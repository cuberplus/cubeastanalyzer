import React from "react";
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
        }
    }

    static applyFiltersToSolves(allSolves: Solve[], filters: Filters): Solve[] {
        let filteredSolves: Solve[] = [];

        // TODO: add short-circuit logic here
        // TODO: add more filters as I need them
        allSolves.forEach(x => {
            let passesFilters: boolean = true;

            if(filters.crossColors.indexOf(x.crossColor) <0) {
                passesFilters = false;
            }
            if(x.date < filters.startDate || x.date > filters.endDate) {
                passesFilters = false;
            }
            if(x.time < filters.fastestTime || x.time > filters.slowestTime) {
                passesFilters = false;
            }

            if(passesFilters) {
                filteredSolves.push(x);
            }
        })
        return filteredSolves;
    }

    static getDerivedStateFromProps(nextProps: FilterPanelProps, prevState: FilterPanelState) {
        let newState: FilterPanelState = {
            allSolves: nextProps.solves,
            filteredSolves: FilterPanel.applyFiltersToSolves(nextProps.solves, prevState.filters),
            filters: prevState.filters
        }

        return newState;
    }

    onUpdate() {

    }

    render() {
        console.log("my lengths are ", this.state.allSolves.length, " ", this.state.filteredSolves.length)
        if(this.state.filteredSolves.length > 0) {
            console.log(this.state.filteredSolves[0]);
        }
        return (
            <div>
                I'm a filter panel
            </div>
        )
    }
}