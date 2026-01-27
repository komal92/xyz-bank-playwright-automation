import { test, expect } from "../../fixtures";
import { LoginPage } from "../../../pages/common/login.page";
import { ManagerPage } from "../../../pages/manager/manager.page";
import { OpenAccountPage } from "../../../pages/manager/openAccount.page";
import { getOpenAccountData } from "../../helpers/dataLoader";

// Define Open Account interface
interface OpenAccount {
  customerName: string;
  currency: string;
}

const openAccountData: OpenAccount[] = getOpenAccountData();

// Entire suite is end-to-end
test.describe("🏦 Open Account - XYZ Bank", { tag: "@e2e" }, () => {
  let loginPage: LoginPage;
  let managerPage: ManagerPage;
  let openAccountPage: OpenAccountPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    managerPage = new ManagerPage(page);
    openAccountPage = new OpenAccountPage(page);

    await loginPage.navigateToLogin();
    await loginPage.loginAsManager();
  });

  test(
    "should navigate to Open Account page",
    { tag: ["@smoke", "@regression"] },
    async () => {
      const isManagerPageLoaded = await managerPage.isManagerPageLoaded();
      expect(isManagerPageLoaded).toBeTruthy();

      await managerPage.navigateToOpenAccount();
      const isOpenAccountPageLoaded =
        await openAccountPage.isOpenAccountPageLoaded();
      expect(isOpenAccountPageLoaded).toBeTruthy();
    }
  );

  openAccountData.forEach((account: OpenAccount) => {
    test(
      `should open ${account.currency} account for ${account.customerName}`,
      { tag: "@regression" },
      async () => {
        await managerPage.navigateToOpenAccount();
        expect(await openAccountPage.isOpenAccountPageLoaded()).toBeTruthy();

        const dialogPromise = openAccountPage.page.waitForEvent("dialog");

        await openAccountPage.openAccount(
          account.customerName,
          account.currency
        );

        const dialog = await dialogPromise;
        expect(dialog.message()).toContain("Account created successfully");
        await dialog.accept();
      }
    );
  });

  test(
    "should display all dropdown options",
    { tag: "@regression" },
    async () => {
      await managerPage.navigateToOpenAccount();

      await expect(openAccountPage.customerSelect).toBeVisible();
      await expect(openAccountPage.currencySelect).toBeVisible();
      await expect(openAccountPage.processButton).toBeVisible();
    }
  );

  test(
    "should select customer and currency correctly",
    { tag: "@regression" },
    async () => {
      const firstAccount = openAccountData[0];

      await managerPage.navigateToOpenAccount();

      await openAccountPage.selectCustomer(firstAccount.customerName);
      await openAccountPage.selectCurrency(firstAccount.currency);

      const selectedCustomer =
        await openAccountPage.customerSelect.inputValue();
      const selectedCurrency =
        await openAccountPage.currencySelect.inputValue();

      expect(selectedCustomer).toBeTruthy();
      expect(selectedCurrency).toBeTruthy();
    }
  );
});
