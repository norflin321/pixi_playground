import * as PIXI from "pixi.js";

declare global {
  interface Window {
    __PIXI_APP__: PIXI.Application<PIXI.Renderer>;
  }
}

export type TPoint = { x: number; y: number };
export type TSize = { width: number; height: number };
export type TGridSize = { rows: number; cols: number };

/** returns a shuffled copy */
export const getShuffled = <T>(arr: T[]) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** the same as Object.keys but typesafe */
export const getObjKeys = Object.keys as <T extends object>(obj: T) => (keyof T)[];

/** example usage: (arr: [1, 2, 3, 4], chunkLength: 2) => [[1, 2], [3, 4]] */
export const getSplitedByChunks = <T>(arr: T[], chunkLength: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkLength) {
    const chunk = arr.slice(i, i + chunkLength);
    out.push(chunk);
  }
  return out;
}

/** get a random item from an array */
export const selectRandomly = <T>(items: T[]) => items[rnb(0, items.length - 1)];

/** get a random item from an array taking into account its probability (sum of all items probabilities should be equal to 1) */
export const selectByProbability = <T extends { probability: number }>(items: T[]) => {
  const rand = Math.random();
  let acc = 0;
  for (const item of items) {
    acc += item.probability;
    if (rand < acc) return item;
  }
  return items[0];
};

/** example usage: (s: 120) => "2:00" */
export const fmtSecondsToMMSS = (s: number) => new Date(s * 1000).toISOString().slice(14, -5);

/** generates a pseudo Random Number Between two given (inclusive) */
export const rnb = (min: number, max: number, precision?: number) => parseFloat((Math.random() * (max - min) + min).toFixed(precision ?? 0));

/** rounds a number to 2 decimals (0.00) */
export const round = (n: number) => Math.round(n * 100) / 100;

/** generates a unique random id string. with generation speed of 1000 new ids per hour, 99 days or 2 million ids needed in order to have a 1% probability of at least one collision. */
export const uid = () => crypto.getRandomValues(new Uint8Array(8)).reduce(((t,e)=>t+=(e&=63)<36?e.toString(36):e<62?(e-26).toString(36).toUpperCase():e>62?"-":"_"),""); // eslint-disable-line

/** probability = {0.0...1.0}, where 1.0 is 100% probability of getting true */
export const testProbability = (probability: number) => Math.random() < probability;

/** calculates percent difference between two given numbers */
export const calcTwoNumbersPercentDiff = (a: number, b: number) => Math.abs((a - b) / ((a + b) / 2));

/** limits the number between minimum and maximum (inclusive) */
export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** calculates the middle point between 2 points on 2d plane */
export const calc2dMidpoint = (a: TPoint, b: TPoint) => ({ x: Math.round((a.x + b.x)/2), y: Math.round((a.y + b.y)/2) });

/** calculates the distance between 2 points on 2d plane */
export const calc2dDistance = (a: TPoint, b: TPoint) => round(Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2)));

/** checks if 2 points are equal */
export const is2dPointsEqual = (a: TPoint, b: TPoint) => a.x == b.x && a.y == b.y;

/** calculates the position in pixels inside MxN grid (ex. gridSize = { rows: 3, cols: 5 } then it is 3x5 grid with gridIdx = {0...14}) */
export const calcPosByGridIdx = (size: TSize, gridSize: TGridSize, gridIdx: number) => {
  const maxGridIdx = Math.max((gridSize.rows * gridSize.cols) - 1, 0);
  const safeGridPosIdx = gridIdx <= maxGridIdx ? gridIdx : maxGridIdx;
  const row = Math.floor(safeGridPosIdx / gridSize.cols);
  const gridPos = { row: row, col: safeGridPosIdx - (row * gridSize.cols) };
  return {
    x: (size.width / gridSize.cols) * gridPos.col + size.width / gridSize.cols / 2,
    y: (size.height / gridSize.rows) * gridPos.row + size.height / gridSize.rows / 2,
  };
}

