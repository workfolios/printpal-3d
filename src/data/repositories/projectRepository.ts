import { canTransitionProjectStatus } from "../../domain/lifecycle";
import { projectSchema } from "../../domain/schemas/projectSchema";
import type { Project, ProjectStatus } from "../../domain/types";
import type { PrintPalDatabase } from "../db";

export class ProjectRepository {
  constructor(private readonly db: PrintPalDatabase) {}

  async create(project: Project): Promise<Project> {
    const validated = projectSchema.parse(project);
    await this.db.projects.add(validated);
    return validated;
  }

  async get(projectId: string): Promise<Project | undefined> {
    return this.db.projects.get(projectId);
  }

  async listAll(): Promise<Project[]> {
    return this.db.projects.orderBy("updatedAt").reverse().toArray();
  }

  async listByStatus(status: ProjectStatus): Promise<Project[]> {
    const projects = await this.db.projects.where("status").equals(status).toArray();
    return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async update(
    projectId: string,
    patch: Partial<Omit<Project, "projectId" | "schemaVersion" | "createdAt">>,
    now = new Date().toISOString(),
  ): Promise<Project> {
    const current = await this.require(projectId);
    const validated = projectSchema.parse({ ...current, ...patch, updatedAt: now });
    await this.db.projects.put(validated);
    return validated;
  }

  async transitionStatus(
    projectId: string,
    status: ProjectStatus,
    now = new Date().toISOString(),
  ): Promise<Project> {
    const current = await this.require(projectId);
    if (!canTransitionProjectStatus(current.status, status)) {
      throw new Error(`Invalid project status transition: ${current.status} -> ${status}`);
    }

    return this.update(
      projectId,
      {
        status,
        archivedAt: status === "ARCHIVED" ? now : undefined,
      },
      now,
    );
  }

  async delete(projectId: string): Promise<void> {
    await this.db.projects.delete(projectId);
  }

  private async require(projectId: string): Promise<Project> {
    const project = await this.get(projectId);
    if (!project) throw new Error(`Project not found: ${projectId}`);
    return project;
  }
}
