class Position {
    x: number;
    y: number;
    z: number | undefined;
    w: number | undefined;

    constructor(x: number, y: number, z?: number, w?: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    array() {
        return [this.x, this.y, this.z, this.w];
    }
    
    add(x?: number, y?: number, z?: number, w?: number) {
        if(x) this.x += x;
        if(y) this.y += y;
        if(this.z != undefined && z) this.z += z;
        if(this.w != undefined && w) this.w += w;
        return this;
    }
    
    sub(x?: number, y?: number, z?: number, w?: number) {
        if(x) this.x -= x;
        if(y) this.y -= y;
        if(this.z != undefined && z) this.z -= z;
        if(this.w != undefined && w) this.w -= w;
        return this;
    }
    
    multiply(x: number, y?: number, z?: number, w?: number) {
        if(!y) {
            this.x *= x;
            this.y *= x;
            if(this.z != undefined) this.z *= x;
            if(this.w != undefined) this.w *= x;
        } else {
            if(x) this.x *= x;
            if(y) this.y *= y;
            if(this.z != undefined && z) this.z *= z;
            if(this.w != undefined && w) this.w *= w;
        }
        return this;
    }
    
    divide(x: number, y?: number, z?: number, w?: number) {
        if(!y) {
            this.x /= x;
            this.y /= x;
            if(this.z != undefined) this.z /= x;
            if(this.w != undefined) this.w /= x;
        } else {
            if(x) this.x /= x;
            if(y) this.y /= y;
            if(this.z != undefined && z) this.z /= z;
            if(this.w != undefined && w) this.w /= w;
        }
        return this;
    }

    set(x?: number, y?: number, z?: number, w?: number) {
        if(x && this.x != undefined) this.x = x;
        if(y && this.y != undefined) this.y = y;
        if(z && this.z != undefined) this.z = z;
        if(w && this.w != undefined) this.w = w;
        return this;
    }


    normalize() {
        let length = this.length();
        this.divide(length);
        return this;
    }

    length() {
        let squared = this.x * this.x + this.y * this.y;
        if(this.z) {
            squared += this.z * this.z;
            if(this.w) squared += this.w * this.w;
        }
        return Math.sqrt(squared);
    }
    
    distance(x: number, y: number, z?: number, w?: number) {
        let xd = this.x - x;
        let yd = this.y - y;
        let zd = 0;
        let wd = 0;
        if(z && this.z != undefined) zd = this.z - z;
        if(w && this.w != undefined) wd = this.w - w;
        let squared = xd * xd + yd * yd;
        if(zd) squared += zd * zd;
        if(wd) squared += wd * wd;
        return Math.sqrt(squared);
    }
    
    dot(x: number, y: number, z?: number, w?: number) {
        let output = this.x * x + this.y * y;
        if(this.z != undefined && z) output += this.z * z;
        if(this.w != undefined && w) output += this.w * w;
        return output;
    }

    clone() {
        return new Position(this.x, this.y, this.z, this.w);
    }
}

export class Position2D extends Position {
    constructor(x: number = 0, y: number = 0) {
        super(x, y);
    }
}

export class Position3D extends Position {
    z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        super(x, y, z);
        this.z = z;
    }
}

export class Position4D extends Position {
    z: number;
    w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        super(x, y, z, w);
        this.z = z;
        this.w = w;
    }
}

export class Size extends Position {
    constructor(x: number = 0, y: number = 0) {
        super(x, y);
    }
}