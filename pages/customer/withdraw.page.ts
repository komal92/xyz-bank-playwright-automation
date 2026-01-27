import { Page, Locator, expect } from "@playwright/test";

export class WithdrawPage {
  readonly page: Page;

  // Locators
  readonly amountInput: Locator;
  readonly withdrawButton: Locator;
  readonly backButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.amountInput = page.locator("input[ng-model='amount']");
    this.withdrawButton = page.getByRole("button", { name: "Withdraw" });
    this.backButton = page.getByRole("button", { name: "Back" });
    this.successMessage = page.locator("text=Withdraw Successful");
    this.errorMessage = page.locator("text=Transaction Failed");
  }

  async isWithdrawPageLoaded(): Promise<boolean> {
    try {
      await expect(this.amountInput).toBeVisible();
      await expect(this.withdrawButton).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async enterAmount(amount: string) {
    await this.amountInput.fill(amount);
  }

  async submitWithdraw() {
    await this.withdrawButton.click();
  }

  async withdraw(amount: string) {
    await this.enterAmount(amount);
    await this.submitWithdraw();
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

  async isInsufficientFundsError(): Promise<boolean> {
    const errorText = this.page.locator("text=Insufficient Funds");
    try {
      await expect(errorText).toBeVisible();
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