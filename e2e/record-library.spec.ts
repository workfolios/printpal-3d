import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

test("creates, retrieves, filters, archives, and restores a project", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Record Library" })).toBeVisible();
  await expect(page.getByText("Build your first reusable print record")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Start New Print Record" }).click();
  await expect(page.getByRole("heading", { name: "Create a project and Attempt 1" })).toBeVisible();

  await page.getByLabel(/Project Name/).fill("PETG Cable Clip");
  await page.getByLabel(/Print Purpose/).fill("Create a repeatable functional clip");
  await page.getByLabel(/Success Criteria/).fill("Clip fits the target cable\nClip survives normal handling");
  await page.getByLabel("Tags").fill("PETG, functional");
  await page.getByRole("button", { name: /Continue To Attempt Context/ }).click();

  await page.getByLabel(/Material Class/).fill("PETG");
  await page.getByLabel(/Planned Attempt Description/).fill("Establish fit using the baseline geometry.");
  await page.getByLabel("Known Concerns").fill("Bed adhesion\nDimensional fit");
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Create Project And Attempt 1" }).click();

  await expect(page.getByRole("heading", { name: "PETG Cable Clip" })).toBeVisible();
  await expect(page.getByText("Attempt 1 · DRAFT")).toBeVisible();
  await expect(page.getByText("PETG", { exact: true }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Record Library" }).click();
  await expect(page.getByRole("heading", { name: "PETG Cable Clip" })).toBeVisible();

  await page.getByPlaceholder("Search title, purpose, or tag").fill("functional");
  await expect(page.getByText("1 record", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Archive" }).click();
  await expect(page.getByRole("button", { name: "Restore" })).toBeVisible();

  await page.getByLabel("Filter by lifecycle status").selectOption("ARCHIVED");
  await expect(page.getByRole("heading", { name: "PETG Cable Clip" })).toBeVisible();

  await page.getByRole("button", { name: "Restore" }).click();
  await page.getByLabel("Filter by lifecycle status").selectOption("ACTIVE");
  await expect(page.getByRole("heading", { name: "PETG Cable Clip" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
