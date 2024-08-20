import { Option } from "react-multi-select-component";
import { CrossColor, MethodName, StepName } from "./Types";

export class Const {
    static readonly StdDevWindow: number = 1000; // This is the default window to use when calculating a single standard deviation
    static readonly InspectionGraphChunks: number = 7;
    static readonly DefaultWindowSize: number = 1000;
    static readonly FastestSolvesCount: number = 100;

    static readonly MethodSteps: { [id in MethodName]: StepName[] } = {
        [MethodName.CFOP]: [StepName.Cross, StepName.F2L_1, StepName.F2L_2, StepName.F2L_3, StepName.F2L_4, StepName.OLL, StepName.PLL],
        [MethodName.CFOP_4LL]: [StepName.Cross, StepName.F2L_1, StepName.F2L_2, StepName.F2L_3, StepName.F2L_4, StepName.EOLL, StepName.COLL, StepName.CPLL, StepName.EPLL],
        [MethodName.CFOP_2OLL]: [StepName.Cross, StepName.F2L_1, StepName.F2L_2, StepName.F2L_3, StepName.F2L_4, StepName.EOLL, StepName.COLL, StepName.PLL],
        [MethodName.Roux]: [StepName.LEFTBLOCK, StepName.RIGHTBLOCK, StepName.CMLL, StepName.LSE],
        [MethodName.LayerByLayer]: [StepName.Cross, StepName.F2L, StepName.EOLL, StepName.COLL, StepName.CPLL, StepName.EPLL]
    }

    static readonly PllCases: Option[] = [
        { label: "Solved", value: "Solved" },
        { label: "T Perm", value: "T" },
        { label: "V Perm", value: "V" },
        { label: "Aa Perm", value: "Aa" },
        { label: "Ab Perm", value: "Ab" },
        { label: "Ga Perm", value: "Ga" },
        { label: "Gb Perm", value: "Gb" },
        { label: "Gc Perm", value: "Gc" },
        { label: "Gd Perm", value: "Gd" },
        { label: "Ja Perm", value: "Ja" },
        { label: "Jb Perm", value: "Jb" },
        { label: "F Perm", value: "F" },
        { label: "Y Perm", value: "Y" },
        { label: "Ua Perm", value: "Ua" },
        { label: "Ub Perm", value: "Ub" },
        { label: "Ra Perm", value: "Ra" },
        { label: "Rb Perm", value: "Rb" },
        { label: "Na Perm", value: "Na" },
        { label: "Nb Perm", value: "Nb" },
        { label: "H Perm", value: "H" },
        { label: "E Perm", value: "E" },
        { label: "Z Perm", value: "Z" }
    ]

    static readonly OllCases: Option[] = [
        { label: "Solved", value: "Solved" },
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
        { label: "5", value: "5" },
        { label: "6", value: "6" },
        { label: "7", value: "7" },
        { label: "8", value: "8" },
        { label: "9", value: "9" },
        { label: "10", value: "10" },
        { label: "11", value: "11" },
        { label: "12", value: "12" },
        { label: "13", value: "13" },
        { label: "14", value: "14" },
        { label: "15", value: "15" },
        { label: "16", value: "16" },
        { label: "17", value: "17" },
        { label: "18", value: "18" },
        { label: "19", value: "19" },
        { label: "20", value: "20" },
        { label: "21", value: "21" },
        { label: "22", value: "22" },
        { label: "23", value: "23" },
        { label: "24", value: "24" },
        { label: "25", value: "25" },
        { label: "26", value: "26" },
        { label: "27", value: "27" },
        { label: "28", value: "28" },
        { label: "29", value: "29" },
        { label: "30", value: "30" },
        { label: "31", value: "31" },
        { label: "32", value: "32" },
        { label: "33", value: "33" },
        { label: "34", value: "34" },
        { label: "35", value: "35" },
        { label: "36", value: "36" },
        { label: "37", value: "37" },
        { label: "38", value: "38" },
        { label: "39", value: "39" },
        { label: "40", value: "40" },
        { label: "41", value: "41" },
        { label: "42", value: "42" },
        { label: "43", value: "43" },
        { label: "44", value: "44" },
        { label: "45", value: "45" },
        { label: "46", value: "46" },
        { label: "47", value: "47" },
        { label: "48", value: "48" },
        { label: "49", value: "49" },
        { label: "50", value: "50" },
        { label: "51", value: "51" },
        { label: "52", value: "52" },
        { label: "53", value: "53" },
        { label: "54", value: "54" },
        { label: "55", value: "55" },
        { label: "56", value: "56" },
        { label: "57", value: "57" }
    ]

    static readonly crossMappings = new Map<string, CrossColor>(
        [
            // CFOP
            ['DB', CrossColor.White],
            ['BU', CrossColor.Green],
            ['FU', CrossColor.Blue],
            ['UF', CrossColor.Yellow],
            ['LU', CrossColor.Red],
            ['RU', CrossColor.Orange],

            // Roux
            ['BD', CrossColor.Unknown],
            ['BL', CrossColor.Unknown],
            ['BR', CrossColor.Unknown],
            ['DF', CrossColor.Unknown],
            ['DL', CrossColor.Unknown],
            ['DR', CrossColor.Unknown],
            ['FD', CrossColor.Unknown],
            ['FL', CrossColor.Unknown],
            ['FR', CrossColor.Unknown],
            ['LB', CrossColor.Unknown],
            ['LD', CrossColor.Unknown],
            ['LF', CrossColor.Unknown],
            ['RB', CrossColor.Unknown],
            ['RD', CrossColor.Unknown],
            ['RF', CrossColor.Unknown],
            ['UB', CrossColor.Unknown],
            ['UL', CrossColor.Unknown],
            ['UR', CrossColor.Unknown]
        ]
    );

    static readonly solveCleanliness: Option[] = [
        { label: "Clean", value: "Clean" },
        { label: "Mistake", value: "Mistake" }
    ]
}