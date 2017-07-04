// Type definitions for fdrandom
// Project: https://www.npmjs.com/package/fdrandom
// Definitions by: Yahiko <https://github.com/yahiko00>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface FdrandomStatic {
    pot(seed: any): FdrandomStatic;
    hot(): FdrandomStatic;
    hotpot(): FdrandomStatic;
    repot(seed: any): FdrandomStatic;
    reset(seed: any): FdrandomStatic;

    getstate(): number[];
    setstate(state: number[]): void;
    version(): string;
    checkfloat(): boolean;

    next(): number;
    f48(): number;
    dbl(): number;
    f24(): number;
    fxs(): number;
    i32(): number;
    ui32(): number;

    rbit(): number;
    rndbit(): number;
    rpole(): number;
    rndsign(): number;
    range(b: number, d: number): number;
    irange(b: number, d: number): number;
    lrange(a: number, b: number, d: number): number;
    zrange(b: number, d: number, c: number): number;

    cauchy(scale: number, mean: number): number;
    gaus(scale: number, mean: number): number;
    gausx(scale: number, mean: number): number;
    usum(n: number, scale: number, mean: number): number;

    mixup(Ai: string, Ao: number | string, c: number, e: number): number | string;
    mixof(Ai: string, Ao: number | string, od: number, c: number, e: number): number | string;
    bulk(A: any, f: any, b: any, c: any, d: any): number[];
    within(a: number, e: number, fn: () => number, n?: number): number;
    aindex(mx: any, Ai: any, sq: any, sep: any, lim: any, x: any): number[];
    aresult(A?: number[], Av?: number | number[], sq?: number): number;
    antisort(mx: any, Ai: any, A: any, sq: any, sep: any, lim: any, x: any): number[];
    ilcg(): number;
    ishr2(): number;
    ishp(): number;

    uigless(): number;
    uigmore(): number;
    igbrist(): number;
    igmode(): number;

    fgwedge(b: number, d: number): number;
    fgtrapez(b: number, d: number): number;
    fgnorm(b?: number, d?: number): number;
    fgthorn(b: number, d: number): number;
    fgskip(b: number, d: number): number;
    fgteat(b: number, d: number): number;

    gbowl(b: number, d: number): number;
    gspire(b: number, d: number): number;
    gthorn(b: number, d: number): number;
    gwedge(b: number, d: number): number;
    gnorm(b?: number, d?: number): number;
    gcauchy(b: number, d: number): number;
    gteat(b: number, d: number): number;
    gtrapez(b: number, d: number): number;
    gskip(b: number, d: number): number;
} // FdrandomFactory

declare var fdrandom: FdrandomStatic;

declare module "fdrandom" {
    export = fdrandom;
}
