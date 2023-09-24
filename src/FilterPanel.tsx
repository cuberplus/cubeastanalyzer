import React from "react";
import moment from "moment";
import { MultiSelect } from "react-multi-select-component";
import DatePicker from "react-datepicker";
import { CrossColor, FilterPanelProps, FilterPanelState, Filters, Solve } from "./Types";
import { ChartPanel } from "./ChartPanel";

export class FilterPanel extends React.Component<FilterPanelProps, FilterPanelState> {
    state: FilterPanelState = {
        allSolves: [],
        filteredSolves: [],
        filters: {
            startDate: moment.utc("1700-01-01").toDate(),
            endDate: moment.utc("2300-01-01").toDate(),
            fastestTime: 0,
            slowestTime: 1000000,
            crossColors: [CrossColor.White, CrossColor.Yellow, CrossColor.Blue, CrossColor.Green, CrossColor.Orange, CrossColor.Red],
            pllCases: ["T", "V", "Aa", "Ab", "Ga", "Gb", "Gc", "Gd", "Ja", "Jb", "F", "Y", "Ua", "Ub", "Ra", "Rb", "Na", "Nb", "H", "E", "Z", "Solved"],
            includeMistakes: false
        },
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
        ]
    }

    static applyFiltersToSolves(allSolves: Solve[], filters: Filters): Solve[] {
        let filteredSolves: Solve[] = [];

        // TODO: add short-circuit logic here
        // TODO: add more filters as I need them
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
            allSolves: nextProps.solves,
            filteredSolves: FilterPanel.applyFiltersToSolves(nextProps.solves, prevState.filters),
            filters: prevState.filters,

            chosenColors: prevState.chosenColors,
            chosenPLLs: prevState.chosenPLLs
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

    setMistakes(event: React.ChangeEvent<HTMLInputElement>) {
        let newFilters: Filters = this.state.filters;
        console.log("event is ", event)
        newFilters.includeMistakes = event.target.checked;
        this.setState({ filters: newFilters });
    }

    render() {
        console.log("my lengths are ", this.state.allSolves.length, " ", this.state.filteredSolves.length)
        if (this.state.filteredSolves.length > 0) {
            console.log(this.state.filteredSolves[0]);
        }
        return (
            <main className="body">
                <div className="pagetitle">
                    <h1>Cubing Stats</h1>
                </div>

                <section className="section dashboard">

                    <div className={"row"}>
                        <div className={"col-lg-2 col-md-2 col-sm-6"}>
                            <div className="card info-card">

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
                                    //selectedValues={this.state.filters.crossColors}
                                    value={this.state.chosenColors}
                                    onChange={this.crossColorsChanged.bind(this)}
                                    labelledBy="Select"
                                />
                            </div>
                        </div>

                        <div className={"col-lg-2 col-md-2 col-sm-6"}>
                            <div className="card info-card">

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
                            </div>
                        </div>

                        <div className={"col-lg-2 col-md-2 col-sm-6"}>
                            <div className="card info-card">

                                Pick start date
                                <DatePicker selected={this.state.filters.startDate} onChange={this.setStartDate.bind(this)} />
                            </div>
                        </div>

                        <div className={"col-lg-2 col-md-2 col-sm-6"}>
                            <div className="card info-card">

                                Pick end date
                                <DatePicker selected={this.state.filters.endDate} onChange={this.setEndDate.bind(this)} />
                            </div>
                        </div>

                        <div className={"col-lg-2 col-md-2 col-sm-6"}>
                            <div className="card info-card">

                                Include messed up solves?
                                <input
                                    type="checkbox"
                                    onChange={this.setMistakes.bind(this)}
                                />
                            </div>
                        </div>
                        <ChartPanel solves={this.state.filteredSolves} />

                    </div>

                </section>

            </main>
        )
    }
}