import React, { Component, ChangeEvent } from 'react'
import { Form } from 'react-bootstrap'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Offcanvas from 'react-bootstrap/Offcanvas'

import { Project } from "./Project"
import ProjectItem from "./models/ProjectItem"

import { ProjectList } from "./ProjectList"
import { Info } from "./Info"
import { TrackView } from "./TrackView"
import { Track } from "./Track"
import { db } from "./models/db"
import { soundEngine } from './sound/SoundEngine';

const sliderMaxValue = 10000

type ExportType = "WAV" | "JSON"

interface RealbeatState {
  showClearAlert: boolean
  showSettings: boolean
  showExport: boolean
  showInfo: boolean
  showProjectManager: boolean
  exportType: ExportType
  playing: boolean
  selectedProjectNr: number
  currentProject?: Project
  tracks: Track[]
}
 
interface RealbeatProps {
}

export class Main extends Component<RealbeatProps, RealbeatState> {
  private mainDivRef: React.RefObject<HTMLDivElement>;

  setLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getLocalStorage<T>(key: string, defaultValue: T): T {
    let storedValue = localStorage.getItem(key);
    if (storedValue == null) {
      this.setLocalStorage(key, defaultValue);
      return defaultValue;
    }
    return JSON.parse(storedValue);
  }

  getProjects() {
    return db.getProjects()
  }

  getCurrentProject() {
    return this.state.currentProject
  }

  openProjectNr(projectIndex: number) {
    soundEngine.closeAll()

    db.getProjects().then(
      (projects: ProjectItem[]) => {
        let project = projects[this.state.selectedProjectNr] as Project
        project.setUpdater(() => {this.updateProject()})
        this.setState({currentProject: project})
        soundEngine.setMainVolume(project.getVolume())

        project.loadTracks().then((tracks) => {
          this.setState({tracks: tracks.map((trackItem) => {
            let track = new Track(this.updateTrack)
            track.setFromTrackItem(trackItem)
            track.initSound()

            return track
          })})
        })
      }
    )
  }

  updateProject() {
    this.setState({currentProject: this.state.currentProject})
  }

  createNewProject() {
    return new Project(() => {this.updateProject()})
  }

  makeNewProject() {
    var newProject = this.createNewProject()

    soundEngine.closeAll()
    this.setState({currentProject: newProject, tracks: []})
  }

  constructor(props: RealbeatProps) {
    super(props);

    this.mainDivRef = React.createRef();

    //let rotate = this.getLocalStorage<number>("rotate", 0)

    db.getProjectCount().then((count: number) => {
      if (count <= 0) {
        db.populate()
      }
    })

    db.projects.mapToClass(Project)

    this.state = {
      playing: false,
      showClearAlert: true, showSettings: false, showExport: false, showProjectManager: false,
      showInfo: false,
      selectedProjectNr: -1,
      currentProject: undefined,
      exportType: "WAV",
      tracks: []
    }

    this.showExport = this.showExport.bind(this)
    this.hideExport = this.hideExport.bind(this)
    this.keyDown = this.keyDown.bind(this)
    this.play = this.play.bind(this)
    this.hideClearAlert = this.hideClearAlert.bind(this)
    this.showClearAlert = this.showClearAlert.bind(this)
    this.showSettings = this.showSettings.bind(this)
    this.handleCloseSettings = this.handleCloseSettings.bind(this)
    this.onExportTypeChange = this.onExportTypeChange.bind(this)
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this)
    this.makeNewProject = this.makeNewProject.bind(this)
    this.makeNewProject = this.makeNewProject.bind(this)
    this.onProjectNameChange = this.onProjectNameChange.bind(this)
    this.showProjectManager = this.showProjectManager.bind(this)
    this.hideProjectManager = this.hideProjectManager.bind(this)
    this.doExport = this.doExport.bind(this)
    this.addTrack = this.addTrack.bind(this)
    this.updateTrack = this.updateTrack.bind(this)
    this.deleteTrack = this.deleteTrack.bind(this)
    this.duplicateTrack = this.duplicateTrack.bind(this)
    this.onChangeMainVolume = this.onChangeMainVolume.bind(this)

