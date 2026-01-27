import { expect, Page } from "@playwright/test";

// ===== LOGIN PAGE ASSERTIONS =====
export async function verifyLoginPageLoaded(page: Page) {
  await expect(page.getByRole("button", { name: "Bank Manager Login" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Customer Login" })).toBeVisible();
  await expect(page.locator("text=XYZ Bank")).toBeVisible();
}

export async function verifyLoginUrl(page: Page) {
  await expect(page).toHaveURL(/#\/login/);
}

// ===== BANK MANAGER ASSERTIONS =====
export async function verifyManagerPageLoaded(page: Page) {
  await expect(page).toHaveURL(/#\/manager/);
  await expect(page.getByRole("button", { name: "Add Customer" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Account" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Customers" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
}

export async function verifyAddCustomerPageLoaded(page: Page) {
  await expect(page).toHaveURL(/#\/addCust/);
  await expect(page.locator("input[ng-model='fName']")).toBeVisible();
  await expect(page.locator("input[ng-model='lName']")).toBeVisible();
  await expect(page.locator("input[ng-model='postCd']")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Customer" })).toBeVisible();
}

export async function verifyCustomerListPageLoaded(page: Page) {
  await expect(page).toHaveURL(/#\/list/);
  await expect(page.locator("table")).toBeVisible();
}

export async function verifyCustomerCreated(page: Page, customerName: string) {
  const customerRow = page.locator(`text=${customerName}`);
  await expect(customerRow).toBeVisible();
}

export async function verifyCustomerInTable(page: Page, customerName: string, postCode: string) {
  const customerRow = page.locator(`text=${customerName}`);
  await expect(customerRow).toBeVisible();
  
  // Verify postCode is in the same row
  const row = customerRow.locator("..");
  await expect(row).toContainText(postCode);
}

export async function verifyCustomerCreationSuccess(page: Page) {
  // Handle alert dialog
  const alertPromise = page.waitForEvent("dialog");
  await alertPromise.then((dialog) => {
    expect(dialog.message()).toContain("Customer added successfully");
    dialog.accept();
  });
}

export async function verifyCustomerDeleted(page: Page, customerName: string) {
  const customerRow = page.locator(`text=${customerName}`);
  await expect(customerRow).not.toBeVisible();
}

// ===== CUSTOMER LOGIN ASSERTIONS =====
export async function verifyCustomerLoginPageLoaded(page: Page) {
  await expect(page.locator("text=Your Name")).toBeVisible();
  await expect(page.locator("text=Account Number")).toBeVisible();
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
}

export async function verifyCustomerPageLoaded(page: Page) {
  await expect(page).toHaveURL(/#\/account/);
  await expect(page.locator("text=Deposit")).toBeVisible();
  await expect(page.locator("text=Withdraw")).toBeVisible();
  await expect(page.locator("text=Transactions")).toBeVisible();
}

// ===== ACCOUNT OPERATIONS ASSERTIONS =====
export async function verifyDepositSuccess(page: Page) {
  const successMessage = page.locator("text=Deposit Successful");
  await expect(successMessage).toBeVisible();
}

export async function verifyWithdrawSuccess(page: Page) {
  const successMessage = page.locator("text=Transaction Successful");
  await expect(successMessage).toBeVisible();
}

export async function verifyInsufficientFunds(page: Page) {
  const errorMessage = page.locator("text=Transaction Failed");
  await expect(errorMessage).toBeVisible();
}

export async function verifyAccountBalance(page: Page, expectedBalance: string) {
  const balanceText = page.locator(`text=${expectedBalance}`);
  await expect(balanceText).toBeVisible();
}

// ===== TRANSACTIONS ASSERTIONS =====
export async function verifyTransactionDisplayed(page: Page, transactionType: string) {
  const transaction = page.locator(`text=${transactionType}`);
  await expect(transaction).toBeVisible();
}

export async function verifyTransactionTableLoaded(page: Page) {
  const table = page.locator("table");
  await expect(table).toBeVisible();
  await expect(page.locator("th, td")).toBeTruthy();
}

// ===== GENERAL ASSERTIONS =====
export async function verifyManagerUrl(page: Page) {
  await expect(page).toHaveURL(/#\/manager/);
}

export async function verifyLogoutSuccess(page: Page) {
  await expect(page).toHaveURL(/#\/login/);
  await expect(page.getByRole("button", { name: "Bank Manager Login" })).toBeVisible();
}

export async function verifyErrorMessage(page: Page, errorText: string) {
  const error = page.locator(`text=${errorText}`);
  await expect(error).toBeVisible();
}

export async function verifyButtonEnabled(page: Page, buttonName: string) {
  const button = page.getByRole("button", { name: buttonName });
  await expect(button).toBeEnabled();
}

export async function verifyButtonDisabled(page: Page, buttonName: string) {
  const button = page.getByRole("button", { name: buttonName });
  await expect(button).toBeDisabled();
}