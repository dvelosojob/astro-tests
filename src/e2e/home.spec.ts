import { test, expect, type Page } from "@playwright/test";

// Declare window properties for TypeScript
declare global {
  interface Window {
    mockCheckIfUserExists: () => Promise<boolean>;
    mockInitiatePasswordlessAuth: () => Promise<any>;
    mockRespondToEmailOtp: () => Promise<any>;
    mockSignUp: () => Promise<any>;
    mockConfirmSignUp: () => Promise<any>;
    mockInitiateAuth: () => Promise<any>;
    mockRespondToAuthChallenge: () => Promise<any>;
  }
}

export async function mockCognitoUserExistsFlow(page: Page) {
  // Mock the AWS SDK functions by intercepting module imports
  await page.addInitScript(() => {
    // Mock the checkIfUserExists function to return true (user exists)
    window.mockCheckIfUserExists = async () => true;

    // Mock the initiatePasswordlessAuth function
    window.mockInitiatePasswordlessAuth = async () => ({
      Session: "mock-session-id",
      $metadata: { httpStatusCode: 200 },
    });

    // Mock the respondToEmailOtp function
    window.mockRespondToEmailOtp = async () => ({
      AuthenticationResult: {
        IdToken: "mock-id-token",
        AccessToken: "mock-access-token",
        RefreshToken: "mock-refresh-token",
      },
      $metadata: { httpStatusCode: 200 },
    });
  });

  // Intercept the cognito module and replace with mocks
  await page.route("**/src/lib/cognito.ts", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `
        export async function checkIfUserExists() {
          return window.mockCheckIfUserExists();
        }
        
        export async function initiatePasswordlessAuth() {
          return window.mockInitiatePasswordlessAuth();
        }
        
        export async function respondToEmailOtp() {
          return window.mockRespondToEmailOtp();
        }
        
        export async function signUp() {
          return {};
        }
        
        export async function signIn() {
          return {};
        }
        
        export async function confirmUserSignUp() {
          return {};
        }
      `,
    });
  });
}

export async function mockCognitoUserSignUpFlow(page: Page) {
  // Mock the AWS SDK functions by intercepting module imports
  await page.addInitScript(() => {
    // Mock the checkIfUserExists function to return false (user doesn't exist)
    window.mockCheckIfUserExists = async () => false;

    // Mock the signUp function
    window.mockSignUp = async () => ({
      UserConfirmed: false,
      CodeDeliveryDetails: {
        AttributeName: "email",
        DeliveryMedium: "EMAIL",
        Destination: "t***@example.com",
      },
      $metadata: { httpStatusCode: 200 },
    });

    // Mock the confirmSignUp function
    window.mockConfirmSignUp = async () => ({
      $metadata: { httpStatusCode: 200 },
    });

    // Mock the initiateAuth function for new password required
    window.mockInitiateAuth = async () => ({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: "mock-session-id",
      $metadata: { httpStatusCode: 200 },
    });

    // Mock the respondToAuthChallenge function
    window.mockRespondToAuthChallenge = async () => ({
      AuthenticationResult: {
        IdToken: "mock-id-token",
        AccessToken: "mock-access-token",
        RefreshToken: "mock-refresh-token",
      },
      $metadata: { httpStatusCode: 200 },
    });
  });

  // Intercept the cognito module and replace with mocks
  await page.route("**/src/lib/cognito.ts", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `
        export async function checkIfUserExists() {
          return window.mockCheckIfUserExists();
        }
        
        export async function signUp() {
          return window.mockSignUp();
        }
        
        export async function confirmUserSignUp() {
          return window.mockConfirmSignUp();
        }
        
        export async function initiateAuth() {
          return window.mockInitiateAuth();
        }
        
        export async function respondToAuthChallenge() {
          return window.mockRespondToAuthChallenge();
        }
        
        export async function initiatePasswordlessAuth() {
          return window.mockInitiatePasswordlessAuth();
        }
        
        export async function respondToEmailOtp() {
          return window.mockRespondToEmailOtp();
        }
        
        export async function signIn() {
          return {};
        }
      `,
    });
  });
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

  await page.getByRole("textbox", { name: "Email" }).fill(email);
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

  const emailInput = page.getByRole("textbox", { name: "Email" });
  const continueBtn = page.getByRole("button", { name: "Continue" });

  await emailInput.fill(randomEmail);
  await emailInput.blur();
  await expect(continueBtn).toBeEnabled();
  await continueBtn.click();

  await expect(
    page.getByText("You don't have an account yet. Create one to get started.")
  ).toBeVisible();

  const passwordInput = page.getByRole("textbox", {
    name: "Password",
  });
  await passwordInput.fill("Test123@");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    page.getByText("Enter the code sent to your email")
  ).toBeVisible();
  await expect(page.getByText("Verification code")).toBeVisible();
});
