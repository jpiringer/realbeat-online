// sound engine for realbeat online

import { createDevice, IPatcher, MessageEvent } from "@rnbo/js"
import { Looper } from "./Looper"

export class SoundEngine {
	context: AudioContext
	outputNode: GainNode

	constructor() {
		this.context = new AudioContext()

		// Create gain node and connect it to audio output
    this.outputNode = this.context.createGain();
    this.outputNode.connect(this.context.destination);
	}

	createLooper() {
		return new Looper(this.context, this.outputNode) 
	}

	destroyLooper(looper: Looper) {
		looper.destroy()
	}
}

export const soundEngine = new SoundEngine()