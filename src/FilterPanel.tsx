import React from "react";
import { MultiSelect } from "react-multi-select-component";
import { CrossColor, FilterPanelProps, FilterPanelState, Filters, Solve } from "./Types";

export class FilterPanel extends React.Component<FilterPanelProps, FilterPanelState> {
    state: FilterPanelState = {
        allSolves: [],
        filteredSolves: [],
        filters: {
            startDate: new Date("1700-01-01"),
            endDate: new Date("2300-01-01"),
            fastestTime: 0,
            slowestTime: 1000000,
            crossColors: [CrossColor.White, CrossColor.Yellow, CrossColor.Blue, CrossColor.Green, CrossColor.Orange, CrossColor.Red]
        },
        chosenColors: [
            { label: CrossColor.White, value: CrossColor.White },
            { label: CrossColor.Yellow, value: CrossColor.Yellow },
            { label: CrossColor.Red, value: CrossColor.Red },
            { label: CrossColor.Orange, value: CrossColor.Orange },
            { label: CrossColor.Blue, value: CrossColor.Blue },
            { label: CrossColor.Green, value: CrossColor.Green },
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
            chosenColors: prevState.chosenColors
        }

        return newState;
    }

    crossColorsChanged(selectedList: any[]) {
        console.log("colors changing, selected list is ", selectedList);
        let selectedColors: CrossColor[] = selectedList.map(x => x.label);

        let newFilters: Filters = this.state.filters;
        newFilters.crossColors = selectedColors;


        this.setState({
            filteredSolves: FilterPanel.applyFiltersToSolves(this.state.allSolves, newFilters),
            filters: newFilters,
            chosenColors: selectedList
        })

        console.log("done setting state?");
    }

    render() {
        console.log("my lengths are ", this.state.allSolves.length, " ", this.state.filteredSolves.length)
        if (this.state.filteredSolves.length > 0) {
            console.log(this.state.filteredSolves[0]);
        }
        return (
            <div>
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

                I'm a filter panel
            </div>
        )
    }
}