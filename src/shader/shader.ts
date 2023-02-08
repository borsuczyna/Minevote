import { compileShader } from "./compiler";

let defaultVertexShader = `
vec4 vertexShaderFunction() {
    texCoord = inTexCoord;

    screenCoord = matrix * position;
    screenCoord.xy = (screenCoord.xy+1.0)/2.0;
    screenCoord.y = 1.0-screenCoord.y;

    return matrix * position;
}
`;

let defaultPixelShader = `
vec4 pixelShaderFunction() {
    vec4 color = texture2D(texture, vec2(texCoord.x, texCoord.y));
    vec4 normalColor = texture2D(normalTexture, vec2(texCoord.x, texCoord.y));

    // color.rg += normal.xy;
    
    float dotValue = dot(normal.xy, lightDir.xy);
    color.rgb *= mix(
        vec3(1, 1, 1),
        lightColor.rgb,
        dotValue
    );
    // color.rg = lightDir.xy;

    color *= diffuse;
    color.rgb *= color.a;
    return color;
}`;

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

    constructor(context: WebGLRenderingContext, vertexShader: string = defaultVertexShader, pixelShader: string = defaultPixelShader) {
        this.context = context;
        
        this.program = webglUtils.createProgramFromSources(context, compileShader(vertexShader, pixelShader));
        this.positionLocation = context.getAttribLocation(this.program, "position");
        this.texcoordLocation = context.getAttribLocation(this.program, "inTexCoord");
        this.matrixLocation = context.getUniformLocation(this.program, "matrix") as WebGLUniformLocation;
        this.textureLocation = context.getUniformLocation(this.program, "texture") as WebGLUniformLocation;
        this.normalLocation = context.getUniformLocation(this.program, "normalTexture") as WebGLUniformLocation;
    }

    setValue(key: string, value: any, type: 'float' | 'matrix' | 'texture' | 'int' | 'vec2' | 'vec3' | 'vec4') {
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
        }
    }
}