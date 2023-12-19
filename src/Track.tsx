import TrackItem from "./models/TrackItem"
import { Looper } from "./sound/Looper"
import { db } from "./models/db"

function generateTitle() {
	return "new track"
}

export class Track implements TrackItem {
	public id: number = -1

	projectId: number = -1
	title: string = "untitled"
	audio: number[] = []
	looped: boolean = true
	pitch: number = 0.5
	volume: number = 1

	// non persistent
	playing: boolean = false
	recording: boolean = false

	protected looper : Looper | undefined

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

	duplicate() {
		var track = new Track(this.updater)

		track.projectId = this.projectId
		track.title = this.getTitle()
		track.audio = this.getAudio()
		track.looped = this.getLooped()
		track.pitch = this.getPitch()
		track.volume = this.getVolume()

		return track
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
		this.looper?.setLooped(looped)
		this.updateState()
	}

	getLooped() {
		return this.looped
	}

	// pitch 
	setPitch(pitch: number) {
		this.pitch = pitch
		this.looper?.setPitch(pitch)
		this.updateState()
	}

	getPitch() {
		return this.pitch
	}

	// volume
	setVolume(volume: number) {
		this.volume = volume
		this.looper?.setVolume(volume)
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
		this.looper?.play()
	}

	stop() {
		console.log(`stop track "${this.title}""`)
		this.looper?.stop()
	}

	reverse() {
		console.log(`reverse track "${this.title}""`)
	}
}