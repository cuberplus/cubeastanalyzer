import React from "react";
import { ChartPanelProps, ChartPanelState, Solve } from "./Types";
import { Line, Chart } from 'react-chartjs-2';
import { Chart as ChartJS, ChartData, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js/auto';
import { calculateNewValue } from "@testing-library/user-event/dist/utils";

export class ChartPanel extends React.Component<ChartPanelProps, ChartPanelState> {
    state: ChartPanelState = { solves: [] };

    calculateMovingAverage(data: number[], window: number): number[] {
        let result: number[] = [];
        if (data.length < window) {
            return result;
        }
        let sum = 0;
        for (let i = 0; i < window; ++i) {
            sum += data[i];
        }
        result.push(sum / window);
        const steps = data.length - window - 1;
        for (let i = 0; i < steps; ++i) {
            sum -= data[i];
            sum += data[i + window];
            result.push(sum / window);
        }
        return result;
    };

    // TODO: this data feels wrong
    buildCrossTurnsData() {
        let movingAverage = this.calculateMovingAverage(this.props.solves.map(x => x.steps.cross.turns), 1000);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: 'Number of cross turns (ao1000)',
                data: movingAverage
            }]
        }

        return data;
    }

    buildAo1000Data() {
        let movingAverage = this.calculateMovingAverage(this.props.solves.map(x => x.time), 1000);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: 'Average Of 1000',
                data: movingAverage
            }]
        }

        return data;
    }

    render() {
        // TODO: is there a better spot to put this?
        ChartJS.register(CategoryScale);

        return (
            <div>
                I have {this.props.solves.length} solves
                <div>
                    <Line data={this.buildAo1000Data()} />
                </div>
                <div>
                    <Line data={this.buildCrossTurnsData()} />
                </div>
            </div>
        )
    }
}