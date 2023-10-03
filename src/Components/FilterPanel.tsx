import React from "react";
import moment from "moment";
import { MultiSelect } from "react-multi-select-component";
import DatePicker from "react-datepicker";
import { CrossColor, FilterPanelProps, FilterPanelState, Filters, Solve, StepName } from "../Helpers/Types";
import { ChartPanel } from "./ChartPanel";
import { StepDrilldown } from "./StepDrilldown";
import Select from "react-select";
import { Option } from "react-multi-select-component"
import { calculate90thPercentile } from "../Helpers/RunningAverageMath";
import { Tabs, Tab, FormControl, Card, Row, Offcanvas, Col, Button } from 'react-bootstrap';
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
        if (filters.pllCases.indexOf(solve.steps.pll.case) < 0) {
            return false;
        }
        if (filters.ollCases.indexOf(solve.steps.oll.case) < 0) {
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
            showFilters: prevState.showFilters
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

    render() {
        let filters: JSX.Element = (<></>);
        if (this.state.allSolves.length > 0) {
            filters = (
                <Col>
                    <Card className="card info-card">
                        Which step to drill down?
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
                        Showing {this.state.filteredSolves.length}/{this.state.allSolves.length} solves
                    </Card>

                    <Card className="card info-card">
                        Pick starting cross color
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
                        Choose slowest and fastest solves to keep
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
                        Pick PLL case
                        <MultiSelect
                            options={Const.PllCases}
                            value={this.state.chosenPLLs}
                            onChange={this.pllChanged.bind(this)}
                            labelledBy="Select"
                        />
                    </Card>

                    <Card className="card info-card">
                        Pick OLL case
                        <MultiSelect
                            options={Const.OllCases}
                            value={this.state.chosenOLLs}
                            onChange={this.ollChanged.bind(this)}
                            labelledBy="Select"
                        />
                    </Card>

                    <Card className="card info-card">
                        Choose sliding window size
                        <FormControl min="5" max="10000" type="number" id="windowSize" value={this.state.windowSize} onChange={this.setWindowSize.bind(this)} />
                    </Card>

                    <Card className="card info-card">
                        Choose points per graph
                        <FormControl min="5" max="10000" type="number" id="windowSize" value={this.state.pointsPerGraph} onChange={this.setPointsPerGraph.bind(this)} />
                    </Card>

                    <Card className="card info-card">
                        Include messed up solves?
                        <input
                            type="checkbox"
                            checked={this.state.filters.includeMistakes}
                            onChange={this.setMistakes.bind(this)}
                        />
                    </Card>

                    <Card className="card info-card">
                        Pick start date
                        <DatePicker selected={this.state.filters.startDate} onChange={this.setStartDate.bind(this)} />
                    </Card>

                    <Card className="card info-card">
                        Pick end date
                        <DatePicker selected={this.state.filters.endDate} onChange={this.setEndDate.bind(this)} />
                    </Card>
                </Col>
            )
        }


        let analysis: JSX.Element = (<></>)
        if (this.state.allSolves.length > 0) {
            analysis = (
                <div>
                    <Row>
                        <Button className={"col-lg-2 col-md-2 col-sm-12"} onClick={this.showFilters.bind(this)}>
                            Show filters
                        </Button>
                        <Card className={"col-lg-2 col-md-2 col-sm-12"}>
                            90% of your last 1000 solves are below {calculate90thPercentile(this.props.solves.map(x => x.time), 1000)} seconds.
                        </Card>
                    </Row>

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
                </div>
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