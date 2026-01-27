import { Page, Locator, expect } from "@playwright/test";

export class DepositPage {
  readonly page: Page;

  // Locators
  readonly amountInput: Locator;
  readonly depositButton: Locator;
  readonly backButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.amountInput = page.locator("input[ng-model='amount']");
    this.depositButton = page.getByRole("button", { name: "Deposit" });
    this.backButton = page.getByRole("button", { name: "Back" });
    this.successMessage = page.locator("text=Deposit Successful");
    this.errorMessage = page.locator("text=Transaction Failed");
  }

  async isDepositPageLoaded(): Promise<boolean> {
    try {
      await expect(this.amountInput).toBeVisible();
      await expect(this.depositButton).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async enterAmount(amount: string) {
    await this.amountInput.fill(amount);
  }

  async submitDeposit() {
    await this.depositButton.click();
  }

  async deposit(amount: string) {
    await this.enterAmount(amount);
    await this.submitDeposit();
  }

  async goBack() {
    await this.backButton.click();
    await this.page.waitForURL(/#\/account/);
  }

  async isSuccessMessageDisplayed(): Promise<boolean> {
    try {
      await expect(this.successMessage).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async isErrorMessageDisplayed(): Promise<boolean> {
    try {
      await expect(this.errorMessage).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async getAmountValue(): Promise<string> {
    return await this.amountInput.inputValue();
  }

  async clearAmount() {
    await this.amountInput.clear();
  }
}