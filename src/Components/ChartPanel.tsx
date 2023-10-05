import React from "react";
import { ChartPanelProps, ChartPanelState, ChartType } from "../Helpers/Types";
import { Chart as ChartJS, ChartData, CategoryScale } from 'chart.js/auto';
import { calculateMovingAverage, calculateMovingPercentage, reduceDataset } from "../Helpers/RunningAverageMath";
import { createOptions } from "../Helpers/ChartHelpers";
import { Card, Row } from "react-bootstrap";
import { Line, Bar, Doughnut } from 'react-chartjs-2';

export class ChartPanel extends React.Component<ChartPanelProps, ChartPanelState> {
    state: ChartPanelState = { solves: [] };

    buildRunningAverageData() {
        let movingAverage = calculateMovingAverage(this.props.solves.map(x => x.time), this.props.windowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average Time Of ${this.props.windowSize}`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildRunningTpsData() {
        let movingAverage = calculateMovingAverage(this.props.solves.map(x => x.tps), this.props.windowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average TPS Of ${this.props.windowSize}`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildRunningTurnsData() {
        let movingAverage = calculateMovingAverage(this.props.solves.map(x => x.turns), this.props.windowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average Turns Of ${this.props.windowSize}`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildRunningRecognitionExecution() {
        let movingRecognition = calculateMovingAverage(this.props.solves.map(x => x.recognitionTime), this.props.windowSize);
        let movingExecution = calculateMovingAverage(this.props.solves.map(x => x.executionTime), this.props.windowSize);

        let labels = [];
        for (let i = 1; i <= movingRecognition.length; i++) {
            labels.push(i.toString())
        };

        movingExecution = reduceDataset(movingExecution, this.props.pointsPerGraph);
        movingRecognition = reduceDataset(movingRecognition, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average Recognition Of ${this.props.windowSize}`,
                data: movingRecognition
            },
            {
                label: `Average Execution Of ${this.props.windowSize}`,
                data: movingExecution
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

        labels = reduceDataset(labels, this.props.pointsPerGraph);
        crossAverage = reduceDataset(crossAverage, this.props.pointsPerGraph);
        f2l_1Average = reduceDataset(f2l_1Average, this.props.pointsPerGraph);
        f2l_2Average = reduceDataset(f2l_2Average, this.props.pointsPerGraph);
        f2l_3Average = reduceDataset(f2l_3Average, this.props.pointsPerGraph);
        f2l_4Average = reduceDataset(f2l_4Average, this.props.pointsPerGraph);
        ollAverage = reduceDataset(ollAverage, this.props.pointsPerGraph);
        pllAverage = reduceDataset(pllAverage, this.props.pointsPerGraph);

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

        movingPercentBad = reduceDataset(movingPercentBad, this.props.pointsPerGraph);
        movingPercentGood = reduceDataset(movingPercentGood, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

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

        return (
            <Row>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Line data={this.buildRunningAverageData()} options={createOptions(ChartType.Line, "Average Time", "Solve Number", "Time")} height={200} />
                </Card>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Line data={this.buildRunningRecognitionExecution()} options={createOptions(ChartType.Line, "Average Recognition and Execution", "Solve Number", "Time")} height={200} />
                </Card>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Bar data={this.buildHistogramData()} options={createOptions(ChartType.Bar, "Count of Solves by How Long They Took", "Time (s)", "Count")} height={200} />
                </Card>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Line data={this.buildRunningTpsData()} options={createOptions(ChartType.Line, "Average Turns Per Second", "Solve Number", "Time (s)")} height={200} />
                </Card>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Line data={this.buildRunningTurnsData()} options={createOptions(ChartType.Line, "Average Turns", "Solve Number", "Turns")} height={200} />
                </Card>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Line data={this.buildGoodBadData()} options={createOptions(ChartType.Line, "Percentage of 'Good' and 'Bad' Solves", "Solve Number", "Percentage")} height={200} />
                </Card>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Line data={this.buildStepAverages()} options={createOptions(ChartType.Line, "Average Time by Step", "Solve Number", "Time (s)")} height={200} />
                </Card>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Doughnut data={this.buildStepPercentages()} options={createOptions(ChartType.Doughnut, "Percentage of the Solve Each Step Took", "", "")} />
                </Card>
            </Row>
        )
    }
}