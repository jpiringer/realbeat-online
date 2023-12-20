// LooperProcessor.js
export class LooperProcessor extends AudioWorkletProcessor {
	static get parameterDescriptors() {
    return [
			{name: 'volume', defaultValue: 0.75, minValue: 0, maxValue: 1},
			{name: 'pitch', defaultValue: 0.5, minValue: 0, maxValue: 1},
			{name: 'looped', defaultValue: 0, minValue: 0, maxValue: 1},
			{name: 'loopStart', defaultValue: 0, minValue: 0, maxValue: 1},
			{name: 'loopEnd', defaultValue: 1, minValue: 0, maxValue: 1},
		];
  }

	testInit() {
		let hz = 440
		let sampleRate = 48000
		let seconds = 2

		this.buffer = new Float32Array(sampleRate*seconds)

		for (let i = 0; i < this.buffer.length; i++) {
			this.buffer[i] = Math.sin(i * 100)
		}

		console.log(this.buffer)
	}

	resetPlaypos() {
		this.playPos = this.loopStart
	}

	play() {
		console.log(`processor play`)
		this.resetPlaypos()
		this.playing = true
	}

	stop() {
		console.log("processor stop")
		this.playing = false
		this.port.postMessage({
        message: 'stop'
      });
	}

  handleMessage_(event) {
		switch (event.data.message) {
			case "play":
				this.play()
				break
			case "stop":
				this.stop()
				break
			default:
		    console.log(`unknown message [Processor:Received] ${event.data.message} (${event.data.contextTimestamp})`)
				break
		}
  }

	constructor(options) {
		super()

		this.playing = false
		this.loopStart = 0
		this.testInit()
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
		const looped = parameters.looped

		// when connected
		/*if (inputs.length === 0 || inputs[0].length === 0) {
      return true
    }*/

		const output = outputs[0]

		output.forEach((channel) => {
			for (let i = 0; i < channel.length; i++) {
				let p = isPitchConstant ? pitch[0] : pitch[i]
				let advance = p * 2

				if (this.playing) {
					channel[i] = this.buffer[Math.floor(this.playPos)] * (isVolumeConstant ? volume[0] : volume[i])
					this.playPos = this.playPos + advance

					if (this.playPos > this.loopEnd) {
						if (looped[0] === 1) {
							this.playPos = this.loopStart + this.loopEnd - this.playPos
						}
						else {
							this.resetPlaypos()
							this.stop()
						}
					}
				}
				else {
					channel[i] = 0
				}
			}
		})

		return true
	}
}

registerProcessor("LooperProcessor", LooperProcessor);