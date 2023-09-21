import { Solve } from "./Types";
import moment from 'moment';

export function parseCsv(stringVal: string, splitter: string): Solve[] {
    const [keys, ...rest] = stringVal
      .trim()
      .split("\n")
      .map((item) => item.split(splitter));
  
    const formedArr = rest.map((item) => {
      const obj: Solve = {time: 0, date: new Date()};
      keys.forEach((key, index) => {
        // TODO: need this for every column
        switch(key) {
          case "time":
            obj.time = Number(item.at(index));
            break;
          case "date":
            obj.date = moment.utc(item.at(index), 'YYYY-MM-DD hh:mm:ss').toDate()
            break;
          default:
            //console.log(key + " is an unused column");
        }
      });
      return obj;
    });
    return formedArr;
  }