import * as PIXI from "pixi.js";
import { Main } from "@/main";

export class FPS {
  cnt = new PIXI.Container({ label: "FPS", eventMode: "none"  });

  private sprite = new PIXI.Sprite({ texture: PIXI.Texture.WHITE, label: "FPS", tint: 0x1A1A1A });
  private update: (ticker: PIXI.Ticker) => void;

  constructor() {
    this.cnt.addChild(this.sprite);

    const text = new PIXI.BitmapText({
      label: "FPS_text",
      style: { fill: { color: 0xffffff }, fontSize: 28 * Main.scale, fontWeight: "bold" },
      text: `FPS: ${Main.app.ticker.FPS.toFixed(2)}`,
    });
    this.cnt.addChild(text);
    this.sprite.setSize(text.width, text.height);

    let counter = 0;
    let sum = 0;
    this.update = (ticker: PIXI.Ticker) => {
      counter++;
      sum += ticker.FPS;
      if (counter < 30) return;
      text.text = `FPS: ${(sum / counter).toFixed(2)}`;
      sum = 0;
      counter = 0;
    };
    Main.app.ticker.add(this.update, this);
  }

  destroy() {
    Main.app.ticker.remove(this.update, this);
    this.sprite.destroy();
    this.cnt.destroy({ children: true });
  }
}
