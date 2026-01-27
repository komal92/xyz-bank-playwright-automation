import { Page, Locator, expect } from "@playwright/test";

export class OpenAccountPage {
  readonly page: Page;

  // Locators
  readonly customerSelect: Locator;
  readonly currencySelect: Locator;
  readonly processButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.customerSelect = page.locator("select[name='userSelect']");
    this.currencySelect = page.locator("select[name='currency']");
    this.processButton = page.getByRole("button", { name: "Process" });
  }

  async selectCustomer(customerName: string) {
    await this.customerSelect.selectOption(customerName);
  }

  async selectCurrency(currency: string) {
    await this.currencySelect.selectOption(currency);
  }

  async openAccount(customerName: string, currency: string) {
    await this.selectCustomer(customerName);
    await this.selectCurrency(currency);
    await this.processButton.click();
  }

  async isOpenAccountPageLoaded(): Promise<boolean> {
    try {
      await expect(this.customerSelect).toBeVisible();
      await expect(this.currencySelect).toBeVisible();
      await expect(this.processButton).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }
}