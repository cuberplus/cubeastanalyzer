import React from "react";
import { ChartPanelProps, ChartPanelState, ChartType, CrossColor, FastestSolve, MethodName, Solve, StepName } from "../Helpers/Types";
import { Chart as ChartJS, ChartData, CategoryScale, Point } from 'chart.js/auto';
import { calculateAverage, calculateMovingAverage, calculateMovingPercentage, calculateMovingStdDev, reduceDataset, splitIntoChunks, getTypicalAverages, calculateMovingAverageChopped } from "../Helpers/MathHelpers";
import { createOptions, buildChartHtml } from "../Helpers/ChartHelpers";
import { Row, Tooltip } from "react-bootstrap";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Const } from "../Helpers/Constants";
import DataGrid, { CellClickArgs } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import 'chartjs-adapter-moment';

export class ChartPanel extends React.Component<ChartPanelProps, ChartPanelState> {
    state: ChartPanelState = { solves: [] };

    getEmptyChartData() {
        let data: ChartData<"line"> = {
            labels: [],
            datasets: []
        }
        return data;
    }

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
        let movingAverageDuringExecution = calculateMovingAverage(this.props.solves.map(x => (x.turns / x.executionTime)), this.props.windowSize)

        let labels = [];
        for (let i = 1; i <= movingAverage.length; i++) {
            labels.push(i.toString())
        };

