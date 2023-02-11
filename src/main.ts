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
import Light from './render/light';
import Gradient from './shader/gradient';
import Shader from './shader/shader';
import './style.css';
import { Position3D, Size } from './uitls/position';
import Settings from './uitls/Settings';
let gradient = new Gradient(game.context, 
    new Color(150, 255, 255), // red
    new Color(180, 255, 255), // orange
);
let rectangle = new Gradient(game.context, new Color(255, 0, 0));

let normalShader: Shader = new Shader(game.context);
game.render.lightColor = new Color(425, 425, 425);
game.render.lightDirection.set(2, -2).normalize();

game.camera = new FreeCam(game);
let blocks: Position3D[] = [];
for(let x = 0; x < 21; x++) {
    blocks.push(new Position3D(x, 0, 0));
}

let light: Light = new Light().setSize(3).setColor(new Color(1500/3, 1000/3, 0));
let light2: Light = new Light().setSize(3).setColor(new Color(1500/2, 255, 255));
let light3: Light = new Light().setSize(3).setColor(new Color(255, 1500/2, 255));

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

    game.render.drawImageWithNormal(new Position3D(0, 0, 0), new Size(512, 512), '/blocks/gun.png', '/blocks/gun-normal.png', normalShader);

    light.setPosition(new Position3D(game.cursor.position.x, game.cursor.position.y, 0));
    light2.setPosition(new Position3D(256 + Math.sin(performance.now()/900)*128, 256 + Math.cos(performance.now()/300)*128, 0));
    light3.setPosition(new Position3D(256 + Math.sin(-performance.now()/900)*128, 256 + Math.cos(-performance.now()/300)*128, 0));
    game.render.setLights([light]);

    game.render.drawShader(new Position3D(game.cursor.position.x, game.cursor.position.y, 10), new Size(5, 5), rectangle);

    gradient.setAngleDegrees(performance.now()/10);
    game.render.drawShader(new Position3D(), new Size(game.canvas.width, game.canvas.height), gradient);
}

requestAnimationFrame(update);