import Game from "../../game/game";
import { Position2D } from "../../uitls/position";

export default class Camera {
    parent: Game;
    zoom: number = 1;
    position: Position2D = new Position2D();

    constructor(parent: Game) {
        this.parent = parent;
    }

    update() {}
}