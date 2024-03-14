import * as PIXI from "pixi.js";
import { Main } from "@/main";
import { proportionalResize, rnb } from "@/utils";

export class Coin {
  speedY: number;
  speedX: number;
  cnt = new PIXI.Container({ label: "coin" });
  sprite: PIXI.Sprite;

  constructor(texture: PIXI.Texture) {
    this.speedY = rnb(-4, 4);
    this.speedX = rnb(-4, 4);
    this.speedY ||= 1;
    this.speedX ||= 1;

    this.cnt.eventMode = "none";

    this.sprite = new PIXI.Sprite({ texture, label: "coin" });
    const width = Main.appHeight * 0.03;
    proportionalResize(this.sprite, "width", width);
    this.sprite.anchor.set(0.5);
    this.cnt.addChild(this.sprite)
  }
}

export class CoinsGame {
  private cnt = new PIXI.Container({ label: "coinsGame" });
  private coins: Coin[] = [];
  private sprite = new PIXI.Sprite({ texture: PIXI.Texture.EMPTY, label: "coinsGame" });

  constructor(targetCnt: PIXI.Container) {
    this.sprite.width = targetCnt.width;
    this.sprite.height = targetCnt.height;
    this.cnt.addChild(this.sprite);
    targetCnt.addChild(this.cnt);

    // spawn coins on pointerdown event
    this.cnt.eventMode = "static";
    this.cnt.on("pointertap", (e) => {
      const localPos = this.cnt.toLocal(e.global);
      for (let i = 0; i < 200; i++) {
        const coin = new Coin(PIXI.Assets.get("coin.png"));
        this.cnt.addChild(coin.cnt);
        coin.cnt.position.set(localPos.x, localPos.y);
        this.coins.push(coin);
      }
    });

    Main.app.ticker.add(this.update.bind(this));
  }

  update(ticker: PIXI.Ticker) {
    for (const coin of this.coins) {
      if (coin.cnt.destroyed) return;

      if (coin.cnt.position.x > this.sprite.width - coin.cnt.width / 2) {
        coin.speedX = -Math.abs(coin.speedX);
      } else if (coin.cnt.position.x <= 0 + coin.cnt.width / 2) {
        coin.speedX = Math.abs(coin.speedX);
      }
      coin.cnt.position.x += coin.speedX * ticker.deltaTime;

      if (coin.cnt.position.y > this.sprite.height - coin.cnt.height / 2) {
        coin.speedY = -Math.abs(coin.speedY);
      } else if (coin.cnt.position.y <= 0 + coin.cnt.height / 2) {
        coin.speedY = Math.abs(coin.speedY);
      }
      coin.cnt.position.y += coin.speedY * ticker.deltaTime;
    }
  }

  destroy() {
    this.coins.forEach((coin) => coin.cnt.destroy({ children: true, texture: false }));
    this.sprite.destroy({ children: true, texture: false });
    this.cnt.destroy({ children: true, texture: false });
    Main.app.ticker.remove(this.update.bind(this));
  }
}
