// sound engine for realbeat online

import { createDevice, IPatcher, MessageEvent } from "@rnbo/js"
import { Looper } from "./Looper"
import { Track } from "../Track"

export class SoundEngine {
	context: AudioContext
	outputNode: GainNode

	loopers: Looper[] = []

	constructor() {
		this.context = new AudioContext()

		this.context.destination.disconnect()

		// Create gain node and connect it to audio output
    this.outputNode = this.context.createGain();
    this.outputNode.connect(this.context.destination);

		document.body.onclick = () => {
			this.context.resume();
    }
	}

	closeAll() {
		this.loopers.forEach(looper => {
			looper.destroy()
		})

		this.loopers = []
	}

	createLooper(track: Track) {
		let looper = new Looper(this.context, this.outputNode, track) 

		this.loopers.push(looper)

		return looper
	}

	destroyLooper(looper: Looper) {
		looper.destroy()

		this.loopers = this.loopers.filter((lp, index) => {
			return looper !== lp
		})
	}

	setMainVolume(volume: number) {
		this.outputNode.gain.setValueAtTime(volume, this.context.currentTime)
	}
}

export const soundEngine = new SoundEngine()