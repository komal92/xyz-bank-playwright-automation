import { test, expect } from "../../fixtures";
import { LoginPage } from "../../../pages/common/login.page";
import { ManagerPage } from "../../../pages/manager/manager.page";
import { AddCustomerPage } from "../../../pages/manager/addCustomer.page";
import { CustomerListPage } from "../../../pages/manager/customerList.page";
import { getCustomerCreationData } from "../../helpers/dataLoader";

// Define Customer interface
interface Customer {
  firstName: string;
  lastName: string;
  postCode: string;
}

const customerData: Customer[] = getCustomerCreationData();

// Entire suite is end-to-end
test.describe("Add Customer - XYZ Bank", { tag: "@e2e" }, () => {
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

  // Smoke: basic navigation sanity check
  test(
    "should navigate to Add Customer page",
    { tag: "@smoke" },
    async () => {
      const isManagerPageLoaded = await managerPage.isManagerPageLoaded();
      expect(isManagerPageLoaded).toBeTruthy();

      await managerPage.navigateToAddCustomer();
      const isAddCustomerPageLoaded =
        await addCustomerPage.isAddCustomerPageLoaded();
      expect(isAddCustomerPageLoaded).toBeTruthy();
    }
  );

  // Regression + E2E: data-driven customer creation
  customerData.forEach((customer: Customer) => {
    test(
      `should create customer ${customer.firstName} ${customer.lastName} with postCode ${customer.postCode}`,
      { tag: "@regression" },
      async () => {
        await managerPage.navigateToAddCustomer();
        expect(await addCustomerPage.isAddCustomerPageLoaded()).toBeTruthy();

        await addCustomerPage.fillCustomerForm(
          customer.firstName,
          customer.lastName,
          customer.postCode
        );

        const dialogMessage =
          await addCustomerPage.clickAddCustomerAndGetDialogMessage();
        await addCustomerPage.verifyCustomerAddedDialog(dialogMessage);

        await managerPage.navigateToCustomerList();
        expect(await customerListPage.isCustomerListLoaded()).toBeTruthy();

        const customerFullName = `${customer.firstName} ${customer.lastName}`;
        const postcode = customer.postCode;
        const isCustomerInList =
          await customerListPage.isCustomerInList(customerFullName, postcode);
        expect(isCustomerInList).toBeTruthy();

        const detailsMatch =
          await customerListPage.verifyCustomerDetails(
            customerFullName,
            customer.postCode
          );
        expect(detailsMatch).toBeTruthy();
      }
    );
  });

  // Regression: post-submit state validation
  test(
    "should clear form after customer creation",
    { tag: "@regression" },
    async () => {
      const firstCustomer = customerData[0];

      await managerPage.navigateToAddCustomer();

      await addCustomerPage.fillCustomerForm(
        firstCustomer.firstName,
        firstCustomer.lastName,
        firstCustomer.postCode
      );

      const dialogMessage =
        await addCustomerPage.clickAddCustomerAndGetDialogMessage();
      await addCustomerPage.verifyCustomerAddedDialog(dialogMessage);

      const firstNameValue = await addCustomerPage.getFirstNameValue();
      const lastNameValue = await addCustomerPage.getLastNameValue();
      const postCodeValue = await addCustomerPage.getPostCodeValue();

      expect(firstNameValue).toBe("");
      expect(lastNameValue).toBe("");
      expect(postCodeValue).toBe("");
    }
  );

  // Regression: negative / duplicate scenario
  test(
    "should throw duplicate customer error & form is not cleared",
    { tag: "@regression" },
    async () => {
      const firstCustomer = customerData[0];

      await managerPage.navigateToAddCustomer();

      await addCustomerPage.fillCustomerForm(
        firstCustomer.firstName,
        firstCustomer.lastName,
        firstCustomer.postCode
      );

      await addCustomerPage.clickAddCustomerAndGetDialogMessage();

      await addCustomerPage.fillCustomerForm(
        firstCustomer.firstName,
        firstCustomer.lastName,
        firstCustomer.postCode
      );

      const duplicateMessage =
        await addCustomerPage.clickAddCustomerAndGetDialogMessage();
      await addCustomerPage.verifyDuplicateErrorDialog(duplicateMessage);

      const firstNameValue = await addCustomerPage.getFirstNameValue();
      const lastNameValue = await addCustomerPage.getLastNameValue();
      const postCodeValue = await addCustomerPage.getPostCodeValue();

      expect(firstNameValue).not.toBe("");
      expect(lastNameValue).not.toBe("");
      expect(postCodeValue).not.toBe("");
    }
  );

  // Smoke + E2E: immediate availability check
  test(
    "should display customer in list immediately after creation and has no account numbers",
    { tag: ["@smoke", "@e2e"] },
    async () => {
      const firstCustomer = customerData[0];
      const fullName = `${firstCustomer.firstName} ${firstCustomer.lastName}`;

      await managerPage.navigateToAddCustomer();
      await addCustomerPage.fillCustomerForm(
        firstCustomer.firstName,
        firstCustomer.lastName,
        firstCustomer.postCode
      );

      // IMPORTANT: actually submit so the customer is created
      const dialogMessage =
        await addCustomerPage.clickAddCustomerAndGetDialogMessage();
      await addCustomerPage.verifyCustomerAddedDialog(dialogMessage);

      await managerPage.navigateToCustomerList();

      // (Optional but helps flakiness) search reduces scrolling issues
      await customerListPage.searchCustomer(firstCustomer.firstName);

      const postCode = await customerListPage.getCustomerPostCode(fullName);
      expect(postCode).not.toBeNull();
      expect(postCode!).toContain(firstCustomer.postCode);
      expect(await customerListPage.hasNoAccountNumbers(fullName, firstCustomer.postCode)).toBeTruthy();
    }
  );
});