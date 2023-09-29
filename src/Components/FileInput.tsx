import React from "react";
import { FileInputProps, FileInputState, Solve } from "../Helpers/Types";
import { parseCsv } from "../Helpers/CsvParser";
import { FilterPanel } from "./FilterPanel";
import { GetDemoData } from "../Helpers/SampleData"

export class FileInput extends React.Component<FileInputProps, FileInputState> {
    state: FileInputState = { solves: [] };

    showFileData() {
        let dataset = (document.getElementById("uploaded_data") as HTMLInputElement);
        let files: FileList = dataset.files as FileList;
        let file = files.item(0);

        let text = file?.text();
        text?.then((value: string) => {
            let solveList: Solve[] = parseCsv(value, ',');
            this.setState({ solves: solveList });
        })
    };

    showTestData() {
        let file = GetDemoData();
        let solveList: Solve[] = parseCsv(file, ',');
        this.setState({ solves: solveList });
    }

    render() {
        return (
            <div>
                <header className={"header"}>

                    <div className="row">
                        <div className="pagetitle col-12">
                            <h1>Cubeast Analyzer</h1>
                        </div>
                    </div>
                </header>

                <div className="row">
                    <div className="card info-card">
                        <div className="col-lg-6 col-md-6 col-sm-6">
                            <form>
                                Upload your cubeast file:
                                <input type="file" id="uploaded_data" accept=".csv" />
                                <button type="button" onClick={() => {
                                    this.showFileData();
                                }}>Display My Stats!</button>
                                <button type="button" onClick={() => {
                                    this.showTestData();
                                }}>Display Test Stats!</button>
                            </form>
                        </div>
                    </div>
                </div>

                <FilterPanel solves={this.state.solves} />
            </div>
        )
    }
}