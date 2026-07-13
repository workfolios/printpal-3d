import { expect, test } from "@playwright/test";

const projectId = "71111111-1111-4111-8111-111111111111";
const attemptAId = "72222222-2222-4222-8222-222222222222";
const attemptBId = "73333333-3333-4333-8333-333333333333";
const comparisonId = "74444444-4444-4444-8444-444444444444";
const createdAt = "2026-07-13T12:00:00.000Z";
const updatedAt = "2026-07-13T13:00:00.000Z";
const comparedAt = "2026-07-13T14:00:00.000Z";

async function seedDecisionSupportRecord(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(
    async ({ projectId, attemptAId, attemptBId, comparisonId, createdAt, updatedAt, comparedAt }) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("printpal-3d-local");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const project = {
        projectId,
        schemaVersion: 1,
        title: "Slice Seven Decision Support",
        purpose: "Validate bounded interpretation and one-variable planning",
        description: "A browser acceptance fixture for Slice Seven.",
        successCriteria: ["Clip fits"],
        tags: ["Slice Seven"],
        status: "ACTIVE",
        attemptIds: [attemptAId, attemptBId],
        createdAt,
        updatedAt,
      };

      const baseAttempt = {
        projectId,
        schemaVersion: 1,
        status: "COMPARED",
        printerContext: {
          technology: "FFF_FDM",
          manufacturer: "Example Maker",
          model: "P1",
          unknownInformation: false,
        },
        materialContext: {
          materialClass: "PETG",
          manufacturer: "Example Material",
          productOrResinName: "PETG Pro",
          unknownInformation: false,
        },
        sourceReferences: [],
        comparisonIds: [comparisonId],
        printerTechnologyIndex: "FFF_FDM",
        materialClassIndex: "PETG",
        createdAt,
        updatedAt,
        completedAt: updatedAt,
      };

      const attemptA = {
        ...baseAttempt,
        attemptId: attemptAId,
        attemptNumber: 1,
        processContext: {
          plannedAttemptDescription: "Baseline orientation",
          knownConcerns: [],
          settingsSnapshotOrNotes: "Baseline orientation",
          plannedVariables: [],
          changesFromParentAttempt: [],
        },
        outcome: {
          status: "PARTIALLY_SUCCESSFUL",
          completedAt: updatedAt,
          successCriteriaResults: [
            { criterion: "Clip fits", status: "PARTIALLY_MET", notes: "Minor flex" },
          ],
          observations: ["Minor flex"],
          deviationsOrDefects: ["Loose fit"],
          unexpectedConditions: [],
          postProcessingPerformed: [],
          lessonsLearned: ["Orientation may warrant a controlled test"],
          summary: "Minor flex",
          summaryOrigin: "USER_AUTHORED",
        },
      };

      const attemptB = {
        ...baseAttempt,
        attemptId: attemptBId,
        parentAttemptId: attemptAId,
        attemptNumber: 2,
        processContext: {
          plannedAttemptDescription: "Rotate the part",
          knownConcerns: [],
          settingsSnapshotOrNotes: "Rotated orientation",
          plannedVariables: ["Orientation"],
          changesFromParentAttempt: ["Rotate the part orientation"],
        },
        outcome: {
          status: "SUCCESSFUL",
          completedAt: updatedAt,
          successCriteriaResults: [
            { criterion: "Clip fits", status: "MET", notes: "Stable fit" },
          ],
          observations: ["Stable fit"],
          deviationsOrDefects: [],
          unexpectedConditions: [],
          postProcessingPerformed: [],
          lessonsLearned: ["The rotated attempt met the criterion"],
          summary: "Stable fit",
          summaryOrigin: "USER_AUTHORED",
        },
      };

      const comparison = {
        comparisonId,
        projectId,
        schemaVersion: 1,
        attemptAId,
        attemptBId,
        constants: [
          { fieldPath: "printerContext.model", label: "Printer Model", value: "P1" },
          { fieldPath: "materialContext.materialClass", label: "Material Class", value: "PETG" },
        ],
        changes: [
          {
            fieldPath: "processContext.settingsSnapshotOrNotes",
            label: "Settings Snapshot Or Notes",
            attemptAValue: "Baseline orientation",
            attemptBValue: "Rotated orientation",
          },
        ],
        intentionalChanges: ["Rotate the part orientation"],
        unknownChanges: [],
        missingInformation: ["Environmental observations were not recorded."],
        outcomeDifferences: ["Outcome status changed from PARTIALLY_SUCCESSFUL to SUCCESSFUL."],
        supportedObservations: [
          "Settings Snapshot Or Notes differed between the Attempts.",
          "Outcome status differed between the Attempts.",
        ],
        modelInferences: [],
        alternateExplanations: [],
        uncertainties: [
          "This deterministic comparison identifies recorded differences; it does not establish causation.",
        ],
        interpretationUncertainties: [],
        interpretationSourceChecks: [],
        origin: "RULES_BASED_FALLBACK",
        promptVersion: "deterministic-comparison-v1",
        createdAt: comparedAt,
      };

      await new Promise<void>((resolve, reject) => {
        const tx = database.transaction(
          ["projects", "attempts", "comparisons", "nextTestPlans"],
          "readwrite",
        );
        tx.objectStore("projects").put(project);
        tx.objectStore("attempts").put(attemptA);
        tx.objectStore("attempts").put(attemptB);
        tx.objectStore("comparisons").put(comparison);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      database.close();
    },
    { projectId, attemptAId, attemptBId, comparisonId, createdAt, updatedAt, comparedAt },
  );
  await page.reload();
}

test("persists bounded interpretation and an accepted Next-Test Plan", async ({ page }) => {
  await page.route("**/api/interpret-comparison", (route) => route.abort());
  await page.route("**/api/generate-next-test", (route) => route.abort());
  await seedDecisionSupportRecord(page);

  await page.getByText("Slice Seven Decision Support", { exact: true }).first().click();
  await expect(page.getByText(/Attempt 2/).first()).toBeVisible();

  const storedComparison = page.getByRole("button", {
    name: /open comparison|view comparison|comparison record/i,
  });
  if (await storedComparison.count()) {
    await storedComparison.first().click();
  } else {
    await page.getByRole("button", { name: /compare attempts/i }).click();
    await page.getByText(/Attempt 1/).last().click();
    await page.getByRole("button", { name: /create comparison|compare selected|compare attempts/i }).last().click();
  }

  await expect(page.getByRole("heading", { name: "Deterministic Comparison" })).toBeVisible();
  await page.getByRole("button", { name: "Interpret And Plan" }).click();
  await expect(page.getByRole("heading", { name: "Interpret & Plan The Next Test" })).toBeVisible();

  await page.getByRole("button", { name: "Generate Interpretation" }).click();
  await expect(page.getByText("Rules-Based Fallback").first()).toBeVisible();
  const summary = page.locator("label").filter({ hasText: "Interpretation Summary" }).locator("textarea");
  await summary.fill("User-refined interpretation that preserves uncertainty and does not establish causation.");
  await page.getByRole("button", { name: "Save Interpretation" }).click();
  await expect(page.getByText("Interpretation edits saved locally.")).toBeVisible();

  await page.getByRole("button", { name: "Generate Plan" }).click();
  const primaryVariable = page.locator("label").filter({ hasText: "Primary Variable" }).locator("input");
  await primaryVariable.fill("Orientation only");
  await page.getByRole("button", { name: "Accept Plan" }).click();
  await expect(page.getByText(/Next-Test Plan accepted/)).toBeVisible();

  await page.reload();
  await expect(primaryVariable).toHaveValue("Orientation only");
  await expect(page.getByText("ACCEPTED")).toBeVisible();
  await expect(page.getByText(/User-refined interpretation/)).toBeVisible();

  const width = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(width).toBe(true);
});
