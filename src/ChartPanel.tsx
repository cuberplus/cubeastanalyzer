import React from "react";
import { ChartPanelProps, ChartPanelState, Solve } from "./Types";
import { Line, Chart, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ChartData, LineElement, PointElement, LinearScale, Title, CategoryScale, ChartOptions } from 'chart.js/auto';
import { Const } from "./Constants";
import { calculateMovingAverage, calculateMovingPercentage, reduceDataset } from "./RunningAverageMath";
import "./Style.css";

export class ChartPanel extends React.Component<ChartPanelProps, ChartPanelState> {
    state: ChartPanelState = { solves: [] };

    buildRunningAverageData() {
        let movingAverage = calculateMovingAverage(this.props.solves.map(x => x.time), Const.WindowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage);
        labels = reduceDataset(labels);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average Of ${Const.WindowSize}`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildStepAverages() {
        let crossAverage = calculateMovingAverage(this.props.solves.map(x => x.steps.cross.time), Const.WindowSize);
        let f2l_1Average = calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_1.time), Const.WindowSize);
        let f2l_2Average = calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_2.time), Const.WindowSize);
        let f2l_3Average = calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_3.time), Const.WindowSize);
        let f2l_4Average = calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_4.time), Const.WindowSize);
        let ollAverage = calculateMovingAverage(this.props.solves.map(x => x.steps.oll.time), Const.WindowSize);
        let pllAverage = calculateMovingAverage(this.props.solves.map(x => x.steps.pll.time), Const.WindowSize);

        let labels = [];
        for (let i = 1; i <= crossAverage.length; i++) {
            labels.push(i.toString())
        };

        labels = reduceDataset(labels);
        crossAverage = reduceDataset(crossAverage);
        f2l_1Average = reduceDataset(f2l_1Average);
        f2l_2Average = reduceDataset(f2l_2Average);
        f2l_3Average = reduceDataset(f2l_3Average);
        f2l_4Average = reduceDataset(f2l_4Average);
        ollAverage = reduceDataset(ollAverage);
        pllAverage = reduceDataset(pllAverage);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Cross Average Of ${Const.WindowSize}`,
                data: crossAverage
            },
            {
                label: `Pair 1 Average Of ${Const.WindowSize}`,
                data: f2l_1Average
            },
            {
                label: `Pair 2 Average Of ${Const.WindowSize}`,
                data: f2l_2Average
            },
            {
                label: `Pair 3 Average Of ${Const.WindowSize}`,
                data: f2l_3Average
            },
            {
                label: `Pair 4 Average Of ${Const.WindowSize}`,
                data: f2l_4Average
            },
            {
                label: `OLL Average Of ${Const.WindowSize}`,
                data: ollAverage
            },
            {
                label: `PLL Average Of ${Const.WindowSize}`,
                data: pllAverage
            }]
        }

        return data;
    }


    buildGoodBadData() {
        let checkIfBad = (time: number) => { return time > 20 };
        let checkIfGood = (time: number) => { return time < 15 }

        let movingPercentBad = calculateMovingPercentage(this.props.solves.map(x => x.time), Const.WindowSize, checkIfBad);
        let movingPercentGood = calculateMovingPercentage(this.props.solves.map(x => x.time), Const.WindowSize, checkIfGood);

        let labels = [];
        for (let i = 1; i <= movingPercentBad.length; i++) {
            labels.push(i.toString())
        };

        movingPercentBad = reduceDataset(movingPercentBad);
        movingPercentGood = reduceDataset(movingPercentGood);
        labels = reduceDataset(labels);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Percentage of good solves over last ${Const.WindowSize}`,
                data: movingPercentGood
            },
            {
                label: `Percentage of bad solves over last ${Const.WindowSize}`,
                data: movingPercentBad
            }]
        }

        return data;
    }

    buildHistogramData() {
        let recentSolves = this.props.solves.map(x => x.time).slice(-Const.WindowSize);

        let histogram = new Map<number, number>();

        for (let i = 0; i < recentSolves.length; i++) {
            let val: number = Math.trunc(recentSolves[i]);
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
                label: `Number of solves by time (of recent ${Const.WindowSize})`,
                data: values
            }]
        }

        return data;
    }

    render() {
        // TODO: is there a better spot to put this?
        ChartJS.register(CategoryScale);

        let LineOptions = {
            spanGaps: true
        };
        let BarOptions = {

        };

        return (
            <div>
                <div className="row">
                    <div className={"card col-lg-6 col-md-6 col-sm-12"}>
                        <Line data={this.buildRunningAverageData()} options={LineOptions} />
                    </div>
                    <div className={"card col-lg-6 col-md-6 col-sm-12"}>
                        <Bar data={this.buildHistogramData()} options={BarOptions} />
                    </div>
                    <div className={"card col-lg-6 col-md-6 col-sm-12"}>
                        <Line data={this.buildGoodBadData()} options={LineOptions} />
                    </div>
                    <div className={"card col-lg-6 col-md-6 col-sm-12"}>
                        <Line data={this.buildStepAverages()} options={LineOptions} />
                    </div>
                </div>
            </div>
        )
    }
}