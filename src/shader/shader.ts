import { compileShader } from "./compiler";
import defaultShader from './shaders/default.glsl?raw';

declare const webglUtils: {
    [key: string]: any
};

declare const m4: {
    [key: string]: any
};

export default class Shader {
    context: WebGLRenderingContext;
    program: WebGLProgram;
    positionLocation: number;
    texcoordLocation: number;
    matrixLocation: WebGLUniformLocation;
    textureLocation: WebGLUniformLocation;
    normalLocation: WebGLUniformLocation;

    constructor(context: WebGLRenderingContext, shaderCode: string = defaultShader) {
        this.context = context;
        
        this.program = webglUtils.createProgramFromSources(context, compileShader(shaderCode));
        this.positionLocation = context.getAttribLocation(this.program, "internal_position");
        this.texcoordLocation = context.getAttribLocation(this.program, "internal_inTexCoord");
        this.matrixLocation = context.getUniformLocation(this.program, "internal_matrix") as WebGLUniformLocation;
        this.textureLocation = context.getUniformLocation(this.program, "texture") as WebGLUniformLocation;
        this.normalLocation = context.getUniformLocation(this.program, "normalTexture") as WebGLUniformLocation;
    }

    setValue(key: string, value: any, type: 'float' | 'matrix' | 'texture' | 'int' | 'vec2' | 'vec3' | 'vec4' | 'bool') {
        const location = this.context.getUniformLocation(this.program, key);
        if (!location) return;
        this.context.useProgram(this.program);
        switch (type) {
            case 'float':
                this.context.uniform1f(location, value);
                break;
            case 'matrix':
                this.context.uniformMatrix3fv(location, false, value);
                break;
            case 'texture':
                // this.context.activeTexture(this.context.TEXTURE1);
                // this.context.bindTexture(this.context.TEXTURE_2D, value);
                // this.context.uniform1i(location, 1);
                break;
            case 'int':
                this.context.uniform1i(location, value);
                break;
            case 'vec2':
                this.context.uniform2f(location, value[0], value[1]);
                break;
            case 'vec3':
                this.context.uniform3f(location, value[0], value[1], value[2]);
                break;
            case 'vec4':
                this.context.uniform4f(location, value[0], value[1], value[2], value[3]);
                break;
            case 'bool':
                this.context.uniform1i(location, value ? 1 : 0);
                break;
        }
    }
}