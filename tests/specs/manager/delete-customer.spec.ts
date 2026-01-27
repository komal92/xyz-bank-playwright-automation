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

test.describe("Delete Customer - XYZ Bank", { tag: "@e2e" }, () => {
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
    "should delete an existing customer and remove it from the list",
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

      // Go to customer list and confirm it exists
      await managerPage.navigateToCustomerList();
      expect(await customerListPage.isCustomerListLoaded()).toBeTruthy();

      await customerListPage.searchCustomer(customer.firstName);

      const existsBefore = await customerListPage.isCustomerInList(fullName, customer.postCode);
      expect(existsBefore).toBeTruthy();

      // Delete customer
      await customerListPage.deleteCustomer(fullName);

      // After delete, filter again and verify row is gone
      await customerListPage.searchCustomer(customer.firstName);

      const existsAfter = await customerListPage.isCustomerInList(fullName, customer.postCode);
      expect(existsAfter).toBeFalsy();
    }
  );
});
