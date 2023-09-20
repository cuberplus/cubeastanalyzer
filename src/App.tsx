import React from 'react';
import logo from './logo.svg';
import './App.css';
import moment from 'moment';

function App() {

  interface Solve {
    time: number,
    date: Date
  }

  function parseCsv(stringVal: string, splitter: string): Solve[] {
    const [keys, ...rest] = stringVal
      .trim()
      .split("\n")
      .map((item) => item.split(splitter));
  
    const formedArr = rest.map((item) => {
      const obj: Solve = {time: 0, date: new Date()};
      keys.forEach((key, index) => {
        // TODO: need this for every column
        switch(key) {
          case "time":
            obj.time = Number(item.at(index));
            break;
          case "date":
            // TODO: I think this is the wrong time zone, should be UTC
            obj.date = moment(item.at(index), 'YYYY-MM-DD hh:mm:ss').toDate()
            break;
          default:
            //console.log(key + " is an unused column");
        }
      });
      return obj;
    });
    return formedArr;
  }

    const handleClick = () => {
        let dataset = (document.getElementById("uploaded_data") as HTMLInputElement);
        let files: FileList = dataset.files as FileList;
        let file = files.item(0);  

        let text = file?.text();
        text?.then( (value: string) => {
          console.log("Parsed csv is ", parseCsv(value, ','));
        })
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
