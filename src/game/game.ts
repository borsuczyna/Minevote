import Cursor from "../controls/cursor";
import Render from "../render/render";

declare const webglUtils: {
    [key: string]: any
};

declare const m4: {
    [key: string]: any
};

export default class Game {
    canvas: HTMLCanvasElement;
    context: WebGLRenderingContext;
    render: Render;
    cursor: Cursor;

    constructor(canvas: HTMLCanvasElement) {
        // Basic stuff
        let context = canvas.getContext('webgl', {premultipliedAlpha: true});
        if(!context) throw new Error('Error setting up Game, WebGL not supported!');

        this.canvas = canvas;
        this.context = context;

        // Render
        this.render = new Render(this.context);

        // Cursor
        this.cursor = new Cursor(canvas);
    }

    update(): this {
        this.render.clear();
        this.render.drawArrays();

        return this;
    }
}