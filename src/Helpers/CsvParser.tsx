import { Const } from "./Constants";
import { Solve, Step, CrossColor, Method } from "./Types";
import moment from 'moment';

export function GetEmptyStep() {
    let step: Step = {
        time: 0,
        executionTime: 0,
        recognitionTime: 0,
        turns: 0,
        tps: 0,
        moves: "",
        case: ""
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
        steps: {
            cross: GetEmptyStep(),
            f2l_1: GetEmptyStep(),
            f2l_2: GetEmptyStep(),
            f2l_3: GetEmptyStep(),
            f2l_4: GetEmptyStep(),
            oll: GetEmptyStep(),
            pll: GetEmptyStep()

        },
        isCorrupt: false,
        method: Method.CFOP
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

        keys.forEach((key, index) => {
            switch (key) {
                case "time":
                    obj.time = Number(item.at(index)) / 1000;
                    if (obj.time < 1) {
                        obj.isCorrupt = true;
                    }
                    break;
                case "date":
                    obj.date = moment.utc(item.at(index), 'YYYY-MM-DD hh:mm:ss').toDate()
                    break;
                case "solution_rotation":
                    if (Const.crossMappings.get(item.at(index)!) === undefined) {
                        console.log("Couldn't parse rotation ", item.at(index));
                        obj.crossColor = CrossColor.Unknown;
                        obj.isCorrupt = true;
                        break;
                    }
                    obj.crossColor = Const.crossMappings.get(item.at(index)!)!
                    break;
                case "scramble":
                    obj.scramble = item.at(index)!;
                    break;
                case "solving_method":
                    obj.method = item.at(index)! as Method;
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


                case "step_0_time":
                    obj.steps.cross.time = Number(item.at(index)) / 1000;
                    break;
                case "step_1_time":
                    obj.steps.f2l_1.time = Number(item.at(index)) / 1000;
                    break;
                case "step_2_time":
                    obj.steps.f2l_2.time = Number(item.at(index)) / 1000;
                    break;
                case "step_3_time":
                    obj.steps.f2l_3.time = Number(item.at(index)) / 1000;
                    break;
                case "step_4_time":
                    obj.steps.f2l_4.time = Number(item.at(index)) / 1000;
                    break;
                case "step_5_time":
                    obj.steps.oll.time = Number(item.at(index)) / 1000;
                    break;
                case "step_6_time":
                    obj.steps.pll.time = Number(item.at(index)) / 1000;
                    break;

                case "step_0_case":
                    obj.steps.cross.case = item.at(index)!;
                    break;
                case "step_1_case":
                    obj.steps.f2l_1.case = item.at(index)!;
                    break;
                case "step_2_case":
                    obj.steps.f2l_2.case = item.at(index)!;
                    break;
                case "step_3_case":
                    obj.steps.f2l_3.case = item.at(index)!;
                    break;
                case "step_4_case":
                    obj.steps.f2l_4.case = item.at(index)!;
                    break;
                // As a note, these are out of order because F2L pair column 3 contains a comma, which breaks my script
                case "step_6_case":
                    obj.steps.oll.case = item.at(index)!;
                    break;
                case "step_7_case":
                    obj.steps.pll.case = item.at(index)!;
                    break;


                case "step_0_turns_per_second":
                    obj.steps.cross.tps = Number(item.at(index));
                    break;
                case "step_1_turns_per_second":
                    obj.steps.f2l_1.tps = Number(item.at(index));
                    break;
                case "step_2_turns_per_second":
                    obj.steps.f2l_2.tps = Number(item.at(index));
                    break;
                case "step_3_turns_per_second":
                    obj.steps.f2l_3.tps = Number(item.at(index));
                    break;
                case "step_4_turns_per_second":
                    obj.steps.f2l_4.tps = Number(item.at(index));
                    break;
                case "step_5_turns_per_second":
                    obj.steps.oll.tps = Number(item.at(index));
                    break;
                case "step_6_turns_per_second":
                    obj.steps.pll.tps = Number(item.at(index));
                    break;



                case "step_0_recognition_time":
                    obj.steps.cross.recognitionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_1_recognition_time":
                    obj.steps.f2l_1.recognitionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_2_recognition_time":
                    obj.steps.f2l_2.recognitionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_3_recognition_time":
                    obj.steps.f2l_3.recognitionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_4_recognition_time":
                    obj.steps.f2l_4.recognitionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_5_recognition_time":
                    obj.steps.oll.recognitionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_6_recognition_time":
                    obj.steps.pll.recognitionTime = Number(item.at(index)) / 1000;
                    break;


                case "step_0_execution_time":
                    obj.steps.cross.executionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_1_execution_time":
                    obj.steps.f2l_1.executionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_2_execution_time":
                    obj.steps.f2l_2.executionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_3_execution_time":
                    obj.steps.f2l_3.executionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_4_execution_time":
                    obj.steps.f2l_4.executionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_5_execution_time":
                    obj.steps.oll.executionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_6_execution_time":
                    obj.steps.pll.executionTime = Number(item.at(index)) / 1000;
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