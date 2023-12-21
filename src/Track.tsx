import TrackItem, { WaveSelection } from "./models/TrackItem"
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
	looped: boolean = true
	pitch: number = 0.5
	volume: number = 1
	mute: boolean = false
	playing: boolean = false
	selection: WaveSelection

	// non persistent
	recording: boolean = false
	wave: Float32Array
	enqueueWave: boolean = false
	playPos: number = 0

	protected looper : Looper | undefined

	protected updater: (track: Track) => void

	constructor(updater: (track: Track) => void) {
		this.updater = updater

		this.title = generateTitle()
		this.wave = new Float32Array(0)
		this.selection = {start: 0, end: 1}
	}

	clone() {
		var newTrack = new Track(this.updater)

		newTrack.id = this.id
		newTrack.title = this.title
		newTrack.wave = this.wave.slice(0)
		newTrack.selection = this.selection
		newTrack.setWave(newTrack.wave)
		
		return newTrack
	}

	duplicate() {
		var track = new Track(this.updater)

		track.projectId = this.projectId
		track.title = this.getTitle()
		track.looped = this.getLooped()
		track.pitch = this.getPitch()
		track.volume = this.getVolume()
		track.mute = this.getMute()
		track.playing = this.isPlaying()
		track.wave = this.wave.slice(0)
		track.setWave(track.wave)
		track.selection = this.getSelection()

		return track
	}

	setFromTrackItem(trackItem: TrackItem) {
		this.id = trackItem.id!
		this.projectId = trackItem.projectId
  	this.title = trackItem.title
		this.looped = trackItem.looped
		this.pitch = trackItem.pitch
		this.volume = trackItem.volume
		this.mute = trackItem.mute
		this.playing = trackItem.playing
		this.selection = trackItem.selection

		this.wave = trackItem.wave
		this.setWave(trackItem.wave)
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
		this.looper = soundEngine.createLooper(this, this.enqueueWave ? this.wave : undefined)
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

	resetPitch() {
		this.setPitch(0.5)
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

	// mute

	setMute(mute: boolean) {
		this.mute = mute
		this.looper?.setMute(mute)
		this.updateState()
	}

	getMute() {
		return this.mute
	}

	// audio
	getWave() {
		return this.wave
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

	/// sets the audio wavedata
	setWave(waveData: Float32Array) {
		if (this.looper) {
			this.looper.setWave(waveData)
		}
		else {
			this.enqueueWave = true
		}
	}

	setWaveForm(waveData: Float32Array, length: number, normalizeDiv: number) {
		this.wave = new Float32Array(length)
		for (let i = 0; i < length; i++) {
			this.wave[i] = waveData[i] / normalizeDiv
		}
		db.updateTrackWave(this)
		this.updateState()
	}

	// playPos

	setPlayPos(pp: number) {
		this.playPos = pp
	}

	getPlayPos() {
		return this.playPos
	}

	// selection

	select(start: number, end: number) {
		this.looper?.select(start, end)
		this.selection = {start: start, end: end}
		this.updateState()
	}

	getSelection(): WaveSelection {
		return this.selection
	}

	// actions

	reverse() {
		this.looper?.reverse()
	}

	trim() {
		this.looper?.trim()
	}
}