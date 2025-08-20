import { Const } from "./Constants";
import { GetEmptySolve } from "./CubeHelpers";
import { Solve, CrossColor, MethodName, StepName } from "./Types";
import moment from 'moment';

export function parseCsv(stringVal: string, splitter: string): Solve[] {
    stringVal = stringVal.replace(/(\[.*?\])/g, '');

    const [keys, ...rest] = stringVal
        .trim()
        .split("\n")
        .map((item) => item.split(splitter));

    const keyMap: { [key: string]: (obj: Solve, value: string) => void } = {
        "id": (obj, value) => { obj.id = value; },
        "time": (obj, value) => { obj.time = Number(value) / 1000; if (obj.time < 1) obj.isCorrupt = true; },
        "date": (obj, value) => { obj.date = moment.utc(value, 'YYYY-MM-DD hh:mm:ss').toDate(); },
        "solution_rotation": (obj, value) => { obj.crossColor = Const.crossMappings.get(value) ?? CrossColor.Unknown },
        "scramble": (obj, value) => { obj.scramble = value; },
        "solving_method": (obj, value) => { obj.method = value as MethodName; },
        "turns_per_second": (obj, value) => { obj.tps = Number(value); },
        "total_recognition_time": (obj, value) => { obj.recognitionTime = Number(value) / 1000; },
        "inspection_time": (obj, value) => { obj.inspectionTime = Number(value) / 1000; },
        "total_execution_time": (obj, value) => { obj.executionTime = Number(value) / 1000; },
        "slice_turns": (obj, value) => { obj.turns = Number(value); },
        "session_name": (obj, value) => { obj.session = value; },
    };

    const stepKeyMap: { [key: string]: (step: any, value: string) => void } = {
        "name": (step, value) => { step.name = value as StepName; },
        "slice_turns": (step, value) => { step.turns = Number(value); },
        "time": (step, value) => { step.time = Number(value) / 1000; },
        "case": (step, value) => { step.case = value; },
        "turns_per_second": (step, value) => { step.tps = Number(value); },
        "recognition_time": (step, value) => { step.recognitionTime = Number(value) / 1000; },
        "execution_time": (step, value) => { step.executionTime = Number(value) / 1000; },
    };

    let formedArr = rest.map((item) => {
        let obj = GetEmptySolve();

        keys.forEach((key, index) => {
            if (key.startsWith("step_")) {
                const stepIndex = +key[5];
                const stepKey = key.split("_").slice(2).join("_");
                stepKeyMap[stepKey]?.(obj.steps[stepIndex], item[index]);
            } else {
                keyMap[key]?.(obj, item[index]);
            }
        });

        return obj;
    });

    formedArr = formedArr.sort((a: Solve, b: Solve) => {
        return a.date.getTime() - b.date.getTime();
    });

    return formedArr;
}