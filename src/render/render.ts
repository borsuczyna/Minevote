import Game from "../game/game";
import Shader from "../shader/shader";
import { Position2D, Position3D, Position4D, Size } from "../uitls/position";
import Settings from "../uitls/Settings";
import Cache, { TextureInfo } from "./cache";
import Color from "./color";

interface Buffers {
    position: WebGLBuffer;
    texCoord: WebGLBuffer;
};

const defaultBuffers = {
    positions: [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
    ],
    texCoords: [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
    ]
};

declare const webglUtils: {
    [key: string]: any
};

declare const m4: {
    [key: string]: any
};

interface DrawCall {
    texture?: TextureInfo;
    normal?: TextureInfo;
    shader: Shader;
    matrix: any;
    color: Color | Color[];
    uw: number;
    uh: number;
    texCoords?: number[];
};

export default class Render {
    private drawCalls: DrawCall[] = [];
    parent: Game;
    context: WebGLRenderingContext;
    cache: Cache;
    shader: Shader;
    buffers: Buffers;
    lightDirection: Position2D = new Position2D();
    lightColor: Color = new Color();

    constructor(context: WebGLRenderingContext, parent: Game) {
        this.parent = parent;
        this.context = context;

        this.cache = new Cache(context);
        this.shader = new Shader(context);

        //  Buffers
        let position = this.context.createBuffer();
        let texCoord = this.context.createBuffer();
        if(!position || !texCoord) throw new Error('Error setting up Render, failed to create buffers!');

        this.buffers = {
            position: position,
            texCoord: texCoord
        };

        this.context.bindBuffer(this.context.ARRAY_BUFFER, position);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(defaultBuffers.positions), this.context.STATIC_DRAW);
        this.context.bindBuffer(this.context.ARRAY_BUFFER, texCoord);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(defaultBuffers.texCoords), this.context.STATIC_DRAW);
    }

    clear() {
        let canvas: HTMLCanvasElement | OffscreenCanvas = this.context.canvas;

        webglUtils.resizeCanvasToDisplaySize(this.context.canvas);
    
        this.context.viewport(0, 0, canvas.width, canvas.height);
        this.context.clear(this.context.COLOR_BUFFER_BIT);
        this.context.clear(this.context.DEPTH_BUFFER_BIT);
        this.context.enable(this.context.BLEND);
        this.context.enable(this.context.DEPTH_TEST);
        this.context.blendFunc(this.context.ONE, this.context.ONE_MINUS_SRC_ALPHA);
    }

    drawImage(
        position: Position3D,
        size: Size,
        url: string,
        shader: Shader = this.shader,
        color: Color | Color[] = Color.White()
    ) {
        let texture: TextureInfo = this.cache.getTextureFromCache(url);
        let canvas: HTMLCanvasElement | OffscreenCanvas = this.context.canvas;

        let matrix = m4.orthographic(0, canvas.width, canvas.height, 0, -100, 100);
        matrix = m4.translate(matrix, position.x, position.y, position.z);
        matrix = m4.scale(matrix, size.x, size.y, 1);

        this.drawCalls.push({
            texture,
            matrix,
            shader,
            color,
            uw: 1,
            uh: 1
        });
    }

    drawImageWithNormal(
        position: Position3D,
        size: Size,
        url: string,
        normal: string,
        shader: Shader = this.shader,
        color: Color | Color[] = Color.White()
    ) {
        let texture: TextureInfo = this.cache.getTextureFromCache(url);
        let normalTexture: TextureInfo = this.cache.getTextureFromCache(normal);
        let canvas: HTMLCanvasElement | OffscreenCanvas = this.context.canvas;

        let matrix = m4.orthographic(0, canvas.width, canvas.height, 0, -100, 100);
        matrix = m4.translate(matrix, position.x, position.y, position.z);
        matrix = m4.scale(matrix, size.x, size.y, 1);

        this.drawCalls.push({
            texture,
            normal: normalTexture,
            matrix,
            shader,
            color,
            uw: 1,
            uh: 1
        });
    }
    
    drawImageSection(
        position: Position3D,
        size: Size,
        uv: Position4D,
        url: string,
        shader: Shader = this.shader,
        color: Color | Color[] = Color.White()
    ) {
        let texture: TextureInfo = this.cache.getTextureFromCache(url);
        let canvas: HTMLCanvasElement | OffscreenCanvas = this.context.canvas;

        let matrix = m4.orthographic(0, canvas.width, canvas.height, 0, -100, 100);
        matrix = m4.translate(matrix, position.x, position.y, position.z);
        matrix = m4.scale(matrix, size.x, size.y, 1);

        [uv.z, uv.w] = [uv.z + uv.x, uv.w + uv.y];

        this.drawCalls.push({
            texture,
            matrix,
            shader,
            color,
            uw: uv.z - uv.x,
            uh: uv.w - uv.y,
            texCoords: [
                uv.x, uv.y,
                uv.x, uv.w,
                uv.z, uv.y,
                uv.z, uv.y,
                uv.x, uv.w,
                uv.z, uv.w,
            ]
        });
    }

    drawShader(
        position: Position3D,
        size: Size,
        shader: Shader = this.shader,
        color: Color | Color[] = Color.White()
    ) {
        let canvas: HTMLCanvasElement | OffscreenCanvas = this.context.canvas;

        let matrix = m4.orthographic(0, canvas.width, canvas.height, 0, -100, 100);
        matrix = m4.translate(matrix, position.x, position.y, position.z);
        matrix = m4.scale(matrix, size.x, size.y, 1);

        this.drawCalls.push({
            matrix,
            shader,
            color,
            uw: 1,
            uh: 1
        });
    }

    private updateDefaultShaderValues(shader: Shader) {
        shader.setValue('time', performance.now(), 'float');
        shader.setValue('lightDir', this.lightDirection.array(), 'vec2');
        shader.setValue('lightColor', this.lightColor.normalizedArray(), 'vec4');
    }

    private updateShaderDiffuse(shader: Shader, color: Color | Color[]) {
        if(color instanceof Color) {
            shader.setValue('diffuse_tl', color.normalizedArray(), 'vec4');
            shader.setValue('diffuse_tr', color.normalizedArray(), 'vec4');
            shader.setValue('diffuse_bl', color.normalizedArray(), 'vec4');
            shader.setValue('diffuse_br', color.normalizedArray(), 'vec4');
        } else {
            if(color.length == 1) {
                shader.setValue('diffuse_tl', color[0].normalizedArray(), 'vec4');
                shader.setValue('diffuse_tr', color[0].normalizedArray(), 'vec4');
                shader.setValue('diffuse_bl', color[0].normalizedArray(), 'vec4');
                shader.setValue('diffuse_br', color[0].normalizedArray(), 'vec4');
            } else if(color.length == 2) {
                shader.setValue('diffuse_tl', color[0].normalizedArray(), 'vec4');
                shader.setValue('diffuse_tr', color[0].normalizedArray(), 'vec4');
                shader.setValue('diffuse_bl', color[1].normalizedArray(), 'vec4');
                shader.setValue('diffuse_br', color[1].normalizedArray(), 'vec4');
            } else if(color.length == 4) {
                shader.setValue('diffuse_tl', color[0].normalizedArray(), 'vec4');
                shader.setValue('diffuse_tr', color[1].normalizedArray(), 'vec4');
                shader.setValue('diffuse_bl', color[2].normalizedArray(), 'vec4');
                shader.setValue('diffuse_br', color[3].normalizedArray(), 'vec4');
            } else {
                throw new Error('Invalid color count');
            }
        }
    }

    private updateShaderUV(shader: Shader, uw: number, uh: number) {
        shader.setValue('uw', uw, 'float');
        shader.setValue('uh', uh, 'float');
    }

    getScreenFromWorldPosition(position: Position3D = new Position3D()): Position2D {
        let zMult: number = 1/((position.z/2) + 1);

        let validPosition: Position2D = new Position2D(
            this.context.canvas.width / 2 + (position.x * this.parent.camera.zoom * Settings.BlockSize) - (this.parent.camera.position.x * this.parent.camera.zoom * Settings.BlockSize),
            this.context.canvas.height / 2 - (position.y * this.parent.camera.zoom * Settings.BlockSize) + (this.parent.camera.position.y * this.parent.camera.zoom * Settings.BlockSize)
        );

        let cx: number = this.context.canvas.width/2;
        let cy: number = this.context.canvas.height/2;

        return new Position2D(
            cx + (validPosition.x - cx) * zMult,
            cy + (validPosition.y - cy) * zMult
        );
    }

    getWorldPositionFromScreen(position: Position2D = new Position2D(), depth: number = 0): Position3D {
        let zMult: number = 1/((depth/2) + 1);

        let validPosition: Position2D = new Position2D(
            (position.x - (this.context.canvas.width / 2)) / zMult + (this.parent.camera.position.x * this.parent.camera.zoom * Settings.BlockSize),
            (-position.y + (this.context.canvas.height / 2)) / zMult + (this.parent.camera.position.y * this.parent.camera.zoom * Settings.BlockSize)
        );

        return new Position3D(
            (validPosition.x / this.parent.camera.zoom) / Settings.BlockSize,
            (validPosition.y / this.parent.camera.zoom) / Settings.BlockSize,
            depth
        );
    }

    drawArrays() {
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffers.position);
        this.context.enableVertexAttribArray(this.shader.positionLocation);
        this.context.vertexAttribPointer(this.shader.positionLocation, 2, this.context.FLOAT, false, 0, 0);
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffers.texCoord);
        this.context.enableVertexAttribArray(this.shader.texcoordLocation);
        this.context.vertexAttribPointer(this.shader.texcoordLocation, 2, this.context.FLOAT, false, 0, 0);

        for (let drawCall of this.drawCalls) {
            if(drawCall.texCoords) {
                this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffers.texCoord);
                this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(drawCall.texCoords), this.context.STATIC_DRAW);
            }
            
            this.context.uniform1i(drawCall.shader.textureLocation, 0);
            this.context.uniform1i(drawCall.shader.normalLocation, 1);
            
            this.context.activeTexture(this.context.TEXTURE0);
            this.context.bindTexture(this.context.TEXTURE_2D, drawCall.texture?.texture || this.cache.getEmptyTexture().texture);

            if(drawCall.normal) {
                this.context.activeTexture(this.context.TEXTURE1);
                this.context.bindTexture(this.context.TEXTURE_2D, drawCall.normal?.texture || this.cache.getEmptyTexture().texture);
            } else {
                this.context.activeTexture(this.context.TEXTURE1);
                this.context.bindTexture(this.context.TEXTURE_2D, this.cache.getEmptyTexture().texture);
            }

            this.context.useProgram(drawCall.shader.program);
            this.updateDefaultShaderValues(drawCall.shader);
            this.updateShaderDiffuse(drawCall.shader, drawCall.color);
            this.updateShaderUV(drawCall.shader, drawCall.uw, drawCall.uh);

            this.context.uniformMatrix4fv(drawCall.shader.matrixLocation, false, drawCall.matrix);
            this.context.drawArrays(this.context.TRIANGLES, 0, 6);

            if(drawCall.texCoords) {
                this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffers.texCoord);
                this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(defaultBuffers.texCoords), this.context.STATIC_DRAW);
            }
        }

        this.drawCalls = [];
    }
}