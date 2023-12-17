// db.ts
// uses dexie
// https://dexie.org

import Dexie, { Table } from 'dexie';
import { Project } from "../Project"
import ProjectItem from "./ProjectItem"

export class RealbeatDB extends Dexie {
  projects!: Table<ProjectItem, number>;

  populate() {
    new Project(() => {})
  }

  constructor() {
    super('realbeatDatabase');

    this.version(0.1).stores({
      projects: '++id', // Primary key and indexed props
    })

    this.on("populate", this.populate)

    this.open()
  }

  deleteProject(projectId: number) {
    return this.transaction('rw', this.projects, () => {
      this.projects.delete(projectId)
    })
  }

  async addProject(project: Project) {
    const id = await this.projects.add({
      title: project.getTitle(),
    })

    return id
  }

  async updateProject(project: Project) {
    await this.projects.update(project.getId(), {
      title: project.getTitle(),
    })
  }

  async getProjects() {
    return this.projects.toArray()
  }

  async getProjectCount() {
    return this.projects.count()
  }
}

export const db = new RealbeatDB()
