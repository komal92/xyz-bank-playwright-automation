import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../../utils/logger";

export class OpenAccountPage {
  readonly page: Page;

  // Locators
  readonly customerSelect: Locator;
  readonly currencySelect: Locator;
  readonly processButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.customerSelect = page.locator("#userSelect");
    this.currencySelect = page.locator("#currency");
    this.processButton = page.getByRole("button", { name: "Process" });

    logger.info("OpenAccountPage initialized");
  }

  /**
   * Checks whether Open Account page is loaded
   */
  async isOpenAccountPageLoaded(): Promise<boolean> {
    logger.info("Checking if Open Account page is loaded");
    try {
      await expect(this.customerSelect).toBeVisible();
      await expect(this.currencySelect).toBeVisible();
      await expect(this.processButton).toBeVisible();
      return true;
    } catch {
      logger.error("Open Account page not loaded");
      return false;
    }
  }

  /**
   * Selects customer from dropdown by visible text
   */
  async selectCustomer(customerName: string): Promise<void> {
    logger.info(`Selecting customer "${customerName}"`);
    await expect(this.customerSelect).toBeVisible();
    await this.customerSelect.selectOption({ label: customerName });
  }

  /**
   * Selects currency from dropdown by visible text
   */
  async selectCurrency(currency: string): Promise<void> {
    logger.info(`Selecting currency "${currency}"`);
    await expect(this.currencySelect).toBeVisible();
    await this.currencySelect.selectOption({ label: currency });
  }

  /**
   * Clicks Process and returns dialog message if it appears
   * If dialog doesn't appear, returns null
   */
  async clickProcessAndGetDialogMessage(): Promise<string | null> {
    logger.info("Clicking Process and waiting for dialog (if any)");

    await expect(this.processButton).toBeVisible();
    await expect(this.processButton).toBeEnabled();

    const dialogPromise = this.page
      .waitForEvent("dialog", { timeout: 3000 })
      .then(async (dialog) => {
        const msg = dialog.message();
        logger.info(`Dialog message: ${msg}`);
        await dialog.accept();
        return msg;
      })
      .catch(() => {
        logger.warn("Dialog did not appear after clicking Process");
        return null;
      });

    await this.processButton.click();

    return await dialogPromise;
  }

  /**
   * Opens account for a customer + currency and returns dialog message (if any)
   */
  async openAccountAndGetDialogMessage(customerName: string, currency: string): Promise<string | null> {
    logger.info(`Opening account | customer="${customerName}", currency="${currency}"`);

    await this.selectCustomer(customerName);
    await this.selectCurrency(currency);

    return await this.clickProcessAndGetDialogMessage();
  }

  /**
   * Verifies account created success dialog
   */
  async verifyAccountCreatedDialog(message: string | null): Promise<void> {
    expect(message, "Expected alert dialog after opening account").not.toBeNull();
    expect(message!).toContain("Account created successfully");
  }
}
