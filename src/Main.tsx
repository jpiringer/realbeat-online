import React, { Component, ChangeEvent } from 'react'
import { Col, Form, ListGroup } from 'react-bootstrap'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Offcanvas from 'react-bootstrap/Offcanvas'

import { Project } from "./Project"
import ProjectItem from "./models/ProjectItem"

import { ProjectList } from "./ProjectList";
import { Info } from "./Info";
import { db } from "./models/db"

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
    return this.state.currentProject //this.state.projects[this.state.currentProjectNr];
  }

  openProjectNr(projectIndex: number) {
    db.getProjects().then(
      (projects: ProjectItem[]) => {
        let project = projects[this.state.selectedProjectNr] as Project
        project.setUpdater(() => {this.updateProject()})
        this.setState({currentProject: project})
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

    this.setState({currentProject: newProject})
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
      exportType: "WAV"
    };

    this.showExport = this.showExport.bind(this)
    this.hideExport = this.hideExport.bind(this)
    this.keyDown = this.keyDown.bind(this);
    this.play = this.play.bind(this);
    this.hideClearAlert = this.hideClearAlert.bind(this);
    this.showClearAlert = this.showClearAlert.bind(this);
    this.showSettings = this.showSettings.bind(this);
    this.handleCloseSettings = this.handleCloseSettings.bind(this);
    this.onExportTypeChange = this.onExportTypeChange.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.makeNewProject = this.makeNewProject.bind(this);
    this.makeNewProject = this.makeNewProject.bind(this);
    this.onProjectNameChange = this.onProjectNameChange.bind(this);
    this.showProjectManager = this.showProjectManager.bind(this);
    this.hideProjectManager = this.hideProjectManager.bind(this);
    this.doExport = this.doExport.bind(this)

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

  info() {
    return (
      <Modal show={this.state.showInfo} onHide={() => {this.setState({showInfo: false})}} animation={true}>
        <Modal.Header closeButton className="blackmodal" closeVariant="white">
          <Modal.Title>Info</Modal.Title>
        </Modal.Header>
        <Modal.Body className="blackmodal">
          <p>This is a cute app sound by jörg piringer</p>
          <p>check out my website: <a href="https://joerg.piringer.net">https://joerg.piringer.net</a></p>
          <p>or fork this app on github: <a href="https://github.com/jpiringer/realbeat-online">https://github.com/jpiringer/stopmotion</a></p>
        </Modal.Body>
        <Modal.Footer className="blackmodal">
          <Button variant="primary" onClick={() => {this.setState({showInfo: false})}}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
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
        </div>
        <br />
        <Button variant="outline-success" onClick={this.play}>{this.state.playing ? <i className="bi bi-stop"></i> : <i className="bi bi-play"></i>}</Button>{' '}
        <br />
        <div>
          <Button variant="outline-success" onClick={this.showExport}><i className="bi bi-box-arrow-down"></i></Button>{' '}
          <Button variant="outline-success" onClick={this.showProjectManager}>Manage Projects</Button>{' '}
          <Button variant="outline-success" onClick={() => {this.setState({showInfo: true})}} ><i className="bi bi-info-circle"></i></Button>
        </div>
        { this.export() }
        { this.projectManager() }
        <Info show={this.state.showInfo} onHide={() => {this.setState({showInfo: false})}} />
      </div>
    );
  };
}

export default Main;