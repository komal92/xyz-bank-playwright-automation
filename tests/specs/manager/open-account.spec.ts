import { test, expect } from "../../fixtures";
import { LoginPage } from "../../../pages/common/login.page";
import { ManagerPage } from "../../../pages/manager/manager.page";
import { AddCustomerPage } from "../../../pages/manager/addCustomer.page";
import { OpenAccountPage } from "../../../pages/manager/openAccount.page";
import { CustomerListPage } from "../../../pages/manager/customerList.page";
import { getCustomerCreationData, getOpenAccountData } from "../../helpers/dataLoader";

interface Customer {
  firstName: string;
  lastName: string;
  postCode: string;
}

interface OpenAccountConfig {
  customerName: string;
  currencies: string[];
}

const customers: Customer[] = getCustomerCreationData();
const openAccountConfig: OpenAccountConfig[] = getOpenAccountData();

function fullName(c: Customer) {
  return `${c.firstName} ${c.lastName}`;
}

function findPostCode(customerName: string): string {
  const match = customers.find((c) => fullName(c) === customerName);
  if (!match) throw new Error(`No postcode found for customerName="${customerName}" in customers.json`);
  return match.postCode;
}

function countAccountTokens(accountText: string | null): number {
  if (!accountText) return 0;
  return accountText.split(/\s+/).filter(Boolean).length;
}

test.describe("Open Account - XYZ Bank", { tag: "@e2e" }, () => {
  let loginPage: LoginPage;
  let managerPage: ManagerPage;
  let addCustomerPage: AddCustomerPage;
  let openAccountPage: OpenAccountPage;
  let customerListPage: CustomerListPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    managerPage = new ManagerPage(page);
    addCustomerPage = new AddCustomerPage(page);
    openAccountPage = new OpenAccountPage(page);
    customerListPage = new CustomerListPage(page);

    await loginPage.navigateToLogin();
    await loginPage.loginAsManager();
  });

  async function addAllCustomers(): Promise<void> {
    for (const c of customers) {
      await managerPage.navigateToAddCustomer();
      await addCustomerPage.fillCustomerForm(c.firstName, c.lastName, c.postCode);

      const dialogMessage = await addCustomerPage.clickAddCustomerAndGetDialogMessage();
      await addCustomerPage.verifyCustomerAddedDialog(dialogMessage);
    }
  }

  test(
    "should navigate to Open Account page",
    { tag: ["@smoke", "@regression"] },
    async () => {
      expect(await managerPage.isManagerPageLoaded()).toBeTruthy();

      await managerPage.navigateToOpenAccount();
      expect(await openAccountPage.isOpenAccountPageLoaded()).toBeTruthy();
    }
  );

  test(
    "should allow selecting an existing customer from dropdown",
    { tag: "@regression" },
    async () => {
      await addAllCustomers();

      const cfg = openAccountConfig[0];

      await managerPage.navigateToOpenAccount();
      expect(await openAccountPage.isOpenAccountPageLoaded()).toBeTruthy();

      await openAccountPage.selectCustomer(cfg.customerName);

      const selected = await openAccountPage.customerSelect.inputValue();
      expect(selected).toBeTruthy();
    }
  );

  test(
    "should open account for one user and validate account count increases",
    { tag: ["@smoke", "@regression"] },
    async () => {
      await addAllCustomers();

      const cfg = openAccountConfig.find((x) => x.currencies.length === 1) ?? openAccountConfig[0];
      const customerName = cfg.customerName;
      const postCode = findPostCode(customerName);
      const currency = cfg.currencies[0];

      // Before opening account: should be empty
      await managerPage.navigateToCustomerList();
      await customerListPage.searchCustomer(customerName.split(" ")[0]);

      const before = await customerListPage.getCustomerAccountNumbers(customerName, postCode);
      expect(countAccountTokens(before)).toBe(0);

      // Open account
      await managerPage.navigateToOpenAccount();
      expect(await openAccountPage.isOpenAccountPageLoaded()).toBeTruthy();

      const msg = await openAccountPage.openAccountAndGetDialogMessage(customerName, currency);
      await openAccountPage.verifyAccountCreatedDialog(msg);

      // After opening: should be 1
      await managerPage.navigateToCustomerList();
      await customerListPage.searchCustomer(customerName.split(" ")[0]);

      const after = await customerListPage.getCustomerAccountNumbers(customerName, postCode);
      expect(countAccountTokens(after)).toBe(1);
    }
  );

  test(
    "should open accounts for multiple users and validate account count equals configured currencies length",
    { tag: "@regression" },
    async () => {
      await addAllCustomers();

      for (const cfg of openAccountConfig) {
        const customerName = cfg.customerName;
        const postCode = findPostCode(customerName);

        for (const currency of cfg.currencies) {
          await managerPage.navigateToOpenAccount();
          expect(await openAccountPage.isOpenAccountPageLoaded()).toBeTruthy();

          const msg = await openAccountPage.openAccountAndGetDialogMessage(customerName, currency);
          await openAccountPage.verifyAccountCreatedDialog(msg);
        }

        await managerPage.navigateToCustomerList();
        await customerListPage.searchCustomer(customerName.split(" ")[0]);

        const accountsText = await customerListPage.getCustomerAccountNumbers(customerName, postCode);
        expect(countAccountTokens(accountsText)).toBe(cfg.currencies.length);
      }
    }
  );

  test(
    "should display all dropdown controls on Open Account page",
    { tag: "@regression" },
    async () => {
      await addAllCustomers();

      await managerPage.navigateToOpenAccount();

      await expect(openAccountPage.customerSelect).toBeVisible();
      await expect(openAccountPage.currencySelect).toBeVisible();
      await expect(openAccountPage.processButton).toBeVisible();
    }
  );
});
