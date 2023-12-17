// Project

import adjectives from "./Adjectives"
import nouns from "./Nouns"
import { db } from "./models/db"
import ProjectItem from "./models/ProjectItem"

const getRandomWord = (array: string[]) => {
  return array[Math.floor(Math.random() * (array.length - 1))];
};

function generateTitle() {
	return getRandomWord(adjectives)+" "+getRandomWord(nouns);
}

export class Project implements ProjectItem {
	public id: number = -1

	title: string

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