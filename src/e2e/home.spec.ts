import { test, expect } from "@playwright/test";

test("authentication flow - username and password incorrect", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
});

test("authentication flow - user exists", async ({ page }) => {
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
  // Step 1: Check if user exists
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

  await page.getByRole("textbox", { name: "Enter your email" }).focus();

  await page.getByPlaceholder("Enter your email").fill("");
  await page
    .getByRole("textbox", { name: "Enter your email" })
    .fill("test@test.com");

  await page.getByRole("textbox", { name: "Enter your email" }).blur();

  await page.getByRole("button", { name: "Continue" }).click();
});

test("authentication flow – user does not exist", async ({ page }) => {
  await page.goto("/");
  //Wait for the page to load JS
  await page.waitForLoadState("networkidle");

  const randomEmail = `user-${Date.now()}@test.com`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

  const emailInput = page.getByRole("textbox", { name: "Enter your email" });
  const continueBtn = page.getByRole("button", { name: "Continue" });

  await emailInput.fill(randomEmail);

  await emailInput.blur();

  await expect(continueBtn).toBeEnabled();

  const [userExistsResp] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().includes("cognito-idp") && resp.request().method() === "POST"
    ),
    continueBtn.click(),
  ]);

  //User does not exist
  expect(userExistsResp.status()).toBe(400);

  await expect(
    page.getByText("You don't have an account yet. Create one to get started.")
  ).toBeVisible();

  //Sign up
  const passwordInput = page.getByRole("textbox", {
    name: "Enter your password",
  });
  await passwordInput.fill("Test123@");
  const signUpBtn = page.getByRole("button", { name: "Continue" });
  await signUpBtn.click();

  const [signUpResp] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().includes("cognito-idp") && resp.request().method() === "POST"
    ),
  ]);

  //Sign up successful - create account with email and password
  expect(signUpResp.ok()).toBeTruthy();

  await expect(
    page.getByText("Enter the code sent to your email")
  ).toBeVisible();

  await expect(page.getByText("Verification code")).toBeVisible();
});
