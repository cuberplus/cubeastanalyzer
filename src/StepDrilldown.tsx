import React from "react";
import { StepDrilldownProps, StepDrilldownState, Step, StepName } from "./Types";
import { Line, Chart, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ChartData, LineElement, PointElement, LinearScale, Title, CategoryScale, ChartOptions } from 'chart.js/auto';
import { Const } from "./Constants";
import { calculateMovingAverage, calculateMovingPercentage, reduceDataset } from "./RunningAverageMath";
import "./Style.css";

export class StepDrilldown extends React.Component<StepDrilldownProps, StepDrilldownState> {
    state: StepDrilldownState = { steps: [] };

    buildStepTurnsData() {
        let movingAverage = calculateMovingAverage(this.props.steps.map(x => x.turns), Const.WindowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage);
        labels = reduceDataset(labels);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Number of ${this.props.stepName} turns (ao${Const.WindowSize})`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildRunningAverageData() {
        let movingAverage = calculateMovingAverage(this.props.steps.map(x => x.time), Const.WindowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage);
        labels = reduceDataset(labels);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average time of ${this.props.stepName} Of ${Const.WindowSize}`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildRunningTpsData() {
        let movingAverage = calculateMovingAverage(this.props.steps.map(x => x.tps), Const.WindowSize);

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage);
        labels = reduceDataset(labels);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average tps of ${this.props.stepName} Of ${Const.WindowSize}`,
                data: movingAverage
            }]
        }

        return data;
    }

    buildRecognitionExecutionData() {
        let recognitionAverage = calculateMovingAverage(this.props.steps.map(x => x.recognitionTime), Const.WindowSize);
        let executionAverage = calculateMovingAverage(this.props.steps.map(x => x.executionTime), Const.WindowSize);


        let labels = [];
        for (let i = 1; i <= recognitionAverage.length; i++) {
            labels.push(i.toString())
        };

        recognitionAverage = reduceDataset(recognitionAverage);
        executionAverage = reduceDataset(executionAverage);

        labels = reduceDataset(labels);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average recognition time of ${this.props.stepName} Of ${Const.WindowSize}`,
                data: recognitionAverage
            }, {
                label: `Average execution time of ${this.props.stepName} Of ${Const.WindowSize}`,
                data: executionAverage
            }]
        }

        return data;
    }

    buildHistogramData() {
        let solves = this.props.steps.map(x => x.time).slice(-Const.WindowSize);

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
                label: `Number of solves by ${this.props.stepName} time (of recent ${Const.WindowSize})`,
                data: values
            }]
        }

        return data;
    }

    buildCaseData() {
        if (this.props.stepName != StepName.OLL && this.props.stepName != StepName.PLL) {
            let data: ChartData<"bar"> = {
                labels: [],
                datasets: []
            }
            return data;
        }

        let caseTimes: { [id: string]: number[] } = {};
        for (let i = 0; i < this.props.steps.length; i++) {
            if (!(this.props.steps[i].case in caseTimes)) {
                caseTimes[this.props.steps[i].case] = [];
            }
            caseTimes[this.props.steps[i].case].push(this.props.steps[i].time)
        }

        let cases: { label: string, time: number }[] = []
        for (let key in caseTimes) {
            let average: number = caseTimes[key].reduce((a, b) => a + b) / caseTimes[key].length;
            cases.push({
                label: key,
                time: average
            })
        }

        cases.sort((a, b) => {
            return b.time - a.time;
        })

        let labels = cases.map(x => "Case: " + x.label);
        let values = cases.map(x => x.time)

        let data: ChartData<"bar"> = {
            labels: labels,
            datasets: [{
                label: `Average time for each case`,
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
            scales: {
                x: {
                    ticks: {
                        autoSkip: false
                    }
                }

            }
        };


        let caseChart: JSX.Element = (<></>);

        if (this.props.stepName == StepName.OLL || this.props.stepName == StepName.PLL) {
            caseChart = (
                <div className={"card col-lg-6 col-md-6 col-sm-12"}>
                    <Bar data={this.buildCaseData()} options={BarOptions} />
                </div>
            )
        }

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
                        <Line data={this.buildStepTurnsData()} options={LineOptions} />
                    </div>
                    <div className={"card col-lg-6 col-md-6 col-sm-12"}>
                        <Line data={this.buildRunningTpsData()} options={LineOptions} />
                    </div>
                    <div className={"card col-lg-6 col-md-6 col-sm-12"}>
                        <Line data={this.buildRecognitionExecutionData()} options={LineOptions} />
                    </div>
                    {caseChart}
                </div>

            </div>
        )
    }
}