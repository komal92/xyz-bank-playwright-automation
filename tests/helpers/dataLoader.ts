import fs from "fs";
import path from "path";

function loadJsonFile(filename: string) {
  const filePath = path.join(__dirname, `../../data/${filename}`);
  const rawData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(rawData);
}

export function getCustomerCreationData() {
  return loadJsonFile("customers.json");
}

export function getOpenAccountData() {
  return loadJsonFile("openAccount.json");
}

export function getTransactionData() {
  return loadJsonFile("transactions.json");
}

export function getLoginData() {
  return loadJsonFile("customers.json"); // Reuse customers file
}

export function getErrorMessages() {
  return loadJsonFile("errorMessages.json");
}

export function getDepositData() {
  return loadJsonFile("deposit.json");
}

export function getWithdrawData() {
  return loadJsonFile("withdraw.json");
}

export function getE2EManagerToCustomerData() {
  return loadJsonFile("e2e.json");
}