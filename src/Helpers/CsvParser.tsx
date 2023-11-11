import { Const } from "./Constants";
import { GetEmptySolve } from "./CubeHelpers";
import { Solve, Step, CrossColor, MethodName, StepName } from "./Types";
import moment from 'moment';

export function parseCsv(stringVal: string, splitter: string): Solve[] {
    stringVal = stringVal.replace(/(\[.*?\])/g, '');

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
                    obj.method = item.at(index)! as MethodName;
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

                case "step_0_name":
                case "step_1_name":
                case "step_2_name":
                case "step_3_name":
                case "step_4_name":
                case "step_5_name":
                case "step_6_name":
                case "step_7_name":
                case "step_8_name":
                case "step_9_name":
                    obj.steps[+key[5]].name = item.at(index)! as StepName;
                    break;
                case "step_0_slice_turns":
                case "step_1_slice_turns":
                case "step_2_slice_turns":
                case "step_3_slice_turns":
                case "step_4_slice_turns":
                case "step_5_slice_turns":
                case "step_6_slice_turns":
                case "step_7_slice_turns":
                case "step_8_slice_turns":
                case "step_9_slice_turns":
                    obj.steps[+key[5]].turns = Number(item.at(index));
                    break;
                case "step_0_time":
                case "step_1_time":
                case "step_2_time":
                case "step_3_time":
                case "step_4_time":
                case "step_5_time":
                case "step_6_time":
                case "step_7_time":
                case "step_8_time":
                case "step_9_time":
                    obj.steps[+key[5]].time = Number(item.at(index)) / 1000;
                    break;
                case "step_0_case":
                case "step_1_case":
                case "step_2_case":
                case "step_3_case":
                case "step_4_case":
                case "step_5_case":
                case "step_6_case":
                case "step_7_case":
                case "step_8_case":
                case "step_9_case":
                    obj.steps[+key[5]].case = item.at(index)!;
                    break;
                case "step_0_turns_per_second":
                case "step_1_turns_per_second":
                case "step_2_turns_per_second":
                case "step_3_turns_per_second":
                case "step_4_turns_per_second":
                case "step_5_turns_per_second":
                case "step_6_turns_per_second":
                case "step_7_turns_per_second":
                case "step_8_turns_per_second":
                case "step_9_turns_per_second":
                    obj.steps[+key[5]].tps = Number(item.at(index));
                    break;
                case "step_0_recognition_time":
                case "step_1_recognition_time":
                case "step_2_recognition_time":
                case "step_3_recognition_time":
                case "step_4_recognition_time":
                case "step_5_recognition_time":
                case "step_6_recognition_time":
                case "step_7_recognition_time":
                case "step_8_recognition_time":
                case "step_9_recognition_time":
                    obj.steps[+key[5]].recognitionTime = Number(item.at(index)) / 1000;
                    break;
                case "step_0_execution_time":
                case "step_1_execution_time":
                case "step_2_execution_time":
                case "step_3_execution_time":
                case "step_4_execution_time":
                case "step_5_execution_time":
                case "step_6_execution_time":
                case "step_7_execution_time":
                case "step_8_execution_time":
                case "step_9_execution_time":
                    obj.steps[+key[5]].executionTime = Number(item.at(index)) / 1000;
                    break;

                default:
                    break;
            }
        });
        return obj;
    });

    formedArr = formedArr.sort((a: Solve, b: Solve) => {
        return a.date.getTime() - b.date.getTime();
    })

    return formedArr;
}