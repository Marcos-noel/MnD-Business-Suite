import { test, expect } from "@playwright/test";

const orgSlug = process.env.STOREFRONT_ORG_SLUG || "demo";

function uniqueEmail() {
  const stamp = Date.now();
  return `e2e+${stamp}@example.com`;
}

test("storefront account flow", async ({ page }) => {
  const email = uniqueEmail();
  const startUrl = `/store/${orgSlug}/login?redirect=/store/${orgSlug}/account`;

  await page.goto(startUrl);

  await page.getByRole("button", { name: /sign up/i }).click();

  await page.getByLabel(/full name/i).fill("E2E Shopper");
  await page.getByLabel(/phone/i).fill("+254700000000");
  await page.getByLabel(/email/i).fill(email);

  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(new RegExp(`/store/${orgSlug}/account`));

  await page.getByRole("link", { name: /profile/i }).click();
  await page.getByRole("button", { name: /edit profile/i }).click();

  await page.getByLabel(/full name/i).fill("E2E Shopper Updated");
  await page.getByRole("button", { name: /save changes/i }).click();
  await expect(page.getByText(/profile updated successfully/i)).toBeVisible();

  await page.getByRole("link", { name: /orders/i }).click();
  await page.getByPlaceholder(/order number or product/i).fill("test");
  await expect(page.getByText(/showing/i)).toBeVisible();
});

