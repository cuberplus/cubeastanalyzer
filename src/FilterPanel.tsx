import React from "react";
import { FilterPanelProps, FilterPanelState } from "./Types";

export class FilterPanel extends React.Component<FilterPanelProps, FilterPanelState> {
    state: FilterPanelState = {solves: []}

    render() {
        console.log("my props are ", this.props.solves)
        return (
            <div>
                I'm a filter panel
            </div>
        )
    }
}