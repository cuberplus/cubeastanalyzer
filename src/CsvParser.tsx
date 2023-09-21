import { Solve, Step, CrossColor } from "./Types";
import moment from 'moment';

// TODO: finish this mapping, move to constants file
let crossMappings = new Map<string, CrossColor>();
crossMappings.set('DB', CrossColor.White);
crossMappings.set('BU', CrossColor.Green);
crossMappings.set('FU', CrossColor.Blue);
crossMappings.set('UF', CrossColor.Yellow);
crossMappings.set('LU', CrossColor.Red);
crossMappings.set('RU', CrossColor.Orange);


export function GetEmptyStep() {
    let step: Step = {
        time: 0,
        executionTime: 0,
        recognitionTime: 0,
        turns: 0,
        tps: 0,
        moves: ""
    }

    return step;
}

export function GetEmptySolve() {
    let solve: Solve = {
        time: 0,
        date: new Date(),
        crossColor: CrossColor.White,
        scramble: "",
        tps: 0,
        recognitionTime: 0,
        inspectionTime: 0,
        executionTime: 0,
        turns: 0,
        steps: {
            cross: GetEmptyStep(),
            f2l_1: GetEmptyStep(),
            f2l_2: GetEmptyStep(),
            f2l_3: GetEmptyStep(),
            f2l_4: GetEmptyStep(),
            oll: GetEmptyStep(),
            pll: GetEmptyStep()

        }
    };

    return solve;
}

export function parseCsv(stringVal: string, splitter: string): Solve[] {
    const [keys, ...rest] = stringVal
        .trim()
        .split("\n")
        .map((item) => item.split(splitter));

    let formedArr = rest.map((item) => {
        let obj = GetEmptySolve();

        // TODO: read in step data (time, turns, execution, inspection, tps, moves, case (g perm or whatever))
        // read in solution?

        keys.forEach((key, index) => {
            // TODO: need this for every column
            switch (key) {
                case "time":
                    obj.time = Number(item.at(index)) / 1000;
                    break;
                case "date":
                    obj.date = moment.utc(item.at(index), 'YYYY-MM-DD hh:mm:ss').toDate()
                    break;
                case "solution_rotation":
                    if (crossMappings.get(item.at(index)!) == undefined) {
                        console.log("couldn't parse rotation ", item.at(index));
                    }
                    obj.crossColor = crossMappings.get(item.at(index)!)!
                    break;
                case "scramble":
                    obj.scramble = item.at(index)!;
                    break;
                case "turns_per_second":
                    obj.tps = Number(item.at(index));
                    break;
                case "total_recognition_time":
                    obj.recognitionTime = Number(item.at(index)) / 1000;
                    break;
                case "inspection_time":
                    obj.inspectionTime = Number(item.at(index)) / 1000;
                    break;
                case "total_execution_time":
                    obj.executionTime = Number(item.at(index)) / 1000;
                    break;
                case "slice_turns":
                    obj.turns = Number(item.at(index));
                    break;
                case "step_0_slice_turns":
                    obj.steps.cross.turns = Number(item.at(index));
                    break;
                case "step_1_slice_turns":
                    obj.steps.f2l_1.turns = Number(item.at(index));
                    break;
                case "step_2_slice_turns":
                    obj.steps.f2l_2.turns = Number(item.at(index));
                    break;
                case "step_3_slice_turns":
                    obj.steps.f2l_3.turns = Number(item.at(index));
                    break;
                case "step_4_slice_turns":
                    obj.steps.f2l_4.turns = Number(item.at(index));
                    break;
                case "step_5_slice_turns":
                    obj.steps.oll.turns = Number(item.at(index));
                    break;
                case "step_6_slice_turns":
                    obj.steps.pll.turns = Number(item.at(index));
                    break;





                default:
                //console.log(key + " is an unused column");
            }
        });
        return obj;
    });

    formedArr = formedArr.sort((a: Solve, b: Solve) => {
        return a.date.getTime() - b.date.getTime();
    })

    return formedArr;
}