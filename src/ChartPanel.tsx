import React from "react";
import { ChartPanelProps, ChartPanelState, Solve } from "./Types";
import { Line, Chart } from 'react-chartjs-2';
import { Chart as ChartJS, ChartData, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js/auto';

export class ChartPanel extends React.Component<ChartPanelProps, ChartPanelState> {
    state: ChartPanelState = { solves: [] };

    buildChartData() {
        let labels: string[] = ['1', '2', '3'];
        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: 'dataset1',
                data: this.props.solves.map(x => x.time)
            }]
        }
        return data;

    }

    render() {
        let myData = this.buildChartData();


        return (
            <div>
                <h2>Hi! I'm a Chart Panel</h2>

                I have {this.props.solves.length} solves

                <Line data={this.buildChartData()} />
            </div>
        )
    }
}