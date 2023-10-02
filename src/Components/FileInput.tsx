import React from "react";
import { FileInputProps, FileInputState, Solve } from "../Helpers/Types";
import { parseCsv } from "../Helpers/CsvParser";
import { FilterPanel } from "./FilterPanel";
import { GetDemoData } from "../Helpers/SampleData"
import { Button, Form, FormControl, Card, Row, ButtonGroup } from "react-bootstrap";

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
                    <Row>
                        <div className="pagetitle col-12">
                            <h1>Cubeast Analyzer</h1>
                        </div>
                    </Row>
                </header>

                <br />

                <Row className="col-6">
                    <Card className="info-card col-lg-6 col-md-6 col-sm-6">
                        <Form>
                            Upload your cubeast file:
                            <FormControl type="file" id="uploaded_data" accept=".csv" />
                        </Form>
                    </Card>

                    <ButtonGroup className="col-lg-6 col-md-6 col-sm-6">
                        <Button variant="success" onClick={() => { this.showFileData(); }}>
                            Display My Stats!
                        </Button>
                        <Button onClick={() => { this.showTestData(); }}>
                            Display Test Stats!
                        </Button>
                    </ButtonGroup>
                </Row>
                <FilterPanel solves={this.state.solves} />
            </div >
        )
    }
}