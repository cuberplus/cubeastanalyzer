import { Option } from "react-multi-select-component"

export enum CrossColor {
    White = 'White',
    Yellow = 'Yellow',
    Red = 'Red',
    Orange = 'Orange',
    Blue = 'Blue',
    Green = 'Green'
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
    filters: Filters,
    chosenColors: Option[] // TODO: probably change this
}

export interface FileInputProps {

}

export interface FileInputState {
    solves: Solve[]
}