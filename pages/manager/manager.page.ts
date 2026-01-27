import { Page, Locator, expect } from "@playwright/test";

export class ManagerPage {
  readonly page: Page;

  // Locators
  readonly addCustomerTab: Locator;
  readonly addCustomerButton: Locator;
  readonly openAccountButton: Locator;
  readonly customersButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.addCustomerTab = page.locator("button[ng-click='addCust()']");
    this.addCustomerButton = page.locator("button[type='submit']");
    this.openAccountButton = page.getByRole("button", { name: "Open Account" });
    this.customersButton = page.getByRole("button", { name: "Customers" });
    this.logoutButton = page.getByRole("button", { name: "Logout" });
  }

  async navigateToAddCustomer() {
    await this.addCustomerTab.click();
    await this.page.waitForURL(/addCust/);
  }

  async navigateToOpenAccount() {
    await this.openAccountButton.click();
    await this.page.waitForURL(/openAccount/);
  }

  async navigateToCustomerList() {
    await this.customersButton.click();
    await this.page.waitForURL(/list/);
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL(/#\/login/);
  }

  async isManagerPageLoaded(): Promise<boolean> {
    try {
      await expect(this.addCustomerTab).toBeVisible();
      await expect(this.openAccountButton).toBeVisible();
      await expect(this.customersButton).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }
}