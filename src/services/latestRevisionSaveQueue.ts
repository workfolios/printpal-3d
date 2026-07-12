export class LatestRevisionSaveQueue {
  private revision = 0;
  private tail: Promise<void> = Promise.resolve();

  get currentRevision(): number {
    return this.revision;
  }

  markChanged(): number {
    this.revision += 1;
    return this.revision;
  }

  invalidate(): number {
    return this.markChanged();
  }

  isCurrent(revision: number): boolean {
    return revision === this.revision;
  }

  enqueue(revision: number, task: () => Promise<void>): Promise<boolean> {
    const operation = this.tail
      .catch(() => undefined)
      .then(async () => {
        if (!this.isCurrent(revision)) return false;
        await task();
        return this.isCurrent(revision);
      });

    this.tail = operation.then(
      () => undefined,
      () => undefined,
    );

    return operation;
  }
}
