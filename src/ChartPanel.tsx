import React from "react";
import { ChartPanelProps, ChartPanelState, Solve } from "./Types";
import { Line, Chart, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ChartData, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js/auto';

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

    buildHistogramData() {
        let solves = this.props.solves.map(x => x.time).slice(-1000);

        let histogram = new Map<number, number>();

        for (let i = 0; i < solves.length; i++) {
            let val: number = Math.trunc(solves[i]);
            if (!histogram.get(val)) {
                histogram.set(val, 0);
            }
            histogram.set(val, histogram.get(val)! + 1)
        }

        let arr = Array.from(histogram).sort((a, b) => {
            return a[0] - b[0];
        })

        console.log(arr);

        let labels = arr.map(a => a[0]);
        let values = arr.map(a => a[1]);

        let data: ChartData<"bar"> = {
            labels: labels,
            datasets: [{
                label: 'Number of solves by time (of recent 1000)',
                data: values
            }]
        }

        return data;
    }

    render() {
        // TODO: is there a better spot to put this?
        ChartJS.register(CategoryScale);

        this.buildHistogramData();

        return (
            <div>
                I have {this.props.solves.length} solves
                <div>
                    <Line data={this.buildAo1000Data()} />
                </div>
                <div>
                    <Line data={this.buildCrossTurnsData()} />
                </div>
                <div>
                    <Bar data={this.buildHistogramData()} />
                </div>
            </div>
        )
    }
}