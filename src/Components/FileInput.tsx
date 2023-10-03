import React from "react";
import { FileInputProps, FileInputState, Solve } from "../Helpers/Types";
import { parseCsv } from "../Helpers/CsvParser";
import { FilterPanel } from "./FilterPanel";
import { GetDemoData } from "../Helpers/SampleData"
import { Button, Form, FormControl, Card, Row, ButtonGroup, Navbar, Modal } from "react-bootstrap";

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
                        <Button onClick={() => { this.helpButtonClicked() }}>
                            Help
                        </Button>
                    </Navbar>
                </header>

                <Modal
                    show={this.state.showHelpModal}
                    onHide={() => { this.closeButtonClicked() }}
                    size="xl"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Cubeast Analyzer</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Thank you for using Cubeast Analyzer!

                        Add steps to download and use CSV file (include link)

                        Add explanations for charts???

                        Add suggestions of what to do with this tool
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => { this.closeButtonClicked() }}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

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