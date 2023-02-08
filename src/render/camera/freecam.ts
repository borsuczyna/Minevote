import Game from "../../game/game";
import Camera from "./camera";

export default class FreeCam extends Camera {
    speed: number = 1;

    update() {
        let game: Game = this.parent;
        if(game.keyboard.isKeyDown('a')) {
            this.position.add(-this.speed/10);
        } else if(game.keyboard.isKeyDown('d')) {
            this.position.add(this.speed/10);
        }
        if(game.keyboard.isKeyDown('s')) {
            this.position.add(0, -this.speed/10);
        } else if(game.keyboard.isKeyDown('w')) {
            this.position.add(0, this.speed/10);
        }
    }
}