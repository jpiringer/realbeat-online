export interface WaveSelection {
	start: number
	end: number
}

export default interface TrackItem {
  id?: number
	projectId: number
  title: string
	looped: boolean
	pitch: number
	volume: number
	mute: boolean
	playing: boolean
	selection: WaveSelection
	wave: Float32Array
}