import { test as base, expect, Page } from "@playwright/test";
import { LoginPage } from "../pages/common/login.page";
import { ManagerPage } from "../pages/manager/manager.page";
import { AddCustomerPage } from "../pages/manager/addCustomer.page";
import { CustomerListPage } from "../pages/manager/customerList.page";

type TestFixtures = {
  loginPage: Page;
  managerPage: ManagerPage;
  addCustomerPage: AddCustomerPage;
  customerListPage: CustomerListPage;
};

// Helper type for Playwright fixture "use"
type Use<T> = (fixture: T) => Promise<void>;

export const test = base.extend<TestFixtures>({
  loginPage: async (
    { page }: { page: Page },
    use: Use<Page>
  ) => {
    await page.goto("");
    await page.waitForURL(/#\/login/);

    await expect(
      page.getByRole("button", { name: "Bank Manager Login" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Customer Login" })
    ).toBeVisible();

    await use(page);
  },

  managerPage: async (
    { page }: { page: Page },
    use: Use<ManagerPage>
  ) => {
    const login = new LoginPage(page);
    await login.navigateToLogin();
    await login.loginAsManager();

    await use(new ManagerPage(page));
  },

  addCustomerPage: async (
    { page }: { page: Page },
    use: Use<AddCustomerPage>
  ) => {
    await use(new AddCustomerPage(page));
  },

  customerListPage: async (
    { page }: { page: Page },
    use: Use<CustomerListPage>
  ) => {
    await use(new CustomerListPage(page));
  },
});

export { expect };
