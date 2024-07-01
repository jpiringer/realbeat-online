import React, { Component } from 'react';
 
import './App.scss';

import Main from "./Main";

interface AppProps {
}

interface AppState {
}

export class App extends Component<AppProps, AppState> {
  render() {
    return (
      <div className="App">
        <Main />
      </div>
    );
  }
}

export default App;
