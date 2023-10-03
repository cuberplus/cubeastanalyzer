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
            pllCases: ["Solved", "T", "V", "Aa", "Ab", "Ga", "Gb", "Gc", "Gd", "Ja", "Jb", "F", "Y", "Ua", "Ub", "Ra", "Rb", "Na", "Nb", "H", "E", "Z"],
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
        chosenPLLs: [
            { label: "Solved", value: "Solved" },
            { label: "T Perm", value: "T" },
            { label: "V Perm", value: "V" },
            { label: "Aa Perm", value: "Aa" },
            { label: "Ab Perm", value: "Ab" },
            { label: "Ga Perm", value: "Ga" },
            { label: "Gb Perm", value: "Gb" },
            { label: "Gc Perm", value: "Gc" },
            { label: "Gd Perm", value: "Gd" },
            { label: "Ja Perm", value: "Ja" },
            { label: "Jb Perm", value: "Jb" },
            { label: "F Perm", value: "F" },
            { label: "Y Perm", value: "Y" },
            { label: "Ua Perm", value: "Ua" },
            { label: "Ub Perm", value: "Ub" },
            { label: "Ra Perm", value: "Ra" },
            { label: "Rb Perm", value: "Rb" },
            { label: "Na Perm", value: "Na" },
            { label: "Nb Perm", value: "Nb" },
            { label: "H Perm", value: "H" },
            { label: "E Perm", value: "E" },
            { label: "Z Perm", value: "Z" }
        ],
        chosenOLLs: Const.OllCases,
        tabKey: 1,
        windowSize: 500,
        showFilters: false,
    }

    static applyFiltersToSolves(allSolves: Solve[], filters: Filters): Solve[] {
        let filteredSolves: Solve[] = [];

        // TODO: add short-circuit logic here
        allSolves.forEach(x => {
            let passesFilters: boolean = true;

            if (filters.crossColors.indexOf(x.crossColor) < 0) {
                passesFilters = false;
            }
            if (x.date < filters.startDate || x.date > filters.endDate) {
                passesFilters = false;
            }
            if (x.time < filters.fastestTime || x.time > filters.slowestTime) {
                passesFilters = false;
            }
            if (filters.pllCases.indexOf(x.steps.pll.case) < 0) {
                passesFilters = false;
            }
            if (filters.ollCases.indexOf(x.steps.oll.case) < 0) {
                passesFilters = false;
            }
            if (filters.slowestTime < x.time) {
                passesFilters = false;
            }
            if (filters.fastestTime > x.time) {
                passesFilters = false;
            }


            // TODO: this is a bad way of filtering out mistakes
            if (!filters.includeMistakes && x.time > 30) {
                passesFilters = false;
            }

            if (passesFilters) {
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
                        Pick PLL case
                        <MultiSelect
                            options={[
                                { label: "Solved", value: "Solved" },
                                { label: "T Perm", value: "T" },
                                { label: "V Perm", value: "V" },
                                { label: "Aa Perm", value: "Aa" },
                                { label: "Ab Perm", value: "Ab" },
                                { label: "Ga Perm", value: "Ga" },
                                { label: "Gb Perm", value: "Gb" },
                                { label: "Gc Perm", value: "Gc" },
                                { label: "Gd Perm", value: "Gd" },
                                { label: "Ja Perm", value: "Ja" },
                                { label: "Jb Perm", value: "Jb" },
                                { label: "F Perm", value: "F" },
                                { label: "Y Perm", value: "Y" },
                                { label: "Ua Perm", value: "Ua" },
                                { label: "Ub Perm", value: "Ub" },
                                { label: "Ra Perm", value: "Ra" },
                                { label: "Rb Perm", value: "Rb" },
                                { label: "Na Perm", value: "Na" },
                                { label: "Nb Perm", value: "Nb" },
                                { label: "H Perm", value: "H" },
                                { label: "E Perm", value: "E" },
                                { label: "Z Perm", value: "Z" }
                            ]}
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
                        Choose sliding window size
                        <FormControl min="5" max="10000" type="number" id="windowSize" value={this.state.windowSize} onChange={this.setWindowSize.bind(this)} />
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
                            You have {this.state.allSolves.length} solves before filtering, and {this.state.filteredSolves.length} after
                        </Card>
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
                                <ChartPanel windowSize={this.state.windowSize} solves={this.state.filteredSolves} />
                            </Tab>
                            <Tab eventKey={2} title="Step Drilldown">
                                <StepDrilldown windowSize={this.state.windowSize} steps={this.state.filteredSolves.map(x => {
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