import React from "react";
import { ChartPanelProps, ChartPanelState, Solve } from "./Types";
import { Line, Chart, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ChartData, LineElement, PointElement, LinearScale, Title, CategoryScale, ChartOptions } from 'chart.js/auto';

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

    calculateMovingPercentage(data: number[], window: number, criteria: (solve: number) => boolean): number[] {
        let result: number[] = [];
        if (data.length < window) {
            return result;
        }

        let good = 0;
        for (let i = 0; i < window; ++i) {
            if (criteria(data[i])) {
                good++;
            }
        }
        result.push(good / window * 100);
        const steps = data.length - window - 1;
        for (let i = 0; i < steps; ++i) {
            if (criteria(data[i])) {
                good--;
            }
            if (criteria(data[i + window])) {
                good++;
            }
            result.push(good / window * 100);
        }
        return result;
    }

    reduceDataset(values: any[]) {
        let targetPoints = 100; // TODO: constants file

        let reducedValues = []
        let delta = Math.floor(values.length / targetPoints);
        for (let i = 0; i < values.length; i = i + delta) {
            reducedValues.push(values[i]);
        }

        return reducedValues;
    }

    buildCrossTurnsData() {
        let movingAverage = this.calculateMovingAverage(this.props.solves.map(x => x.steps.cross.turns), 1000);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = this.reduceDataset(movingAverage);
        labels = this.reduceDataset(labels);

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

        movingAverage = this.reduceDataset(movingAverage);
        labels = this.reduceDataset(labels);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: 'Average Of 1000',
                data: movingAverage
            }]
        }

        return data;
    }

    buildStepAverages() {
        let crossAverage = this.calculateMovingAverage(this.props.solves.map(x => x.steps.cross.time), 1000);
        let f2l_1Average = this.calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_1.time), 1000);
        let f2l_2Average = this.calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_2.time), 1000);
        let f2l_3Average = this.calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_3.time), 1000);
        let f2l_4Average = this.calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_4.time), 1000);
        let ollAverage = this.calculateMovingAverage(this.props.solves.map(x => x.steps.oll.time), 1000);
        let pllAverage = this.calculateMovingAverage(this.props.solves.map(x => x.steps.pll.time), 1000);

        let labels = [];
        for (let i = 1; i <= crossAverage.length; i++) {
            labels.push(i.toString())
        };

        labels = this.reduceDataset(labels);
        crossAverage = this.reduceDataset(crossAverage);
        f2l_1Average = this.reduceDataset(f2l_1Average);
        f2l_2Average = this.reduceDataset(f2l_2Average);
        f2l_3Average = this.reduceDataset(f2l_3Average);
        f2l_4Average = this.reduceDataset(f2l_4Average);
        ollAverage = this.reduceDataset(ollAverage);
        pllAverage = this.reduceDataset(pllAverage);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: 'Cross Average Of 1000',
                data: crossAverage
            },
            {
                label: 'Pair 1 Average Of 1000',
                data: f2l_1Average
            },
            {
                label: 'Pair 2 Average Of 1000',
                data: f2l_2Average
            },
            {
                label: 'Pair 3 Average Of 1000',
                data: f2l_3Average
            },
            {
                label: 'Pair 4 Average Of 1000',
                data: f2l_4Average
            },
            {
                label: 'OLL Average Of 1000',
                data: ollAverage
            },
            {
                label: 'PLL Average Of 1000',
                data: pllAverage
            }]
        }

        return data;
    }


    buildGoodBadData() {
        let checkIfBad = (time: number) => { return time > 20 };
        let checkIfGood = (time: number) => { return time < 15 }

        let movingPercentBad = this.calculateMovingPercentage(this.props.solves.map(x => x.time), 1000, checkIfBad);
        let movingPercentGood = this.calculateMovingPercentage(this.props.solves.map(x => x.time), 1000, checkIfGood);

        let labels = [];
        for (let i = 1; i <= movingPercentBad.length; i++) {
            labels.push(i.toString())
        };

        movingPercentBad = this.reduceDataset(movingPercentBad);
        movingPercentGood = this.reduceDataset(movingPercentGood);
        labels = this.reduceDataset(labels);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: 'Percentage of good solves over last 1000',
                data: movingPercentGood
            },
            {
                label: 'Percentage of bad solves over last 1000',
                data: movingPercentBad
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

        let options = {
            spanGaps: true,
            datasets: {
                line: {
                    pointRadius: 0
                }
            }
        };

        return (
            <div>
                I have {this.props.solves.length} solves
                <div className="row">
                    <div className={"col-lg-4 col-md-4 col-sm-12"}>
                        <Line data={this.buildAo1000Data()} />
                    </div>
                    <div className={"col-lg-4 col-md-4 col-sm-12"}>
                        <Line data={this.buildCrossTurnsData()} />
                    </div>
                    <div className={"col-lg-4 col-md-4 col-sm-12"}>
                        <Bar data={this.buildHistogramData()} />
                    </div>
                    <div className={"col-lg-4 col-md-4 col-sm-12"}>
                        <Line data={this.buildGoodBadData()} />
                    </div>
                    <div className={"col-lg-4 col-md-4 col-sm-12"}>
                        <Line data={this.buildStepAverages()} options={options} />
                    </div>
                </div>
            </div>
        )
    }
}