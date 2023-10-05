import React from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { MultiSelect } from "react-multi-select-component";
import { CrossColor, FilterPanelProps, FilterPanelState, Filters, Solve, StepName } from "../Helpers/Types";
import { ChartPanel } from "./ChartPanel";
import { StepDrilldown } from "./StepDrilldown";
import { Option } from "react-multi-select-component"
import { calculate90thPercentile } from "../Helpers/RunningAverageMath";
import { Tabs, Tab, FormControl, Card, Row, Offcanvas, Col, Button, Tooltip, OverlayTrigger, Alert } from 'react-bootstrap';
import { Const } from "../Helpers/Constants";

export class FilterPanel extends React.Component<FilterPanelProps, FilterPanelState> {
    state: FilterPanelState = {
        allSolves: [],
        filteredSolves: [],
        filters: {
            startDate: moment.utc("1700-01-01").toDate(),
            endDate: moment.utc("2300-01-01").toDate(),
            fastestTime: 0,
            slowestTime: 300,
            crossColors: [CrossColor.White, CrossColor.Yellow, CrossColor.Blue, CrossColor.Green, CrossColor.Orange, CrossColor.Red],
            pllCases: Const.PllCases.map(x => x.value),
            ollCases: Const.OllCases.map(x => x.value),
            includeMistakes: true
        },
        drilldownStep: { label: StepName.PLL, value: StepName.PLL },
        chosenColors: [
            { label: CrossColor.White, value: CrossColor.White },
            { label: CrossColor.Yellow, value: CrossColor.Yellow },
            { label: CrossColor.Red, value: CrossColor.Red },
            { label: CrossColor.Orange, value: CrossColor.Orange },
            { label: CrossColor.Blue, value: CrossColor.Blue },
            { label: CrossColor.Green, value: CrossColor.Green },
        ],
        chosenPLLs: Const.PllCases,
        chosenOLLs: Const.OllCases,
        tabKey: 1,
        windowSize: 500,
        pointsPerGraph: 100,
        showFilters: false,
        showAlert: true
    }

    static passesFilters(solve: Solve, filters: Filters) {
        if (filters.crossColors.indexOf(solve.crossColor) < 0) {
            return false;
        }
        if (solve.date < filters.startDate || solve.date > filters.endDate) {
            return false;
        }
        if (solve.time < filters.fastestTime || solve.time > filters.slowestTime) {
            return false;
        }
        if (solve.steps.pll.case !== "" && filters.pllCases.indexOf(solve.steps.pll.case) < 0) {
            return false;
        }
        if (solve.steps.oll.case !== "" && filters.ollCases.indexOf(solve.steps.oll.case) < 0) {
            return false;
        }
        if (filters.slowestTime < solve.time) {
            return false;
        }
        if (filters.fastestTime > solve.time) {
            return false;
        }

        // TODO: this is a bad way of filtering out mistakes
        if (!filters.includeMistakes && solve.time > 30) {
            return false;
        }

        return true;
    }

    static applyFiltersToSolves(allSolves: Solve[], filters: Filters): Solve[] {
        let filteredSolves: Solve[] = [];
        allSolves.forEach(x => {
            if (this.passesFilters(x, filters)) {
                filteredSolves.push(x);
            }
        })
        return filteredSolves;
    }

    static getDerivedStateFromProps(nextProps: FilterPanelProps, prevState: FilterPanelState) {
        let newState: FilterPanelState = {
            // Update with new solves
            allSolves: nextProps.solves,
            filteredSolves: FilterPanel.applyFiltersToSolves(nextProps.solves, prevState.filters),

            // Leave remaining props the same
            drilldownStep: prevState.drilldownStep,
            filters: prevState.filters,
            chosenColors: prevState.chosenColors,
            chosenPLLs: prevState.chosenPLLs,
            chosenOLLs: prevState.chosenOLLs,
            tabKey: prevState.tabKey,
            windowSize: prevState.windowSize,
            pointsPerGraph: prevState.pointsPerGraph,
            showFilters: prevState.showFilters,
            showAlert: prevState.showAlert
        }

        return newState;
    }

