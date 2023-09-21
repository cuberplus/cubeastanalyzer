import React from "react";
import { CrossColor, FilterPanelProps, FilterPanelState } from "./Types";

export class FilterPanel extends React.Component<FilterPanelProps, FilterPanelState> {
    state: FilterPanelState = {
        solves: [],
        filters: {
            startDate: new Date("1700-01-01"),
            endDate: new Date("2300-01-01"),
            fastestTime: 0,
            slowestTime: 1000000,
            crossColors: [CrossColor.White, CrossColor.Yellow, CrossColor.Blue, CrossColor.Green, CrossColor.Orange, CrossColor.Red]
        }
    }


    static getDerivedStateFromProps(nextProps: FilterPanelProps, prevState: FilterPanelState) {
        let newState: FilterPanelState = {
            solves: nextProps.solves,
            filters: prevState.filters
        }

        // TODO: apply filtering logic here

        return newState;
    }

    render() {
        console.log("my length are ", this.state.solves.length)
        if(this.state.solves.length > 0) {
            console.log(this.state.solves[0]);
        }
        return (
            <div>
                I'm a filter panel
            </div>
        )
    }
}