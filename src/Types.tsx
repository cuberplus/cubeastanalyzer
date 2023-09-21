export enum CrossColor {
    White,
    Yellow,
    Red,
    Orange,
    Blue,
    Green
}

export interface Filters {
    crossColors: CrossColor[],
    startDate: Date,
    endDate: Date,
    slowestTime: number,
    fastestTime: number
}

export interface Solve {
    time: number,
    date: Date,
    crossColor: CrossColor
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
    filters: Filters
}

export interface FileInputProps {

}

export interface FileInputState {
    solves: Solve[]
}