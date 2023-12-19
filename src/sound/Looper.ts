import { createDevice, Device, IPatcher, MessageEvent } from "@rnbo/js"
import patcher from "./export/patch.export.json"

export class Looper {
	device: Device | undefined = undefined
	context: AudioContext
	outputNode: AudioNode

	protected pitch: number = 1
	protected volume: number = 1
	protected looped: boolean = true

	constructor(context: AudioContext, outputNode: AudioNode) {
		this.context = context	
		this.outputNode = outputNode

		this.create()
	}

	create() {
		try {
			createDevice({
				patcher: patcher as unknown as IPatcher,
				context: this.context
			}).then((device: Device) => {
				this.device = device
				this.device.node.connect(this.outputNode)
			})
		}
		catch(err) {
			console.log(`error creating patcher: ${err}`)
		}
	}

	destroy() {
		this.device?.node.disconnect()
	}

	setVolume(volume: number) {
		this.volume = volume
	}

	setPitch(pitch: number) {
		this.pitch = pitch
	}

	setLooped(looped: boolean) {
		this.looped = looped
	}

	play() {

	}

	stop() {

	}

	record() {

	}

	stopRecord() {

	}


}