    crossColorsChanged(selectedList: any[]) {
        let selectedColors: CrossColor[] = selectedList.map(x => x.value);

        let newFilters: Filters = this.state.filters;
        newFilters.crossColors = selectedColors;

        this.setState({
            filteredSolves: FilterPanel.applyFiltersToSolves(this.state.allSolves, newFilters),
            filters: newFilters,
            chosenColors: selectedList
        })
    }

    drilldownStepChanged(newValue: Option | null) {
        this.setState({
            drilldownStep: newValue!
        })
    }

    pllChanged(selectedList: any[]) {
        let selectedPlls: string[] = selectedList.map(x => x.value);

        let newFilters: Filters = this.state.filters;
        newFilters.pllCases = selectedPlls;

        this.setState({
            filteredSolves: FilterPanel.applyFiltersToSolves(this.state.allSolves, newFilters),
            filters: newFilters,
            chosenPLLs: selectedList
        })
    }

    ollChanged(selectedList: any[]) {
        let selectedOlls: string[] = selectedList.map(x => x.value);

        let newFilters: Filters = this.state.filters;
        newFilters.ollCases = selectedOlls;

        this.setState({
            filteredSolves: FilterPanel.applyFiltersToSolves(this.state.allSolves, newFilters),
            filters: newFilters,
            chosenOLLs: selectedList
        })
    }

    setStartDate(newStartDate: Date) {
        let newFilters: Filters = this.state.filters;
        newFilters.startDate = newStartDate;
        this.setState({ filters: newFilters })
    }

    setEndDate(newEndDate: Date) {
        let newFilters: Filters = this.state.filters;
        newFilters.startDate = newEndDate;
        this.setState({ filters: newFilters })
    }

    setSlowestSolve(event: React.ChangeEvent<HTMLInputElement>) {
        let newFilters: Filters = this.state.filters;
        newFilters.slowestTime = parseInt(event.target.value);
        this.setState({ filters: newFilters })
    }

    setFastestSolve(event: React.ChangeEvent<HTMLInputElement>) {
        let newFilters: Filters = this.state.filters;
        newFilters.fastestTime = parseInt(event.target.value);
        this.setState({ filters: newFilters })
    }

