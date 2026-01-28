import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../../utils/logger";

export class DepositPage {
  readonly page: Page;

  readonly amountInput: Locator;
  readonly depositButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.amountInput = page.locator("input[ng-model='amount']");
    this.depositButton = page.locator("button[type='submit']");
    this.successMessage = page.locator("span[ng-show='message']").or(page.locator("span").filter({ hasText: "Deposit Successful" }));

    logger.info("DepositPage initialized");
  }

  /**
   * Deposits amount and waits for success message
   */
  async deposit(amount: number): Promise<void> {
    logger.info(`Depositing amount=${amount}`);
    await expect(this.amountInput).toBeVisible();
    await this.amountInput.fill(String(amount));

    await expect(this.depositButton).toBeVisible();
    await this.depositButton.click();

    // Demo app shows "Deposit Successful"
    await expect(this.successMessage).toBeVisible();
  }
}
