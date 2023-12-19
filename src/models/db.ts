// db.ts
// uses dexie
// https://dexie.org

import Dexie, { Table } from 'dexie'
import { Project } from "../Project"
import ProjectItem from "./ProjectItem"
import TrackItem from './TrackItem'
import { Track } from '../Track'

export class RealbeatDB extends Dexie {
  projects!: Table<ProjectItem, number>
  tracks!: Table<TrackItem, number>

  populate() {
    new Project(() => {})
  }

  constructor() {
    super('realbeatDatabase')

    this.version(0.1).stores({
      projects: '++id', // Primary key and indexed props
      tracks: '++id, projectId', // Primary key and indexed props
    })

    this.on("populate", this.populate)

    this.open()
  }

  deleteProject(projectId: number) {
    return this.transaction('rw', this.tracks, this.projects, () => {
       this.tracks.where({ projectId }).delete()
       this.projects.delete(projectId)
    })
  }

  async addProject(project: Project) {
    const id = await this.projects.add({
      title: project.getTitle(),
      trackIds: project.trackIds
    })

    return id
  }

  async updateProject(project: Project) {
    await this.projects.update(project.getId(), {
      title: project.getTitle(),
      trackIds: project.trackIds
    })
  }

  async getProjects() {
    return this.projects.toArray()
  }

  async getProjectCount() {
    return this.projects.count()
  }

  // track

  async addTrack(project: Project | undefined, track: Track) {
    const id = await this.tracks.add({
      projectId: project ? project.getId() : track.projectId,
      title: track.getTitle(),
	    audio: track.getAudio(),
	    looped: track.getLooped(),
	    pitch: track.getPitch(),
	    volume: track.getVolume()
    })

    return id
  }

  /// update track except audio
  async updateTrack(track: Track) {
    console.log(`update track "${track.getId()}"`)
    await this.tracks.update(track.getId(), {
      title: track.getTitle(),
	    looped: track.getLooped(),
	    pitch: track.getPitch(),
	    volume: track.getVolume()
    })
  }

  /// update track audio online
  async updateTrackAudio(track: Track) {
    await this.tracks.update(track.getId(), {
	    audio: track.getAudio()
    })
  }

  async deleteTrack(trackId: number) {
    return this.tracks.delete(trackId)
  }

  async getTracks(project: Project) {
    let projectId = project.id
    return this.tracks.where({ projectId }).toArray()
  }
}

export const db = new RealbeatDB()
