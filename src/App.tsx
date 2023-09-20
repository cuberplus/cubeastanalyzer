import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const handleClick = () => {
        let dataset = (document.getElementById("uploaded_data") as HTMLInputElement);
        let files: FileList = dataset.files as FileList;
        let file = files.item(0);  

        let text = file?.text();
        text?.then( (value: string) => {
          // right here, value is my csv as a string. This now needs to be parsed into a cool object
          console.log("CSV text is ", value);
          console.log("Parsed csv is ", parseCsv(value));
        })
    }

    const parseCsv = (text: string) => {
      let x = parse;
      console.log("thing is ", x);
      //var myParser = parse(text, {delimiter: ','}, function(data,err) {
      //  console.log("d", data);
      //})

      //console.log("p", myParser);
    }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>


   <form>
      Upload some files?
      <br/>
      <input type="file" id="uploaded_data" accept=".csv"/>
      <br/>
      <button type="button" onClick={() => {
            handleClick();
        }}>Display Data</button>
    </form>

    </div>
  );
}

export default App;
