import { test, expect } from "../../fixtures";
import { CustomerLoginPage } from "../../../pages/customer/customer.page";
import { AccountPage } from "../../../pages/customer/account.page";
import { getCustomerCreationData } from "../../helpers/dataLoader";
import { AddCustomerPage } from "../../../pages/manager/addCustomer.page";
import { add } from "winston";

interface Customer {
  firstName: string;
  lastName: string;
  postCode: string;
}

const customers: Customer[] = getCustomerCreationData();

test.describe("Customer Login - XYZ Bank", { tag: "@e2e" }, () => {
  test(
    "should login as an existing customer from dropdown",
    { tag: ["@smoke", "@regression"] },
    async ({ page }) => {
      const customer = customers[0];
      const customerName = `${customer.firstName} ${customer.lastName}`;
      const msg = await AddCustomerPage.addCustomerAsManager(page, customer);

      // allow reruns: success or duplicate
      expect(
        msg && (msg.includes("Customer added successfully") || msg.toLowerCase().includes("duplicate"))
      ).toBeTruthy();

      const customerLogin = new CustomerLoginPage(page);
      const accountPage = new AccountPage(page);

      await customerLogin.navigateToLogin();
      await customerLogin.loginAs(customerName);

      expect(await accountPage.isLoaded()).toBeTruthy();
    }
  );
});