    window.addEventListener("beforeunload", this.handleBeforeUnload);
  }

  handleBeforeUnload(event: Event) {
    event.preventDefault();
  }

  componentWillUnmount(): void {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  }

  componentDidMount() {
    this.mainDivRef.current && this.mainDivRef.current.focus();
  }

  exportJSON(fileName: string) {
    let jsonString = this.getCurrentProject()!.exportToJSON()

    const file = new Blob([jsonString], { type: 'text/plain' })
    const link = document.createElement('a')
    link.download = fileName+".json"
    link.href = URL.createObjectURL(file)
    link.click()
    //this.setProgress(0)
    URL.revokeObjectURL(link.href)
  }

  play() {
    this.setState({playing: !this.state.playing});
  }

  addTrack() {
    var tracks = this.state.tracks
    let track = new Track(this.updateTrack)

    tracks.push(track)
    this.setState({tracks: tracks})

    this.getCurrentProject()!.addTrack(track)
  }

  updateTrack(track: Track) {
    this.setState({tracks: this.state.tracks})
  }

  deleteTrack(track: Track) {
    let tracks = this.state.tracks.filter((t: Track, index: number) => {
      return t.getId() !== track.getId()
    })

    this.setState({tracks: tracks})
    this.getCurrentProject()!.deleteTrack(track)
  }

  duplicateTrack(track: Track) {
    if (this.getCurrentProject() !== undefined) {
      let newTrack = track.duplicate()
      let tracks = this.state.tracks

      tracks.push(newTrack)

      this.setState({tracks: tracks})
      this.getCurrentProject()!.addTrack(newTrack)
    }
  }

  noModals() {
    return !(this.state.showProjectManager || this.state.showExport || this.state.showSettings);
  }

  keyDown(e: { key: string; code: string; }) {
    if (this.noModals()) {
      if (e.code === "Enter") {
      }
      else if (e.code === "Space") {
        this.play();
      }
      else if (e.code === "ArrowRight") {
      }
      else if (e.code === "ArrowLeft") {
      }
      else if (e.code === "Delete" || e.code === "Backspace") {
      }
      else {
      }
    }
  }

  hideClearAlert() {
    this.setState({showClearAlert: false});
  }

  showClearAlert() {
    this.setState({showClearAlert: true});
  }

  handleCloseSettings() {
    this.setState({showSettings: false});
  }

  showSettings() {
    this.setState({showSettings: true});
  }

  onProjectNameChange(event: ChangeEvent<HTMLInputElement>) {
    if (this.getCurrentProject() !== undefined) {
      this.getCurrentProject()!.setTitle(event.target.value)
    }
  }

  settings() {
    return (
    <Offcanvas show={this.state.showSettings} onHide={this.handleCloseSettings}>
      <Offcanvas.Header closeButton closeVariant="white">
        <Offcanvas.Title>Settings</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        { this.getCurrentProject() !== undefined && 
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Project title:</Form.Label>
            <Form.Control type="input" placeholder="project title" value={this.getCurrentProject()!.getTitle()} onChange={this.onProjectNameChange}/>
          </Form.Group>
        }

        {/*<Form.Check type="checkbox" id="rotate" label="Rotate 180°" checked={this.getCurrentProject()!.getRotate()} onChange={this.changeRotate} />*/}

      </Offcanvas.Body>
    </Offcanvas>
    );
  }

  openProject() {
    this.openProjectNr(this.state.selectedProjectNr)
    this.hideProjectManager()
  }

  deleteProject(id: number) {
    var current = this.getCurrentProject()

    if (current !== undefined) {
      if (current.id === id) {
        this.setState({currentProject: undefined})
      }
    }

    db.deleteProject(id)
  }

  projectManager() {
    return (
      <Modal show={this.state.showProjectManager} onHide={this.hideProjectManager} animation={true}>
        <Modal.Header closeButton className="blackmodal" closeVariant="white">
          <Modal.Title>Project Manager</Modal.Title>
        </Modal.Header>
        <ProjectList 
          selected={this.state.selectedProjectNr} 
          onSelect={(index: number) => {this.setState({selectedProjectNr: index})}}
          onOpen={() => {this.openProject()}}
          onDelete={(index: number) => {this.deleteProject(index)}}
        />
        
        <Modal.Footer className="blackmodal">
            <Col>
              <Button variant="primary" onClick={() => {this.makeNewProject(); this.hideProjectManager();}}>New Project</Button>
            </Col>
            <Col>
              <Button variant="success" disabled={this.state.selectedProjectNr < 0} onClick={() => {this.openProject()}}>Open Project</Button>{' '}
              
              <Button variant="primary" onClick={this.hideProjectManager}>Cancel</Button>
            </Col>
        </Modal.Footer>
      </Modal>
    )
  }

  showProjectManager() {
    this.setState({showProjectManager: true, selectedProjectNr: -1, showClearAlert: false});
  }

  hideProjectManager() {
    this.setState({showProjectManager: false, showClearAlert: false});
  }

  showExport() {
    this.setState({showExport: true});
  }

  hideExport() {
    this.setState({showExport: false});
  }

  onExportTypeChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({exportType: event.target.value as ExportType});
  }

  doExport() {

  }

  onChangeMainVolume(event: ChangeEvent<HTMLInputElement>) {
		this.getCurrentProject()!.setVolume(event.target.valueAsNumber / sliderMaxValue)
	}

  export() {
    return (
      <Modal show={this.state.showExport} onHide={this.hideExport} animation={true}>
        <Modal.Header closeButton className="blackmodal" closeVariant="white">
          <Modal.Title>Export</Modal.Title>
        </Modal.Header>
        <Modal.Body className="blackmodal">
          <Form>
            <div className="mb-3">
              <Form.Check inline label="WAV" value="Video" name="group1" type="radio" checked={this.state.exportType === "WAV"} onChange={this.onExportTypeChange} id="wav" />
              <Form.Check inline label="JSON" value="JSON" name="group1" type="radio" checked={this.state.exportType === "JSON"} onChange={this.onExportTypeChange} id="json" />
            </div>
          </Form>
          
        </Modal.Body>
        <Modal.Footer className="blackmodal">
          <Button variant="success" onClick={this.doExport}>
            Export
          </Button>
          <Button variant="primary" onClick={this.hideExport}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  tracks() {
    return (
      <div className="tracks">
        <Container>
          <Row>
            <Col>
              <Button variant="outline-success" onClick={this.addTrack}><i className="bi bi-plus-lg"></i></Button>{' '}
              <Button variant="outline-success" onClick={this.play}>{this.state.playing ? <i className="bi bi-stop"></i> : <i className="bi bi-play"></i>}</Button>{' '}
            </Col>
            <Col>
              <Form.Label>Volume</Form.Label>
              <Form.Range min={0} max={sliderMaxValue} value={this.getCurrentProject()!.getVolume()*sliderMaxValue} onChange={this.onChangeMainVolume}/>
            </Col>
          </Row>
        </Container>
        { this.state.tracks.map((track: Track, index: number) => {
          return <TrackView key={index} track={track} onDelete={this.deleteTrack} onCopy={this.duplicateTrack}/>
        })}
      </div>
    )
  }

  render() {
    return (
      <div className="camMain" tabIndex={0} onKeyDown={this.keyDown} ref={this.mainDivRef}>
        { this.getCurrentProject() !== undefined && this.settings() }
        <br />
        <div className="heading">
          <span className="projectTitle">{ this.getCurrentProject() === undefined ? "please create or load a project!" : this.getCurrentProject()!.getTitle() }</span>
          { this.getCurrentProject() !== undefined && <Button variant="outline-danger" onClick={this.showSettings}><i className="bi bi-gear"></i></Button> }{' '} 
          <Button variant="outline-success" onClick={this.showExport}><i className="bi bi-box-arrow-down"></i></Button>{' '}
          <Button variant="outline-success" onClick={this.showProjectManager}>Manage Projects</Button>{' '}
          <Button variant="outline-success" onClick={() => {this.setState({showInfo: true})}} ><i className="bi bi-info-circle"></i></Button>
        </div>
        
        { this.getCurrentProject() !== undefined && this.tracks() }

        { this.export() }
        { this.projectManager() }
        <Info show={this.state.showInfo} onHide={() => {this.setState({showInfo: false})}} />
      </div>
    );
  };
}

export default Main;