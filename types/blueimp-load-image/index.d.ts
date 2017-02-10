
export interface ILoadImageOptions {
  crossOrigin?: boolean;
  noRevoke?: boolean;
  aspectRatio?: number;
  crop?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  sourceWidth?: number;
  sourceHeight?: number;
  contain?: boolean;
  cover?: boolean;
  pixelRatio?: number;
  downsamplingRatio?: number;
  orientation?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | true;
  meta?: true;
}


export interface ILoadImageCanvasOptions extends ILoadImageOptions {
  canvas: true;
}

interface ILoadImage {
  (file: File, callback: (HTMLImageElement) => void, options: ILoadImageOptions);
  (file: File, callback: (HTMLCanvasElement) => void, options: ILoadImageCanvasOptions);
};

export = ILoadImage;
