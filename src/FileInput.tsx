import React from "react";
import { FileInputProps, FileInputState, Solve } from "./Types";
import { parseCsv } from "./CsvParser";
import { FilterPanel } from "./FilterPanel";

export class FileInput extends React.Component<FileInputProps, FileInputState> {
    state: FileInputState = { solves: [] };

    handleClick() {
        let dataset = (document.getElementById("uploaded_data") as HTMLInputElement);
        let files: FileList = dataset.files as FileList;
        let file = files.item(0);

        let text = file?.text();
        text?.then((value: string) => {
            let solveList: Solve[] = parseCsv(value, ',');
            this.setState({ solves: solveList });
        })
    };

    render() {
        return (
            <div>
                <br />
                <form>
                    Upload your cubeast file:
                    <input type="file" id="uploaded_data" accept=".csv" />
                    <button type="button" onClick={() => {
                        this.handleClick();
                    }}>Display Data</button>
                </form>

                <FilterPanel solves={this.state.solves} />
            </div>
        )
    }
}