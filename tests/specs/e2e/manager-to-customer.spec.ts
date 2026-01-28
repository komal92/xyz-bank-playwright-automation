import { test, expect } from "../../fixtures";
import { LoginPage } from "../../../pages/common/login.page";
import { ManagerPage } from "../../../pages/manager/manager.page";
import { AddCustomerPage } from "../../../pages/manager/addCustomer.page";
import { OpenAccountPage } from "../../../pages/manager/openAccount.page";
import { CustomerListPage } from "../../../pages/manager/customerList.page";

import { CustomerLoginPage } from "../../../pages/customer/customer.page";
import { AccountPage } from "../../../pages/customer/account.page";
import { DepositPage } from "../../../pages/customer/deposit.page";
import { WithdrawPage } from "../../../pages/customer/withdraw.page";
import { TransactionsPage } from "../../../pages/customer/transactions.page";

import { getE2EManagerToCustomerData } from "../../helpers/dataLoader";

function uniquePostCode(base: string) {
  return `${base}-${Date.now()}`;
}

function countAccountTokens(accountText: string | null): number {
  if (!accountText) return 0;
  return accountText.split(/\s+/).filter(Boolean).length;
}

test.describe("E2E - Manager to Customer journey", { tag: "@e2e" }, () => {
  test(
    "should add customer, open accounts, verify account numbers, login as customer and perform deposit/withdraw",
    { tag: ["@smoke", "@regression"] },
    async ({ page }) => {
      const e2e = getE2EManagerToCustomerData();

      // Manager pages
      const loginPage = new LoginPage(page);
      const managerPage = new ManagerPage(page);
      const addCustomerPage = new AddCustomerPage(page);
      const openAccountPage = new OpenAccountPage(page);
      const customerListPage = new CustomerListPage(page);

      // Customer pages
      const customerLoginPage = new CustomerLoginPage(page);
      const customerAccountPage = new AccountPage(page);
      const depositPage = new DepositPage(page);
      const withdrawPage = new WithdrawPage(page);
      const transactionsPage = new TransactionsPage(page);

      // Customer from json (postcode becomes unique per run)
      const firstName = e2e.customer.firstName;
      const lastName = e2e.customer.lastName;
      const postCode = uniquePostCode(e2e.customer.postCodeBase);
      const customerName = `${firstName} ${lastName}`;

      // 1) Manager login
      await loginPage.navigateToLogin();
      await loginPage.loginAsManager();

      // 2) Add customer
      await managerPage.navigateToAddCustomer();
      await addCustomerPage.fillCustomerForm(firstName, lastName, postCode);

      const addDialog = await addCustomerPage.clickAddCustomerAndGetDialogMessage();
      await addCustomerPage.verifyCustomerAddedDialog(addDialog);

      // 3) Customer list: should have no accounts initially
      await managerPage.navigateToCustomerList();
      await customerListPage.searchCustomer(firstName);

      const beforeAccounts = await customerListPage.getCustomerAccountNumbers(customerName, postCode);
      expect(countAccountTokens(beforeAccounts)).toBe(0);

      // 4) Open accounts defined in json
      for (const currency of e2e.accountsToOpen) {
        await managerPage.navigateToOpenAccount();
        expect(await openAccountPage.isOpenAccountPageLoaded()).toBeTruthy();

        const msg = await openAccountPage.openAccountAndGetDialogMessage(customerName, currency);
        await openAccountPage.verifyAccountCreatedDialog(msg);
      }

      // 5) Customer list: should now have N account numbers
      await managerPage.navigateToCustomerList();
      await customerListPage.searchCustomer(firstName);

      const afterAccounts = await customerListPage.getCustomerAccountNumbers(customerName, postCode);
      expect(countAccountTokens(afterAccounts)).toBe(e2e.accountsToOpen.length);

      // 6) Go to customer login
      await customerLoginPage.navigateToLogin();

      // 7) Customer login
      await customerLoginPage.loginAs(customerName);
      expect(await customerAccountPage.isLoaded()).toBeTruthy();

      // 8) Execute actions defined in json
      for (const actionSet of e2e.actions) {
        await customerAccountPage.selectAccountByIndex(actionSet.accountIndex);

        for (const step of actionSet.steps) {
          const beforeBalance = await customerAccountPage.getBalance();

          if (step.type === "deposit") {
            await customerAccountPage.goToDeposit();
            await depositPage.deposit(step.amount);

            const afterBalance = await customerAccountPage.getBalance();
            expect(afterBalance).toBe(beforeBalance + step.amount);
          }

          if (step.type === "withdraw") {
            await customerAccountPage.goToWithdraw();
            await withdrawPage.withdraw(step.amount);

            const afterBalance = await customerAccountPage.getBalance();
            expect(afterBalance).toBe(beforeBalance - step.amount);
          }

          await customerAccountPage.goToTransactions();
          await transactionsPage.waitForTransactionsPageLoaded();
          await transactionsPage.expectTransaction(step.amount, step.expectedTxnType);
        }
      }
    }
  );
});
