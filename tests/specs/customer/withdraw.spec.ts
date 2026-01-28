import { test, expect } from "../../fixtures";
import { CustomerLoginPage } from "../../../pages/customer/customer.page";
import { AccountPage } from "../../../pages/customer/account.page";
import { getCustomerCreationData } from "../../helpers/dataLoader";
import { randomAmount } from "../../../utils/random";

import { AddCustomerPage } from "../../../pages/manager/addCustomer.page";
import { OpenAccountPage } from "../../../pages/manager/openAccount.page";
import { ManagerPage } from "../../../pages/manager/manager.page";
import { WithdrawPage } from "../../../pages/customer/withdraw.page";
import { DepositPage } from "../../../pages/customer/deposit.page";

test.describe("Customer Withdraw", { tag: "@e2e" }, () => {
  test(
    "should allow customer to withdraw money",
    { tag: ["@smoke", "@regression"] },
    async ({ page }) => {
      const customerLoginPage = new CustomerLoginPage(page);
      const accountPage = new AccountPage(page);
      const withdrawPage = new WithdrawPage(page);
      const openAccountPage = new OpenAccountPage(page);
      const managerPage = new ManagerPage(page);
      const depositPage = new DepositPage(page);

      const customer = getCustomerCreationData()[0];
      const customerName = `${customer.firstName} ${customer.lastName}`;

      const msg = await AddCustomerPage.addCustomerAsManager(page, customer);
      expect(
        msg &&
          (msg.includes("Customer added successfully") ||
            msg.toLowerCase().includes("duplicate") ||
            msg.toLowerCase().includes("already"))
      ).toBeTruthy();

      await managerPage.navigateToOpenAccount();
      const openAccountMsg = await openAccountPage.openAccountAndGetDialogMessage(
        customerName,
        "Dollar"
      );
      await openAccountPage.verifyAccountCreatedDialog(openAccountMsg);

      await customerLoginPage.navigateToLogin();
      await customerLoginPage.loginAs(customerName);

      await accountPage.selectAccountByIndex(0);

      // Deposit first so withdraw can succeed
      await accountPage.goToDeposit();
      await depositPage.deposit(500);

      // Read balance after deposit and wait until UI is stable
      const beforeBalance = await accountPage.getBalance();
      await accountPage.waitForBalanceToBe(beforeBalance);

      expect(beforeBalance).toBeGreaterThan(20);

      const amountToWithdraw = randomAmount(20, beforeBalance - 1);

      await accountPage.goToWithdraw();
      await withdrawPage.withdraw(amountToWithdraw);
      await withdrawPage.expectWithdrawSuccess();

      const expected = beforeBalance - amountToWithdraw;

      // Wait for UI to reflect withdraw
      await accountPage.waitForBalanceToBe(expected);

      const afterBalance = await accountPage.getBalance();
      expect(afterBalance).toBe(expected);
    }
  );

  test(
    "should not allow customer to withdraw more than available balance",
    { tag: ["@regression"] },
    async ({ page }) => {
      const customerLoginPage = new CustomerLoginPage(page);
      const accountPage = new AccountPage(page);
      const withdrawPage = new WithdrawPage(page);
      const openAccountPage = new OpenAccountPage(page);
      const managerPage = new ManagerPage(page);
      const depositPage = new DepositPage(page);

      const customer = getCustomerCreationData()[0];
      const customerName = `${customer.firstName} ${customer.lastName}`;

      const msg = await AddCustomerPage.addCustomerAsManager(page, customer);
      expect(
        msg &&
          (msg.includes("Customer added successfully") ||
            msg.toLowerCase().includes("duplicate") ||
            msg.toLowerCase().includes("already"))
      ).toBeTruthy();

      await managerPage.navigateToOpenAccount();
      const openAccountMsg = await openAccountPage.openAccountAndGetDialogMessage(
        customerName,
        "Dollar"
      );
      await openAccountPage.verifyAccountCreatedDialog(openAccountMsg);

      await customerLoginPage.navigateToLogin();
      await customerLoginPage.loginAs(customerName);

      await accountPage.selectAccountByIndex(0);

      const beforeBalance = await accountPage.getBalance();
      await accountPage.waitForBalanceToBe(beforeBalance);

      const tooMuch = beforeBalance + randomAmount(50, 200);

      await accountPage.goToWithdraw();
      await withdrawPage.withdraw(tooMuch);

      await withdrawPage.expectWithdrawFailure();

      // Balance should remain unchanged
      await accountPage.waitForBalanceToBe(beforeBalance);

      const afterBalance = await accountPage.getBalance();
      await expect(afterBalance).toBe(beforeBalance);
    }
  );
});
