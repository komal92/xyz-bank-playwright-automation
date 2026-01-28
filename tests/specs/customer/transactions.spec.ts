import { test, expect } from "../../fixtures";
import { CustomerLoginPage } from "../../../pages/customer/customer.page";
import { AccountPage } from "../../../pages/customer/account.page";
import { TransactionsPage } from "../../../pages/customer/transactions.page";
import { getE2EManagerToCustomerData } from "../../helpers/dataLoader";

test.describe("Customer Transactions", { tag: "@e2e" }, () => {
  test(
    "should display deposit and withdrawal transactions",
    { tag: ["@smoke", "@regression"] },
    async ({ page }) => {
      const e2e = getE2EManagerToCustomerData();

      const customerLoginPage = new CustomerLoginPage(page);
      const accountPage = new AccountPage(page);
      const transactionsPage = new TransactionsPage(page);

      await customerLoginPage.navigateToLogin();
      await customerLoginPage.loginAs(e2e.customer.fullName);

      await accountPage.selectAccountByIndex(0);
      await accountPage.goToTransactions();

      await transactionsPage.waitForTransactionsPageLoaded();

      await transactionsPage.expectTransaction(
        e2e.transactions[0].amount,
        e2e.transactions[0].type
      );
    }
  );
});