        movingAverage = reduceDataset(movingAverage, this.props.pointsPerGraph);
        movingAverageDuringExecution = reduceDataset(movingAverageDuringExecution, this.props.pointsPerGraph)
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average TPS Of ${this.props.windowSize}`,
                data: movingAverage
            },
            {
                label: `Average TPS During Execution Of ${this.props.windowSize}`,
                data: movingAverageDuringExecution
            }]
        }

        return data;
    }

    buildRunningInspectionData() {
        let movingInspection = calculateMovingAverage(this.props.solves.map(x => x.inspectionTime), this.props.windowSize);

        let labels = [];
        for (let i = 1; i <= movingInspection.length; i++) {
            labels.push(i.toString())
        };

        movingInspection = reduceDataset(movingInspection, this.props.pointsPerGraph);
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels,
            datasets: [{
                label: `Average Inspection Of ${this.props.windowSize}`,
                data: movingInspection
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
        let totals: { [step in StepName]?: number } = {};
        for (let i = 0; i < this.props.steps.length; i++) {
            totals[this.props.steps[i]] = 0;
        }

        let recentSolves = this.props.solves.slice(-this.props.windowSize);
        for (let i = 0; i < recentSolves.length; i++) {
            for (let j = 0; j < this.props.steps.length; j++) {
                totals[recentSolves[i].steps[j].name]! += recentSolves[i].steps[j].time;
            }
        }

        let labels: string[] = [];
        let values: number[] = [];

        for (let key in totals) {
            labels.push(key);
            values.push(totals[key as StepName]! / recentSolves.length);
        }

        // TODO: make the colors consistent
        let data: ChartData<"doughnut"> = {
            labels: labels,
            datasets: [{
                label: `Seconds each step takes (of recent ${this.props.windowSize})`,
                data: values
            }]
        }

        return data;
    }

    buildStepAverages() {
        if (this.props.solves.length == 0 || this.props.steps.length == 0) {
            return this.getEmptyChartData();
        }

        let datasets = [];

        for (let i = 0; i < this.props.steps.length; i++) {
            let average: number[] = calculateMovingAverage(this.props.solves.map(x => x.steps[i].time), this.props.windowSize);
            average = reduceDataset(average, this.props.pointsPerGraph);

            let dataset = {
                label: `${this.props.solves[0].steps[i].name} Average of ${this.props.windowSize}`,
                data: average
            }
            datasets.push(dataset);
        }

        let labels: string[] = [];
        for (let i = 0; i < datasets[0].data.length; i++) {
            labels.push(i.toString());
        }
        labels = reduceDataset(labels, this.props.pointsPerGraph);

        let data: ChartData<"line"> = {
            labels: labels,
            datasets: datasets
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

    buildTypicalCompare() {
        // This chart was built using data sourced from here:
        // https://www.cubeskills.com/blog/cfop-solve-splits-tool

        // Get users's average for each step, and average overall
        let average = calculateAverage(this.props.solves.map(x => x.time).slice(-this.props.windowSize));
        let crossAverage = calculateAverage(this.props.solves.map(x => x.steps[0].time).slice(-this.props.windowSize));
        let f2l1Average = calculateAverage(this.props.solves.map(x => x.steps[1].time).slice(-this.props.windowSize));
        let f2l2Average = calculateAverage(this.props.solves.map(x => x.steps[2].time).slice(-this.props.windowSize));
        let f2l3Average = calculateAverage(this.props.solves.map(x => x.steps[3].time).slice(-this.props.windowSize));
        let f2l4Average = calculateAverage(this.props.solves.map(x => x.steps[4].time).slice(-this.props.windowSize));
        let ollAverage = calculateAverage(this.props.solves.map(x => x.steps[5].time).slice(-this.props.windowSize));
        let pllAverage = calculateAverage(this.props.solves.map(x => x.steps[6].time).slice(-this.props.windowSize));
        let f2lAverage = f2l1Average + f2l2Average + f2l3Average + f2l4Average;
        let yourAverages = [crossAverage, f2lAverage, ollAverage, pllAverage];

        // Get typical solver's average for each step, and overall
        let typicalAverages = getTypicalAverages(average);

        // Get percent differences
        //let differences = [0, 0, 0, 0]
        //let colors = ["green", "green", "green", "green"]
        //for (let i = 0; i < 4; i++) {
        //    differences[i] = (yourAverages[i] - typicalAverages[i]) / typicalAverages[i] * 100;
        //    if (differences[i] >= 0) {
        //        colors[i] = "red";
        //    }
        //}

        let labels = ['Cross', 'F2L', 'OLL', 'PLL'];
        let data: ChartData<"bar"> = {
            labels,
            datasets: [
                {
                    label: `Your average by step over last ${this.props.windowSize}`,
                    data: yourAverages
                },
                {
                    label: `Typical cuber's average by step, using your average time`,
                    data: typicalAverages
                },
                //{
                //    label: `Percent difference between your solves and typical solvers (lower is good)`,
                //    data: differences,
                //    backgroundColor: colors
                //}
            ]
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

    buildRecordDataset(dates: Date[], times: number[]) {
        let records = [{ x: dates[0], y: times[0] }];

        for (let i = 1; i < times.length; i++) {
            if (times[i] < records[records.length - 1].y) {
                records.push({ x: dates[i], y: times[i] });
            }
        }

        return records;
    }

    buildRecordHistory()
        : ChartData<"line", {
            x: Date;
            y: number;
        }[]> {
        if (this.props.solves.length == 0) {
            //return this.getEmptyChartData();
        }

        let dates = this.props.solves.map(x => x.date);

        let single = this.props.solves.map(x => x.time);
        let ao5 = calculateMovingAverage(this.props.solves.map(x => x.time), 5);
        let ao12 = calculateMovingAverageChopped(this.props.solves.map(x => x.time), 12, 1);
        let ao100 = calculateMovingAverageChopped(this.props.solves.map(x => x.time), 100, 5);
        let ao1000 = calculateMovingAverageChopped(this.props.solves.map(x => x.time), 1000, 50);

        // Start initial records
        let records = {
            single: this.buildRecordDataset(dates, single),
            ao5: this.buildRecordDataset(dates.slice(4), ao5),
            ao12: this.buildRecordDataset(dates.slice(11), ao12),
            ao100: this.buildRecordDataset(dates.slice(99), ao100),
            ao1000: this.buildRecordDataset(dates.slice(999), ao1000)
        };

        // Display the charts
        let data: ChartData<"line", { x: Date, y: number }[]> = {
            datasets: [
                {
                    label: `Record Single`,
                    data: records.single
                },
                {
                    label: `Record Ao5`,
                    data: records.ao5
                },
                {
                    label: `Record Ao12`,
                    data: records.ao12
                },
                {
                    label: `Record Ao100`,
                    data: records.ao100
                },
                {
                    label: `Record Ao1000`,
                    data: records.ao1000
                }
            ]
        }

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

    buildCaseData() {
        if (this.props.steps.length != 1 || (this.props.steps[0] !== StepName.OLL && this.props.steps[0] !== StepName.PLL)) {
            let data: ChartData<"bar"> = {
                labels: [],
                datasets: []
            }
            return data;
        }

        let solves = this.props.solves.slice(-this.props.windowSize);

        let caseTimes: { [id: string]: { recognitionTime: number, executionTime: number }[] } = {};
        for (let i = 0; i < solves.length; i++) {
            if (!(solves[i].steps[0].case in caseTimes)) {
                caseTimes[solves[i].steps[0].case] = [];
            }
            caseTimes[solves[i].steps[0].case].push({
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

    buildBestSolves() {
        const cols = [
            { key: 'time', name: 'Time' },
            { key: 'date', name: 'Date' },
            { key: 'scramble', name: 'Scramble' },
            { key: 'id', name: 'ID' } // Make invisible?
        ];

        let solveCopy: Solve[] = structuredClone(this.props.solves);
        let fastest: Solve[] = solveCopy.sort((a: Solve, b: Solve) => a.time - b.time).slice(0, Const.FastestSolvesCount);
        let reduced: FastestSolve[] = fastest.map(x => { return { date: x.date.toDateString(), time: x.time.toFixed(3), scramble: x.scramble, id: x.id } });

        return (<DataGrid rows={reduced} columns={cols} onCellClick={this.openCubeast} />);
    }

    createTooltip(description: string): JSX.Element {
        const tooltip = (
            <Tooltip id="tooltip">
                {description}
            </Tooltip>
        );
        return tooltip;
    }

    openCubeast(params: CellClickArgs<FastestSolve>) {
        window.open("https://app.cubeast.com/log/solves/" + params.row.id)
    }

    render() {
        // TODO: is there a better spot to put this?
        ChartJS.register(CategoryScale);

        let charts: JSX.Element[] = [];

        // Add charts that require exactly one step to be chosen
        if (this.props.steps.length == 1 && (this.props.steps[0] === StepName.OLL || this.props.steps[0] === StepName.PLL)) {
            charts.push(buildChartHtml(0, <Bar data={this.buildCaseData()} options={createOptions(ChartType.Bar, "Solve Number", "Time (s)", this.props.useLogScale)} />, "Average Recognition Time and Execution Time per Case", "This chart shows how long your execution/recognition took for any individual last layer algorithm, sorted by how long each took."));
        }

        // Add remaining charts
        charts.push(buildChartHtml(1, <Line data={this.buildRunningAverageData()} options={createOptions(ChartType.Line, "Solve Number", "Time (s)", this.props.useLogScale)} />, "Average Time", "This chart shows your running average"));
        charts.push(buildChartHtml(2, <Line data={this.buildRunningRecognitionExecution()} options={createOptions(ChartType.Line, "Solve Number", "Time (s)", this.props.useLogScale)} />, "Average Recognition and Execution", "This chart shows your running average, split up by recognition time and execution time"));
        charts.push(buildChartHtml(3, <Bar data={this.buildHistogramData()} options={createOptions(ChartType.Bar, "Time (s)", "Count", this.props.useLogScale)} />, "Count of Solves by How Long They Took", "This chart shows how many solves you have done in 10s, 11s, 12s, etc..."));
        charts.push(buildChartHtml(4, <Line data={this.buildRunningTpsData()} options={createOptions(ChartType.Line, "Solve Number", "Time (s)", this.props.useLogScale)} />, "Average Turns Per Second", "This chart shows your average turns per second. 'TPS During Execution' only counts your TPS while actively turning the cube"));
        charts.push(buildChartHtml(5, <Line data={this.buildRunningTurnsData()} options={createOptions(ChartType.Line, "Solve Number", "Turns", this.props.useLogScale)} />, "Average Turns", "This chart shows your average number of turns, in quarter turn metric"));
        charts.push(buildChartHtml(6, this.buildBestSolves(), `Top ${Const.FastestSolvesCount} Fastest Solves`, `This shows your ${Const.FastestSolvesCount} fastest solves, given the filters`));
        charts.push(buildChartHtml(7, <Line data={this.buildRunningStdDevData()} options={createOptions(ChartType.Line, "Solve Number", "Time (s)", this.props.useLogScale)} />, "Average Standard Deviation", "This chart shows your running average's standard deviation"));
        charts.push(buildChartHtml(8, <Line data={this.buildRunningColorPercentages()} options={createOptions(ChartType.Line, "Solve Number", "Percentage", this.props.useLogScale)} />, "Percentage of Solves by Cross Color", "This chart shows what percentage of solves started with cross on White/Yellow/etc..."));
        charts.push(buildChartHtml(9, <Bar data={this.buildInspectionData()} options={createOptions(ChartType.Bar, "Inspection Time (s)", "Solve Time (s)", this.props.useLogScale)} />, "Average solve time by inspection time", "This chart shows your average, grouped up by how much inspection time (For example, the left bar is the 1/7 of your solves with the lowest inspection time, and the right bar is the 1/7 of your solves with the most inspection time)"));
        charts.push(buildChartHtml(10, <Line data={this.buildStepAverages()} options={createOptions(ChartType.Line, "Solve Number", "Time (s)", this.props.useLogScale)} />, "Average Time by Step", "This chart shows what percentage of your solve each step takes"));
        charts.push(buildChartHtml(1, <Line data={this.buildRunningInspectionData()} options={createOptions(ChartType.Line, "Solve Number", "Time (s)", this.props.useLogScale)} />, "Average Inspection Time", "This chart shows how much inspection time you use on average"));

        // Add charts that require CFOP method (and all of its steps) to be chosen
        if (this.props.methodName == MethodName.CFOP && this.props.steps.length == Const.MethodSteps[MethodName.CFOP].length) {
            charts.push(buildChartHtml(11, <Bar data={this.buildTypicalCompare()} options={createOptions(ChartType.Bar, "Step Name", "Time (s)", this.props.useLogScale, false)} />, "Time Per Step, Compared to Typical Solver", "This chart shows how long each step takes, compared to a typical solver at your average. The 'typical' data is calculated based on a tool provided from Felix Zemdegs's CubeSkills blog"));
        }

        // Add charts that require 2+ steps
        if (this.props.steps.length >= 2) {
            charts.push(buildChartHtml(12, <Doughnut data={this.buildStepPercentages()} options={createOptions(ChartType.Doughnut, "", "", this.props.useLogScale)} />, "Percentage of the Solve Each Step Took", "This chart shows what percentage of your solve each step takes"));
        }

        // Add charts that require all steps to be chosen
        if (this.props.steps.length == Const.MethodSteps[this.props.methodName].length) {
            charts.push(buildChartHtml(13, <Line data={this.buildGoodBadData(this.props.goodTime, this.props.badTime)} options={createOptions(ChartType.Line, "Solve Number", "Percentage", this.props.useLogScale)} />, "Percentage of 'Good' and 'Bad' Solves", "This chart shows your running average of solves considered 'good' and 'bad'. This can be configured in the filter panel. Just set the good and bad values to times you feel are correct"));
            charts.push(buildChartHtml(14, <Line data={this.buildRecordHistory()} options={createOptions(ChartType.Line, "Date", "Time (s)", this.props.useLogScale, true, true)} />, "History of Records", "This chart shows your history of PBs. Note that this will only show solves that meet the criteria in your filters, so don't be alarmed if you don't see your PB here. As a note, Ao12 removes the best and worst solves of the 12. Ao100 removes the best and worst 5. Ao1000 removes the best and worst 50."))
        }

        let chartRow = (
            <div>
                <Row>
                    {charts}
                </Row>
            </div>
        );

        return chartRow;
    }
}