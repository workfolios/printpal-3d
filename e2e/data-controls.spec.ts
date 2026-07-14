import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

async function openSettings(page: Page) {
  const width = page.viewportSize()?.width ?? 1280;
  if (width < 1024) {
    await page.getByRole("button", { name: /navigation menu/ }).click();
  }
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Portability, recovery, and local control" })).toBeVisible();
}

async function createProject(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Print Record" }).click();
  await page.getByLabel(/Project Name/).fill("Backup Validation Clip");
  await page.getByLabel(/Print Purpose/).fill("Validate portable records and recovery");
  await page.getByLabel(/Success Criteria/).fill("Project restores with its Attempt relationship");
  await page.getByRole("button", { name: /Continue To Attempt Context/ }).click();
  await page.getByLabel(/Material Class/).fill("PETG");
  await page.getByLabel(/Planned Attempt Description/).fill("Create one record for export and recovery validation.");
  await page.getByRole("button", { name: "Create Project And Attempt 1" }).click();
  await expect(page.getByRole("heading", { name: "Backup Validation Clip" })).toBeVisible();
}

test("exports, validates, restores, and reimports local PrintPal data", async ({ page }) => {
  await createProject(page);
  await openSettings(page);
  await expectNoHorizontalOverflow(page);

  await page.getByLabel("Project To Export").selectOption({ label: "Backup Validation Clip" });
  const [projectDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Project JSON" }).click(),
  ]);
  const projectPath = await projectDownload.path();
  expect(projectPath).toBeTruthy();
  await expect(page.getByText(/Exported Backup Validation Clip as structured JSON/)).toBeVisible();

  const [markdownDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Project Markdown" }).click(),
  ]);
  expect(await markdownDownload.path()).toBeTruthy();

  const [backupDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Full Backup JSON" }).click(),
  ]);
  const backupPath = await backupDownload.path();
  expect(backupPath).toBeTruthy();

  await page.getByLabel("Enter DELETE ALL").fill("DELETE ALL");
  await page.getByRole("button", { name: "Delete All Local Data" }).click();
  await expect(page.getByText(/All local PrintPal records and settings were deleted/)).toBeVisible();

  await page.getByLabel("Select PrintPal JSON export").setInputFiles(backupPath!);
  await expect(page.getByText("Complete PrintPal Full Backup")).toBeVisible();
  await expect(page.getByText("Validated", { exact: true })).toBeVisible();
  await page.getByLabel("Enter REPLACE ALL").fill("REPLACE ALL");
  await page.getByRole("button", { name: "Replace All From Backup" }).click();
  await expect(page.getByText(/Full Backup replaced the prior local PrintPal data successfully/)).toBeVisible();

  const width = page.viewportSize()?.width ?? 1280;
  if (width < 1024) await page.getByRole("button", { name: /navigation menu/ }).click();
  await page.getByRole("button", { name: "Records" }).click();
  await expect(page.getByRole("heading", { name: "Backup Validation Clip" })).toBeVisible();

  await openSettings(page);
  await page.getByLabel("Select PrintPal JSON export").setInputFiles(projectPath!);
  await expect(page.getByText("Project: Backup Validation Clip")).toBeVisible();
  await page.getByRole("button", { name: "Import As New Project" }).click();
  await expect(page.getByText(/Imported Backup Validation Clip as a new local Project/)).toBeVisible();
  await page.getByRole("button", { name: "Open Imported Project" }).click();
  await expect(page.getByRole("heading", { name: "Backup Validation Clip" })).toBeVisible();
  await expect(page.getByText("Attempt 1 · DRAFT")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("rejects an invalid import before writing local records", async ({ page }) => {
  await page.goto("/");
  await openSettings(page);
  await page.getByLabel("Select PrintPal JSON export").setInputFiles({
    name: "invalid-printpal.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"format":"NOT_PRINTPAL"}'),
  });
  await expect(page.getByText(/not a compatible PrintPal export/)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
