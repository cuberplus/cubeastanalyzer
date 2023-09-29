import React from "react";
import { ChartPanelProps, ChartPanelState, Solve } from "./Types";
import { Line, Chart, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ChartData, LineElement, PointElement, LinearScale, Title, CategoryScale, ChartOptions } from 'chart.js/auto';
import { Const } from "./Constants";
import { calculateMovingAverage, calculateMovingPercentage, reduceDataset } from "./RunningAverageMath";
import "./Style.css";

export class ChartPanel extends React.Component<ChartPanelProps, ChartPanelState> {
    state: ChartPanelState = { solves: [] };

    buildRunningAverageData() {
        let movingAverage = calculateMovingAverage(this.props.solves.map(x => x.time), this.props.windowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage);
        labels = reduceDataset(labels);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average Of ${this.props.windowSize}`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildStepPercentages() {

        let labels = ['OLL', 'PLL', 'Cross', 'F2L', 'F2L', 'F2L', 'F2L'];

        let cross = 0;
        let f2l_1 = 0;
        let f2l_2 = 0;
        let f2l_3 = 0;
        let f2l_4 = 0;
        let oll = 0;
        let pll = 0;

        let recentSolves = this.props.solves.slice(-this.props.windowSize);
        for (let i = 0; i < recentSolves.length; i++) {
            cross += recentSolves[i].steps.cross.time;
            f2l_1 += recentSolves[i].steps.f2l_1.time;
            f2l_2 += recentSolves[i].steps.f2l_2.time;
            f2l_3 += recentSolves[i].steps.f2l_3.time;
            f2l_4 += recentSolves[i].steps.f2l_4.time;
            oll += recentSolves[i].steps.oll.time;
            pll += recentSolves[i].steps.pll.time;
        }
        let f2l = f2l_1 + f2l_2 + f2l_3 + f2l_4;
        let total = cross + f2l_1 + f2l_2 + f2l_3 + f2l_4 + oll + pll;
        let values1 = [
            100 * oll / total,
            100 * pll / total,
            100 * cross / total,
            100 * f2l_1 / total,
            100 * f2l_2 / total,
            100 * f2l_3 / total,
            100 * f2l_4 / total
        ];
        let values2 = [
            100 * oll / total,
            100 * pll / total,
            100 * cross / total,
            100 * f2l / total
        ];

        // TODO: make the colors consistent
        let data: ChartData<"doughnut"> = {
            labels: labels,
            datasets: [{
                label: `Percent of solve each step takes (of recent ${this.props.windowSize})`,
                data: values1
            }, {
                normalized: false,
                data: values2
            }]
        }

        return data;
    }

    buildStepAverages() {
        let crossAverage = calculateMovingAverage(this.props.solves.map(x => x.steps.cross.time), this.props.windowSize);
        let f2l_1Average = calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_1.time), this.props.windowSize);
        let f2l_2Average = calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_2.time), this.props.windowSize);
        let f2l_3Average = calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_3.time), this.props.windowSize);
        let f2l_4Average = calculateMovingAverage(this.props.solves.map(x => x.steps.f2l_4.time), this.props.windowSize);
        let ollAverage = calculateMovingAverage(this.props.solves.map(x => x.steps.oll.time), this.props.windowSize);
        let pllAverage = calculateMovingAverage(this.props.solves.map(x => x.steps.pll.time), this.props.windowSize);

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
                label: `Cross Average Of ${this.props.windowSize}`,
                data: crossAverage
            },
            {
                label: `Pair 1 Average Of ${this.props.windowSize}`,
                data: f2l_1Average
            },
            {
                label: `Pair 2 Average Of ${this.props.windowSize}`,
                data: f2l_2Average
            },
            {
                label: `Pair 3 Average Of ${this.props.windowSize}`,
                data: f2l_3Average
            },
            {
                label: `Pair 4 Average Of ${this.props.windowSize}`,
                data: f2l_4Average
            },
            {
                label: `OLL Average Of ${this.props.windowSize}`,
                data: ollAverage
            },
            {
                label: `PLL Average Of ${this.props.windowSize}`,
                data: pllAverage
            }]
        }

        return data;
    }


    buildGoodBadData() {
        let checkIfBad = (time: number) => { return time > 20 };
        let checkIfGood = (time: number) => { return time < 15 }

        let movingPercentBad = calculateMovingPercentage(this.props.solves.map(x => x.time), this.props.windowSize, checkIfBad);
        let movingPercentGood = calculateMovingPercentage(this.props.solves.map(x => x.time), this.props.windowSize, checkIfGood);

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
                label: `Percentage of good solves over last ${this.props.windowSize}`,
                data: movingPercentGood
            },
            {
                label: `Percentage of bad solves over last ${this.props.windowSize}`,
                data: movingPercentBad
            }]
        }

        return data;
    }

    buildHistogramData() {
        let recentSolves = this.props.solves.map(x => x.time).slice(-this.props.windowSize);

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
                label: `Number of solves by time (of recent ${this.props.windowSize})`,
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
        let DoughnutOptions = {

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
                    <div className={"card col-lg-6 col-md-6 col-sm-12"}>
                        <Doughnut data={this.buildStepPercentages()} options={DoughnutOptions} />
                    </div>
                </div>
            </div>
        )
    }
}