import { ChartType } from "./Types";

export function createOptions(chartType: ChartType, chartTitle: string) {
    let options: any = {};

    switch (chartType) {
        case ChartType.Line:
            options = {
                spanGaps: true
            };
            break;

        case ChartType.Bar:
            options = {
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            autoSkip: false
                        }
                    },
                    y: {
                        stacked: true
                    }
                }
            };
            break;

        case ChartType.Doughnut:
            options = {
                maintainAspectRatio: true
            }
            break;
        default:
            console.log("Unknown chart type: " + chartType)
    }

    console.log("Title is " + chartTitle)

    options.plugins = {
        title: {
            display: true,
            text: chartTitle
        }
    }

    return options;
}