import * as _ from "lodash";

export default function isEquals (a: number[], b: number[]): boolean {
    let diffArray: Array<Number> = [];
    if (a.length > b.length) {
        diffArray = _.difference(a, b);
    } else {
        diffArray = _.difference(b, a);
    }

    return diffArray.length === 0;
}