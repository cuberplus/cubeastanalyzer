import React from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { MultiSelect } from "react-multi-select-component";
import { CrossColor, Deviations, FilterPanelProps, FilterPanelState, Filters, MethodName, Solve, SolveCleanliness, Step, StepName } from "../Helpers/Types";
import { ChartPanel } from "./ChartPanel";
import { Option } from "react-multi-select-component"
import { calculate90thPercentile, calculateAverage, calculateStandardDeviation } from "../Helpers/MathHelpers";
import { FormControl, Card, Row, Offcanvas, Col, Button, Tooltip, OverlayTrigger, Alert, Container } from 'react-bootstrap';
import { Const } from "../Helpers/Constants";
import { GetEmptySolve } from "../Helpers/CubeHelpers";

export class FilterPanel extends React.Component<FilterPanelProps, FilterPanelState> {
    state: FilterPanelState = {
        allSolves: [],
        filteredSolves: [],
        filters: {
            startDate: moment.utc("1700-01-01").toDate(),
            endDate: moment.utc("2300-01-01").toDate(),
            fastestTime: 0,
            slowestTime: 300,
            crossColors: [CrossColor.White, CrossColor.Yellow, CrossColor.Blue, CrossColor.Green, CrossColor.Orange, CrossColor.Red, CrossColor.Unknown],
            pllCases: Const.PllCases.map(x => x.value),
            ollCases: Const.OllCases.map(x => x.value),
            steps: [StepName.Cross, StepName.F2L_1, StepName.F2L_2, StepName.F2L_3, StepName.F2L_4, StepName.OLL, StepName.PLL],
            solveCleanliness: Const.solveCleanliness.map(x => x.value),
            method: MethodName.CFOP
        },
        chosenSteps: FilterPanel.getStepOptionsForMethod(MethodName.CFOP),
        chosenColors: [
            { label: CrossColor.White, value: CrossColor.White },
            { label: CrossColor.Yellow, value: CrossColor.Yellow },
            { label: CrossColor.Red, value: CrossColor.Red },
            { label: CrossColor.Orange, value: CrossColor.Orange },
            { label: CrossColor.Blue, value: CrossColor.Blue },
            { label: CrossColor.Green, value: CrossColor.Green },
            { label: CrossColor.Unknown, value: CrossColor.Unknown },
        ],
        solveCleanliness: Const.solveCleanliness,
        chosenPLLs: Const.PllCases,
        chosenOLLs: Const.OllCases,
        tabKey: 1,
        windowSize: Const.DefaultWindowSize,
        pointsPerGraph: 100,
        showFilters: false,
        showTestAlert: false,
        badTime: 20,
        goodTime: 15,
        method: { label: MethodName.CFOP, value: MethodName.CFOP }
    }

