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
	wave: Float32Array
	playPos: number = 0

	protected looper : Looper | undefined

	protected updater: (track: Track) => void

	constructor(updater: (track: Track) => void) {
		this.updater = updater

		this.title = generateTitle()
		this.wave = new Float32Array(0)

		//db.addProject(this).then((value: number) => {this.id = value}, (error) => {})
	}

	clone() {
		var newTrack = new Track(this.updater)

		newTrack.id = this.id
		newTrack.title = this.title
		newTrack.wave = this.wave
		
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
		track.wave = this.wave

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

	setStopRecord() {
		this.recording = false
		this.updateState()
	}

	toggleRecord() {
		if (this.recording) {
			this.looper?.stopRecord()
			// this.recording will be set to false in setStopRecord
		}
		else {
			this.recording = true
			this.looper?.record()
		}
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

	// wave

	setWaveForm(waveData: Float32Array, length: number, normalizeDiv: number) {
		this.wave = new Float32Array(length)
		for (let i = 0; i < length; i++) {
			this.wave[i] = waveData[i] / normalizeDiv
		}
		this.updateState()
	}

	// playPos

	setPlayPos(pp: number) {
		this.playPos = pp
	}

	getPlayPos() {
		return this.playPos
	}

	// actions

	reverse() {
		console.log(`reverse track "${this.title}""`)
		this.looper?.reverse()
	}
}