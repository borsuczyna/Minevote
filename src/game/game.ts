import Cursor from "../controls/cursor";
import Keyboard from "../controls/keyboard";
import Camera from "../render/camera/camera";
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
    camera: Camera = new Camera(this);
    
    // Controllers
    keyboard: Keyboard;
    cursor: Cursor;

    constructor(canvas: HTMLCanvasElement) {
        // Basic stuff
        let context = canvas.getContext('webgl', {premultipliedAlpha: true});
        if(!context) throw new Error('Error setting up Game, WebGL not supported!');

        this.canvas = canvas;
        this.context = context;

        // Render
        this.render = new Render(this.context, this);

        // Controllers
        this.cursor = new Cursor(canvas);
        this.keyboard = new Keyboard(canvas);
    }

    update(): this {
        this.camera.update();
        this.render.clear();
        this.render.drawArrays();

        return this;
    }
}