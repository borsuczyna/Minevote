export default class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number = 255, g: number = 255, b: number = 255, a: number = 255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    array() {
        return [this.r, this.g, this.b, this.a];
    }

    normalizedArray() {
        return [this.r/255, this.g/255, this.b/255, this.a/255];
    }

    static White() {
        return new Color();
    }
}