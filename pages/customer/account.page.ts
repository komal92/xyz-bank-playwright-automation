import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../../utils/logger";
import { safeRefresh } from "utils/pageUtils";

export class AccountPage {
  readonly page: Page;

  readonly accountSelect: Locator;
  readonly balanceValue: Locator;

  readonly transactionsTab: Locator;
  readonly depositTab: Locator;
  readonly withdrawTab: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.accountSelect = page.locator("#accountSelect");


    // On this app, balance is shown as the 2nd "strong.ng-binding" in the account summary row.
    // This is stable enough for this demo app.
    this.balanceValue = page.locator("strong.ng-binding").nth(1);

    this.transactionsTab = page.locator("button[ng-click='transactions()']");
    this.depositTab = page.locator("button[ng-click='deposit()']");
    this.withdrawTab = page.locator("button[ng-click='withdrawl()']");
    this.logoutButton = page.locator("button[ng-click='byebye()']");

    logger.info("CustomerAccountPage initialized");
  }

  /**
   * Validates customer account page is loaded
   */
  async isLoaded(): Promise<boolean> {
  try {
    await expect(this.logoutButton).toBeVisible();
    return true;
  } catch {
    return false;
  }
}

  /**
   * Switches account by index (0..n-1)
   */
  async selectAccountByIndex(index: number): Promise<void> {
    logger.info(`Selecting account index=${index}`);
    await expect(this.logoutButton).toBeVisible();
    await this.accountSelect.selectOption({ index });
  }

  /**
   * Returns current balance as number
   */
  async getBalance(): Promise<number> {
    await expect(this.balanceValue).toBeVisible();
    const text = (await this.balanceValue.textContent())?.trim() ?? "0";
    const value = Number(text);
    return Number.isFinite(value) ? value : 0;
  }

  async goToDeposit(): Promise<void> {
    await expect(this.depositTab).toBeVisible();
    await this.depositTab.click();
  }

  async goToWithdraw(): Promise<void> {
    await expect(this.withdrawTab).toBeVisible();
    await this.withdrawTab.click();
  }

  async goToTransactions(): Promise<void> {
    await safeRefresh(this.page);
    await expect(this.transactionsTab).toBeVisible();
    await this.transactionsTab.click();
  }

  async logout(): Promise<void> {
    await expect(this.logoutButton).toBeVisible();
    await this.logoutButton.click();
    await this.page.waitForURL(/#\/customer/);
  }

  /**
   * Waits until balance becomes exactly expected.
   * Use this after deposit/withdraw to avoid flaky reads.
   */
  async waitForBalanceToBe(expected: number, timeout = 5000): Promise<void> {
    await expect(this.balanceValue).toHaveText(String(expected), { timeout });
  }

  /**
   * Waits until balance is different than the provided value.
   * Useful if you don’t know the expected exact value.
   */
  async waitForBalanceToChange(fromBalance: number, timeout = 5000): Promise<void> {
    await expect
      .poll(async () => this.getBalance(), { timeout })
      .not.toBe(fromBalance);
  }
}