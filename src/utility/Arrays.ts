export class Arrays {
    static min = (arr: number[]) => arr.reduce((p, v) => (p < v ? p : v));
    
    static max = (arr: number[]) => arr.reduce((p, v) => (p > v ? p : v));
}