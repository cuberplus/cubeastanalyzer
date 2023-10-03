import React from "react";
import { FileInputProps, FileInputState, Solve } from "../Helpers/Types";
import { parseCsv } from "../Helpers/CsvParser";
import { FilterPanel } from "./FilterPanel";
import { GetDemoData } from "../Helpers/SampleData"
import { Button, Form, FormControl, Card, Row, ButtonGroup, Navbar } from "react-bootstrap";

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
                    <Navbar>
                        <img src="../../public/favicon.png" width="30" height="30" className="d-inline-block align-top" alt="" />
                        <Navbar.Brand>
                            Cubeast Analyzer
                        </Navbar.Brand>
                    </Navbar>
                </header>

                <br />

                <Row className="col-lg-8 col-md-12 col-sm-12">
                    <Card className="info-card col-lg-6 col-md-12 col-sm-12">
                        <Form>
                            Upload your cubeast file:
                            <FormControl type="file" id="uploaded_data" accept=".csv" />
                        </Form>
                    </Card>

                    <ButtonGroup className="col-lg-6 col-md-6 col-sm-12">
                        <Button className="col-lg-7 col-md-6 col-sm-6" variant="success" onClick={() => { this.showFileData(); }}>
                            Display My Stats!
                        </Button>
                        <Button className="col-lg-5 col-md-6 col-sm-6" onClick={() => { this.showTestData(); }}>
                            Display Test Stats!
                        </Button>
                    </ButtonGroup>
                </Row>

                <br />

                <FilterPanel solves={this.state.solves} />
            </div >
        )
    }
}