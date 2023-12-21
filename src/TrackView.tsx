import React, { Component, ChangeEvent } from 'react'
import { Form, Dropdown } from 'react-bootstrap'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import WaveForm from './WaveForm'
import { Track } from "./Track"
import { CustomToggle } from './CustomToggle';

const sliderMaxValue = 10000

interface TrackViewState {
	title: string
	looped: boolean
	playing: boolean
	recording: boolean
}
 
interface TrackViewProps {
	track: Track
	onDelete: (track: Track) => void
	onCopy: (track: Track) => void
}

export class TrackView extends Component<TrackViewProps, TrackViewState> {
	constructor(props: TrackViewProps) {
    super(props);

		this.state = {
			title: "untitled",
			looped: false,
			playing: false,
			recording: false
		}

		this.onTrackNameChange = this.onTrackNameChange.bind(this)
		this.onClickLoop = this.onClickLoop.bind(this)
		this.onChangePitch = this.onChangePitch.bind(this)
		this.onChangeVolume = this.onChangeVolume.bind(this)
		this.drawWave = this.drawWave.bind(this)
	}

	drawWave(context: CanvasRenderingContext2D | null, frameCount: number) {
		if (context !== null) {
			context.fillStyle = '#000000'
			context.fillRect(0, 0, context.canvas.width, context.canvas.height)

			context.strokeStyle = '#DD0000'
			context.lineWidth = 1
			context.beginPath()
			context.moveTo(0, context.canvas.height/2)
			context.lineTo(context.canvas.width, context.canvas.height/2)

			let wave = this.props.track.wave
			let fact = wave.length / context.canvas.width
			for (let x = 0; x < context.canvas.width; x++) {
				let amplitude = Math.abs(wave[Math.floor(x*fact)])
				let lineLength = amplitude * context.canvas.height

				context.moveTo(x, (context.canvas.height - lineLength)/2)
				context.lineTo(x, context.canvas.height - (context.canvas.height - lineLength)/2)
			}
			context.stroke()

			if (this.props.track.isPlaying()) {
				let xPlayPos = this.props.track.getPlayPos() * context.canvas.width
				context.strokeStyle = '#FF0000'
				context.lineWidth = 3
				context.beginPath()
				context.moveTo(xPlayPos, 0)
				context.lineTo(xPlayPos, context.canvas.height)
				context.stroke()
			}
		}
	}

	onTrackNameChange(event: ChangeEvent<HTMLInputElement>) {
    this.props.track.setTitle(event.target.value)
  }

	onClickLoop() {
		this.props.track.setLooped(!this.props.track.looped)
	}

	onChangePitch(event: ChangeEvent<HTMLInputElement>) {
		this.props.track.setPitch(event.target.valueAsNumber / sliderMaxValue)
	}

	onChangeVolume(event: ChangeEvent<HTMLInputElement>) {
		this.props.track.setVolume(event.target.valueAsNumber / sliderMaxValue)
	}

	render() {
    return (
      <div className="track">
				<Container>
					<Row>
						<Col>
	            <Form.Control className="track-title" type="input" value={this.props.track.title} onChange={this.onTrackNameChange}/>
						</Col>
						<Col>
							<button className="track-button track-button-white" onClick={() => {this.props.onDelete(this.props.track)}}><i className="bi bi-x-circle-fill"></i></button>
						</Col>
					</Row>
				</Container>
				<div className="track-pane">
				<Container>
					<Row>
						<Col>
							<button className={"track-button "+(this.props.track.isRecording() ? "track-record-button-active": "track-button-red")} onClick={() => {this.props.track.toggleRecord()}}><i className="bi bi-record-fill"></i></button> {'  '}
						</Col>
						<Col>
							<button className={"track-button"+(this.props.track.looped ? " track-button-red" : "")} onClick={this.onClickLoop}><i className="bi bi-repeat"></i></button>
						</Col>
						<Col>
							{this.props.track.isPlaying() ? 
								<button className="track-button" onClick={() => {this.props.track.stop()}}><i className="bi bi-stop-fill"></i></button>
								:
								<button className="track-button" onClick={() => {this.props.track.play()}}><i className="bi bi-play-fill"></i></button>
							}
						</Col>
					</Row>
					<Row>
						<Col xs={10}>
								<Row>
									<WaveForm 
										width={220}
										height={70} 
										draw={this.drawWave} 
										frameRate={30} 
									/>
								</Row>
								<Row>
									<Col>								
										<Form.Label>Pitch</Form.Label>
										<Form.Range min={0} max={sliderMaxValue} value={this.props.track.pitch*sliderMaxValue} onChange={this.onChangePitch} />
									</Col>
									<Col>								
										<Form.Label>Volume</Form.Label>
										<Form.Range min={0} max={sliderMaxValue} value={this.props.track.volume*sliderMaxValue} onChange={this.onChangeVolume}/>
									</Col>
								</Row>
						</Col>
						<Col xs={1}>
							<Row>
								<button className="track-button" onClick={() => {this.props.track.reverse()}}><i className="bi bi-arrow-left"></i></button>
							</Row>
							<Row>
								<Dropdown>
									<Dropdown.Toggle as={CustomToggle} id="dropdown-basic">
										<i className="bi bi-gear"></i>
									</Dropdown.Toggle>

									<Dropdown.Menu>
										<Dropdown.Item href="#/action-1"><i className="bi bi-lightning"></i> Test</Dropdown.Item>
										<Dropdown.Item href="#/action-2"><i className="bi bi-arrows-collapse-vertical"></i> Trim</Dropdown.Item>
										<Dropdown.Item href="#/action-3"><i className="bi bi-graph-down"></i> Fade Out</Dropdown.Item>
										<Dropdown.Item href="#/action-4"><i className="bi bi-box"></i> Reverb</Dropdown.Item>
										<Dropdown.Item href="#/action-5"><i className="bi bi-wind"></i> Distortion</Dropdown.Item>
										<Dropdown.Item href="#/action-6"><i className="bi bi-shift"></i> Louder</Dropdown.Item>
										<Dropdown.Item href="#/action-7"><i className="bi bi-chat-text"></i> Speak</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</Row>
							<Row>
								<button className="track-button"><i className="bi bi-chat-text"></i></button>
							</Row>
							<Row>
								<button className="track-button" onClick={() => {this.props.onCopy(this.props.track)}}><i className="bi bi-copy"></i></button>
							</Row>
						</Col>
					</Row>
				</Container>
				</div>
			</div>
		)
	}
}