export function calculate90thPercentile(data: number[], window: number): number {
    let recentSolves = data.slice(-window);

    let sortedSolves = recentSolves.sort((a, b) => {
        return a - b;
    })

    let total = .9 * sortedSolves.length;

    return Math.ceil(sortedSolves[total]);
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

export function calculateMovingPercentage(data: number[], window: number, criteria: (solve: number) => boolean): number[] {
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