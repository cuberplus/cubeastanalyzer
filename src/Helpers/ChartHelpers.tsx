import { Card, Col } from "react-bootstrap";
import { ChartType } from "./Types";

export function buildChartHtml(chart: JSX.Element): JSX.Element {
    return (
        <Col className="col-12 col-lg-6">
            <Card className="m-2">
                {chart}
            </Card>
        </Col>
    )
}

export function createOptions(chartType: ChartType, chartTitle: string, xAxis: string, yAxis: string) {
    let genericOptions: any = {
        plugins: {
            title: {
                display: true,
                text: chartTitle
            }
        }
    };

    let chartOptions: any = {};

    switch (chartType) {
        case ChartType.Line:
            chartOptions = {
                maintainAspectRatio: false,
                spanGaps: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xAxis
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxis
                        }
                    }
                }
            };
            break;

        case ChartType.Bar:
            chartOptions = {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xAxis
                        },
                        stacked: true,
                        ticks: {
                            autoSkip: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxis
                        },
                        stacked: true
                    }
                }
            };
            break;

        case ChartType.Doughnut:
            chartOptions = {
                maintainAspectRatio: true
            }
            break;
        default:
            console.log("Unknown chart type: " + chartType)
    }


    return { ...chartOptions, ...genericOptions };
}