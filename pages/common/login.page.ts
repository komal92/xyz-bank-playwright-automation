import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  // Locators
  readonly bankManagerLoginButton: Locator;
  readonly customerLoginButton: Locator;
  readonly xyzBankText: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.bankManagerLoginButton = page.getByRole("button", { name: "Bank Manager Login" });
    this.customerLoginButton = page.getByRole("button", { name: "Customer Login" });
    this.xyzBankText = page.locator("text=XYZ Bank");
  }

  async navigateToLogin() {
    await this.page.goto("");
    await this.page.waitForURL(/#\/login/);
  }

  async loginAsManager() {
    await this.bankManagerLoginButton.click();
    await this.page.waitForURL(/#\/manager/);
  }

  async loginAsCustomer() {
    await this.customerLoginButton.click();
    await this.page.waitForURL(/#\/login/);
  }

  async isManagerLoginButtonVisible(): Promise<boolean> {
    try {
      await expect(this.bankManagerLoginButton).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async isCustomerLoginButtonVisible(): Promise<boolean> {
    try {
      await expect(this.customerLoginButton).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async isXyzBankTextVisible(): Promise<boolean> {
    try {
      await expect(this.xyzBankText).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }
}
