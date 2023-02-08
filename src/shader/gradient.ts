import Color from "../render/color";
import Shader from "./shader";

function gradientReturnValue(colors: number) {
    const steps = Array.from({ length: colors - 1 }, (_, i) => i / (colors - 1));
    const mixCalls = steps.map((step, i) => `mix(color${i}, color${i + 1}, smoothstep(${step.toFixed(1)}, ${(steps[i + 1] || 1.0).toFixed(1)}, x))`);
  
    return mixCalls.reduceRight((acc, call) => `mix(${call}, ${acc}, smoothstep(0.0, 1.0, x))`);
}  

export default class Gradient extends Shader {
    constructor(context: WebGLRenderingContext, ...colors: Color[]) {
        let shaderCode = 'uniform float angle;\n';
        if(colors.length == 0) throw new Error('Need at least one color for gradient!');
        else if(colors.length == 1) {
            shaderCode = `
            uniform vec4 color0;

            vec4 pixelShaderFunction() {
                return color0;
            }`;
        } else {
            for(let id in colors) {
                shaderCode += `uniform vec4 color${id};\n`;
            }

            shaderCode += `
            vec4 pixelShaderFunction() {
                vec2 U = texCoord.xy - .5;
                float x = .5 + length(U) * cos( atan(U.y,-U.x) + angle);
                return ${gradientReturnValue(colors.length)};
            }`;
        }
        super(context, undefined, shaderCode);

        for(let id in colors) {
            let color: Color = colors[id];
            this.setValue(`color${id}`, color.normalizedArray(), 'vec4');
        }
    }

    setAngle(angle: number) {
        this.setValue('angle', angle, 'float');
    }

    setAngleDegrees(degrees: number) {
        this.setAngle(degrees * Math.PI / 180);
    }
}