import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  interface Solve {
    time: number
  }

  function csvToArr(stringVal: string, splitter: string): Solve[] {
    const [keys, ...rest] = stringVal
      .trim()
      .split("\n")
      .map((item) => item.split(splitter));
  
    const formedArr = rest.map((item) => {
      const obj: Solve = {time: 0};
      keys.forEach((key, index) => {
        // TODO: need this for every column
        switch(key) {
          case "time":
            obj.time = Number(item.at(index));
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
          // right here, value is my csv as a string. This now needs to be parsed into a cool object
          console.log("CSV text is ", value);
          console.log("Parsed csv is ", parseCsv(value));
        })
    }

    const parseCsv = (text: string) => {
      //console.log("thing is ", x);
      //var myParser = parse(text, {delimiter: ','}, function(data,err) {
      //  console.log("d", data);
      //})

      //console.log("p", myParser);

      //const stream = parse({headers: true})
      //.on('data', row => console.log("row is ", row));
      //
      let data = csvToArr(text, ',');
      console.log(data);
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