/** subtracts one point from another */
export const calcPointsDiff = (a: TPoint, b: TPoint) => ({ x: a.x - b.x, y: a.y - b.y });

/** generates an array of given len with unique pseudo random numbers in given range (inclusive) */
export const uniqueRandRange = (len: number, min: number, max: number) => {
  const nums = new Set<number>();
  while (nums.size != (len > max ? max : len)) nums.add(rnb(min, max));
  return [...nums];
};

export const getGlobalCenterPos = (cnt: PIXI.Container) => {
  const globalPos = cnt.getGlobalPosition();
  const size = cnt.getSize();
  return { x: globalPos.x + size.width / 2, y: globalPos.y + size.height / 2 };
}

export const debugCnt = (cnt: PIXI.Container) => {
  const bg = new PIXI.Sprite({ texture: PIXI.Texture.WHITE, label: "debug", eventMode: "none", tint: 0x565c0, alpha: 0.5 });
  bg.setSize(cnt.width, cnt.height);
  cnt.addChild(bg);
};

export const proportionalResize = (target: PIXI.Container | PIXI.Sprite, targetDim: "height" | "width", dimNewSize: number) => {
  const scale = dimNewSize / target[targetDim];
  const size = target.getSize();
  target.setSize(size.width * scale, size.height * scale);
}

/** changes the pivot and compensates the position so the target doesn't move (version 1) */
export const changePivotSilently = (target: PIXI.Container, pivot: TPoint | "center", options?: { targetSize?: TSize }) => {
  const targetSize = options?.targetSize ?? target.getSize();
  const newPivot = pivot == "center" ? { x: targetSize.width/2, y: targetSize.height/2 } : pivot;
  const pivotsDiff = calcPointsDiff(target.pivot, newPivot);
  target.pivot.set(newPivot.x, newPivot.y);
  target.position.set(target.position.x - pivotsDiff.x, target.position.y - pivotsDiff.y);
}

/** changes the pivot and compensates the position so that target doesn't move (version 2 using global pos) */
export const changePivotSilentlyByGlobal = (target: PIXI.Container, newPivot: TPoint) => {
  const globPoint = target.toGlobal(newPivot);
  target.pivot.set(newPivot.x, newPivot.y);
  target.position.set(globPoint.x, globPoint.y);
};

/** changes texture without changing the size */
export const changeTextureSilently = (target: PIXI.Sprite | undefined, newTextureName: string, options?: { size: TSize }) => {
  if (!target) return;
  const newTexture = PIXI.Assets.get<PIXI.Texture>(newTextureName);
  if (!newTexture) return;
  const size = options?.size ?? target.getSize();
  target.texture = newTexture;
  target.setSize(size.width, size.height);
}

/** changes text value and compensates the position */
export const changeTextSilently = (target: PIXI.BitmapText | PIXI.Text | undefined, value: number | string) => {
  if (!target) return;
  target.text = value;
  target.position.x = target.parent.width/2 - target.width/2;
}

/** sets pivot in the center of target and position in the center of parent */
export const centralize = (target: PIXI.Container | PIXI.Sprite | PIXI.Text, options?: { targetSize?: TSize; parentSize?: TSize }) => {
  const { targetSize, parentSize } = options ?? {};
  if (target instanceof PIXI.Sprite) {
    target.anchor.set(0.5);
  } else {
    const tSize = targetSize ?? target.getSize();
    target.pivot.set(tSize.width/2, tSize.height/2);
  }

  const pSize = parentSize ?? target.parent.getSize();
  target.position.set(pSize.width/2, pSize.height/2);
}

/** returns the coordinate of the center point of the target */
export const getCenterPoint = (target: PIXI.Container | PIXI.Sprite) => {
  const { width, height } = target.getSize();
  return { x: target.position.x + width/2, y: target.position.y + height/2 };
}
