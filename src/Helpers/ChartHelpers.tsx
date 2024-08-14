import { Card, Col, OverlayTrigger, Ratio, Tooltip } from "react-bootstrap";
import { ChartType } from "./Types";

export function createTooltip(description: string) {
    const tooltip = (
        <Tooltip id="tooltip">
            {description}
        </Tooltip>
    );
    return tooltip;
}

export function buildChartHtml(chart: JSX.Element, tooltip: string): JSX.Element {
    return (
        <Col className="col-12 col-lg-6">
            <Card className="p-2">
                <OverlayTrigger placement="auto" overlay={createTooltip(tooltip)}>
                    <Ratio aspectRatio="4x3">
                        {chart}
                    </Ratio>
                </OverlayTrigger>

            </Card>
        </Col>
    )
}

export function createOptions(chartType: ChartType, chartTitle: string, xAxis: string, yAxis: string, isStacked: boolean = true) {
    let genericOptions: any = {
        maintainAspectRatio: false,
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
                        stacked: isStacked,
                        ticks: {
                            autoSkip: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxis
                        },
                        stacked: isStacked
                    }
                }
            };
            break;

        case ChartType.Doughnut:
            chartOptions = {
            }
            break;
        default:
            console.log("Unknown chart type: " + chartType)
    }


    return { ...chartOptions, ...genericOptions };
}