import React from "react";
import { ChartPanelProps, ChartPanelState, Solve } from "./Types";
import { FilterPanel } from "./FilterPanel";

export class ChartPanel extends React.Component<ChartPanelProps, ChartPanelState> {
    state: ChartPanelState = { solves: [] };

    render() {
        return (
            <div>
                <h2>Hi! I'm a Chart Panel</h2>

                I have {this.props.solves.length} solves
            </div>
        )
    }
}