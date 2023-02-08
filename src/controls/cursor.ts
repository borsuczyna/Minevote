import { Position2D } from "../uitls/position";

export default class Cursor {
    private canvas: HTMLCanvasElement;
    position: Position2D = new Position2D();

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvas.addEventListener('mousemove', this.update.bind(this));
    }
    
    destroy() {
        this.canvas.removeEventListener('mousemove', this.update.bind(this));
    }
    
    private update(e: MouseEvent) {
        let dom: DOMRect = this.canvas.getBoundingClientRect();
        this.position.set(e.clientX, e.clientY).sub(dom.x, dom.y);
    }
}