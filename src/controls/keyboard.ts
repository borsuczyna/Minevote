export default class Keyboard {
    private canvas: HTMLCanvasElement;
    private keysDown: string[] = [];
    private keyCodesDown: number[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        addEventListener('keydown', this.keyDown.bind(this));
        addEventListener('keyup', this.keyUp.bind(this));
    }
    
    destroy() {
        this.canvas.removeEventListener('keydown', this.keyDown.bind(this));
        removeEventListener('keyup', this.keyUp.bind(this));
    }
    
    private keyDown(e: KeyboardEvent) {
        this.keysDown.push(e.key);
        this.keyCodesDown.push(e.keyCode);
    }
    
    private keyUp(e: KeyboardEvent) {
        this.keysDown = this.keysDown.filter(k => k !== e.key);
        this.keyCodesDown = this.keyCodesDown.filter(k => k !== e.keyCode);
    }
    
    isKeyDown(key: string) {
        return this.keysDown.includes(key);
    }
    
    isKeyCodeDown(key: number) {
        return this.keyCodesDown.includes(key);
    }
}