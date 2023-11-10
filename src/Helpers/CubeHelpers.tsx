import { CrossColor, MethodName, Solve, Step, StepName } from "./Types";

export function GetEmptyStep() {
    let step: Step = {
        time: 0,
        executionTime: 0,
        recognitionTime: 0,
        turns: 0,
        tps: 0,
        moves: "",
        case: "",
        name: StepName.Cross
    }

    return step;
}

export function GetEmptySolve() {
    let solve: Solve = {
        time: 0,
        date: new Date(),
        crossColor: CrossColor.Unknown,
        scramble: "",
        tps: 0,
        recognitionTime: 0,
        inspectionTime: 0,
        executionTime: 0,
        turns: 0,
        steps: [GetEmptyStep(), GetEmptyStep(), GetEmptyStep(), GetEmptyStep(), GetEmptyStep(), GetEmptyStep(), GetEmptyStep(), GetEmptyStep(), GetEmptyStep()],
        isCorrupt: false,
        method: MethodName.CFOP
    };

    return solve;
}