import { Solve, CrossColor } from "./Types";
import moment from 'moment';

// TODO: finish this mapping, move to constants file
let crossMappings = new Map<string, CrossColor>();
crossMappings.set('DB', CrossColor.White);

export function parseCsv(stringVal: string, splitter: string): Solve[] {
    const [keys, ...rest] = stringVal
        .trim()
        .split("\n")
        .map((item) => item.split(splitter));

    let formedArr = rest.map((item) => {
        // TODO: probably want to create this in a method somewhere.
        const obj: Solve = {
            time: 0,
            date: new Date(),
            crossColor: CrossColor.White,
            scramble: "",
            tps: 0,
            recognitionTime: 0,
            inspectionTime: 0,
            executionTime: 0,
            turns: 0
        };

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
                case "total_inspection_time":
                    obj.inspectionTime = Number(item.at(index)) / 1000;
                    break;
                case "total_execution_time":
                    obj.executionTime = Number(item.at(index)) / 1000;
                    break;
                case "slice_turns":
                    obj.turns = Number(item.at(index));
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