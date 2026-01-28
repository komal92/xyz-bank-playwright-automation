import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../../utils/logger";

export class WithdrawPage {
  readonly page: Page;

  readonly amountInput: Locator;
  readonly withdrawButton: Locator;
  readonly messageText: Locator;
  readonly withdrawSection: Locator 

  constructor(page: Page) {
    this.page = page;

    this.amountInput = page.locator("input[placeholder='amount']");
    this.withdrawButton = page.locator("button[type='submit']");
    this.withdrawSection = page.locator('div[ng-show="withdrawl"]');

    // message span exists for both success/failure in this app
    this.messageText = page.locator("span[ng-show='message']");
    logger.info("WithdrawPage initialized");
  }

  async withdraw(amount: number): Promise<void> {
    logger.info(`Withdrawing amount=${amount}`);

    const value = String(amount);

    for (let attempt = 1; attempt <= 4; attempt++) {
      logger.info(`Withdraw attempt ${attempt}`);

     // await expect(this.withdrawSection).toBeVisible();
      await expect(this.amountInput).toBeVisible();

      // Clear + fill is safer for Angular inputs
      await this.amountInput.fill("");
      await this.amountInput.fill(value);

      // Ensure it actually entered (this catches the flaky case)
      try {
        await expect(this.amountInput).toHaveValue(value, { timeout: 1000 });
      } catch (e) {
        logger.warn(`Amount did not stick in input on attempt ${attempt}`);
        if (attempt === 2) throw e;
        continue; // retry
      }

      await this.amountInput.press("Tab");
      await expect(this.withdrawButton).toBeEnabled();

      // Click and wait for a signal that action happened
      await this.withdrawButton.click();

      // If your app always shows message after clicking, use that as sync point
      const msgVisible = await this.messageText.isVisible().catch(() => false);
      if (msgVisible) return;

      logger.warn(`No message appeared after withdraw click on attempt ${attempt}`);
      if (attempt === 2) return; // don’t hard-fail here; your test can assert balance/message
    }
  }


  async expectWithdrawSuccess(): Promise<void> {
    await expect(this.messageText).toBeVisible();
    await expect(this.messageText).toContainText("Transaction successful");
  }

  async expectWithdrawFailure(): Promise<void> {
    await expect(this.messageText).toBeVisible();
    await expect(this.messageText).toContainText("Transaction Failed");
  }
}
