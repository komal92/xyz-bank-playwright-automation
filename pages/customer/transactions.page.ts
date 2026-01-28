import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../../utils/logger";

export class TransactionsPage {
  readonly page: Page;

  // Locators
  readonly transactionsTable: Locator;
  readonly tableRows: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.transactionsTable = page.locator("table");
    this.tableRows = page.locator("table tbody tr");
    this.backButton = page.getByRole("button", { name: "Back" });

    logger.info("TransactionsPage initialized");
  }



  /**
   * Checks if transactions table has at least 1 row
   */
  async hasAnyRows(): Promise<boolean> {
    try {
      const count = await this.tableRows.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Asserts a transaction exists with amount and type (Credit/Debit)
   * The table columns are typically: Date-Time, Amount, Transaction Type
   */
  async expectTransaction(amount: number, type: "Credit" | "Debit"): Promise<void> {
    logger.info(`Verifying transaction amount=${amount}, type=${type}`);

    const row = this.tableRows
      .filter({ hasText: String(amount) })
      .filter({ hasText: type })
      .first();

    await expect(row).toBeVisible();
  }

  /**
   * Waits until Transactions page is ready for assertions/actions
   */
  async waitForTransactionsPageLoaded(): Promise<void> {
    logger.info("Waiting for Transactions page to load");

    // URL check first (fast feedback)
    await expect(this.page).toHaveURL(/#\/listTx/);

    // Core UI must be visible
    await expect(this.transactionsTable).toBeVisible({ timeout: 10000 });
    await expect(this.backButton).toBeVisible({ timeout: 10000 });

    // Rows might be 0 or more, so don't force row visibility.
    // But ensure the table body exists.
    await expect(this.page.locator("table tbody")).toBeVisible({ timeout: 10000 });

    logger.info("Transactions page loaded");
  }
}
