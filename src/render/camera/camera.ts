import Render from "../render";
import { Position2D } from "../../uitls/position";

export default class Camera {
    private parent: Render;
    zoom: number = 1;
    position: Position2D = new Position2D();

    constructor(parent: Render) {
        this.parent = parent;
    }

    update() {}
}