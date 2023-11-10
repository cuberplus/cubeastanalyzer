import React from "react";
import { ChartPanelProps, ChartPanelState, ChartType, CrossColor, Solve } from "../Helpers/Types";
import { Chart as ChartJS, ChartData, CategoryScale } from 'chart.js/auto';
import { calculateAverage, calculateMovingAverage, calculateMovingPercentage, calculateMovingStdDev, reduceDataset, splitIntoChunks } from "../Helpers/MathHelpers";
import { createOptions, buildChartHtml } from "../Helpers/ChartHelpers";
import { Card, Row, Col, Ratio } from "react-bootstrap";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Const } from "../Helpers/Constants";

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

    buildRunningStdDevData() {
        let movingAverage = calculateMovingStdDev(this.props.solves.map(x => x.time), this.props.windowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average StdDev Of ${this.props.windowSize}`,
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
        let labels = ['Cross', 'F2L Pair 1', 'F2L Pair 2', 'F2L Pair 3', 'F2L Pair 4', 'OLL', 'PLL'];

        let cross = 0;
        let f2l_1 = 0;
        let f2l_2 = 0;
        let f2l_3 = 0;
        let f2l_4 = 0;
        let oll = 0;
        let pll = 0;

        let recentSolves = this.props.solves.slice(-this.props.windowSize);
        for (let i = 0; i < recentSolves.length; i++) {
            cross += recentSolves[i].steps[0].time;
            f2l_1 += recentSolves[i].steps[1].time;
            f2l_2 += recentSolves[i].steps[2].time;
            f2l_3 += recentSolves[i].steps[3].time;
            f2l_4 += recentSolves[i].steps[4].time;
            oll += recentSolves[i].steps[5].time;
            pll += recentSolves[i].steps[6].time;
        }
        let total = cross + f2l_1 + f2l_2 + f2l_3 + f2l_4 + oll + pll;
        let values = [
            100 * cross / total,
            100 * f2l_1 / total,
            100 * f2l_2 / total,
            100 * f2l_3 / total,
            100 * f2l_4 / total,
            100 * oll / total,
            100 * pll / total
        ];

        // TODO: make the colors consistent
        let data: ChartData<"doughnut"> = {
            labels: labels,
            datasets: [{
                label: `Percent of solve each step takes (of recent ${this.props.windowSize})`,
                data: values
            }]
        }

        return data;
    }

    buildStepAverages() {
        let crossAverage = calculateMovingAverage(this.props.solves.map(x => x.steps[0].time), this.props.windowSize);
        let f2l_1Average = calculateMovingAverage(this.props.solves.map(x => x.steps[1].time), this.props.windowSize);
        let f2l_2Average = calculateMovingAverage(this.props.solves.map(x => x.steps[2].time), this.props.windowSize);
        let f2l_3Average = calculateMovingAverage(this.props.solves.map(x => x.steps[3].time), this.props.windowSize);
        let f2l_4Average = calculateMovingAverage(this.props.solves.map(x => x.steps[4].time), this.props.windowSize);
        let ollAverage = calculateMovingAverage(this.props.solves.map(x => x.steps[5].time), this.props.windowSize);
        let pllAverage = calculateMovingAverage(this.props.solves.map(x => x.steps[6].time), this.props.windowSize);

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

    buildGoodBadData(goodTime: number, badTime: number) {
        let checkIfBad = (time: number) => { return time > badTime };
        let checkIfGood = (time: number) => { return time < goodTime }

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

    buildInspectionData() {
        let recentSolves = this.props.solves.slice(-this.props.windowSize);
        recentSolves.sort((a, b) => {
            return a.inspectionTime - b.inspectionTime;
        })

        let chunkedArr: Solve[][] = splitIntoChunks(recentSolves, Const.InspectionGraphChunks);

        let labels: string[] = [];
        let values: number[] = [];

        for (let i = 0; i < Const.InspectionGraphChunks; i++) {
            labels.push("~" + calculateAverage(chunkedArr[i].map(x => x.inspectionTime)).toFixed(2).toString());
            values.push(calculateAverage(chunkedArr[i].map(x => x.time)));
        }

        let data: ChartData<"bar"> = {
            labels: labels,
            datasets: [{
                label: `Solve time by inspection time (of recent ${this.props.windowSize})`,
                data: values
            }]
        }

        return data;
    }

    buildRecordHistory() {
        let data: ChartData<"line"> = {
            labels: [],
            datasets: []
        }

        if (this.props.solves.length == 0) {
            return data;
        }

        let records = [this.props.solves[0].time];
        let dates = [this.props.solves[0].date];

        for (let i = 1; i < this.props.solves.length; i++) {
            if (this.props.solves[i].time < records[records.length - 1]) {
                records.push(this.props.solves[i].time);
                dates.push(this.props.solves[i].date);
            }
        }

        let labels = dates.map(x => x.toDateString())

        data.labels = labels;
        data.datasets = [
            {
                label: `Current record`,
                data: records
            }
        ]

        return data;
    }

    buildRunningColorPercentages() {
        let checkIfWhite = (crossColor: CrossColor) => { return crossColor == CrossColor.White };
        let checkIfYellow = (crossColor: CrossColor) => { return crossColor == CrossColor.Yellow };
        let checkIfRed = (crossColor: CrossColor) => { return crossColor == CrossColor.Red };
        let checkIfOrange = (crossColor: CrossColor) => { return crossColor == CrossColor.Orange };
        let checkIfBlue = (crossColor: CrossColor) => { return crossColor == CrossColor.Blue };
        let checkIfGreen = (crossColor: CrossColor) => { return crossColor == CrossColor.Green };
        let checkIfUnknown = (crossColor: CrossColor) => { return crossColor == CrossColor.Unknown };

        let movingPercentWhite = calculateMovingPercentage(this.props.solves.map(x => x.crossColor), this.props.windowSize, checkIfWhite);
        let movingPercentYellow = calculateMovingPercentage(this.props.solves.map(x => x.crossColor), this.props.windowSize, checkIfYellow);
        let movingPercentRed = calculateMovingPercentage(this.props.solves.map(x => x.crossColor), this.props.windowSize, checkIfRed);
        let movingPercentOrange = calculateMovingPercentage(this.props.solves.map(x => x.crossColor), this.props.windowSize, checkIfOrange);
        let movingPercentBlue = calculateMovingPercentage(this.props.solves.map(x => x.crossColor), this.props.windowSize, checkIfBlue);
        let movingPercentGreen = calculateMovingPercentage(this.props.solves.map(x => x.crossColor), this.props.windowSize, checkIfGreen);
        let movingPercentUnknown = calculateMovingPercentage(this.props.solves.map(x => x.crossColor), this.props.windowSize, checkIfUnknown);

        let labels = [];
        for (let i = 1; i <= movingPercentWhite.length; i++) {
            labels.push(i.toString())
        };

        movingPercentWhite = reduceDataset(movingPercentWhite, this.props.pointsPerGraph);
        movingPercentYellow = reduceDataset(movingPercentYellow, this.props.pointsPerGraph);
        movingPercentRed = reduceDataset(movingPercentRed, this.props.pointsPerGraph);
        movingPercentOrange = reduceDataset(movingPercentOrange, this.props.pointsPerGraph);
        movingPercentBlue = reduceDataset(movingPercentBlue, this.props.pointsPerGraph);
        movingPercentGreen = reduceDataset(movingPercentGreen, this.props.pointsPerGraph);
        movingPercentUnknown = reduceDataset(movingPercentUnknown, this.props.pointsPerGraph);


        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Percentage of solves with white cross over last ${this.props.windowSize}`,
                data: movingPercentWhite,
                borderColor: 'Black',
                backgroundColor: 'Black'
            }, {
                label: `Percentage of solves with yellow cross over last ${this.props.windowSize}`,
                data: movingPercentYellow,
                borderColor: 'Yellow',
                backgroundColor: 'Yellow'
            }, {
                label: `Percentage of solves with red cross over last ${this.props.windowSize}`,
                data: movingPercentRed,
                borderColor: 'Red',
                backgroundColor: 'Red'
            }, {
                label: `Percentage of solves with orange cross over last ${this.props.windowSize}`,
                data: movingPercentOrange,
                borderColor: 'Orange',
                backgroundColor: 'Orange'
            }, {
                label: `Percentage of solves with blue cross over last ${this.props.windowSize}`,
                data: movingPercentBlue,
                borderColor: 'Blue',
                backgroundColor: 'Blue'
            }, {
                label: `Percentage of solves with green cross over last ${this.props.windowSize}`,
                data: movingPercentGreen,
                borderColor: 'Green',
                backgroundColor: 'Green'
            }, {
                label: `Percentage of solves with unknown cross over last ${this.props.windowSize}`,
                data: movingPercentUnknown,
                borderColor: 'Purple',
                backgroundColor: 'Purple'
            }]
        }

        return data;
    }

    render() {
        // TODO: is there a better spot to put this?
        ChartJS.register(CategoryScale);

        return (
            <div>
                <br />
                <Row>
                    {buildChartHtml(<Line data={this.buildRunningAverageData()} options={createOptions(ChartType.Line, "Average Time", "Solve Number", "Time (s)")} />)}
                    {buildChartHtml(<Line data={this.buildRunningRecognitionExecution()} options={createOptions(ChartType.Line, "Average Recognition and Execution", "Solve Number", "Time (s)")} />)}
                    {buildChartHtml(<Bar data={this.buildHistogramData()} options={createOptions(ChartType.Bar, "Count of Solves by How Long They Took", "Time (s)", "Count")} />)}
                    {buildChartHtml(<Line data={this.buildRunningTpsData()} options={createOptions(ChartType.Line, "Average Turns Per Second", "Solve Number", "Time (s)")} />)}
                    {buildChartHtml(<Line data={this.buildRunningTurnsData()} options={createOptions(ChartType.Line, "Average Turns", "Solve Number", "Turns")} />)}
                    {buildChartHtml(<Line data={this.buildRunningStdDevData()} options={createOptions(ChartType.Line, "Average Standard Deviation", "Solve Number", "Time (s)")} />)}
                    {buildChartHtml(<Line data={this.buildGoodBadData(this.props.goodTime, this.props.badTime)} options={createOptions(ChartType.Line, "Percentage of 'Good' and 'Bad' Solves", "Solve Number", "Percentage")} />)}
                    {buildChartHtml(<Line data={this.buildRecordHistory()} options={createOptions(ChartType.Line, "History of Records", "Date", "Time (s)")} />)}

                    {buildChartHtml(<Line data={this.buildRunningColorPercentages()} options={createOptions(ChartType.Line, "Percentage of Solves by Cross Color", "Solve Number", "Percentage")} />)}
                    {buildChartHtml(<Bar data={this.buildInspectionData()} options={createOptions(ChartType.Bar, "Average solve time by inspection time", "Inspection Time (s)", "Solve Time (s)")} />)}
                </Row>
            </div>
        )
    }
}

/*
                    {buildChartHtml(<Line data={this.buildStepAverages()} options={createOptions(ChartType.Line, "Average Time by Step", "Solve Number", "Time (s)")} />)}
                    {buildChartHtml(<Doughnut data={this.buildStepPercentages()} options={createOptions(ChartType.Doughnut, "Percentage of the Solve Each Step Took", "", "")} />)}
*/