    setWindowSize(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ windowSize: parseInt(event.target.value) })
    }

    setPointsPerGraph(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ pointsPerGraph: parseInt(event.target.value) })
    }

    setMistakes(event: React.ChangeEvent<HTMLInputElement>) {
        let newFilters: Filters = this.state.filters;
        newFilters.includeMistakes = event.target.checked;
        this.setState({ filters: newFilters });
    }

    tabSelect(key: any) {
        this.setState({ tabKey: key });
    }

    showFilters() {
        this.setState({ showFilters: true });
    }

    hideFilters() {
        this.setState({ showFilters: false });
    }

    hideAlert() {
        this.setState({ showAlert: false });
    }

    createTooltip(description: string) {
        const tooltip = (
            <Tooltip id="tooltip">
                {description}
            </Tooltip>
        );
        return tooltip;
    }

    render() {
        let filters: JSX.Element = (<></>);
        if (this.state.allSolves.length > 0) {
            filters = (
                <Col>
                    <Card className="card info-card">
                        <OverlayTrigger placement="bottom" overlay={this.createTooltip("This dropdown lets you choose which step to see more information about. This only affects data in the 'Step Drilldown' tab.")}>
                            <h6>Which step to drill down?</h6>
                        </OverlayTrigger>
                        <Select
                            options={[
                                { label: StepName.Cross, value: StepName.Cross },
                                { label: StepName.F2L_1, value: StepName.F2L_1 },
                                { label: StepName.F2L_2, value: StepName.F2L_2 },
                                { label: StepName.F2L_3, value: StepName.F2L_3 },
                                { label: StepName.F2L_4, value: StepName.F2L_4 },
                                { label: StepName.OLL, value: StepName.OLL },
                                { label: StepName.PLL, value: StepName.PLL },

                            ]}
                            value={this.state.drilldownStep}
                            onChange={this.drilldownStepChanged.bind(this)}
                        />
                    </Card>

                    <br />
                    <br />

                    <Card className={""}>
                        <OverlayTrigger placement="bottom" overlay={this.createTooltip("If you notice that not all your solves are appearing, even when no filters are chosen, either those solves are corrupt, or cubeast exported a comma in its CSV incorrectly.")}>
                            <h6>Showing {this.state.filteredSolves.length}/{this.state.allSolves.length} solves</h6>
                        </OverlayTrigger>
                    </Card>

                    <Card className="card info-card">
                        <OverlayTrigger placement="bottom" overlay={this.createTooltip("Pick the starting cross color")}>
                            <h6>Cross Color</h6>
                        </OverlayTrigger>
                        <MultiSelect
                            options={[
                                { label: CrossColor.White, value: CrossColor.White },
                                { label: CrossColor.Yellow, value: CrossColor.Yellow },
                                { label: CrossColor.Red, value: CrossColor.Red },
                                { label: CrossColor.Orange, value: CrossColor.Orange },
                                { label: CrossColor.Blue, value: CrossColor.Blue },
                                { label: CrossColor.Green, value: CrossColor.Green },
                            ]}
                            value={this.state.chosenColors}
                            onChange={this.crossColorsChanged.bind(this)}
                            labelledBy="Select"
                        />
                    </Card>

                    <Card className="card info-card">
                        <OverlayTrigger placement="bottom" overlay={this.createTooltip("Choose slowest and fastest solves to keep")}>
                            <h6>Solve Times</h6>
                        </OverlayTrigger>
                        <div className="row">
                            <div className="form-outline col-6" >
                                <FormControl min="0" max="300" type="number" id="fastestSolve" value={this.state.filters.fastestTime} onChange={this.setFastestSolve.bind(this)} />
                            </div>
                            <div className="form-outline col-6" >
                                <FormControl min="0" max="300" type="number" id="slowestSolve" value={this.state.filters.slowestTime} onChange={this.setSlowestSolve.bind(this)} />
                            </div>
                        </div>
                    </Card>

                    <Card className="card info-card">
                        <OverlayTrigger placement="bottom" overlay={this.createTooltip("Choose which PLL Cases to show. This will not work if you do not have Cubeast Premium. I suggest using this simply to keep/remove skips.")}>
                            <h6>PLL cases</h6>
                        </OverlayTrigger>
                        <MultiSelect
                            options={Const.PllCases}
                            value={this.state.chosenPLLs}
                            onChange={this.pllChanged.bind(this)}
                            labelledBy="Select"
                        />
                    </Card>

                    <Card className="card info-card">
                        <OverlayTrigger placement="bottom" overlay={this.createTooltip("Choose which OLL Cases to show. This will not work if you do not have Cubeast Premium. I suggest using this simply to keep/remove skips.")}>
                            <h6>Pick OLL case</h6>
                        </OverlayTrigger>
                        <MultiSelect
                            options={Const.OllCases}
                            value={this.state.chosenOLLs}
                            onChange={this.ollChanged.bind(this)}
                            labelledBy="Select"
                        />
                    </Card>

                    <Card className="card info-card">
                        <OverlayTrigger placement="bottom" overlay={this.createTooltip("Choose the sliding window size. For example, the default is to show the average of 500 solves, over time. If you see no data, you should try lowering this value.")}>
                            <h6>Sliding Window Size</h6>
                        </OverlayTrigger>
                        <FormControl min="5" max="10000" type="number" id="windowSize" value={this.state.windowSize} onChange={this.setWindowSize.bind(this)} />
                    </Card>

                    <Card className="card info-card">
                        <OverlayTrigger placement="bottom" overlay={this.createTooltip("Choose how many points to show on each chart. If this value is set too high, you may see performance issues.")}>
                            <h6>Points Per Graph</h6>
                        </OverlayTrigger>
                        <FormControl min="5" max="10000" type="number" id="windowSize" value={this.state.pointsPerGraph} onChange={this.setPointsPerGraph.bind(this)} />
                    </Card>

                    <Card className="card info-card">
                        <OverlayTrigger placement="bottom" overlay={this.createTooltip("Choose whether to keep messed up solves. Currently, this just filters out solves over 30 seconds. This will likely change in the future.")}>
                            <h6>Include Messed Up Solves</h6>
                        </OverlayTrigger>
                        <input
                            type="checkbox"
                            checked={this.state.filters.includeMistakes}
                            onChange={this.setMistakes.bind(this)}
                        />
                    </Card>

                    <Card className="card info-card">
                        <h6>Pick start date</h6>
                        <DatePicker selected={this.state.filters.startDate} onChange={this.setStartDate.bind(this)} />
                    </Card>

                    <Card className="card info-card">
                        <h6>Pick end date</h6>
                        <DatePicker selected={this.state.filters.endDate} onChange={this.setEndDate.bind(this)} />
                    </Card>
                </Col>
            )
        }


        let analysis: JSX.Element = (<></>)
        if (this.state.allSolves.length > 0) {
            let numSolves = Math.min(1000, this.props.solves.length);
            analysis = (
                <div>
                    <Row>
                        <Button className={"col-lg-2 col-md-2 col-sm-12"} onClick={this.showFilters.bind(this)}>
                            Show filters
                        </Button>
                        <OverlayTrigger placement="bottom" overlay={this.createTooltip(`This means that of the past ${numSolves} solves, 90% of them were below the shown time, rounded up to the nearest second. This is a very high definition of Sub-X, but if you tell someone this number, you will be able to meet that number with 90% certainty.`)}>
                            < Card className={"col-lg-2 col-md-2 col-sm-12"} >
                                You are Sub-{calculate90thPercentile(this.props.solves.map(x => x.time), numSolves)}.
                            </Card>
                        </OverlayTrigger>
                    </Row >

                    <Alert show={this.state.showAlert && (this.state.allSolves.length < this.state.windowSize)} variant={"warning"}>
                        <Alert.Heading>Warning: Not Enough Solves</Alert.Heading>
                        Your number of solves is less than your sliding window size. Try decreasing the Sliding Window Size or do more solves and export them again!
                        <div className="d-flex justify-content-end">
                            <Button onClick={() => this.hideAlert()} variant="warning">
                                Close
                            </Button>
                        </div>
                    </Alert>

                    <br />

                    <Row>
                        <Tabs
                            activeKey={this.state.tabKey}
                            onSelect={this.tabSelect.bind(this)}
                        >
                            <Tab eventKey={1} title="All Steps">
                                <ChartPanel windowSize={this.state.windowSize} solves={this.state.filteredSolves} pointsPerGraph={this.state.pointsPerGraph} />
                            </Tab>
                            <Tab eventKey={2} title="Step Drilldown">
                                <StepDrilldown windowSize={this.state.windowSize} pointsPerGraph={this.state.pointsPerGraph} steps={this.state.filteredSolves.map(x => {
                                    switch (this.state.drilldownStep.value) {
                                        case StepName.Cross:
                                            return x.steps.cross;
                                        case StepName.F2L_1:
                                            return x.steps.f2l_1;
                                        case StepName.F2L_2:
                                            return x.steps.f2l_2;
                                        case StepName.F2L_3:
                                            return x.steps.f2l_3;
                                        case StepName.F2L_4:
                                            return x.steps.f2l_4;
                                        case StepName.OLL:
                                            return x.steps.oll;
                                        case StepName.PLL:
                                            return x.steps.pll;
                                        default:
                                            console.log("invalid step picked" + this.state.drilldownStep.value);
                                            return x.steps.cross;
                                    }
                                })} stepName={this.state.drilldownStep.label} />
                            </Tab>
                        </Tabs>
                    </Row>
                </div >
            );
        }

        return (
            <main className="body">
                <section className="dashboard">
                    <Offcanvas show={this.state.showFilters} onHide={this.hideFilters.bind(this)}>
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Choose solves to show!</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            {filters}
                        </Offcanvas.Body>
                    </Offcanvas>
                    {analysis}
                </section>
            </main >
        )
    }
}