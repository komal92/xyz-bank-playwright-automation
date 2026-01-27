import { test, expect } from "../../fixtures";
import { LoginPage } from "../../../pages/common/login.page";
import { ManagerPage } from "../../../pages/manager/manager.page";
import { AddCustomerPage } from "../../../pages/manager/addCustomer.page";
import { CustomerListPage } from "../../../pages/manager/customerList.page";
import { getCustomerCreationData } from "../../helpers/dataLoader";

interface Customer {
  firstName: string;
  lastName: string;
  postCode: string;
}

const customerData: Customer[] = getCustomerCreationData();

test.describe("Search Customer - XYZ Bank", { tag: "@e2e" }, () => {
  let loginPage: LoginPage;
  let managerPage: ManagerPage;
  let addCustomerPage: AddCustomerPage;
  let customerListPage: CustomerListPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    managerPage = new ManagerPage(page);
    addCustomerPage = new AddCustomerPage(page);
    customerListPage = new CustomerListPage(page);

    await loginPage.navigateToLogin();
    await loginPage.loginAsManager();
  });

  test(
    "should search customer by first name and show the customer in results",
    { tag: ["@smoke", "@regression"] },
    async () => {
      const customer = customerData[0];
      const fullName = `${customer.firstName} ${customer.lastName}`;

      // Create customer
      await managerPage.navigateToAddCustomer();
      await addCustomerPage.fillCustomerForm(
        customer.firstName,
        customer.lastName,
        customer.postCode
      );
      const dialogMessage = await addCustomerPage.clickAddCustomerAndGetDialogMessage();
      await addCustomerPage.verifyCustomerAddedDialog(dialogMessage);

      // Go to customer list
      await managerPage.navigateToCustomerList();
      expect(await customerListPage.isCustomerListLoaded()).toBeTruthy();

      // Search by first name
      await customerListPage.searchCustomer(customer.firstName);

      // Validate row exists for name + postcode
      const exists = await customerListPage.isCustomerInList(fullName, customer.postCode);
      expect(exists).toBeTruthy();

      // Validate postcode cell is correct (extra check)
      const postCodeText = await customerListPage.getCustomerPostCode(fullName);
      expect(postCodeText).not.toBeNull();
      expect(postCodeText!).toContain(customer.postCode);
    }
  );

  test(
    "should return no match when searching for a non-existing customer",
    { tag: "@regression" },
    async () => {
      await managerPage.navigateToCustomerList();
      expect(await customerListPage.isCustomerListLoaded()).toBeTruthy();

      await customerListPage.searchCustomer("DUMMyNAME");

      // Table may show 0 rows after filter
      const rowsCount = await customerListPage.getTableRowCount();
      expect(rowsCount).toBe(0);
    }
  );
});
