import React from "react";
import { StepDrilldownProps, StepDrilldownState, StepName, ChartType } from "../Helpers/Types";
import { Chart as ChartJS, ChartData, CategoryScale } from 'chart.js/auto';
import { calculateMovingAverage, reduceDataset } from "../Helpers/RunningAverageMath";
import { createOptions } from "../Helpers/ChartHelpers";
import { Card, Row } from "react-bootstrap";
import { Line, Bar } from 'react-chartjs-2';

export class StepDrilldown extends React.Component<StepDrilldownProps, StepDrilldownState> {
    state: StepDrilldownState = { steps: [] };

    buildStepTurnsData() {
        let movingAverage = calculateMovingAverage(this.props.steps.map(x => x.turns), this.props.windowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Number of ${this.props.stepName} turns (ao${this.props.windowSize})`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildRunningAverageData() {
        let movingAverage = calculateMovingAverage(this.props.steps.map(x => x.time), this.props.windowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average time of ${this.props.stepName} Of ${this.props.windowSize}`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildRunningTpsData() {
        let movingAverage = calculateMovingAverage(this.props.steps.map(x => x.tps), this.props.windowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average tps of ${this.props.stepName} Of ${this.props.windowSize}`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildRecognitionExecutionData() {
        let recognitionAverage = calculateMovingAverage(this.props.steps.map(x => x.recognitionTime), this.props.windowSize);
        let executionAverage = calculateMovingAverage(this.props.steps.map(x => x.executionTime), this.props.windowSize);


        let labels = [];
        for (let i = 1; i <= recognitionAverage.length; i++) {
            labels.push(i.toString())
        };

        recognitionAverage = reduceDataset(recognitionAverage, this.props.pointsPerGraph);
        executionAverage = reduceDataset(executionAverage, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average recognition time of ${this.props.stepName} Of ${this.props.windowSize}`,
                data: recognitionAverage
            }, {
                label: `Average execution time of ${this.props.stepName} Of ${this.props.windowSize}`,
                data: executionAverage
            }]
        }

        return data;
    }

    buildHistogramData() {
        let solves = this.props.steps.map(x => x.time).slice(-this.props.windowSize);

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
                label: `Number of solves by ${this.props.stepName} time (of recent ${this.props.windowSize})`,
                data: values
            }]
        }

        return data;
    }

    buildCaseData() {
        if (this.props.stepName !== StepName.OLL && this.props.stepName !== StepName.PLL) {
            let data: ChartData<"bar"> = {
                labels: [],
                datasets: []
            }
            return data;
        }

        let solves = this.props.steps.slice(-this.props.windowSize);

        let caseTimes: { [id: string]: { recognitionTime: number, executionTime: number }[] } = {};
        for (let i = 0; i < solves.length; i++) {
            if (!(solves[i].case in caseTimes)) {
                caseTimes[solves[i].case] = [];
            }
            caseTimes[solves[i].case].push({
                recognitionTime: solves[i].recognitionTime,
                executionTime: solves[i].executionTime
            });
        }

        let cases: { label: string, recognitionTime: number, executionTime: number }[] = []
        for (let key in caseTimes) {
            let recognitionTimes = caseTimes[key].map(x => x.recognitionTime);
            let executionTimes = caseTimes[key].map(x => x.executionTime);

            let averageRecognition: number = recognitionTimes.reduce((a, b) => a + b) / recognitionTimes.length;
            let averageExecution: number = executionTimes.reduce((a, b) => a + b) / executionTimes.length;

            cases.push({
                label: key,
                executionTime: averageExecution,
                recognitionTime: averageRecognition
            })
        }

        cases.sort((a, b) => {
            return (b.recognitionTime + b.executionTime) - (a.recognitionTime + a.executionTime);
        })

        let labels = cases.map(x => "Case: " + x.label);
        let recognitionValues = cases.map(x => x.recognitionTime)
        let executionValues = cases.map(x => x.executionTime)

        let data: ChartData<"bar"> = {
            labels: labels,
            datasets: [{
                label: `Average recognition time for each case in past ${this.props.windowSize} solves`,
                data: recognitionValues
            }, {
                label: `Average execution time for each case in past ${this.props.windowSize} solves`,
                data: executionValues
            }]
        }

        return data;
    }

    render() {
        // TODO: is there a better spot to put this?
        ChartJS.register(CategoryScale);

        let caseChart: JSX.Element = (<></>);
        if (this.props.stepName === StepName.OLL || this.props.stepName === StepName.PLL) {
            caseChart = (
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Bar data={this.buildCaseData()} options={createOptions(ChartType.Bar, "Average Recognition Time and Execution Time per Case")} height={200} />
                </Card>
            )
        }

        return (
            <Row className="row">
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Line data={this.buildRunningAverageData()} options={createOptions(ChartType.Line, "Average Time per Case")} height={200} />
                </Card>
                {caseChart}
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Bar data={this.buildHistogramData()} options={createOptions(ChartType.Bar, "Count of Solves by How Long This Step Took")} height={200} />
                </Card>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Line data={this.buildStepTurnsData()} options={createOptions(ChartType.Line, "Average Number of Turns this Step Takes")} height={200} />
                </Card>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Line data={this.buildRunningTpsData()} options={createOptions(ChartType.Line, "Average Turns Per Second for this Step")} height={200} />
                </Card>
                <Card className={"col-lg-6 col-md-6 col-sm-12"}>
                    <Line data={this.buildRecognitionExecutionData()} options={createOptions(ChartType.Line, "Average Recognition and Execution Time for this Step")} height={200} />
                </Card>
            </Row>
        )
    }
}