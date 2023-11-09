import { Option } from "react-multi-select-component"

export enum Method {
    CFOP = 'CFOP',
    CFOP_2OLL = 'CFOP (2 look OLL)',
    CFOP_4LL = 'CFOP (4 look LL)',
    Roux = 'Roux'
}

export enum CrossColor {
    White = 'White',
    Yellow = 'Yellow',
    Red = 'Red',
    Orange = 'Orange',
    Blue = 'Blue',
    Green = 'Green',
    Unknown = 'Unknown'
}

export enum StepName {
    Cross = 'Cross',
    F2L_1 = 'F2L_1',
    F2L_2 = 'F2L_2',
    F2L_3 = 'F2L_3',
    F2L_4 = 'F2L_4',
    OLL = 'OLL',
    PLL = 'PLL',
}

export enum ChartType {
    Line = 'Line',
    Bar = 'Bar',
    Doughnut = "Doughnut"
}

export enum SolveCleanliness {
    Clean = "Clean",
    Mistake = "Mistake",
}

export interface Filters {
    crossColors: CrossColor[],
    startDate: Date,
    endDate: Date,
    slowestTime: number,
    fastestTime: number,
    pllCases: string[],
    ollCases: string[],
    solveCleanliness: string[]
}

export interface Step {
    time: number,
    executionTime: number,
    recognitionTime: number,
    turns: number,
    tps: number,
    moves: string,
    case: string
}

export interface Solve {
    time: number,
    date: Date,
    crossColor: CrossColor,
    scramble: string,
    tps: number,
    inspectionTime: number,
    recognitionTime: number,
    executionTime: number,
    turns: number,
    steps: {
        cross: Step,
        f2l_1: Step,
        f2l_2: Step,
        f2l_3: Step,
        f2l_4: Step,
        oll: Step,
        pll: Step
    },
    isCorrupt: boolean,
    method: Method
}

export interface AppState {
    solves: Solve[]
}

export interface FilterPanelProps {
    solves: Solve[]
}

export interface FilterPanelState {
    allSolves: Solve[],
    filteredSolves: Solve[],
    filters: Filters,

    // Objects required for filter objects to work
    drilldownStep: Option,
    chosenColors: Option[],
    chosenPLLs: Option[],
    chosenOLLs: Option[],
    solveCleanliness: Option[],
    tabKey: number,
    windowSize: number,
    pointsPerGraph: number,
    showFilters: boolean,
    showAlert: boolean,
    badTime: number,
    goodTime: number
}

export interface FileInputProps {

}

export interface FileInputState {
    solves: Solve[],
    showHelpModal: boolean
}

export interface ChartPanelProps {
    windowSize: number,
    pointsPerGraph: number,
    solves: Solve[],
    badTime: number,
    goodTime: number
}

export interface ChartPanelState {

}

export interface StepDrilldownProps {
    windowSize: number,
    pointsPerGraph: number,
    steps: Step[],
    stepName: string
}

export interface StepDrilldownState {

}

export interface HelpPanelProps {
    showHelpPanel: boolean,
    onCloseHandler: any
}

export interface HelpPanelState {

}

export interface Deviations {
    dev_total: number,
    dev_cross: number,
    dev_f2l_1: number,
    dev_f2l_2: number,
    dev_f2l_3: number,
    dev_f2l_4: number,
    dev_oll: number,
    dev_pll: number,
    avg_total: number,
    avg_cross: number,
    avg_f2l_1: number,
    avg_f2l_2: number,
    avg_f2l_3: number,
    avg_f2l_4: number,
    avg_oll: number,
    avg_pll: number
}

export interface Records {
    best: number,
    bestAo5: number,
    bestAo12: number,
    bestAo100: number
}