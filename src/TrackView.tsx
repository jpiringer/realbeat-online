import React, { Component, ChangeEvent } from 'react'
import { Form } from 'react-bootstrap'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import WaveForm from './WaveForm'
import { Track } from "./Track"

const sliderMaxValue = 10000

interface TrackViewState {
	title: string
	looped: boolean
	playing: boolean
	recording: boolean
}
 
interface TrackViewProps {
	track: Track
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
	}

	drawWave(context: CanvasRenderingContext2D | null, frameCount: number) {
		if (context !== null) {
			context.fillStyle = '#000000'
			context.fillRect(0, 0, context.canvas.width, context.canvas.height)
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
							<button className="track-button track-button-white"><i className="bi bi-x-circle-fill"></i></button>
						</Col>
					</Row>
				</Container>
				<div className="track-pane">
				<Container>
					<Row>
						<Col>
							<button className="track-button track-button-red" onClick={() => {this.props.track.record()}}><i className="bi bi-record-fill"></i></button> {'  '}
						</Col>
						<Col>
							<button className={"track-button"+(this.props.track.looped ? " track-button-red" : "")} onClick={this.onClickLoop}><i className="bi bi-repeat"></i></button>
						</Col>
						<Col>
							<button className="track-button" onClick={() => {this.props.track.play()}}><i className="bi bi-play-fill"></i></button>
							<button className="track-button" onClick={() => {this.props.track.stop()}}><i className="bi bi-stop-fill"></i></button>
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
								<button className="track-button"><i className="bi bi-gear"></i></button>
							</Row>
							<Row>
								<button className="track-button"><i className="bi bi-chat-text"></i></button>
							</Row>
							<Row>
								<button className="track-button"><i className="bi bi-copy"></i></button>
							</Row>
						</Col>
					</Row>
				</Container>
				</div>
			</div>
		)
	}
}