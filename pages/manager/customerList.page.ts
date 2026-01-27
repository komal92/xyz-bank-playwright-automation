import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../../utils/logger";

export class CustomerListPage {
  readonly page: Page;

  // ===== Locators =====
  readonly customerTable: Locator;
  readonly tableRows: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.customerTable = page.locator("table");
    this.tableRows = page.locator("table tbody tr");
    this.searchInput = page.getByPlaceholder("Search Customer");


    logger.info("CustomerListPage initialized");
  }

  /**
   * Checks whether the customer list table is visible
   */
  async isCustomerListLoaded(): Promise<boolean> {
    logger.info("Checking if customer list is loaded");
    try {
      await expect(this.customerTable).toBeVisible();
      return true;
    } catch {
      logger.error("Customer list table not visible");
      return false;
    }
  }

  /**
   * Returns a table row that contains BOTH customer name and postcode
   */
  getCustomerRow(customerName: string, postCode: string): Locator {
    logger.debug(
      `Locating customer row with name="${customerName}" and postCode="${postCode}"`
    );

    return this.tableRows
      .filter({ hasText: customerName })
      .filter({ hasText: postCode })
      .first();
  }

  /**
   * Returns a table row by customer name only
   * Useful for reading individual cell values (when names are unique)
   */
  getCustomerRowByName(customerName: string): Locator {
    logger.debug(`Locating customer row by name="${customerName}"`);
    return this.tableRows.filter({ hasText: customerName }).first();
  }

  /**
   * Returns a table row by customer name + postcode
   * Safer than name-only when there can be duplicates
   */
  getCustomerRowByNameAndPostCode(customerName: string, postCode: string): Locator {
    logger.debug(`Locating customer row by name="${customerName}" and postCode="${postCode}"`);
    return this.getCustomerRow(customerName, postCode);
  }

  /**
 * Checks if a customer exists in the list using name + postcode
 * Uses count check first to avoid long waits when customer is not present
 */
  async isCustomerInList(customerName: string, postCode: string): Promise<boolean> {
    logger.info(`Checking if customer exists | name="${customerName}", postCode="${postCode}"`);

    const row = this.getCustomerRow(customerName, postCode);

    try {
      const matches = await row.count();

      if (matches === 0) {
        logger.warn("Customer not found in list (row count is 0)");
        return false;
      }

      await row.first().scrollIntoViewIfNeeded();
      await expect(row.first()).toBeVisible({ timeout: 3000 });

      logger.info("Customer found in list");
      return true;
    } catch (err) {
      logger.warn(`Customer lookup failed: ${(err as Error).message}`);
      return false;
    }
  }


  /**
   * Verifies that customer row contains expected postcode
   */
  async verifyCustomerDetails(customerName: string, postCode: string): Promise<boolean> {
    logger.info(
      `Verifying customer details | name="${customerName}", postCode="${postCode}"`
    );

    try {
      const row = this.getCustomerRow(customerName, postCode);
      await row.scrollIntoViewIfNeeded();
      await expect(row).toBeVisible();
      return true;
    } catch {
      logger.warn("Customer details verification failed");
      return false;
    }
  }

  /**
   * Returns all table cells (<td>) for a given customer (name only)
   */
  getCustomerRowCells(customerName: string): Locator {
    return this.getCustomerRowByName(customerName).locator("td");
  }

  /**
   * Returns all table cells (<td>) for a given customer (name + postcode)
   */
  getCustomerRowCellsByNameAndPostCode(customerName: string, postCode: string): Locator {
    return this.getCustomerRowByNameAndPostCode(customerName, postCode).locator("td");
  }

  /**
   * Returns total number of rows in the customer table
   */
  async getTableRowCount(): Promise<number> {
    const count = await this.tableRows.count();
    logger.info(`Customer table row count: ${count}`);
    return count;
  }

  /**
   * Searches customer using the search input
   */
  async searchCustomer(searchText: string): Promise<void> {
    logger.info(`Searching customer list with "${searchText}"`);
    try {
      await expect(this.searchInput).toBeVisible();
      await this.searchInput.click();
      await this.searchInput.fill(searchText);
    } catch {
      logger.warn("Search input not available");
    }
  }

  /**
   * Deletes a customer by name
   */
  async deleteCustomer(customerName: string): Promise<void> {
    logger.info(`Deleting customer "${customerName}"`);
    const row = this.getCustomerRowByName(customerName);
    const deleteButton = row.locator("button[ng-click*='delete']");

    await row.scrollIntoViewIfNeeded();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
  }

  /**
   * Returns the postcode (td index 2) for a customer (name only)
   */
  async getCustomerPostCode(customerName: string): Promise<string | null> {
    logger.info(`Reading postcode for "${customerName}"`);
    const cells = this.getCustomerRowCells(customerName);

    if ((await cells.count()) > 2) {
      return (await cells.nth(2).textContent())?.trim() ?? null;
    }

    logger.warn("Postcode cell not found");
    return null;
  }

  /**
   * Returns the account number cell text (td index 3) as string or null if blank
   * This app shows multiple account numbers split by space after opening multiple accounts
   */
  async getCustomerAccountNumbers(customerName: string, postCode: string): Promise<string | null> {
    logger.info(`Reading account number(s) for "${customerName}" with postCode "${postCode}"`);

    const row = this.getCustomerRowByNameAndPostCode(customerName, postCode);

    // scroll the actual row into view
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();

    const cells = row.locator("td");

    if ((await cells.count()) > 3) {
      const raw = (await cells.nth(3).textContent()) ?? "";
      const value = raw.trim();
      return value.length ? value : null;
    }

    logger.warn("Account number cell not found");
    return null;
  }


  /**
   * True when account number cell is empty/null (before opening an account)
   */
  async hasNoAccountNumbers(customerName: string, postCode: string): Promise<boolean> {
    const value = await this.getCustomerAccountNumbers(customerName, postCode);
    logger.info(`Account number(s) value is: ${value === null ? "null/empty" : value}`);
    return value === null;
  }

  /**
   * True when account number cell contains at least one numeric token (after opening an account)
   */
  async hasAccountNumbers(customerName: string, postCode: string): Promise<boolean> {
    const value = await this.getCustomerAccountNumbers(customerName, postCode);
    if (!value) {
      logger.info("No account number(s) present");
      return false;
    }

    const tokens = value.split(/\s+/).filter(Boolean);
    const hasNumeric = tokens.some((t) => /^\d+$/.test(t));

    logger.info(`Account tokens="${tokens.join(",")}", hasNumeric=${hasNumeric}`);
    return hasNumeric;
  }
}
