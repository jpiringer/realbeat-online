export default interface TrackItem {
  id?: number
	projectId: number
  title: string
	audio: number[]
	looped: boolean
	pitch: number
	volume: number
	playing: boolean
}