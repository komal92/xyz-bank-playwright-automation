import { test, expect } from "@playwright/test";

test.describe("Visual Regression @visual", () => {

  test("Login page should match baseline", async ({ page }) => {
    await page.goto("");

    await expect(page.getByRole("button", { name: "Bank Manager Login" }))
      .toBeVisible();

    await expect(page).toHaveScreenshot("login-page.png", {
      clip: { x: 0, y: 0, width: 500, height: 300 },
    });
  });

  test("Add Customer form should match baseline", async ({ page }) => {
    await page.goto("");

    await page.getByRole("button", { name: "Bank Manager Login" }).click();
    await page.getByRole("button", { name: "Add Customer" }).click();

    const form = page.locator("form");
    await expect(form).toBeVisible();

    await expect(form).toHaveScreenshot("add-customer-form.png");
  });

  test("Open Account section should match baseline", async ({ page }) => {
    await page.goto("");

    await page.getByRole("button", { name: "Bank Manager Login" }).click();
    await page.getByRole("button", { name: "Open Account" }).click();

    const container = page.locator(".ng-scope").first();
    await expect(container).toBeVisible();

    await expect(container).toHaveScreenshot("open-account-section.png");
  });

  test("Customer Deposit panel should match baseline", async ({ page }) => {
    await page.goto("");

    await page.getByRole("button", { name: "Customer Login" }).click();

    const loginPanel = page.locator("form");
    await expect(loginPanel).toBeVisible();

    await expect(loginPanel).toHaveScreenshot("customer-login-panel.png");
  });

});
