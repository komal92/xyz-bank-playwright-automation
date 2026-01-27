import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../../utils/logger";

export class AddCustomerPage {
  readonly page: Page;

  // Locators for Add Customer form fields and submit button
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postCodeInput: Locator;
  readonly addCustomerButton: Locator;

  /**
   * Creates an instance of AddCustomerPage and initializes all locators
   * @param page Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator("input[ng-model='fName']");
    this.lastNameInput = page.locator("input[ng-model='lName']");
    this.postCodeInput = page.locator("input[ng-model='postCd']");
    this.addCustomerButton = page.locator(
      "button.btn.btn-default[type='submit']:has-text('Add Customer')"
    );

    logger.info("AddCustomerPage initialized");
  }

  /**
   * Fills the Add Customer form with provided customer details
   * Waits until the Add Customer button becomes enabled
   * @param firstName Customer first name
   * @param lastName Customer last name
   * @param postCode Customer postcode
   */
  async fillCustomerForm(firstName: string, lastName: string, postCode: string) {
    logger.info(
      `Filling Add Customer form with firstName=${firstName}, lastName=${lastName}, postCode=${postCode}`
    );

    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postCodeInput.fill(postCode);

    logger.debug("Waiting for Add Customer button to be enabled");
    await expect(this.addCustomerButton).toBeEnabled();
    logger.info("Add Customer form filled and ready to submit");
  }

  /**
   * Clicks the Add Customer button
   * Listens for a browser dialog and returns its message if it appears
   * @returns Dialog message text if dialog appears, otherwise null
   */
  async clickAddCustomerAndGetDialogMessage(): Promise<string | null> {
    logger.info("Attempting to submit Add Customer form");

    await expect(this.addCustomerButton).toBeVisible();
    await expect(this.addCustomerButton).toBeEnabled();

    const dialogPromise = this.page
      .waitForEvent("dialog", { timeout: 2000 })
      .then(async (dialog) => {
        const message = dialog.message();
        logger.info(`Dialog appeared with message: ${message}`);
        await dialog.accept();
        logger.info("Dialog accepted");
        return message;
      })
      .catch(() => {
        logger.warn("No dialog appeared after clicking Add Customer");
        return null;
      });

    logger.debug("Clicking Add Customer button");
    await this.addCustomerButton.click();

    const dialogMessage = await dialogPromise;
    logger.info(`Add Customer submission completed. Dialog message: ${dialogMessage}`);
    return dialogMessage;
  }

  /**
   * Verifies that the success dialog message is shown after adding a customer
   * @param message Dialog message returned after form submission
   */
  async verifyCustomerAddedDialog(message: string | null) {
    logger.info("Verifying customer added dialog");
    expect(message, "Expected alert dialog to appear after adding customer").not.toBeNull();
    expect(message!).toContain("Customer added successfully");
    logger.info("Customer added dialog verified");
  }

  /**
   * Verifies that a duplicate customer error dialog is shown
   * @param message Dialog message returned after form submission
   */
  async verifyDuplicateErrorDialog(message: string | null) {
    logger.info("Verifying duplicate customer dialog");
    expect(message, "Expected alert dialog to appear after adding customer").not.toBeNull();
    expect(message!).toContain("Please check the details. Customer may be duplicate.");
    logger.info("Duplicate customer dialog verified");
  }

  /**
   * Checks whether the Add Customer page is loaded by validating visibility of key elements
   * @returns true if page is loaded, otherwise false
   */
  async isAddCustomerPageLoaded(): Promise<boolean> {
    logger.info("Checking if Add Customer page is loaded");
    try {
      await expect(this.firstNameInput).toBeVisible();
      await expect(this.lastNameInput).toBeVisible();
      await expect(this.postCodeInput).toBeVisible();
      await expect(this.addCustomerButton).toBeVisible();
      logger.info("Add Customer page loaded");
      return true;
    } catch {
      logger.error("Add Customer page not loaded");
      return false;
    }
  }

  /**
   * Clears all input fields in the Add Customer form
   */
  async clearForm() {
    logger.info("Clearing Add Customer form");
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.postCodeInput.clear();
    logger.debug("Add Customer form cleared");
  }

  /**
   * Returns the current value from the First Name input field
   */
  async getFirstNameValue(): Promise<string> {
    const value = await this.firstNameInput.inputValue();
    logger.debug(`Read first name value: ${value}`);
    return value;
  }

  /**
   * Returns the current value from the Last Name input field
   */
  async getLastNameValue(): Promise<string> {
    const value = await this.lastNameInput.inputValue();
    logger.debug(`Read last name value: ${value}`);
    return value;
  }

  /**
   * Returns the current value from the Post Code input field
   */
  async getPostCodeValue(): Promise<string> {
    const value = await this.postCodeInput.inputValue();
    logger.debug(`Read post code value: ${value}`);
    return value;
  }
}
