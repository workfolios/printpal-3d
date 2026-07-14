import { expect, test, type Page, type TestInfo } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

async function openPrimaryNavigation(page: Page, name: string | RegExp) {
  const width = page.viewportSize()?.width ?? 1280;
  if (width < 1024) {
    await page.getByRole("button", { name: /navigation menu/ }).click();
  }
  await page.getByRole("button", { name }).click();
}

async function expectAccessibleStructure(page: Page, context: string) {
  const findings = await page.evaluate(() => {
    const duplicateIds = Array.from(document.querySelectorAll<HTMLElement>("[id]"))
      .map((element) => element.id)
      .filter((id, index, values) => values.indexOf(id) !== index);
    const unlabeledControls = Array.from(document.querySelectorAll<HTMLElement>("button, input, select, textarea, a[href]"))
      .filter((element) => {
        if (element.getAttribute("aria-hidden") === "true") return false;
        const ariaLabel = element.getAttribute("aria-label")?.trim();
        const labelledBy = element.getAttribute("aria-labelledby")?.trim();
        const text = element.textContent?.trim();
        const title = element.getAttribute("title")?.trim();
        const id = element.id;
        const explicitLabel = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
        return !ariaLabel && !labelledBy && !text && !title && !explicitLabel;
      })
      .map((element) => `${element.tagName.toLowerCase()}#${element.id || "no-id"}`);
    const imagesWithoutAlt = Array.from(document.querySelectorAll<HTMLImageElement>("img:not([alt])")).map((image) => image.src);
    return { duplicateIds: Array.from(new Set(duplicateIds)), unlabeledControls, imagesWithoutAlt };
  });
  expect(findings.duplicateIds, `${context}: duplicate IDs`).toEqual([]);
  expect(findings.unlabeledControls, `${context}: unlabeled interactive controls`).toEqual([]);
  expect(findings.imagesWithoutAlt, `${context}: images without alt text`).toEqual([]);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
}

async function captureCheckpoint(page: Page, testInfo: TestInfo, name: string) {
  if (!testInfo.project.name.includes("chromium")) return;
  const body = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, { body, contentType: "image/png" });
}

test("provides accessible navigation, reference tools, responsive layouts, and checkpoint screenshots", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Record Library" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectAccessibleStructure(page, "Record Library");
  await captureCheckpoint(page, testInfo, "01-record-library.png");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await openPrimaryNavigation(page, "Reference Tools");
  await expect(page.getByRole("heading", { name: "Standalone advisory utilities" })).toBeVisible();
  await expectAccessibleStructure(page, "Reference Tools");
  await expectNoHorizontalOverflow(page);
  await captureCheckpoint(page, testInfo, "02-reference-tools.png");

  await page.getByRole("button", { name: "Open Materials Compass" }).click();
  await expect(page.getByRole("heading", { name: "Materials Compass" })).toBeVisible();
  await expectAccessibleStructure(page, "Materials Compass");
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Back To Reference Tools" }).click();
  await page.getByRole("button", { name: "Open Failure Review" }).click();
  await expect(page.getByRole("heading", { name: "Failure Review" })).toBeVisible();
  await expectAccessibleStructure(page, "Failure Review");
  await expectNoHorizontalOverflow(page);

  await openPrimaryNavigation(page, "Settings");
  await expect(page.getByRole("heading", { name: "Portability, recovery, and local control" })).toBeVisible();
  await expectAccessibleStructure(page, "Settings And Data");
  await expectNoHorizontalOverflow(page);
  await captureCheckpoint(page, testInfo, "03-settings-and-data.png");
});

