import Color from "../render/color";
import Shader from "./shader";
import gradientShader from './shaders/gradient.glsl?raw';

function gradientReturnValue(colors: number) {
    const steps = Array.from({ length: colors - 1 }, (_, i) => i / (colors - 1));
    const mixCalls = steps.map((step, i) => `mix(color${i}, color${i + 1}, smoothstep(${step.toFixed(1)}, ${(steps[i + 1] || 1.0).toFixed(1)}, x))`);
  
    return mixCalls.reduceRight((acc, call) => `mix(${call}, ${acc}, smoothstep(0.0, 1.0, x))`);
}  

export default class Gradient extends Shader {
    constructor(context: WebGLRenderingContext, ...colors: Color[]) {
        let returnCode = 'return vec4(1, 0, 0, 1);';
        let colorUniforms = '';
        let uniforms: number[] = [];
        if(colors.length == 0) throw new Error('Need at least one color for gradient!');
        else if(colors.length == 1) {
            returnCode = 'return color0;';
        } else {
            returnCode = `return ${gradientReturnValue(colors.length)};`;
        }

        for(let id in colors) {
            colorUniforms += `vec4 color${id};\n`;
        }

        let shaderCode = gradientShader+''; // just clone it.
        shaderCode = shaderCode.replace('<colorUniforms>', colorUniforms);
        shaderCode = shaderCode.replace('<returnCode>', returnCode);

        super(context, shaderCode);

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