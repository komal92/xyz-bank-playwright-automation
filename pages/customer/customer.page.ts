import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../../utils/logger";

export class CustomerLoginPage {
  readonly page: Page;

  readonly customerLoginButton: Locator;
  readonly userSelect: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.customerLoginButton = page.getByRole("button", { name: "Customer Login" });
    this.userSelect = page.locator("#userSelect");
    this.loginButton = page.getByRole("button", { name: "Login" });

    logger.info("CustomerLoginPage initialized");
  }

  /**
   * Navigates to the app login
   */
  async navigateToLogin(): Promise<void> {
    await this.page.goto("");
    await this.page.waitForURL(/#\/login/);
  }

  /**
   * Opens Customer Login view
   */
  async goToCustomerLogin(): Promise<void> {
    await expect(this.customerLoginButton).toBeVisible();
    await this.customerLoginButton.click();
    await expect(this.userSelect).toBeVisible();
  }

  /**
   * Select customer from dropdown by visible label
   */
  async selectCustomer(customerName: string): Promise<void> {
    await expect(this.userSelect).toBeVisible();
    await this.userSelect.selectOption({ label: customerName });
  }

  /**
   * Click Login and wait for customer area
   */
  async clickLogin(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await this.loginButton.click();
    await this.page.waitForURL(/#\/account/);
  }

  /**
   * Select customer + login
   */
  async loginAs(customerName: string): Promise<void> {
    logger.info(`Customer login as "${customerName}"`);
    await this.goToCustomerLogin();
    await this.selectCustomer(customerName);
    await this.clickLogin();
  }
}
