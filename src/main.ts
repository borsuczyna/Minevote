import Game from './game/game';
import FreeCam from './render/camera/freecam';

let player: HTMLCanvasElement = document.getElementById('player') as HTMLCanvasElement;
let game: Game = new Game(player);

let startTime = performance.now();
let frameCount = 0;

let fpsCounter: HTMLDivElement = document.getElementById('fps-counter') as HTMLDivElement;

// @ts-ignore
requestAnimationFrame = (callback) => {
    setTimeout(callback, 0);
}


// @ test
import Color from './render/color';
import Gradient from './shader/gradient';
import Shader from './shader/shader';
import './style.css';
import { Position2D, Position3D, Size } from './uitls/position';
import Settings from './uitls/Settings';
let gradient = new Gradient(game.context, 
    new Color(150, 255, 255), // red
    new Color(180, 255, 255), // orange
);
let rectangle = new Gradient(game.context, new Color(255, 0, 0));

let normalShader: Shader = new Shader(game.context);
game.render.lightColor = new Color(325, 325, 325);
game.render.lightDirection.set(2, -2).normalize();

game.camera = new FreeCam(game);
let blocks: Position3D[] = [];
for(let x = 0; x < 21; x++) {
    blocks.push(new Position3D(x, 0, 0));
}

function update() {
    requestAnimationFrame(update);
    game.update();

    let dom: DOMRect = player.getBoundingClientRect();
    fpsCounter.style.left = `${dom.left}px`;
    fpsCounter.style.top = `${dom.top}px`;
    frameCount++;

    let currentTime = performance.now();
    let elapsedTime = currentTime - startTime;
    if (elapsedTime >= 1000) {
        let fps = Math.floor(frameCount / (elapsedTime / 1000));
        fpsCounter.innerText = 'FPS: ' + fps;

        startTime = currentTime;
        frameCount = 0;
    }

    for(let block of blocks) {
        let pos: Position3D = game.render.getScreenFromWorldPosition(block);
        let size: Size = game.render.getDimensions(new Size(Settings.BlockSize, Settings.BlockSize));
        game.render.drawImageWithNormal(pos, size, '/blocks/grass.png', '/blocks/grass-normal.png', normalShader, [
            new Color(255, 255, 255),
            new Color(75, 75, 75),
        ]);
    }

    game.render.drawShader(new Position3D(game.cursor.position.x, game.cursor.position.y, 10), new Size(15, 15), rectangle);

    gradient.setAngleDegrees(90);
    game.render.drawShader(new Position3D(), new Size(game.canvas.width, game.canvas.height), gradient);
}

requestAnimationFrame(update);