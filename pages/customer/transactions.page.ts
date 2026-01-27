import { Page, Locator, expect } from "@playwright/test";

export class TransactionsPage {
  readonly page: Page;

  // Locators
  readonly transactionsTable: Locator;
  readonly tableRows: Locator;
  readonly backButton: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.transactionsTable = page.locator("table");
    this.tableRows = page.locator("table tbody tr");
    this.backButton = page.getByRole("button", { name: "Back" });
    this.resetButton = page.getByRole("button", { name: "Reset" });
  }

  async isTransactionsPageLoaded(): Promise<boolean> {
    try {
      await expect(this.transactionsTable).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async getTransactionCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async getTransactionByIndex(index: number): Promise<Locator> {
    return this.tableRows.nth(index);
  }

  getTransactionDate(index: number): Locator {
    return this.tableRows.nth(index).locator("td").nth(0);
  }

  getTransactionAmount(index: number): Locator {
    return this.tableRows.nth(index).locator("td").nth(1);
  }

  getTransactionType(index: number): Locator {
    return this.tableRows.nth(index).locator("td").nth(2);
  }

  async verifyTransactionExists(amount: string, type: string): Promise<boolean> {
    const transaction = this.page.locator(
      `text=${amount}` + `text=${type}`
    );
    try {
      await expect(transaction).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async getFirstTransactionAmount(): Promise<string | null> {
    if (await this.getTransactionCount() > 0) {
      return await this.getTransactionAmount(0).textContent();
    }
    return null;
  }

  async getFirstTransactionType(): Promise<string | null> {
    if (await this.getTransactionCount() > 0) {
      return await this.getTransactionType(0).textContent();
    }
    return null;
  }

  async goBack() {
    await this.backButton.click();
    await this.page.waitForURL(/#\/account/);
  }

  async reset() {
    await this.resetButton.click();
  }

  async isResetButtonVisible(): Promise<boolean> {
    try {
      await expect(this.resetButton).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }
}