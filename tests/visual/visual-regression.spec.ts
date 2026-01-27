import { test, expect } from "@playwright/test";

test.describe("Visual Regression @visual", () => {
    test("Login page should match baseline", async ({ page }) => {
        await page.goto("");
        await page.waitForURL(/#\/login/);

        await expect(page.getByRole("button", { name: "Bank Manager Login" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Customer Login" })).toBeVisible();

        await expect(page).toHaveScreenshot("login-page.png", {
            // intentionally crop differently to force mismatch
            clip: { x: 0, y: 0, width: 500, height: 300 },
        });

    });

    test("Add Customer form should match baseline", async ({ page }) => {
        await page.goto("");
        await page.waitForURL(/#\/login/);
        await page.getByRole("button", { name: "Bank Manager Login" }).click();
        await page.getByRole("button", { name: "Add Customer" }).click();

        const form = page.locator("form");
        await expect(form).toBeVisible();

        await expect(form).toHaveScreenshot("add-customer-form.png");
    });

    test("Open Account section should match baseline", async ({ page }) => {
        await page.goto("");
        await page.waitForURL(/#\/login/);
        await page.getByRole("button", { name: "Bank Manager Login" }).click();
        await page.getByRole("button", { name: "Open Account" }).click();

        await expect(page.locator("#userSelect")).toBeVisible();
        await expect(page.locator("#currency")).toBeVisible();

        // Snapshot only main container (more stable than full page)
        const container = page.locator(".ng-scope").first();
        await expect(container).toHaveScreenshot("open-account-section.png");
    });

    test("Customer Deposit panel should match baseline", async ({ page }) => {
        await page.goto("");
        await page.waitForURL(/#\/login/);
        await page.getByRole("button", { name: "Customer Login" }).click();

        // Pick a customer from dropdown (if available)
        const options = await page.locator("#userSelect option").allTextContents();
        const firstCustomer = options.map(o => o.trim()).find(o => o && !o.toLowerCase().includes("your name"));

        test.skip(!firstCustomer, "No customer available in dropdown");

        await page.locator("#userSelect").selectOption({ label: firstCustomer! });
        await page.getByRole("button", { name: "Login" }).click();

        await page.getByRole("button", { name: "Deposit" }).click();
        const depositForm = page.locator("form");
        await expect(depositForm).toBeVisible();

        await expect(depositForm).toHaveScreenshot("deposit-panel.png");
    });
});
