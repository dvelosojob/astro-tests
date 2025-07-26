import { test, expect, type Page } from "@playwright/test";

export async function mockCognitoUserExistsFlow(page: Page) {
  await page.route(
    "**/cognito-idp.*amazonaws.com/**",
    async (route, request) => {
      const target = request.headers()["x-amz-target"];
      const body = await request.postDataJSON();

      console.log("🔥 [Mock Cognito] Target:", target);
      console.log("🔥 [Mock Cognito] Body:", body);

      switch (target) {
        // 1. ForgotPasswordCommand - User exists
        case "AWSCognitoIdentityProviderService.ForgotPassword":
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              CodeDeliveryDetails: {
                AttributeName: "email",
                DeliveryMedium: "EMAIL",
                Destination: "t***@example.com",
              },
            }),
          });

        // 2. InitiateAuthCommand - Start of OTP login
        case "AWSCognitoIdentityProviderService.InitiateAuth":
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ChallengeName: "CUSTOM_CHALLENGE",
              Session: "mock-session-id",
            }),
          });

        // 3. RespondToAuthChallengeCommand - Valid OTP code
        case "AWSCognitoIdentityProviderService.RespondToAuthChallenge":
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              AuthenticationResult: {
                AccessToken: "mock-access-token",
                IdToken: "mock-id-token",
                RefreshToken: "mock-refresh-token",
              },
            }),
          });

        default:
          return route.continue();
      }
    }
  );
}

export async function mockCognitoUserSignUpFlow(page: Page) {
  await page.route(
    "**/cognito-idp.*amazonaws.com/**",
    async (route, request) => {
      const target = request.headers()["x-amz-target"];
      const body = await request.postDataJSON();

      console.log("🔥 [Mock Cognito - Signup Flow] Target:", target);
      console.log("🔥 Body:", body);

      switch (target) {
        // 1. ForgotPasswordCommand - User does not exist
        case "AWSCognitoIdentityProviderService.ForgotPassword":
          return route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({
              __type: "UserNotFoundException",
              message: "User does not exist",
            }),
          });

        // 2. SignUpCommand - Create account with email/password
        case "AWSCognitoIdentityProviderService.SignUp":
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              UserConfirmed: false,
              CodeDeliveryDetails: {
                AttributeName: "email",
                DeliveryMedium: "EMAIL",
                Destination: "t***@example.com",
              },
            }),
          });

        // 3. ConfirmSignUpCommand - Verification code
        case "AWSCognitoIdentityProviderService.ConfirmSignUp":
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({}),
          });

        // 4. InitiateAuthCommand - Initial login with password (can fall into NEW_PASSWORD_REQUIRED)
        case "AWSCognitoIdentityProviderService.InitiateAuth":
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ChallengeName: "NEW_PASSWORD_REQUIRED",
              Session: "mock-session-id",
            }),
          });

        // 5. RespondToAuthChallengeCommand - New password accepted, login completed
        case "AWSCognitoIdentityProviderService.RespondToAuthChallenge":
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              AuthenticationResult: {
                IdToken: "mock-id-token",
                AccessToken: "mock-access-token",
                RefreshToken: "mock-refresh-token",
              },
            }),
          });

        default:
          return route.continue();
      }
    }
  );
}

test("authentication flow – user exists (mocked)", async ({ page }) => {
  page.on("request", (request) => {
    console.log(`➡️  ${request.method()} ${request.url()}`);
    const postData = request.postData();
    if (postData) console.log(`    ▶️  payload: ${postData}`);
  });

  // Loga cada resposta que chega
  page.on("response", async (response) => {
    console.log(`⬅️  ${response.status()} ${response.url()}`);
    // Se quiser o corpo (atenção: grandes respostas podem poluir o log)
    try {
      const text = await response.text();
      console.log(
        `    ◀️  body: ${text.slice(0, 200)}${text.length > 200 ? "…" : ""}`
      );
    } catch {
      // ignora se não for texto
    }
  });
  await mockCognitoUserExistsFlow(page);

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

  const email = "test-user@example.com";

  await page.getByRole("textbox", { name: "Enter your email" }).fill(email);
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    page.getByText("Enter the code sent to your email")
  ).toBeVisible();

  const otpInput = page.getByText("Authentication code");
  await otpInput.fill("123456");

  await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
  await page.getByRole("button", { name: "Continue" }).click();
});

test("authentication flow – user does not exist (mocked)", async ({ page }) => {
  page.on("request", (request) => {
    console.log(`➡️  ${request.method()} ${request.url()}`);
    const postData = request.postData();
    if (postData) console.log(`    ▶️  payload: ${postData}`);
  });

  // Loga cada resposta que chega
  page.on("response", async (response) => {
    console.log(`⬅️  ${response.status()} ${response.url()}`);
    // Se quiser o corpo (atenção: grandes respostas podem poluir o log)
    try {
      const text = await response.text();
      console.log(
        `    ◀️  body: ${text.slice(0, 200)}${text.length > 200 ? "…" : ""}`
      );
    } catch {
      // ignora se não for texto
    }
  });
  await mockCognitoUserSignUpFlow(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const randomEmail = `user-${Date.now()}@test.com`;
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

  const emailInput = page.getByRole("textbox", { name: "Enter your email" });
  const continueBtn = page.getByRole("button", { name: "Continue" });

  await emailInput.fill(randomEmail);
  await emailInput.blur();
  await expect(continueBtn).toBeEnabled();
  await continueBtn.click();

  await expect(
    page.getByText("You don't have an account yet. Create one to get started.")
  ).toBeVisible();

  const passwordInput = page.getByRole("textbox", {
    name: "Enter your password",
  });
  await passwordInput.fill("Test123@");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    page.getByText("Enter the code sent to your email")
  ).toBeVisible();
  await expect(page.getByText("Verification code")).toBeVisible();
});
