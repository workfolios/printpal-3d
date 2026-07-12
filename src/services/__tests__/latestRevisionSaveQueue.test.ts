import { describe, expect, it } from "vitest";
import { LatestRevisionSaveQueue } from "../latestRevisionSaveQueue";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

describe("LatestRevisionSaveQueue", () => {
  it("does not report an in-flight stale revision as saved and persists the newest revision last", async () => {
    const coordinator = new LatestRevisionSaveQueue();
    const firstGate = deferred();
    const firstStarted = deferred();
    const persisted: string[] = [];

    const firstRevision = coordinator.markChanged();
    const firstSave = coordinator.enqueue(firstRevision, async () => {
      firstStarted.resolve();
      await firstGate.promise;
      persisted.push("first");
    });

    await firstStarted.promise;

    const secondRevision = coordinator.markChanged();
    const secondSave = coordinator.enqueue(secondRevision, async () => {
      persisted.push("second");
    });

    firstGate.resolve();

    await expect(firstSave).resolves.toBe(false);
    await expect(secondSave).resolves.toBe(true);
    expect(persisted).toEqual(["first", "second"]);
  });

  it("skips a queued revision that becomes stale before its save starts", async () => {
    const coordinator = new LatestRevisionSaveQueue();
    const blocker = deferred();
    const firstStarted = deferred();
    const persisted: string[] = [];

    const firstRevision = coordinator.markChanged();
    const firstSave = coordinator.enqueue(firstRevision, async () => {
      firstStarted.resolve();
      await blocker.promise;
      persisted.push("first");
    });

    await firstStarted.promise;

    const secondRevision = coordinator.markChanged();
    const secondSave = coordinator.enqueue(secondRevision, async () => {
      persisted.push("second");
    });

    const thirdRevision = coordinator.markChanged();
    const thirdSave = coordinator.enqueue(thirdRevision, async () => {
      persisted.push("third");
    });

    blocker.resolve();

    await expect(firstSave).resolves.toBe(false);
    await expect(secondSave).resolves.toBe(false);
    await expect(thirdSave).resolves.toBe(true);
    expect(persisted).toEqual(["first", "third"]);
  });
});