    static passesFilters(solve: Solve, filters: Filters, deviations: Deviations) {
        if (solve.isCorrupt) {
            return false;
        }
        if (solve.method != filters.method) {
            return false;
        }
        if (filters.crossColors.indexOf(solve.crossColor) < 0) {
            return false;
        }
        if (solve.date < filters.startDate || solve.date > filters.endDate) {
            return false;
        }
        if (solve.time < filters.fastestTime || solve.time > filters.slowestTime) {
            return false;
        }

        // TODO: check case logic properly
        if (solve.method == MethodName.CFOP && solve.steps[6].case !== undefined && filters.pllCases.indexOf(solve.steps[6].case) < 0) {
            return false;
        }
        if (solve.method == MethodName.CFOP && solve.steps[5].case !== undefined && filters.ollCases.indexOf(solve.steps[5].case) < 0) {
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

        for (let i = 0; i < solve.steps.length; i++) {
            if (solve.steps[i].time > ((3 * deviations.dev[i]) + deviations.avg[i])) {
                return true;
            }
        }

        return false;
    }

    static calculateDeviations(allSolves: Solve[]) {
        let deviations: Deviations = {
            dev_total: calculateStandardDeviation(allSolves.map(x => x.time)),
            avg_total: calculateAverage(allSolves.map(x => x.time)),
            dev: [],
            avg: []
        }

        if (allSolves.length == 0) {
            return deviations;
        }

        for (let i = 0; i < allSolves[0].steps.length; i++) {
            let dev = calculateStandardDeviation(allSolves.map(x => x.steps[i].time));
            let avg = calculateAverage(allSolves.map(x => x.steps[i].time));
            deviations.dev.push(dev);
            deviations.avg.push(avg);
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
            // Assume all props stay the same
            allSolves: prevState.allSolves,
            filteredSolves: prevState.filteredSolves,
            method: prevState.method,
            chosenSteps: prevState.chosenSteps,
            filters: prevState.filters,
            chosenColors: prevState.chosenColors,
            chosenPLLs: prevState.chosenPLLs,
            chosenOLLs: prevState.chosenOLLs,
            tabKey: prevState.tabKey,
            windowSize: prevState.windowSize,
            pointsPerGraph: prevState.pointsPerGraph,
            showFilters: prevState.showFilters,
            showTestAlert: prevState.showTestAlert,
            solveCleanliness: prevState.solveCleanliness,
            badTime: prevState.badTime,
            goodTime: prevState.goodTime
        }

        // Update anything that needs it
        newState.allSolves = nextProps.solves;
        newState.filteredSolves = FilterPanel.applyFiltersToSolves(nextProps.solves, prevState.filters);

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

    windowSizeChanged(newWindowSize: number) {
        this.setState({
            windowSize: newWindowSize
        })
    }

    chosenStepsChanged(selectedList: any[]) {
        let selectedSteps: StepName[] = selectedList.map(x => x.value);
        let newFilters: Filters = this.state.filters;
        newFilters.steps = selectedSteps;

        this.setState({
            filters: newFilters,
            chosenSteps: selectedList
        })
    }

    static getStepOptionsForMethod(method: MethodName) {
        let options: Option[] = [];
        Const.MethodSteps[method].forEach(x => {
            options.push({ label: x, value: x });
        })
        return options;
    }

    getMethodOptions() {
        let options: Option[] = [];
        Object.values(MethodName).forEach(x => {
            options.push({ label: x, value: x });
        })
        return options;
    }

    methodChanged(newValue: Option | null) {
        let newMethod: MethodName = newValue!.value;
        let newFilters: Filters = this.state.filters;
        newFilters.method = newMethod;
        newFilters.steps = Const.MethodSteps[newMethod];

        this.setState({
            method: newValue!,
            filters: newFilters,
            chosenSteps: FilterPanel.getStepOptionsForMethod(newMethod)
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


    setBadTime(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ badTime: parseInt(event.target.value) })
    }

    setGoodTime(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ goodTime: parseInt(event.target.value) })
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

    setTestAlert(showTestAlert: boolean) {
        this.setState({ showTestAlert: showTestAlert })
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
        this.setState({ showTestAlert: false });
    }

    compressSolves(solves: Solve[]) {
        let newSolves: Solve[] = [];

        solves.forEach((solve) => {
            let newSolve: Solve = GetEmptySolve();

            let newSteps: Step[] = solve.steps.filter((x) => {
                return this.state.filters.steps.find((y) => y == x.name);
            })
            newSolve.steps = newSteps;

            newSolve.crossColor = solve.crossColor;
            newSolve.date = solve.date;
            newSolve.inspectionTime = solve.inspectionTime;
            newSolve.executionTime = newSolve.steps.reduce((sum, current) => sum + current.executionTime, 0);
            newSolve.recognitionTime = newSolve.steps.reduce((sum, current) => sum + current.recognitionTime, 0);
            newSolve.isCorrupt = solve.isCorrupt;
            newSolve.method = solve.method;
            newSolve.scramble = solve.scramble;
            newSolve.time = newSolve.steps.reduce((sum, current) => sum + current.time, 0);
            newSolve.turns = newSolve.steps.reduce((sum, current) => sum + current.turns, 0);
            newSolve.tps = newSolve.time == 0 ? 0 : newSolve.turns / newSolve.time;

            newSolves.push(newSolve);
        })

        return newSolves;
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
                        <h6>{title} ⓘ</h6>
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
                            options={this.getMethodOptions()}
                            value={this.state.method}
                            onChange={this.methodChanged.bind(this)}
                        />,
                        "Which Method?",
                        "This dropdown lets you choose which method to show solves for."
                    )}
                    {this.createFilterHtml(
                        <MultiSelect
                            options={FilterPanel.getStepOptionsForMethod(this.state.filters.method)}
                            value={this.state.chosenSteps}
                            onChange={this.chosenStepsChanged.bind(this)}
                            labelledBy="Select"
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
                                { label: CrossColor.Unknown, value: CrossColor.Unknown }
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
                        "Choose the sliding window size. For example, the default is to show the average of 1000 solves, over time. If you see no data, you should try lowering this value."
                    )}

                    {this.createFilterHtml(
                        <FormControl min="5" max="10000" type="number" id="windowSize" value={this.state.pointsPerGraph} onChange={this.setPointsPerGraph.bind(this)} />,
                        "Points Per Graph",
                        "Choose how many points to show on each chart. If this value is set too high, you may see performance issues."
                    )}

                    {this.createFilterHtml(
                        <div className="row">
                            <div className="form-outline col-6" >
                                <FormControl min="0" max="300" type="number" id="goodTime" value={this.state.goodTime} onChange={this.setGoodTime.bind(this)} />
                            </div>
                            <div className="form-outline col-6" >
                                <FormControl min="0" max="300" type="number" id="badTime" value={this.state.badTime} onChange={this.setBadTime.bind(this)} />
                            </div>
                        </div>,
                        "Benchmarks",
                        "Choose what you consider a 'good' solve and a 'bad' solve"
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
        if (this.state.allSolves.length > 0) {
            let numSolves = Math.min(1000, this.props.solves.length);
            analysis = (
                <div>
                    <Row>
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
                    </Row >

                    <Alert show={this.state.showTestAlert} variant={"warning"}>
                        <Alert.Heading>Warning: Viewing Test Data</Alert.Heading>
                        These are not your solves, these are the dev's personal solves, just to show off the capabilities of this website! To view your solves, upload a CSV file, and click "Display My Stats"
                        <div className="d-flex justify-content-end">
                            <Button onClick={() => this.hideAlert()} variant="warning">
                                Close
                            </Button>
                        </div>
                    </Alert>

                    <Row>
                        <ChartPanel
                            windowSize={this.state.windowSize}
                            solves={this.compressSolves(this.state.filteredSolves)}
                            pointsPerGraph={this.state.pointsPerGraph}
                            methodName={this.state.filters.method}
                            goodTime={this.state.goodTime}
                            badTime={this.state.badTime}
                            steps={this.state.filters.steps}
                        />
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