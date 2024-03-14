import { Main } from "@/main";
import * as PIXI from "pixi.js";

const vertex = `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void) {
  vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
  position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
  position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
  return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void) {
  return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void) {
  gl_Position = filterVertexPosition();
  vTextureCoord = filterTextureCoord();
}
`;

const fragment = `
in vec2 vTextureCoord;
in vec4 vColor;

uniform sampler2D uTexture;
uniform float uTime;

void main(void) {
  vec2 uvs = vTextureCoord.xy;
  vec4 fg = texture2D(uTexture, vTextureCoord);
  fg.r = uvs.y + sin(uTime);
  gl_FragColor = fg;
}
`;

export class ShaderExample {
  constructor(targetCnt: PIXI.Container) {
    const shaderTestCnt = new PIXI.Container({ parent: targetCnt });
    new PIXI.Sprite({ texture: PIXI.Texture.EMPTY, parent: shaderTestCnt, width: targetCnt.width, height: targetCnt.height });
    const shader = new PIXI.Filter({
      glProgram: new PIXI.GlProgram({ vertex, fragment }),
      resources: { timeUniforms: { uTime: { value: 0.0, type: "f32" } } },
    });
    shaderTestCnt.filters = [shader];
    Main.app.ticker.add((ticker) => shader.resources.timeUniforms.uniforms.uTime += 0.05 * ticker.deltaTime);
  }
}