test("completes the V0.4 record loop and preserves all relationships through backup restoration", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Print Record" }).click();
  await page.getByLabel(/Project Name/).fill("V0.4 Integrated Loop");
  await page.getByLabel(/Print Purpose/).fill("Validate the complete plan-to-next-test record loop");
  await page.getByLabel(/Success Criteria/).fill("Part fits the intended opening");
  await page.getByRole("button", { name: /Continue To Attempt Context/ }).click();
  await page.getByLabel(/Material Class/).fill("PETG");
  await page.getByLabel(/Planned Attempt Description/).fill("Establish a baseline orientation and documented result.");
  await page.getByLabel("Known Concerns").fill("Dimensional fit");
  await page.getByRole("button", { name: "Create Project And Attempt 1" }).click();

  await page.getByRole("button", { name: "Create Saved Plan" }).first().click();
  await expect(page.getByText("Material Context Checklist")).toBeVisible();
  await page.getByRole("button", { name: "Generate Planning View" }).click();
  await expect(page.getByRole("heading", { name: "Editable Plan" })).toBeVisible();
  await page.getByLabel(/Objective Summary/).fill("Document a baseline before changing orientation.");
  await page.getByLabel("User Edit Note").fill("Integrated regression checkpoint edit.");
  await page.getByRole("button", { name: "Save Plan" }).click();
  await expect(page.getByText("Saved Locally", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Attempt Detail" }).click();

  await page.reload();
  await page.getByRole("button", { name: "Open Record" }).click();
  await expect(page.getByText("Document a baseline before changing orientation.")).toBeVisible();

  await page.getByRole("button", { name: "Record Outcome" }).first().click();
  await page.getByLabel(/Outcome Status/).selectOption("PARTIALLY_SUCCESSFUL");
  await page.getByLabel(/Observed Result/).fill("The part fit with minor movement at the opening.");
  await page.getByLabel("Criterion: Part fits the intended opening").selectOption("PARTIALLY_MET");
  await page.getByLabel(/Deviations Or Defects/).fill("Minor movement");
  await page.getByLabel(/Lessons Learned/).fill("Test orientation as the next primary variable");
  await expect(page.getByText("Failure Review Prompts")).toBeVisible();
  await page.getByRole("button", { name: "Save Outcome" }).click();

  await page.getByRole("button", { name: "Duplicate Attempt" }).click();
  await page.getByLabel(/Planned Attempt Description/).fill("Rotate the part while preserving the other recorded context.");
  await page.getByLabel(/Planned Variables/).fill("Orientation");
  await page.getByLabel("Planned Changes").fill("Rotate the part orientation");
  await page.getByRole("button", { name: "Create Attempt 2" }).click();

  await page.getByRole("button", { name: "Record Outcome" }).first().click();
  await page.getByLabel(/Outcome Status/).selectOption("SUCCESSFUL");
  await page.getByLabel(/Observed Result/).fill("The rotated part fit without movement.");
  await page.getByLabel("Criterion: Part fits the intended opening").selectOption("MET");
  await page.getByLabel(/Lessons Learned/).fill("The rotated orientation warrants a controlled repeat.");
  await page.getByRole("button", { name: "Save Outcome" }).click();

  await page.getByRole("button", { name: "Compare Attempts" }).click();
  await page.getByRole("button", { name: "Create Deterministic Comparison" }).click();
  await expect(page.getByRole("heading", { name: "Deterministic Comparison" })).toBeVisible();
  await page.getByRole("button", { name: "Interpret And Plan" }).click();
  await page.getByRole("button", { name: "Generate Interpretation" }).click();
  const interpretation = page.locator("label").filter({ hasText: "Interpretation Summary" }).locator("textarea");
  await interpretation.fill("The recorded difference may warrant a controlled orientation repeat; the comparison does not establish causation.");
  await page.getByRole("button", { name: "Save Interpretation" }).click();

  await page.getByRole("button", { name: "Generate Plan" }).click();
  const primaryVariable = page.locator("label").filter({ hasText: "Primary Variable" }).locator("input");
  await primaryVariable.fill("Orientation only");
  await page.getByRole("button", { name: "Accept Plan" }).click();
  await expect(page.getByText(/Next-Test Plan accepted/)).toBeVisible();
  await captureCheckpoint(page, testInfo, "04-decision-support.png");

  await openPrimaryNavigation(page, "Settings");
  await page.getByLabel("Project To Export").selectOption({ label: "V0.4 Integrated Loop" });
  const [projectDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Project JSON" }).click(),
  ]);
  expect(await projectDownload.path()).toBeTruthy();

  const [backupDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Full Backup JSON" }).click(),
  ]);
  const backupPath = await backupDownload.path();
  expect(backupPath).toBeTruthy();

  await page.getByLabel("Enter DELETE ALL").fill("DELETE ALL");
  await page.getByRole("button", { name: "Delete All Local Data" }).click();
  await page.getByLabel("Select PrintPal JSON export").setInputFiles(backupPath!);
  await page.getByLabel("Enter REPLACE ALL").fill("REPLACE ALL");
  await page.getByRole("button", { name: "Replace All From Backup" }).click();

  await openPrimaryNavigation(page, "Records");
  await page.getByRole("button", { name: "Open Record" }).click();
  await expect(page.getByText("Attempt 2 · COMPARED", { exact: true })).toBeVisible();
  const comparisonButton = page.getByRole("button", { name: /Open comparison Attempt/ }).first();
  await comparisonButton.click();
  await page.getByRole("button", { name: "Interpret And Plan" }).click();
  await expect(page.locator("label").filter({ hasText: "Primary Variable" }).locator("input")).toHaveValue("Orientation only");
  await expect(page.getByText("ACCEPTED")).toBeVisible();
  await expect(page.getByText(/recorded difference may warrant/)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
