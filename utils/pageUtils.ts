import { Page } from "@playwright/test";
import { logger } from "./logger";

export async function safeRefresh(page: Page): Promise<void> {
  logger.warn("Refreshing page to recover UI state");

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
}