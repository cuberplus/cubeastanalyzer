export interface Solve {
    time: number,
    date: Date
}

export interface AppState {
    solves: Solve[]
}

export interface FilterPanelProps {
    solves: Solve[]
}

export interface FilterPanelState {
    solves: Solve[]
}

export interface FileInputProps {

}

export interface FileInputState {
    solves: Solve[]
}