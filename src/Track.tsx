import TrackItem from "./models/TrackItem"
import { db } from "./models/db"

function generateTitle() {
	return "new track"
}

export class Track implements TrackItem {
	public id: number = -1

	projectId: number = 0
	title: string = "untitled"
	audio: number[] = []
	looped: boolean = false
	pitch: number = 1
	volume: number = 1

	// non persistent
	playing: boolean = false
	recording: boolean = false

	protected updater: (track: Track) => void

	constructor(updater: (track: Track) => void) {
		this.updater = updater

		this.title = generateTitle()

		//db.addProject(this).then((value: number) => {this.id = value}, (error) => {})
	}

	clone() {
		var newTrack = new Track(this.updater)

		newTrack.id = this.id
		newTrack.title = this.title
		
		return newTrack
	}

	setFromTrackItem(trackItem: TrackItem) {
		this.id = trackItem.id!
		this.projectId = trackItem.projectId
  	this.title = trackItem.title
		this.audio = trackItem.audio
		this.looped = trackItem.looped
		this.pitch = trackItem.pitch
		this.volume = trackItem.volume
	}

	setUpdater(updater: (track: Track) => void) {
		this.updater = updater
	}

	updateState() {
    db.updateTrack(this)
		this.updater(this)
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

	// looped
	setLooped(looped: boolean) {
		this.looped = looped
		this.updateState()
	}

	getLooped() {
		return this.looped
	}

	// pitch 
	setPitch(pitch: number) {
		this.pitch = pitch
		this.updateState()
	}

	getPitch() {
		return this.pitch
	}

	// volume
	setVolume(volume: number) {
		this.volume = volume
		this.updateState()
	}

	getVolume() {
		return this.volume
	}

	// audio
	getAudio() {
		return this.audio
	}

	// actions
	record() {
		console.log(`record track "${this.title}""`)
	}

	play() {
		console.log(`play track "${this.title}""`)
	}

	stop() {
		console.log(`stop track "${this.title}""`)
	}

	reverse() {
		console.log(`reverse track "${this.title}""`)
	}
}