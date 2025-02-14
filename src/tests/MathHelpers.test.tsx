import { sumArray, calculateAverage, calculateStandardDeviation, calculate90thPercentile, calculateMovingAverage, calculateMovingAverageChopped, calculateMovingStdDev } from '../Helpers/MathHelpers';
import { describe, expect, test } from '@jest/globals';

test('sumArray sums the elements of an array', () => {
    expect(sumArray([1, 2, 3, 4])).toBe(10);
});

test('calculateAverage calculates the average of an array', () => {
    expect(calculateAverage([1, 2, 3, 4])).toBe(2.5);
});

test('calculateStandardDeviation calculates the standard deviation of an array', () => {
    expect(calculateStandardDeviation([1, 2, 3, 4])).toBeCloseTo(1.118, 3);
});

test('calculate90thPercentile calculates the 90th percentile of an array', () => {
    expect(calculate90thPercentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10)).toBe(9);
});

test('calculateMovingAverage calculates the moving average of an array', () => {
    expect(calculateMovingAverage([1, 2, 3, 4, 5], 3)).toEqual([2, 3, 4]);
});

test('calculateMovingAverageChopped calculates the moving average with chopping of an array', () => {
    expect(calculateMovingAverageChopped([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5, 1)).toEqual([3, 4, 5, 6, 7]);
});


test('calculateMovingStdDev calculates the moving standard deviation of an array', () => {
    expect(calculateMovingStdDev([1, 2, 3, 4, 5], 3)).toEqual([1, 1, 1]);
});
