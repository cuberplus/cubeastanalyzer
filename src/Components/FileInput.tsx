import React from "react";
import { FileInputProps, FileInputState, Solve } from "../Helpers/Types";
import { parseCsv } from "../Helpers/CsvParser";
import { FilterPanel } from "./FilterPanel";
import { GetDemoData } from "../Helpers/SampleData"
import { Button, Form, FormControl, Card, Row, ButtonGroup, Navbar, Modal, Container } from "react-bootstrap";
import { HelpPanel } from "./HelpPanel";

export class FileInput extends React.Component<FileInputProps, FileInputState> {
    state: FileInputState = { solves: [], showHelpModal: false };

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

    helpButtonClicked() {
        this.setState({ showHelpModal: true });
    }

    closeButtonClicked() {
        this.setState({ showHelpModal: false });
    }

    render() {
        return (
            <div>
                <header className={"header"}>
                    <Navbar>
                        <Navbar.Brand>
                            Cubeast Analyzer
                        </Navbar.Brand>
                        <Button
                            onClick={() => { this.helpButtonClicked() }}>
                            Help
                        </Button>
                    </Navbar>
                </header>

                <HelpPanel showHelpPanel={this.state.showHelpModal} onCloseHandler={() => this.closeButtonClicked()} />

                <Row className="m-2">
                    <Card className="info-card col-lg-6 col-md-12 col-sm-12">
                        <Form className="m-2">
                            <h3>Upload your Cubeast CSV file:</h3>
                            <FormControl type="file" id="uploaded_data" accept=".csv" />
                        </Form>
                        <ButtonGroup className="m-2">
                            <Button className="col-8" variant="success" onClick={() => { this.showFileData(); }}>
                                Display My Stats!
                            </Button>
                            <Button className="col-4" onClick={() => { this.showTestData(); }}>
                                Display Test Stats!
                            </Button>
                        </ButtonGroup>
                    </Card>
                </Row>

                <FilterPanel solves={this.state.solves} />
            </div >
        )
    }
}