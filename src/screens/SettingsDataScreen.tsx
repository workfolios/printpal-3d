import {
  AlertTriangle,
  ArchiveRestore,
  Database,
  Download,
  FileJson,
  FileText,
  HardDriveDownload,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useRef, useState } from "react";
import { db } from "../data/db";
import { clearAllLocalData } from "../data/transactions";
import type { PrintPalExportEnvelope } from "../domain/types";
import {
  createFullBackupEnvelope,
  createProjectExportEnvelope,
  importProjectAsNew,
  parseImportText,
  previewImport,
  renderProjectMarkdown,
  restoreFullBackupReplaceAll,
  safeFileStem,
  serializeExport,
  type ImportPreview,
  type ImportedProjectResult,
} from "../services/dataTransferService";
import { downloadTextFile } from "../services/downloadService";

interface SettingsDataScreenProps {
  onOpenImportedProject: (projectId: string, attemptId: string) => void;
}

type OperationState = "IDLE" | "BUSY" | "SUCCESS" | "ERROR";

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function CountGrid({ preview }: { preview: ImportPreview }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {Object.entries(preview.counts).map(([label, value]) => (
        <div key={label} className="rounded border border-[#E2E1DB] bg-[#FCFBF7] p-3 text-center">
          <div className="text-lg font-semibold text-[#333333]">{value}</div>
          <div className="mt-1 break-words text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">
            {label.replace(/([A-Z])/g, " $1")}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SettingsDataScreen({ onOpenImportedProject }: SettingsDataScreenProps) {
  const projects = useLiveQuery(() => db.projects.orderBy("updatedAt").reverse().toArray(), [], []);
  const counts = useLiveQuery(
    async () => {
      const [projectsCount, attempts, comparisons, nextTestPlans, appSettings] = await Promise.all([
        db.projects.count(),
        db.attempts.count(),
        db.comparisons.count(),
        db.nextTestPlans.count(),
        db.appSettings.count(),
      ]);
      return { projects: projectsCount, attempts, comparisons, nextTestPlans, appSettings };
    },
    [],
    { projects: 0, attempts: 0, comparisons: 0, nextTestPlans: 0, appSettings: 0 },
  );
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [importEnvelope, setImportEnvelope] = useState<PrintPalExportEnvelope | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [replaceConfirmation, setReplaceConfirmation] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [operationState, setOperationState] = useState<OperationState>("IDLE");
  const [message, setMessage] = useState("");
  const [importedProject, setImportedProject] = useState<ImportedProjectResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.projectId === selectedProjectId),
    [projects, selectedProjectId],
  );

  const runOperation = async (operation: () => Promise<string>) => {
    setOperationState("BUSY");
    setMessage("");
    try {
      const success = await operation();
      setOperationState("SUCCESS");
      setMessage(success);
    } catch (error) {
      setOperationState("ERROR");
      setMessage(error instanceof Error ? error.message : "The data operation could not be completed.");
    }
  };

  const exportSelectedProjectJson = () =>
    runOperation(async () => {
      if (!selectedProject) throw new Error("Select a Project before exporting.");
      const envelope = await createProjectExportEnvelope(selectedProject.projectId);
      downloadTextFile(
        `${safeFileStem(selectedProject.title)}-printpal-project.json`,
        serializeExport(envelope),
        "application/json",
      );
      return `Exported ${selectedProject.title} as structured JSON.`;
    });

  const exportSelectedProjectMarkdown = () =>
    runOperation(async () => {
      if (!selectedProject) throw new Error("Select a Project before exporting.");
      const envelope = await createProjectExportEnvelope(selectedProject.projectId);
      if (envelope.exportType !== "PROJECT") throw new Error("The Project export could not be created.");
      downloadTextFile(
        `${safeFileStem(selectedProject.title)}-printpal-lab-record.md`,
        renderProjectMarkdown(envelope.payload),
        "text/markdown",
      );
      return `Exported ${selectedProject.title} as a readable Markdown lab record.`;
    });

  const exportFullBackup = () =>
    runOperation(async () => {
      const envelope = await createFullBackupEnvelope();
      downloadTextFile(
        `printpal-full-backup-${new Date().toISOString().slice(0, 10)}.json`,
        serializeExport(envelope),
        "application/json",
      );
      return "Exported a complete PrintPal local backup.";
    });

  const handleImportFile = async (file: File | undefined) => {
    setImportedProject(null);
    setImportEnvelope(null);
    setImportPreview(null);
    setReplaceConfirmation("");
    setOperationState("IDLE");
    setMessage("");
    if (!file) return;
    try {
      const envelope = parseImportText(await file.text());
      setImportEnvelope(envelope);
      setImportPreview(previewImport(envelope));
      setMessage("The file is valid. Review the metadata before importing or restoring.");
    } catch (error) {
      setOperationState("ERROR");
      setMessage(error instanceof Error ? error.message : "The selected file could not be validated.");
    }
  };

  const importSingleProject = () =>
    runOperation(async () => {
      if (!importEnvelope || importEnvelope.exportType !== "PROJECT") {
        throw new Error("Select a valid PrintPal Project export first.");
      }
      const result = await importProjectAsNew(importEnvelope);
      setImportedProject(result);
      return `Imported ${result.projectTitle} as a new local Project with regenerated identifiers.`;
    });

  const restoreBackup = () =>
    runOperation(async () => {
      if (!importEnvelope || importEnvelope.exportType !== "FULL_BACKUP") {
        throw new Error("Select a valid PrintPal Full Backup first.");
      }
      if (replaceConfirmation !== "REPLACE ALL") {
        throw new Error('Enter "REPLACE ALL" to confirm the restore.');
      }
      await restoreFullBackupReplaceAll(importEnvelope);
      setReplaceConfirmation("");
      setImportEnvelope(null);
      setImportPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return "The Full Backup replaced the prior local PrintPal data successfully.";
    });

  const clearAllData = () =>
    runOperation(async () => {
      if (deleteConfirmation !== "DELETE ALL") {
        throw new Error('Enter "DELETE ALL" to confirm permanent local deletion.');
      }
      await clearAllLocalData(db);
      setDeleteConfirmation("");
      setSelectedProjectId("");
      setImportEnvelope(null);
      setImportPreview(null);
      setImportedProject(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return "All local PrintPal records and settings were deleted from this browser.";
    });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#D6D4CC] bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4B7270]">Settings And Data</p>
            <h1 className="mt-2 text-2xl font-light tracking-tight text-[#333333] md:text-3xl">Portability, recovery, and local control</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6F6F6F]">
              Export readable records, create a complete backup, validate imports before writing, restore atomically, or delete local data deliberately.
            </p>
          </div>
          <div className="rounded border border-[#D7E3E1] bg-[#EDF3F2] px-4 py-3 text-xs text-[#3D5D5B]">
            <div className="flex items-center gap-2 font-semibold"><Database className="h-4 w-4" /> Browser-Resident Data</div>
            <p className="mt-1 max-w-xs leading-5">Current records remain in this browser and application origin until exported.</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Object.entries(counts).map(([label, value]) => (
            <div key={label} className="rounded border border-[#EEEDE7] bg-[#FCFBF7] p-3 text-center">
              <div className="text-xl font-semibold text-[#333333]">{value}</div>
              <div className="mt-1 break-words text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">{label.replace(/([A-Z])/g, " $1")}</div>
            </div>
          ))}
        </div>
      </section>

      {message && (
        <div
          role="status"
          className={`rounded border px-4 py-3 text-sm ${operationState === "ERROR" ? "border-[#D8AAA3] bg-[#FFF4F2] text-[#8C3B31]" : "border-[#C8DDD9] bg-[#F2F8F7] text-[#3D5D5B]"}`}
        >
          {message}
        </div>
      )}

      <section className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-3">
          <HardDriveDownload className="h-5 w-5 text-[#4B7270]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">Export</h2>
            <p className="mt-1 text-sm text-[#6F6F6F]">Project exports are portable records. Full Backup preserves every local table and setting.</p>
          </div>
        </div>

        <label className="mt-5 block text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F]" htmlFor="project-export-select">Project To Export</label>
        <select
          id="project-export-select"
          value={selectedProjectId}
          onChange={(event) => setSelectedProjectId(event.target.value)}
          className="mt-2 w-full rounded border border-[#D6D4CC] bg-white px-3 py-2.5 text-sm text-[#333333] focus:border-[#4B7270] focus:outline-none"
        >
          <option value="">Select a Project</option>
          {projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.title}</option>)}
        </select>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button type="button" disabled={!selectedProject || operationState === "BUSY"} onClick={exportSelectedProjectMarkdown} className="inline-flex items-center justify-center gap-2 rounded bg-[#4B7270] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-40"><FileText className="h-4 w-4" /> Project Markdown</button>
          <button type="button" disabled={!selectedProject || operationState === "BUSY"} onClick={exportSelectedProjectJson} className="inline-flex items-center justify-center gap-2 rounded border border-[#4B7270] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#4B7270] disabled:cursor-not-allowed disabled:opacity-40"><FileJson className="h-4 w-4" /> Project JSON</button>
          <button type="button" disabled={operationState === "BUSY"} onClick={exportFullBackup} className="inline-flex items-center justify-center gap-2 rounded border border-[#333333] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#333333] disabled:cursor-not-allowed disabled:opacity-40"><Download className="h-4 w-4" /> Full Backup JSON</button>
        </div>
      </section>

      <section className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-[#4B7270]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#333333]">Import Or Restore</h2>
            <p className="mt-1 text-sm text-[#6F6F6F]">Files are fully validated before any record is written. Markdown files are readable exports and cannot be imported.</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={(event) => void handleImportFile(event.target.files?.[0])}
          className="mt-5 block w-full rounded border border-dashed border-[#B9B7AE] bg-[#FCFBF7] px-4 py-4 text-sm file:mr-4 file:rounded file:border-0 file:bg-[#4B7270] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-white"
          aria-label="Select PrintPal JSON export"
        />

        {importPreview && (
          <div className="mt-5 rounded border border-[#D7E3E1] bg-[#F7FAF9] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-[#333333]">{importPreview.exportType === "PROJECT" ? `Project: ${importPreview.projectTitle}` : "Complete PrintPal Full Backup"}</p>
                <p className="mt-1 text-xs text-[#6F6F6F]">App {importPreview.appVersion} · Schema {importPreview.schemaVersion} · Exported {formatDate(importPreview.exportedAt)}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded bg-[#EDF3F2] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]"><ShieldCheck className="h-4 w-4" /> Validated</span>
            </div>
            <CountGrid preview={importPreview} />
          </div>
        )}

        {importEnvelope?.exportType === "PROJECT" && (
          <div className="mt-5 rounded border border-[#E2E1DB] p-4">
            <p className="text-sm text-[#6F6F6F]">The imported Project will receive new identifiers and remain separate from any existing Project with the same title.</p>
            <button type="button" disabled={operationState === "BUSY"} onClick={importSingleProject} className="mt-4 inline-flex items-center gap-2 rounded bg-[#4B7270] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-40"><ArchiveRestore className="h-4 w-4" /> Import As New Project</button>
            {importedProject?.firstAttemptId && (
              <button type="button" onClick={() => onOpenImportedProject(importedProject.projectId, importedProject.firstAttemptId!)} className="ml-3 mt-4 inline-flex items-center gap-2 rounded border border-[#4B7270] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#4B7270]">Open Imported Project</button>
            )}
          </div>
        )}

        {importEnvelope?.exportType === "FULL_BACKUP" && (
          <div className="mt-5 rounded border border-[#E6C8A8] bg-[#FFF9F1] p-4">
            <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#A26325]" /><div><p className="font-semibold text-[#74451A]">Replace All Restore</p><p className="mt-1 text-sm leading-6 text-[#795A39]">This operation replaces every current Project, Attempt, Comparison, Next-Test Plan, and application setting. Export a current backup first when needed.</p></div></div>
            <label htmlFor="replace-confirmation" className="mt-4 block text-[10px] font-bold uppercase tracking-widest text-[#74451A]">Enter REPLACE ALL</label>
            <input id="replace-confirmation" value={replaceConfirmation} onChange={(event) => setReplaceConfirmation(event.target.value)} className="mt-2 w-full rounded border border-[#D3B38E] bg-white px-3 py-2.5 text-sm" />
            <button type="button" disabled={replaceConfirmation !== "REPLACE ALL" || operationState === "BUSY"} onClick={restoreBackup} className="mt-4 inline-flex items-center gap-2 rounded bg-[#8A4B18] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-40"><ArchiveRestore className="h-4 w-4" /> Replace All From Backup</button>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-[#D8AAA3] bg-[#FFF8F6] p-5 shadow-sm md:p-6">
        <div className="flex gap-3"><Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-[#A14436]" /><div><h2 className="text-sm font-bold uppercase tracking-widest text-[#7C3026]">Delete All Local Data</h2><p className="mt-2 text-sm leading-6 text-[#744B45]">This permanently removes all PrintPal records and settings from the current browser. It does not affect exported files.</p></div></div>
        <label htmlFor="delete-confirmation" className="mt-4 block text-[10px] font-bold uppercase tracking-widest text-[#7C3026]">Enter DELETE ALL</label>
        <input id="delete-confirmation" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="mt-2 w-full rounded border border-[#D8AAA3] bg-white px-3 py-2.5 text-sm" />
        <button type="button" disabled={deleteConfirmation !== "DELETE ALL" || operationState === "BUSY"} onClick={clearAllData} className="mt-4 inline-flex items-center gap-2 rounded bg-[#9B3F31] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-4 w-4" /> Delete All Local Data</button>
      </section>

      <section className="rounded-lg border border-[#D7E3E1] bg-[#F7FAF9] p-5 md:p-6">
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#4B7270]" /><div><h2 className="text-sm font-bold uppercase tracking-widest text-[#3D5D5B]">Storage Disclosure</h2><p className="mt-2 text-sm leading-6 text-[#5D706E]">PrintPal uses local browser storage. Clearing site data, changing browsers, or moving to a different application URL can remove access to records on this device. Export a Full Backup periodically and before any browser, device, hostname, or deployment transition.</p><p className="mt-2 text-sm leading-6 text-[#5D706E]">PrintPal exports may contain technical project details, source links, and user notes. Store exported files in a location appropriate for your privacy and recovery needs.</p></div></div>
      </section>
    </div>
  );
}
