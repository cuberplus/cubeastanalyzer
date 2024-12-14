import React from 'react';
import { FileInput } from './FileInput';
import "../CSS/Style.css";
import ReactGA from 'react-ga4';

function App() {
  ReactGA.initialize('G-BHXNCQ3K0D');
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });

  return (
    <div className="App">
      <FileInput />
    </div>
  );
}

export default App;
