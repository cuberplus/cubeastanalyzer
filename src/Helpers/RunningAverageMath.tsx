import { Deque } from "@datastructures-js/deque";
import { Const } from "./Constants";

export function calculateAverage(data: number[]): number {
    let mean = 0;
    for (let i = 0; i < data.length; i++) {
        mean += data[i];
    }
    mean /= data.length;

    return mean;
}

export function calculateStandardDeviation(data: number[]): number {
    let samples = data.slice(-Const.StdDevWindow);
    let mean = calculateAverage(samples)

    let variance = 0;
    for (let i = 0; i < samples.length; i++) {
        variance += Math.pow(samples[i] - mean, 2);
    }
    variance /= samples.length;

    return Math.sqrt(variance)
}

export function calculate90thPercentile(data: number[], window: number): number {
    let recentSolves = data;
    if (data.length > window) {
        recentSolves = data.slice(-window);
    }

    let sortedSolves = recentSolves.sort((a, b) => {
        return a - b;
    })

    let idx = Math.floor(.9 * sortedSolves.length);

    return Math.ceil(sortedSolves[idx]);
}

export function calculateMovingAverage(data: number[], window: number): number[] {
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

export function calculateMovingPercentage(data: any[], window: number, criteria: (solve: any) => boolean): number[] {
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

export function calculateMovingStdDev(data: number[], window: number) {
    let result: number[] = [];
    if (Number.isNaN(window) || data.length < window) {
        return result;
    }

    let deque = new Deque<number>(new Array(window).fill(0));
    let mean = 0;
    let variance = 0;

    for (let i = 0; i < data.length; i++) {
        let oldMean = mean;
        let goingAway = deque.front();
        mean = oldMean + (data[i] - goingAway) / window;
        let newMean = mean;
        deque.pushBack(data[i]);
        if (deque.size() > window) {
            deque.popFront()
        }
        variance += (data[i] - goingAway) * ((data[i] - newMean) + (goingAway - oldMean)) / (window - 1)
        if (i >= window) {
            result.push(Math.sqrt(variance))
        }
    }

    return result;
}

export function reduceDataset(values: any[], pointsPerGraph: number) {
    let targetPoints = pointsPerGraph;
    if (values.length <= targetPoints) {
        return values;
    }

    let reducedValues = []
    let addedLastElement: boolean = false;
    let delta = Math.floor(values.length / targetPoints);
    for (let i = 0; i < values.length; i = i + delta) {
        reducedValues.push(values[i]);
        if (i === (values.length - 1)) {
            addedLastElement = true;
        }
    }

    if (!addedLastElement) {
        reducedValues.push(values[values.length - 1]);
    }

    return reducedValues;
}