import TrackItem from "./models/TrackItem"
import { Looper } from "./sound/Looper"
import { db } from "./models/db"
import { soundEngine } from "./sound/SoundEngine"

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
	playing: boolean = false

	// non persistent
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
		track.playing = this.isPlaying()

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
		this.playing = trackItem.playing
	}

	setUpdater(updater: (track: Track) => void) {
		this.updater = updater
	}

	updateState() {
    db.updateTrack(this)
		this.updater(this)
	}

	// sound
	initSound() {
		this.looper = soundEngine.createLooper(this)
	}

	stopSound() {
		if (this.looper) {
			soundEngine.destroyLooper(this.looper)
			this.looper = undefined
		}
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

	// record
	toggleRecord() {
		if (this.recording) {
			this.looper?.stopRecord()
		}
		else {
			this.looper?.record()
		}
		this.recording = !this.recording
		this.updateState()
	}

	isRecording() {
		return this.recording
	}

	// play

	isPlaying() {
		return this.playing
	}

	play() {
		this.looper?.play()
		this.playing = true
		this.updateState()
	}

	setStop() {
		this.playing = false
		this.updateState()
	}

	stop() {
		this.looper?.stop()
		this.setStop()
	}

	// actions

	reverse() {
		console.log(`reverse track "${this.title}""`)
	}
}