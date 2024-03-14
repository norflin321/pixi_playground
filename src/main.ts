import * as PIXI from "pixi.js";
import { FPS } from "@/FPS";
import { round } from "@/utils";
import { Group } from "tweedle.js";
import { CoinsGame } from "@/coinsGame";
import { ShaderExample } from "@/ShaderExample";

/** starting point of the game, the root of the tree of all game objects (everything grows from this point) */
export abstract class Main {
  static cnt = new PIXI.Container({ label: "main" });
  static app: PIXI.Application;
  static lang: "en" | "fr" | "ru" | "zh" = "ru";
  static scale: number; // percent of how much current screen resolution is different from assets resolution in Figma (fullHD)
  static appWidth: number;
  static appHeight: number;

  static async start() {
    const startT = performance.now();

    // initialize PIXI app
    this.app = new PIXI.Application();
    await this.app.init({
      hello: true,
      resolution: window.devicePixelRatio || 2,
      // webgpu is better, but it has some rare bugs and most of android webview versions doesn't support it yet
      preference: "webgl",
      resizeTo: window, // auto fill the screen
      autoDensity: true, // handles high DPI screens
      powerPreference: "high-performance",
      premultipliedAlpha: false,
      eventFeatures: { globalMove: false, wheel: true },
      // using a back buffer can lead to smoother animations and less visual artifacts, as the entire frame is rendered offscreen before
      // being presented to the user. However, it increases graphics memory usage, as an extra buffer needs to be maintained for offscreen rendering.
      useBackBuffer: true,
      // clearBeforeRender: false,
      antialias: false, // do not turn on (it causes huge performance decrease! specially on mobile)
      // eventMode: "none",
    }).catch(err => console.error(err));
    document.body.appendChild(this.app.canvas);

    // get screen size and fill it with empty texture
    const { width, height } = this.app.screen.getBounds();
    this.appWidth = round(width);
    this.appHeight = round(height);
    const fill = new PIXI.Sprite({ texture: PIXI.Texture.EMPTY, label: "main_fill" });
    fill.setSize(this.appWidth, this.appHeight);
    this.cnt.addChild(fill);
    this.app.stage.addChild(this.cnt);

    window.__PIXI_APP__ = this.app; // for chrome devtools
    this.app.ticker.add(ticker => Group.shared.update(ticker.deltaMS)); // update tweens each tick

    // calculate game scale
    // scale is defined by the percent of how much screen resolution in Figma is different of current device resolution
    const figmaScreenRes = { width: 1080, height: 1920 };
    this.scale = round(Main.appHeight / figmaScreenRes.height);
    if (figmaScreenRes.width * this.scale > Main.appWidth) this.scale = round(Main.appWidth / figmaScreenRes.width);
    // maximum scale is 1 because we export textures from Figma in 1 to 1 scale, and don't want them to scale
    // bigger then their native resolution, otherwise they will look blurry (subject to change later)
    if (this.scale > 1) this.scale = 1;

    this.cnt.addChild(new FPS().cnt); // render fps counter
    console.log(`game is ready in ${round((performance.now() - startT) / 1000)}s`);

    await PIXI.Assets.load("coin.png")
    new CoinsGame(this.cnt);
    new ShaderExample(this.cnt);
  }
}
Main.start();
