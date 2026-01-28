import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";


dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ✅ Better reporting: console + HTML report with a fixed output folder
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["allure-playwright"],
  ],


  use: {
    // ✅ Prefer baseURL without hash for this app, then navigate using /#/login
    baseURL: process.env.BASE_URL,
    headless: true,
    viewport: { width: 1920, height: 1080 },

    // ✅ Artifacts that make HTML report very useful
   // viewport: { width: 1280, height: 720 },
   
    trace: "retain-on-failure",         
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    launchOptions: {
      args: ["--start-maximized"], // Chromium-based browsers
    },
  },

  

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01, // allow tiny pixel differences (1%)
    },
  },


  projects: [
    // 🔵 Chromium – runs ALL tests (including visual)
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // 🟠 Firefox – excludes visual tests
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      grepInvert: /@visual/,
    },

    // 🟢 WebKit – excludes visual tests
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      grepInvert: /@visual/,
    },
  ],
});
