// LooperProcessor.js
const maxBufferLength = 20 // seconds
const normalizeThreshold = 0.00001

export class LooperProcessor extends AudioWorkletProcessor {
	
	static get parameterDescriptors() {
    return [
			{name: 'volume', defaultValue: 0.75, minValue: 0, maxValue: 1},
			{name: 'pitch', defaultValue: 0.5, minValue: 0, maxValue: 1},
			{name: 'looped', defaultValue: 0, minValue: 0, maxValue: 1},
			{name: 'mute', defaultValue: 0, minValue: 0, maxValue: 1},
			{name: 'loopStart', defaultValue: 0, minValue: 0, maxValue: 1},
			{name: 'loopEnd', defaultValue: 1, minValue: 0, maxValue: 1},
		];
  }

	initBuffer() {
		this.buffer = new Float32Array(sampleRate*maxBufferLength)
	}

	testInit() {
		for (let i = 0; i < this.buffer.length; i++) {
			this.buffer[i] = Math.sin(i * 100)
		}

		console.log(this.buffer)
	}

	resetPlaypos() {
		this.playPos = this.loopStart
	}

	play() {
		this.resetPlaypos()
		this.playing = true
	}

	stop() {
		this.playing = false
		this.port.postMessage({
        message: 'stop'
      });
	}

	record() {
		this.initBuffer()
		this.recordPos = 0
		this.maxRecordedSample = 0
		this.recording = true
	}

	postWaveForm() {
		this.port.postMessage({
			message: 'stopRecord',
			transfer: [this.buffer, this.buffer.length, this.normalizeDiv]
    });
	}

	postSelection(start, end) {
		this.port.postMessage({
			message: 'selection',
			transfer: [start, end]
    });
	}

	postPlayPos() {
		this.port.postMessage({
			message: 'playPos',
			transfer: [this.playPos / this.buffer.length]
    });
	}

	stopRecord() {
		this.loopStart = 0
		this.loopEnd = this.recordPos
		if (this.maxRecordedSample <= normalizeThreshold) {
			this.normalizeDiv = 1
		}
		else {
			this.normalizeDiv = this.maxRecordedSample
		}
		this.recording = false
		this.buffer = this.buffer.subarray(0, this.recordPos)
		this.postWaveForm()
	}

	reverse() {
		this.buffer.reverse()
		let selectionStart = this.loopStart / this.buffer.length
		let selectionEnd = this.loopEnd / this.buffer.length
		this.postWaveForm()
		this.postSelection(1-selectionEnd,1-selectionStart)
	}

	trim() {
		this.buffer = this.buffer.subarray(this.loopStart, this.loopEnd)
		this.postWaveForm()
		this.postSelection(0,1)
	}

	setWave(waveData) {
		this.buffer = waveData
		this.postWaveForm()
	}

	addRecordingSample(sample) {
		if (this.recording) {
			if (this.recordPos < this.buffer.length) {
				this.buffer[this.recordPos] = sample
				this.maxRecordedSample = Math.max(Math.abs(sample), this.maxRecordedSample)
				this.recordPos++
			}
			else {
				this.stopRecord()
			}
		}
	}

  handleMessage_(event) {
		switch (event.data.message) {
			case "play":
				this.play()
				break
			case "stop":
				this.stop()
				break
			case "record":
				this.record()
				break
			case "stopRecord":
				this.stopRecord()
				break
			case "reverse":
				this.reverse()
				break
			case "trim":
				this.trim()
				break
			case "setWave":
				this.setWave(event.data.transfer[0])
				break
			default:
		    console.log(`unknown message [Processor:Received] ${event.data.message} (${event.data.contextTimestamp})`)
				break
		}
  }

	constructor(options) {
		super()

		this.initBuffer()

		this.playing = false
		this.recording = false
		this.recordPos = 0
		this.normalizeDiv = 1

		this.loopStart = 0
		//this.testInit()
		this.loopEnd = this.buffer.length
		this.resetPlaypos()

		this.port.onmessage = this.handleMessage_.bind(this);
	}

	//process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>) {
	process(inputs, outputs, parameters) {
		const volume = parameters.volume
    const isVolumeConstant = volume.length === 1
		const pitch = parameters.pitch
    const isPitchConstant = pitch.length === 1
		const looped = parameters.looped[0]
		const mute = parameters.mute[0]

		this.loopStart = parameters.loopStart[0] * this.buffer.length
		this.loopEnd = parameters.loopEnd[0] * this.buffer.length

		if (this.recording) {
			if (inputs.length === 0 || inputs[0].length === 0) {
      	return true
			}
			else {
				let input = inputs[0]
				let channel = input[0]

				for (let i = 0; i < channel.length; i++) {
					this.addRecordingSample(channel[i])
				}
			}
		}

		let output = outputs[0]
		let channel0 = output[0]

		for (let i = 0; i < channel0.length; i++) {
			let p = isPitchConstant ? pitch[0] : pitch[i]
			let advance = p * 2

			if (this.playing) {
				if (mute === 1) {
					output.forEach((channel) => {
						channel[i] = 0
					})
				}
				else {
					output.forEach((channel) => {
						channel[i] = this.buffer[Math.floor(this.playPos)] * (isVolumeConstant ? volume[0] : volume[i]) / this.normalizeDiv
					})
				}
				this.playPos = this.playPos + advance

				if (this.playPos > this.loopEnd) {
					if (looped === 1) {
						this.playPos = this.loopStart + this.playPos - this.loopEnd
					}
					else {
						this.resetPlaypos()
						this.stop()
					}
				}
			}
			else {
				output.forEach((channel) => {
					channel[i] = 0
				})
			}
		}

		this.postPlayPos()

		return true
	}
}

registerProcessor("LooperProcessor", LooperProcessor);