//import { createDevice, Device, IPatcher, MessagePortType, MessageEvent, TimeNow, MillisecondTime } from "@rnbo/js"
//import * as RNBO from "@rnbo/js"
//import patcher from "./export/looper.export.json"
import { Track } from "../Track"

export class Looper {
	//device: Device | undefined = undefined
	context: AudioContext
	outputNode: AudioNode
	inputNode?: AudioNode
	looperNode: AudioWorkletNode | undefined = undefined

	protected pitch: number = 0.5
	protected volume: number = 1
	protected mute: boolean = false
	protected looped: boolean = true
	protected track: Track

	handleProcessorMessage(event: MessageEvent<any>) {
		switch(event.data.message) {
			case "stop":
				this.track.setStop()
				break
			case "stopRecord":
				this.track.setStopRecord()
				this.track.setWaveForm(event.data.transfer[0], event.data.transfer[1], event.data.transfer[2])
				break
			case "playPos":
				this.track.setPlayPos(event.data.transfer[0])
				break
			case "selection":
				this.track.select(event.data.transfer[0], event.data.transfer[1])
				break
			default:
				console.log(`[Node:handleMessage_] ${event.data.message} (${event.data.contextTimestamp})`)
				break
		}
	}

	constructor(context: AudioContext, inputNode: AudioNode|undefined, outputNode: AudioNode, track: Track, waveData?: Float32Array) {
		this.context = context	
		this.outputNode = outputNode
		this.inputNode = inputNode

		this.handleProcessorMessage = this.handleProcessorMessage.bind(this);

		this.track = track
		this.create(track, waveData)
	}

	create(track: Track, waveData?: Float32Array) {
		try {
			// LooperProcessor.js is in public folder
			this.context.audioWorklet.addModule("realbeatOnline/LooperProcessor.js").then(() => {
				try {
					this.looperNode = new AudioWorkletNode(this.context, "LooperProcessor")
					if (this.inputNode) {
						this.inputNode.connect(this.looperNode)
					}
					this.looperNode.connect(this.outputNode)

					this.looperNode.port.onmessage = this.handleProcessorMessage

					if (waveData) {
						this.setWave(waveData)
					}

					this.setPitch(track.getPitch())
					this.setVolume(track.getVolume())
					this.setMute(track.getMute())
					this.setLooped(track.getLooped())
					this.select(track.getSelection().start, track.getSelection().end)
					if (track.isPlaying()) {
						this.play()
					}
				}
				catch(err) {
					console.log(`error audio node: ${err}`)
				}
			},
			(reason) => {
				console.log(`promise rejected. reason: ${reason}`)
			})
		}
		catch(err) {
			console.log(`error audio node: ${err}`)
		}

		/*try {
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
						console.log(desc)
				})
			})
		}
		catch(err) {
			console.log(`error creating patcher: ${err}`)
		}*/
	}

	destroy() {
		this.looperNode?.disconnect()
		//this.device?.node.disconnect()
	}

	// inport & param

	/*sendInport(inportTag: string, value: number, time: MillisecondTime) {
		if (this.device) {
			let messageEvent = new MessageEvent(time, inportTag, [value])
    	this.device.scheduleEvent(messageEvent)
		}
	}*/

	setParam(name: string, value: number, time?: number) {
		if (this.looperNode) {
			const param = this.looperNode.parameters.get(name)

			param?.setValueAtTime(value, time || this.context.currentTime)
		}
		/*if (this.device) {
			const param = this.device.parametersById.get(name)
			param.value = value
		}*/
	}

	// properties

	setVolume(volume: number) {
		this.volume = volume
		this.setParam("volume", volume)
	}

	setMute(mute: boolean) {
		console.log("Looper mute: "+mute)
		this.mute = mute
		this.setParam("mute", mute ? 1 : 0)
	}

	setPitch(pitch: number) {
		this.pitch = pitch
		this.setParam("pitch", pitch)
	}

	setLooped(looped: boolean) {
		this.looped = looped
		this.setParam("looped", looped ? 1 : 0)
	}

	select(start: number, end: number) {
		this.setParam("loopStart", start)
		this.setParam("loopEnd", end)
	}

	/// sets the audio wavedata
	setWave(waveData: Float32Array) {
		this.looperNode?.port.postMessage({message: "setWave", transfer: [waveData]})
	}

	play(time?: number) {
		this.looperNode?.port.postMessage({message: "play"})
	}

	stop(time?: number) {
		this.looperNode?.port.postMessage({message: "stop"})
	}

	record() {
		this.looperNode?.port.postMessage({message: "record"})
	}

	stopRecord() {
		this.looperNode?.port.postMessage({message: "stopRecord"})
	}

	reverse() {
		this.looperNode?.port.postMessage({message: "reverse"})
	}

	trim() {
		this.looperNode?.port.postMessage({message: "trim"})
	}
}