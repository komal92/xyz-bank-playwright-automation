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
    this.searchInput = page.locator("input[placeholder='Search']");

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
   * Useful for reading individual cell values
   */
  getCustomerRowByName(customerName: string): Locator {
    logger.debug(`Locating customer row by name="${customerName}"`);
    return this.tableRows.filter({ hasText: customerName }).first();
  }

  /**
   * Checks if a customer exists in the list using name + postcode
   */
  async isCustomerInList(
    customerName: string,
    postCode: string
  ): Promise<boolean> {
    logger.info(
      `Checking if customer exists | name="${customerName}", postCode="${postCode}"`
    );

    try {
      const row = this.getCustomerRow(customerName, postCode);
      await row.scrollIntoViewIfNeeded();
      await expect(row).toBeVisible();
      logger.info("Customer found in list");
      return true;
    } catch {
      logger.warn("Customer not found in list");
      return false;
    }
  }

  /**
   * Verifies that customer row contains expected postcode
   */
  async verifyCustomerDetails(
    customerName: string,
    postCode: string
  ): Promise<boolean> {
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
   * Returns all table cells (<td>) for a given customer
   */
  getCustomerRowCells(customerName: string): Locator {
    return this.getCustomerRowByName(customerName).locator("td");
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
   * Returns the postcode (td index 2) for a customer
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
   * Returns the account number (td index 3) for a customer
   */
  async getCustomerAccountNumber(
    customerName: string
  ): Promise<string | null> {
    logger.info(`Reading account number for "${customerName}"`);
    const cells = this.getCustomerRowCells(customerName);

    if ((await cells.count()) > 3) {
      return (await cells.nth(3).textContent())?.trim() ?? null;
    }

    logger.warn("Account number cell not found");
    return null;
  }
}
