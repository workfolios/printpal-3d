import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

test("creates a persistent planning record, retrieves it, and manages the project lifecycle", async ({ page }) => {
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

  await page.getByRole("button", { name: "Create Saved Plan" }).first().click();
  await expect(page.getByText("Saved Planning Record")).toBeVisible();
  await page.getByRole("button", { name: "Generate Planning View" }).click();

  await expect(page.getByRole("heading", { name: "Editable Plan" })).toBeVisible();
  await expect(page.getByText("Rules-Based Fallback", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Gemini was unavailable|planning service could not be reached/)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByLabel(/Objective Summary/).fill("User-refined objective for the PETG cable clip.");
  await page.getByLabel("User Edit Note").fill("Clarified the target outcome before printing.");
  await page.getByRole("button", { name: "Save Plan" }).click();
  await expect(page.getByText("Saved Locally", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Attempt Detail" }).click();
  await expect(page.getByText("User-refined objective for the PETG cable clip.")).toBeVisible();
  await expect(page.getByText("Rules-Based Fallback", { exact: true }).first()).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Record Library" })).toBeVisible();
  await page.getByPlaceholder("Search title, purpose, or tag").fill("PETG Cable Clip");
  await page.getByRole("button", { name: "Open Record" }).click();
  await expect(page.getByText("User-refined objective for the PETG cable clip.")).toBeVisible();

  await page.getByRole("button", { name: "Record Outcome" }).first().click();
  await expect(page.getByText("Outcome Capture", { exact: true })).toBeVisible();
  await page.getByLabel(/Outcome Status/).selectOption("PARTIALLY_SUCCESSFUL");
  await page.getByLabel(/Observed Result/).fill("The clip fit the cable, with minor flex at the opening.");
  await page.getByLabel("Criterion: Clip fits the target cable").selectOption("MET");
  await page.getByLabel("Criterion: Clip survives normal handling").selectOption("PARTIALLY_MET");
  await page.getByLabel(/Deviations Or Defects/).fill("Small edge lift");
  await page.getByLabel(/Lessons Learned/).fill("Change orientation on the next attempt");
  await expect(page.getByText("Failure Review Prompts")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Save Outcome" }).click();

  await expect(page.getByText("Outcome Saved", { exact: true })).toBeVisible();
  await expect(page.getByText("Partially Successful", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("The clip fit the cable, with minor flex at the opening.")).toBeVisible();

  await page.getByRole("button", { name: "Duplicate Attempt" }).click();
  await expect(page.getByRole("heading", { name: "Create Attempt 2 From Attempt 1" })).toBeVisible();
  await expect(page.getByText("Inherited", { exact: true }).first()).toBeVisible();
  await page.getByLabel(/Planned Attempt Description/).fill("Test a rotated orientation while preserving other context.");
  await page.getByLabel(/Planned Variables/).fill("Orientation");
  await page.getByLabel("Planned Changes").fill("Rotate the part orientation");
  await expect(page.getByText("Changed", { exact: true }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Create Attempt 2" }).click();

  await expect(page.getByText("Attempt 2 · DRAFT", { exact: true })).toBeVisible();
  await expect(page.getByText("Inherited From Attempt 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Rotate the part orientation")).toBeVisible();
  await expect(page.getByText("No Outcome has been recorded for Attempt 2.")).toBeVisible();
  await expect(page.getByText("The clip fit the cable, with minor flex at the opening.")).toHaveCount(0);

  await page.getByRole("button", { name: "Open Attempt 1" }).click();
  await expect(page.getByText("Attempt 1 · OUTCOME_RECORDED", { exact: true })).toBeVisible();
  await expect(page.getByText("The clip fit the cable, with minor flex at the opening.")).toBeVisible();
  await page.getByRole("button", { name: "Open Attempt 2" }).click();
  await expect(page.getByText("Attempt 2 · DRAFT", { exact: true })).toBeVisible();
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
