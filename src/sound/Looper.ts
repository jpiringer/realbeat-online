import { createDevice, Device, IPatcher, MessagePortType, MessageEvent, TimeNow, MillisecondTime } from "@rnbo/js"
import patcher from "./export/looper.export.json"
import { Track } from "../Track"

export class Looper {
	device: Device | undefined = undefined
	context: AudioContext
	outputNode: AudioNode

	protected pitch: number = 0.5
	protected volume: number = 1
	protected looped: boolean = true

	constructor(context: AudioContext, outputNode: AudioNode, track: Track) {
		this.context = context	
		this.outputNode = outputNode

		this.create(track)
	}

	create(track: Track) {
		try {
			createDevice({
				patcher: patcher as unknown as IPatcher,
				context: this.context
			}).then((device: Device) => {
				this.device = device
				this.device.node.connect(this.outputNode)

				this.setPitch(track.getPitch())
				this.setVolume(track.getVolume())
				this.setLooped(track.getLooped())
				if (track.isPlaying()) {
					this.play()
				}

				const descriptions = this.device.dataBufferDescriptions;

				console.log(descriptions)
				// Each description will have a unique id, as well as a "file" or "url" key, depending on whether 
				// the buffer references a local file or a remote URL
				descriptions.forEach(desc => {
						console.log(`Buffer with id "${desc.id}"`)
				})

				/*device.parameters.forEach(parameter => {
					console.log(`parameter id: ${parameter.id} name: ${parameter.name} value: ${parameter.value} range: ${parameter.min}-${parameter.max}`)
				});*/
			})
		}
		catch(err) {
			console.log(`error creating patcher: ${err}`)
		}
	}

	destroy() {
		this.device?.node.disconnect()
	}

	// inport & param

	sendInport(inportTag: string, value: number, time: MillisecondTime) {
		if (this.device) {
			let messageEvent = new MessageEvent(time, inportTag, [value])
    	this.device.scheduleEvent(messageEvent)
		}
	}

	setParam(name: string, value: number) {
		if (this.device) {
			const param = this.device.parametersById.get(name)
			param.value = value
		}
	}

	// properties

	setVolume(volume: number) {
		this.volume = volume
		this.setParam("volume", volume)
	}

	setPitch(pitch: number) {
		this.pitch = pitch
		this.setParam("pitch", pitch)
	}

	setLooped(looped: boolean) {
		this.looped = looped
		this.setParam("looped", looped ? 1 : 0)
	}

	play(time?: MillisecondTime) {
		this.sendInport("in1", 1, time || TimeNow)
	}

	stop(time?: MillisecondTime) {
		this.sendInport("in1", 0, time || TimeNow)
	}

	record() {
		this.sendInport("in2", 1, TimeNow)
	}

	stopRecord() {
		this.sendInport("in2", 0, TimeNow)
	}
}