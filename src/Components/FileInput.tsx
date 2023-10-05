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

                        <br />
                        <br />

                        To use Cubeast Analyzer, start by <a href="https://app.cubeast.com/log/solves">exporting your solves as a CSV</a>
                        <br />
                        <a href="https://app.cubeast.com/log/solves"><img className="col-6" src={require("../Assets/CubeastCsv.png")}></img></a>

                        <br />
                        <br />

                        Once your solves are exported, <a href="https://app.cubeast.com/exports">download them from Cubeast</a>
                        <br />
                        <a href="https://app.cubeast.com/exports"><img className="col-6" src={require("../Assets/CubeastDownload.png")}></img></a>

                        <br />
                        <br />

                        Finally upload them to Cubeast Analyzer and display your stats!
                        <br />
                        <img className="col-6" src={require("../Assets/AnalyzerSteps.png")}></img>

                        <br />
                        <br />


                        Make sure to get actionable data out of this tool! To do so, I'd suggest messing around with the tool until you figure out these: <br />
                        1 - What is causing the worst 10% of your solves? <br />
                        2 - What is your slowest step, and what is your slowest case? <br />
                        3 - What makes your good solves different from your bad solves? <br />

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
                            Upload your Cubeast CSV file:
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