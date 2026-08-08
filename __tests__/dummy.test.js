import { sum } from "../utils";

describe('sum function',()=>{
    test('add 2 + 2',()=>{
        expect(sum(2,2)).toBe(4);
    })
    test('add -1 + -1',()=>{
        expect(sum(-1,-1)).toBe(-2);
    })
})