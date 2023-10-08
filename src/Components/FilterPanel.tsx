import React from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { MultiSelect } from "react-multi-select-component";
import { CrossColor, Deviations, FilterPanelProps, FilterPanelState, Filters, Solve, SolveCleanliness, StepName } from "../Helpers/Types";
import { ChartPanel } from "./ChartPanel";
import { StepDrilldown } from "./StepDrilldown";
import { Option } from "react-multi-select-component"
import { calculate90thPercentile, calculateAverage, calculateRecords, calculateStandardDeviation } from "../Helpers/MathHelpers";
import { Tabs, Tab, FormControl, Card, Row, Offcanvas, Col, Button, Tooltip, OverlayTrigger, Alert, Container } from 'react-bootstrap';
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
            solveCleanliness: Const.solveCleanliness.map(x => x.value)
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
        solveCleanliness: Const.solveCleanliness,
        chosenPLLs: Const.PllCases,
        chosenOLLs: Const.OllCases,
        tabKey: 1,
        windowSize: 500,
        pointsPerGraph: 100,
        showFilters: false,
        showAlert: true
    }

    static passesFilters(solve: Solve, filters: Filters, deviations: Deviations) {
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

        // If total time or any step is 3 standard deviations away, remove it
        let isMistake = this.isMistakeSolve(solve, deviations);
        if (filters.solveCleanliness.indexOf(SolveCleanliness.Clean) < 0 && !isMistake) {
            return false;
        }
        if (filters.solveCleanliness.indexOf(SolveCleanliness.Mistake) < 0 && isMistake) {
            return false;
        }

        return true;
    }

    static isMistakeSolve(solve: Solve, deviations: Deviations) {
        if (solve.time > (3 * deviations.dev_total) + deviations.avg_total) {
            return true;
        }
        if (solve.steps.cross.time > ((3 * deviations.dev_cross) + deviations.avg_cross)) {
            return true;
        }
        if (solve.steps.f2l_1.time > ((3 * deviations.dev_f2l_1) + deviations.avg_f2l_1)) {
            return true;
        }
        if (solve.steps.f2l_2.time > ((3 * deviations.dev_f2l_2) + deviations.avg_f2l_2)) {
            return true;
        }
        if (solve.steps.f2l_3.time > ((3 * deviations.dev_f2l_3) + deviations.avg_f2l_3)) {
            return true;
        }
        if (solve.steps.f2l_4.time > ((3 * deviations.dev_f2l_4) + deviations.avg_f2l_4)) {
            return true;
        }
        if (solve.steps.oll.time > ((3 * deviations.dev_oll) + deviations.avg_oll)) {
            return true;
        }
        if (solve.steps.pll.time > ((3 * deviations.dev_pll) + deviations.avg_pll)) {
            return true;
        }

        return false;
    }

    static calculateDeviations(allSolves: Solve[]) {
        let deviations: Deviations = {
            dev_total: calculateStandardDeviation(allSolves.map(x => x.time)),
            dev_cross: calculateStandardDeviation(allSolves.map(x => x.steps.cross.time)),
            dev_f2l_1: calculateStandardDeviation(allSolves.map(x => x.steps.f2l_1.time)),
            dev_f2l_2: calculateStandardDeviation(allSolves.map(x => x.steps.f2l_2.time)),
            dev_f2l_3: calculateStandardDeviation(allSolves.map(x => x.steps.f2l_3.time)),
            dev_f2l_4: calculateStandardDeviation(allSolves.map(x => x.steps.f2l_4.time)),
            dev_oll: calculateStandardDeviation(allSolves.map(x => x.steps.oll.time)),
            dev_pll: calculateStandardDeviation(allSolves.map(x => x.steps.pll.time)),
            avg_total: calculateAverage(allSolves.map(x => x.time)),
            avg_cross: calculateAverage(allSolves.map(x => x.steps.cross.time)),
            avg_f2l_1: calculateAverage(allSolves.map(x => x.steps.f2l_1.time)),
            avg_f2l_2: calculateAverage(allSolves.map(x => x.steps.f2l_2.time)),
            avg_f2l_3: calculateAverage(allSolves.map(x => x.steps.f2l_3.time)),
            avg_f2l_4: calculateAverage(allSolves.map(x => x.steps.f2l_4.time)),
            avg_oll: calculateAverage(allSolves.map(x => x.steps.oll.time)),
            avg_pll: calculateAverage(allSolves.map(x => x.steps.pll.time))
        }

        return deviations;
    }

    static applyFiltersToSolves(allSolves: Solve[], filters: Filters): Solve[] {
        let deviations = this.calculateDeviations(allSolves);

        let filteredSolves: Solve[] = [];
        allSolves.forEach(x => {
            if (this.passesFilters(x, filters, deviations)) {
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
            showAlert: prevState.showAlert,
            solveCleanliness: prevState.solveCleanliness
        }

        return newState;
    }

    crossColorsChanged(selectedList: any[]) {
        let selectedColors: CrossColor[] = selectedList.map(x => x.value);
        let newFilters: Filters = this.state.filters;
        newFilters.crossColors = selectedColors;

        this.setState({
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
            filters: newFilters,
            chosenPLLs: selectedList
        })
    }

    ollChanged(selectedList: any[]) {
        let selectedOlls: string[] = selectedList.map(x => x.value);
        let newFilters: Filters = this.state.filters;
        newFilters.ollCases = selectedOlls;

        this.setState({
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

    setCleanliness(selectedList: any[]) {
        let newFilters: Filters = this.state.filters;
        newFilters.solveCleanliness = selectedList.map(x => x.value);

        this.setState({
            solveCleanliness: selectedList,
            filters: newFilters,
        })
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

    createFilterHtml(filter: JSX.Element, title: string, tooltip: string): JSX.Element {
        return (
            <Col>
                <Card className="card info-card p-2">
                    <OverlayTrigger placement="auto" overlay={this.createTooltip(tooltip)}>
                        <h6>{title}</h6>
                    </OverlayTrigger>
                    {filter}
                </Card>
            </Col>
        )
    }

    render() {
        let filters: JSX.Element = (<></>);
        if (this.state.allSolves.length > 0) {
            filters = (
                <Container>
                    {this.createFilterHtml(
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
                        />,
                        "Which step to drill down?",
                        "This dropdown lets you choose which step to see more information about. This only affects data in the 'Step Drilldown' tab."
                    )}

                    <br />
                    <br />

                    {this.createFilterHtml(
                        <></>,
                        `Showing ${this.state.filteredSolves.length} / ${this.state.allSolves.length} solves`,
                        "If you notice that not all your solves are appearing, even when no filters are chosen, either those solves are corrupt, or cubeast exported a comma in its CSV incorrectly."
                    )}

                    {this.createFilterHtml(
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
                        />,
                        "Cross Color",
                        "Pick the starting cross color"
                    )}

                    {this.createFilterHtml(
                        <div className="row">
                            <div className="form-outline col-6" >
                                <FormControl min="0" max="300" type="number" id="fastestSolve" value={this.state.filters.fastestTime} onChange={this.setFastestSolve.bind(this)} />
                            </div>
                            <div className="form-outline col-6" >
                                <FormControl min="0" max="300" type="number" id="slowestSolve" value={this.state.filters.slowestTime} onChange={this.setSlowestSolve.bind(this)} />
                            </div>
                        </div>,
                        "Solve Times",
                        "Choose slowest and fastest solves to keep"
                    )}

                    {this.createFilterHtml(
                        <MultiSelect
                            options={Const.solveCleanliness}
                            value={this.state.solveCleanliness}
                            onChange={this.setCleanliness.bind(this)}
                            labelledBy="Select"
                        />,
                        "Solve Cleanliness",
                        "Choose whether to show messed up solves or clean solves. The definition of a mistake is: Any solve that took 3 standard deviations more than average OR any step that took 3 standard deviations more than average for that step"
                    )}

                    {this.createFilterHtml(
                        <MultiSelect
                            options={Const.PllCases}
                            value={this.state.chosenPLLs}
                            onChange={this.pllChanged.bind(this)}
                            labelledBy="Select"
                        />,
                        "PLL Cases",
                        "Choose which PLL Cases to show. This will not work if you do not have Cubeast Premium. I suggest using this simply to keep/remove skips."
                    )}

                    {this.createFilterHtml(
                        <MultiSelect
                            options={Const.OllCases}
                            value={this.state.chosenOLLs}
                            onChange={this.ollChanged.bind(this)}
                            labelledBy="Select"
                        />,
                        "OLL Cases",
                        "Choose which OLL Cases to show. This will not work if you do not have Cubeast Premium. I suggest using this simply to keep/remove skips."
                    )}

                    {this.createFilterHtml(
                        <FormControl min="5" max="10000" type="number" id="windowSize" value={this.state.windowSize} onChange={this.setWindowSize.bind(this)} />,
                        "Sliding Window Size",
                        "Choose the sliding window size. For example, the default is to show the average of 500 solves, over time. If you see no data, you should try lowering this value."
                    )}

                    {this.createFilterHtml(
                        <FormControl min="5" max="10000" type="number" id="windowSize" value={this.state.pointsPerGraph} onChange={this.setPointsPerGraph.bind(this)} />,
                        "Points Per Graph",
                        "Choose how many points to show on each chart. If this value is set too high, you may see performance issues."
                    )}

                    {this.createFilterHtml(
                        <DatePicker selected={this.state.filters.startDate} onChange={this.setStartDate.bind(this)} />,
                        "Pick Start Date",
                        "Choose start date"
                    )}

                    {this.createFilterHtml(
                        <DatePicker selected={this.state.filters.endDate} onChange={this.setEndDate.bind(this)} />,
                        "Pick End Date",
                        "Choose end date"
                    )}
                </Container>
            )
        }


        let analysis: JSX.Element = (<></>)
        let records = calculateRecords(this.props.solves.map(x => x.time));
        if (this.state.allSolves.length > 0) {
            let numSolves = Math.min(1000, this.props.solves.length);
            analysis = (
                <div>
                    <Row className="col-lg-6 col-md-6 col-sm-12">
                        <Col>
                            <Button onClick={this.showFilters.bind(this)}>
                                Show filters
                            </Button>
                        </Col>
                        <Col>
                            <OverlayTrigger placement="bottom" overlay={this.createTooltip(`This means that of the past ${numSolves} solves, 90% of them were below the shown time, rounded up to the nearest second. This is a very high definition of Sub-X, but if you tell someone this number, you will be able to meet that number with 90% certainty.`)}>
                                <Card>
                                    <h5>
                                        You are Sub-{calculate90thPercentile(this.props.solves.map(x => x.time), numSolves)}.
                                    </h5>
                                </Card>
                            </OverlayTrigger>
                        </Col>
                        <Col>
                            <OverlayTrigger placement="bottom" overlay={this.createTooltip(`This means that of the past ${numSolves} solves, 90% of them were below the shown time, rounded up to the nearest second. This is a very high definition of Sub-X, but if you tell someone this number, you will be able to meet that number with 90% certainty.`)}>
                                <Card>
                                    <h5>
                                        Your PB is {records.best.toFixed(3)}.
                                    </h5>
                                    <h5>
                                        Your Ao5 is {records.bestAo5.toFixed(3)}.
                                    </h5>
                                    <h5>
                                        Your Ao12 is {records.bestAo12.toFixed(3)}.
                                    </h5>
                                    <h5>
                                        Your Ao100 is {records.bestAo100.toFixed(3)}.
                                    </h5>
                                </Card>
                            </OverlayTrigger>
                        </Col>
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

                    <Row>
                        <Tabs
                            activeKey={this.state.tabKey}
                            onSelect={this.tabSelect.bind(this)}
                        >
                            <Tab eventKey={1} title="All Steps">
                                <ChartPanel
                                    windowSize={this.state.windowSize}
                                    solves={this.state.filteredSolves}
                                    pointsPerGraph={this.state.pointsPerGraph} />
                            </Tab>
                            <Tab eventKey={2} title="Step Drilldown">
                                <StepDrilldown
                                    windowSize={this.state.windowSize}
                                    pointsPerGraph={this.state.pointsPerGraph}
                                    stepName={this.state.drilldownStep.label}
                                    steps={this.state.filteredSolves.map(x => {
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
                                                console.log("Invalid step picked" + this.state.drilldownStep.value);
                                                return x.steps.cross;
                                        }
                                    })} />
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