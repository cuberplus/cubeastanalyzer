import React from "react";
import { StepDrilldownProps, StepDrilldownState, Step } from "./Types";
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
                label: `Number of step turns (ao${Const.WindowSize})`,
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
                <div className={"card col-lg-2 col-md-2 col-sm-12"}>
                    I have {this.props.steps.length} solves with {this.props.stepName} data
                </div>
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
                </div>

            </div>
        )
    }
}