import React from "react";
import { FilterPanelProps, FilterPanelState } from "./Types";

export class FilterPanel extends React.Component<FilterPanelProps, FilterPanelState> {
    state: FilterPanelState = {solves: []}


    static getDerivedStateFromProps(nextProps: FilterPanelProps) {
        let newState: FilterPanelState = {
            solves: nextProps.solves
        }

        // TODO: apply filtering logic here

        return newState;
    }

    render() {
        console.log("my length are ", this.state.solves.length)
        return (
            <div>
                I'm a filter panel
            </div>
        )
    }
}