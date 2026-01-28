# XYZ Bank Playwright Automation (TypeScript)

Automated test framework for the XYZ Bank demo app using Playwright + TypeScript and Page Object Model (POM).

Application under test:
- https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login

## What this framework demonstrates

- Page Object Model (POM) for maintainable UI automation
- Test suites that can be executed separately (Manager / Customer / E2E / Visual)
- Tag-based execution (smoke / regression / e2e / visual)
- Cross-browser execution (Chromium, Firefox, WebKit)
- Data-driven tests using JSON + a shared dataLoader
- Reporting: Playwright HTML report + Allure report
- Visual regression using Playwright `toHaveScreenshot()` baseline snapshots

Beyond acceptance criteria

- In addition to the required user stories, this framework includes:
- Duplicate customer creation handling
- Withdraw more than available balance (negative scenario)
- Search and delete customer scenarios
- Full Manager → Customer end-to-end journey
- Visual regression testing

Cross-browser execution with tagged suites
## Tech stack

- Playwright Test (TypeScript)
- POM under `pages/`
- Test specs under `tests/specs/`
- Test data in `data/`
- Utilities in `utils/`
- HTML reporting (Playwright)
- Allure reporting (allure-playwright)

## Project structure

- `pages/`
  - `common/` (Login page)
  - `manager/` (Add customer, open account, customer list)
  - `customer/` (Customer login, account, deposit, withdraw, transactions)
- `tests/`
  - `specs/manager/` (manager flows)
  - `specs/customer/` (customer flows)
  - `specs/e2e/` (end-to-end journey)
  - `visual/` (visual regression specs)
  - `helpers/` (dataLoader, assertions)
  - `fixtures.ts` (shared test setup if needed)
- `data/`
  - `customers.json`
  - `openAccount.json`
  - `e2e.json`
- `utils/`
  - `logger.ts`
  - `random.ts`
- `playwright.config.ts`
- `.env` (local only, not committed)

## Setup

Prerequisites:
- Node.js 18+ recommended

Install dependencies:
```bash
npm install 
```

Environment setup

Create a local .env file in the project root (this file is not committed):
```bash
BASE_URL=https://www.globalsqa.com/angularJs-protractor/BankingProject
```

Visual regression testing

Visual tests are implemented using Playwright snapshot testing.
Run visual tests (compare against baseline):
```bash
npm run test:visual
```
Update visual baselines:
```bash
npm run test:visual
```
Note: Visual tests are recommended to run on Chromium only to avoid OS and font rendering differences.

Allure report
Generate:
```bash
npm run report:allure
```
Open:
```bash
npm run report:allure:open
```




