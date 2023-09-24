import React from "react";
import { FileInputProps, FileInputState, Solve } from "./Types";
import { parseCsv } from "./CsvParser";
import { FilterPanel } from "./FilterPanel";
import { GetDemoData } from "./SampleData"

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
            <div className={"row"}>
                <br />
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

                <FilterPanel solves={this.state.solves} />
            </div>
        )
    }
}