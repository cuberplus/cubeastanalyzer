import { Solve, CrossColor } from "./Types";
import moment from 'moment';

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
            crossColor: CrossColor.White
        };


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
                    obj.crossColor = item.at(index) === "DB" ? CrossColor.White : CrossColor.Red; // TODO: retrieve this and map properly
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