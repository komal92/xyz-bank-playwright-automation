import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import "tsconfig-paths/register";


dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
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
    headless: process.env.CI ? true : false,

    // ✅ Artifacts that make HTML report very useful
   // viewport: { width: 1280, height: 720 },
   
    trace: "retain-on-failure",         
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: null, // 👈 makes browser use full available screen
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
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
