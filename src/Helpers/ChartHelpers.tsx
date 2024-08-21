import { Card, CardText, Col, OverlayTrigger, Ratio, Tooltip } from "react-bootstrap";
import { ChartType } from "./Types";

export function createTooltip(description: string) {
    const tooltip = (
        <Tooltip id="tooltip">
            {description}
        </Tooltip>
    );
    return tooltip;
}

export function buildChartHtml(chart: JSX.Element, title: string, tooltip: string): JSX.Element {
    return (
        <Col className="col-12 col-lg-6">
            <Card className="p-2">
                <OverlayTrigger placement="auto" overlay={createTooltip(tooltip)}>
                    <CardText className="text-center">
                        {title} ⓘ
                    </CardText>
                </OverlayTrigger>
                <Ratio aspectRatio="4x3">
                    {chart}
                </Ratio>
            </Card>
        </Col>
    )
}

export function createOptions(chartType: ChartType, xAxis: string, yAxis: string, isStacked: boolean = true) {
    let genericOptions: any = {
        maintainAspectRatio: false
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