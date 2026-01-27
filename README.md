# XYZ Bank Test Automation (Playwright + TypeScript + BDD)

## Project Overview
This repository contains an automated test solution for the **XYZ Bank** demo application using:
- **Playwright** + **TypeScript**
- **Page Object Model (POM)** design pattern
- Test suite execution via **tags** and **separate folders**

**Application Under Test:**  
https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login

---

## Tech Stack
- Playwright
- TypeScript
- Cucumber (BDD) [~ Future Implementation]
- Node.js / npm


npm i -D allure-playwright
npm i -D allure-commandline
npx playwright test
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report

npm i -D @cucumber/cucumber ts-node typescript

BDD scenarios are executed using Cucumber, with Playwright handling browser automation and assertions.

Visual testing
npm i -D pixelmatch pngjs
npm i -D @types/pngjs

npm i winston





