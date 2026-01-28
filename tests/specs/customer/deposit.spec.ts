import { test, expect } from "../../fixtures";
import { CustomerLoginPage } from "../../../pages/customer/customer.page";
import { AccountPage } from "../../../pages/customer/account.page";
import { DepositPage } from "../../../pages/customer/deposit.page";
import { getCustomerCreationData } from "../../helpers/dataLoader";
import { randomAmount } from "../../../utils/random";
import { AddCustomerPage } from "pages/manager/addCustomer.page";
import { OpenAccountPage } from "pages/manager/openAccount.page";
import { ManagerPage } from "pages/manager/manager.page";

test.describe("Customer Deposit", { tag: "@e2e" }, () => {
  test(
    "should allow customer to deposit money",
    { tag: ["@smoke", "@regression"] },
    async ({ page }) => {

      const customerLoginPage = new CustomerLoginPage(page);
      const accountPage = new AccountPage(page);
      const depositPage = new DepositPage(page);
      const openAccountPage = new OpenAccountPage(page);
      const managerPage = new ManagerPage(page);

      const customer = getCustomerCreationData()[0];

      const customerName = `${customer.firstName} ${customer.lastName}`;
      const msg = await AddCustomerPage.addCustomerAsManager(page, customer);

      // allow reruns: success or duplicate
      expect(
        msg && (msg.includes("Customer added successfully") || msg.toLowerCase().includes("duplicate"))
      ).toBeTruthy();

     
      await managerPage.navigateToOpenAccount();

      const openAccountMsg = await openAccountPage.openAccountAndGetDialogMessage(customerName, "Dollar");
      await openAccountPage.verifyAccountCreatedDialog(openAccountMsg);

      await customerLoginPage.navigateToLogin();
      await customerLoginPage.loginAs(customerName);

      const beforeBalance = await accountPage.getBalance();

      const amountToDeposit = randomAmount(100, 1000);

      await accountPage.goToDeposit();
      await depositPage.deposit(amountToDeposit);

      const afterBalance = await accountPage.getBalance();
      expect(afterBalance).toBe(beforeBalance + amountToDeposit);
    }
  );
});


