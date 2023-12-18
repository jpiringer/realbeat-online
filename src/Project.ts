// Project

import adjectives from "./Adjectives"
import nouns from "./Nouns"
import { db } from "./models/db"
import ProjectItem from "./models/ProjectItem"
import { Track } from "./Track"

const getRandomWord = (array: string[]) => {
  return array[Math.floor(Math.random() * (array.length - 1))];
};

function generateTitle() {
	return getRandomWord(adjectives)+" "+getRandomWord(nouns);
}

export class Project implements ProjectItem {
	public id: number = -1

	title: string
	trackIds: number[] = []

	protected updater: () => void

	constructor(updater: () => void) {
		this.updater = updater

		this.title = generateTitle()

		db.addProject(this).then((value: number) => {this.id = value}, (error) => {})
	}

	clone() {
		var newProject = new Project(this.updater)

		newProject.id = this.id
		newProject.title = this.title
		newProject.trackIds = this.trackIds
		
		return newProject
	}

	setUpdater(updater: () => void) {
		this.updater = updater
	}

	updateState() {
		db.updateProject(this)
		this.updater()
	}

	// id

	getId() {
		return this.id
	}

	// tracks

	addTrackId(trackId: number) {
		if (this.trackIds === undefined) {
			this.trackIds = []
		}
		this.trackIds.push(trackId)
	}

	addTrack(track: Track) {
		db.addTrack(this, track).then((trackId: number) => {
			track.id = trackId
			this.addTrackId(trackId)
			this.updateState()
		})	
	}

	_deleteTrackWithId(trackId: number | undefined) {
		if (trackId !== undefined) {
			db.deleteTrack(trackId).then(() => {
				this.updateState()
			})
		}
	}

	deleteTrack(track: Track) {
		this._deleteTrackWithId(track.getId())
		this.trackIds = this.trackIds.filter((id: number, index: number) => {
			return id !== track.getId()
		})
	}

	async loadTracks() {
		return db.getTracks(this)
	}

	// title

	setTitle(title: string) {
		this.title = title
		this.updateState()
	}

	getTitle() {
		return this.title
	}

	exportToJSON() {
		var json = {
			title: this.title,
		}

		let stringified = JSON.stringify(json)

		return stringified
	}
}

export default Project;