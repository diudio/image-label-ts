import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.topoly.js';
import { LayerTypeEnum } from './Layer';
import {
  Polygon,
  IPolygon,
  IPolygonOptionIn,
  IPolygonOptionInExceptPoints,
  PolygonCanvas,
  TPoints,
} from './Polygon';
import { merge } from 'lodash-es';
import { ISelectLayer } from './SelectLayer';
import { loadImage } from './utils';

export interface IContainerCanvasStatic {
  new (el: HTMLElement, option: IContainerCanvasOptionIn): IContainerCanvas;
  init(el: HTMLElement, option: IContainerCanvasOptionIn): IContainerCanvas;
}

export enum ModeEnum {
  default = 'default',
  drag = 'drag',
  poly = 'poly',
}

interface IPolygonOptionMorePoints extends IPolygonOptionInExceptPoints {
  points: TPoints[];
}

export interface IContainerCanvas extends IContainerCanvasOption {
  root: any; // 根 svg dom
  canvas: any; // canvas dom
  layerCanvas: any; // layer画布, 手动画图时使用
  layers: IPolygon[]; // 标注的图形
  labelImage: any; // 标注的图
  transform: {
    scale: number; // 缩放比
    fixedOffset: Boolean;
    offsetX: number; // 偏移量
    offsetY: number;
  };

  setOption(option: IContainerCanvasOptionIn);
  setMode(mode: ModeEnum); // 设置mode
  toggleMode(mode1: ModeEnum, mode2: ModeEnum); // 设置mode
  clear(); // 清除整个画布
  getLayers(type: LayerTypeEnum): IPolygon[]; // 获取所有的图形
  getLayersByName(type: LayerTypeEnum, name: string): IPolygon[]; // 获取所有的图形
  removeLayerByLayer(layer: IPolygon); // 根据多边形删除多边形
  removeLayerById(id: string); // 根据id删除多边形
  drawDone();

  loadImage(imageUrl: string, imageWidth?: number, imageHeight?: number); // 加载图片

  drawMask(color: string);
  drawPolygonImages(points: TPoints[], imageUrl?:string);

  drawLayer(type: LayerTypeEnum.polygon, option: IPolygonOptionIn); // 绘制一个图形
  // drawLayer(type: LayerTypeEnum.rect, option: IPolygonOptionIn); // 绘制一个图形

  drawLayers(type: LayerTypeEnum.polygon, option: IPolygonOptionMorePoints[]); // 绘制多个图形

  hideLayers(type: LayerTypeEnum.polygon): void;
  showLayers(type: LayerTypeEnum.polygon): void;

  hideLayersByName(type: LayerTypeEnum.polygon, name: string): void;
  showLayersByName(type: LayerTypeEnum.polygon, name: string): void;

  loadImageAndDrawLayers(
    imageUrl: string,
    options?: Array<{ type: LayerTypeEnum.polygon; option: IPolygonOptionMorePoints[] }>,
  ); // 切换图片并且绘制多边形

}

export interface IContainerCanvasOption {
  width: number;
  height: number;
  zoom: {
    zoomFactor: number;
    zoomMin: number;
    zoomMax: number;
  };
  style: {
    color: string;
    fillColor: string;
    selectFillColor: string;
    strokeWidth: number;
    circleRadius: number;
  };
  layerName: string;
  mode: ModeEnum;
  event: {
    draw(layer: IPolygon): void;
    select(layer: IPolygon): void;
    remove(layer: IPolygon): void;
    dragEnd(layer: IPolygon): void;
    clickCanvas(): void;
    beforeLoadImage(): void;
    loadedImage(): void;
  };
  transform: {
    scale: number;
    fixedOffset: Boolean;
    offsetX: number;
    offsetY: number;
  };
}

export interface IContainerCanvasOptionIn {
  width: number;
  height: number;
  zoom?: {
    zoomFactor?: number;
    zoomMin?: number;
    zoomMax?: number;
  };
  style?: {
    color?: string;
    fillColor?: string;
    selectFillColor?: string;
    strokeWidth?: number;
    circleRadius?: number;
  };
  layerName?: string;
  mode?: ModeEnum;
  event?: {
    draw?(layer: IPolygon): void;
    select?(layer: IPolygon): void;
    remove?(layer: IPolygon): void;
    dragEnd?(layer: IPolygon): void;
    clickCanvas?(): void;
    beforeLoadImage?(): void;
    loadedImage?(): void;
  };
  transform?: {
    fixedOffset?: Boolean;
    offsetX?: number;
    offsetY?: number;
  };
}

export const defaultContainerCanvasOption = {
  width: 0,
  height: 0,
  zoom: {
    zoomFactor: 0.5,
    zoomMin: 0.5,
    zoomMax: 20,
  },
  style: {
    color: '#E1600A',
    fillColor: 'rgba(0, 0, 0, 0)',
    selectFillColor: 'rgba(0, 0, 0, 0)',
    strokeWidth: 2,
    circleRadius: 4,
  },
  layerName: 'default-layer',
  mode: ModeEnum.default,
  event: {
    draw: () => {},
    select: () => {},
    remove: () => {},
    dragEnd: () => {},
    clickCanvas: () => {},
    beforeLoadImage: () => {},
    loadedImage: () => {},
  },
  transform: {
    scale: 1,
    fixedOffset: false,
    offsetX: 0,
    offsetY: 0,
  },
};

export class ContainerCanvas {
  root: any;
  canvas: any;
  layerCanvas: any; // layer画布, 手动画图时使用
  layers: IPolygon[] = []; // 标注的图形
  labelImage: any; // 标注的图
  selectLayer: ISelectLayer | undefined;
  polygonCanvas: any;

  width;
  height;
  zoom;
  style;
  layerName;
  mode;
  event;
  transform;

  private imageUrl = '';
  private drawImageWidth = 0;
  private drawImageHeight = 0;

  constructor(el: HTMLElement, option: IContainerCanvasOptionIn) {
    this.setOption(option);

    this.root = SVG().addTo(el).attr({ style: 'vertical-align: bottom' });
    this.root.zoomNum = 1;
    this.canvas = this.root.group().attr({ id: 'canvas' });

    this.root.size(this.width, this.height).viewbox(0, 0, this.width, this.height);
    if (this.mode !== ModeEnum.default) {
      this.root = this.root.panZoom(this.zoom);
    }

    this.root.on('zoom', (lvl) => {
      this.root.zoomNum = lvl.detail.level;
      this.canvas.find('path').forEach((path) => {
        path.attr({
          'stroke-width': this.style.strokeWidth / lvl.detail.level,
        });
      });
      this.canvas.find('polyline').forEach((polyline) => {
        polyline.attr({
          'stroke-width': this.style.strokeWidth / lvl.detail.level,
        });
      });
      this.canvas.find('circle').forEach((circle) => {
        circle.radius(this.style.circleRadius / lvl.detail.level);
      });
    });
    this.canvas.on('click', () => {
      this.selectLayer && this.selectLayer.removeSelect();
      this.selectLayer = undefined;
      this.event.clickCanvas && this.event.clickCanvas()
    });
  }

  static init(el: HTMLElement, option: IContainerCanvasOptionIn): IContainerCanvas {
    return new ContainerCanvas(el, option);
  }

  setOption(option: IContainerCanvasOptionIn) {
    const _option: IContainerCanvasOption = merge({}, defaultContainerCanvasOption, option);
    Object.keys(_option).forEach((key) => {
      // this[key] = _option[key];
      this[key] = this[key] || _option[key];
    });
  }

  setMode(mode: ModeEnum) {
    this.mode = mode;
    switch (mode) {
      case ModeEnum.drag:
        this.polygonCanvas && this.polygonCanvas.remove();
        this.polygonCanvas = null;
        break;
      case ModeEnum.poly:
        // 创建layer画布
        this.polygonCanvas = PolygonCanvas.init(this);
        break;
      case ModeEnum.default:
        break;
    }
  }

  toggleMode(mode1: ModeEnum, mode2: ModeEnum) {
    if (this.mode === mode1) {
      this.setMode(mode2);
    } else {
      this.setMode(mode1);
    }
  }

  // 清除整个画布
  clear() {
    this.canvas.children().forEach((child) => {
      child.remove();
    });
    this.layers = [];
  }

  // 获取所有的图形 (ContainerCanvas实例是个ref时, containerCanvas.layers也会变成响应式)
  getLayers(type: LayerTypeEnum): IPolygon[] {
    return this.layers.filter((layer) => layer.type === type);
  }

  // 获取所有的图形
  getLayersByName(type: LayerTypeEnum, name: string): IPolygon[] {
    return this.getLayers(type).filter((layer) => layer.name === name);
  }

  // 根据多边形删除多边形
  removeLayerByLayer(layer: IPolygon) {
    layer.remove();
    for (let i = 0; i < this.layers.length; i++) {
      if (this.layers[i] === layer) {
        this.layers.splice(i, 1);
        return;
      }
    }
  }

  // 根据多边形删除多边形
  removeLayerById(id: string) {
    const layer = this.layers.find(item => item.id === id)
    if (layer) {
      layer.remove();
      const index = this.layers.indexOf(layer)
      this.layers.splice(index, 1);
    }
  }

  drawDone() {
    this.root.off('mousemove');
    this.setMode(ModeEnum.drag);
    this.event.draw && this.event.draw(this.layers[this.layers.length - 1]);
  }

  private loadImageStack: Promise<any>[] = [];

  private loadImagePool = (imageUrl, fn) => {
    return new Promise((resolve) => {
      const p = loadImage(imageUrl);
      this.loadImageStack.push(p);
      p.then((image) => {
        if (this.loadImageStack[this.loadImageStack.length - 1] === p) {
          fn.call(this, image);
        }
        this.loadImageStack.splice(0, this.loadImageStack.indexOf(p));
        resolve(null);
      });
    });
  };

  // 加载图片
  async loadImage(imageUrl: string, imageWidth?: number, imageHeight?: number) {
    this.imageUrl = imageUrl;
    if (this.mode !== ModeEnum.default) {
      this.setMode(ModeEnum.drag);
    }
    this.root.zoom(1);
    this.root.zoomNum = 1;
    if (this.mode !== ModeEnum.default) {
      this.root = this.root.panZoom(this.zoom);
    }
    this.root.viewbox(0, 0, this.width, this.height);

    this.clear();
    this.layers = [];

    if (!imageUrl) {
      return;
    }
    this.event.beforeLoadImage && this.event.beforeLoadImage();
    await this.loadImagePool(imageUrl, (image: { width: number; height: number }) => {
      this.event.loadedImage && this.event.loadedImage();
      imageWidth = imageWidth || image.width;
      imageHeight = imageHeight || image.height;
      this.transform.scale = Math.max(imageWidth / this.width, imageHeight / this.height);
      this.drawImageWidth = imageWidth / this.transform.scale;
      this.drawImageHeight = imageHeight / this.transform.scale;
      if (!this.transform.fixedOffset) {
        this.transform.offsetX = (this.width - this.drawImageWidth) / 2;
        this.transform.offsetY = (this.height - this.drawImageHeight) / 2;
      }
      this._loadImage(imageUrl).size(this.drawImageWidth, this.drawImageHeight).attr({
        x: this.transform.offsetX,
        y: this.transform.offsetY,
      });
    });
  }

  private _loadImage(imageUrl: string) {
    const image = this.canvas.findOne('#labelImage-background');
    if (image) {
      image.load(imageUrl);
      return image;
    } else {
      this.labelImage = this.canvas.image(imageUrl).attr({ id: 'labelImage-background' });
      return this.labelImage;
    }
  }

  // 画蒙层
  drawMask(color:string) {
    this.canvas
      .rect(this.drawImageWidth, this.drawImageHeight)
      .fill(color)
      .attr({ x: this.transform.offsetX, y: this.transform.offsetY });
  }

  // 画一个图片的多边形可使区域
  drawPolygonImages(points: TPoints[], imageUrl = this.imageUrl) {
    if (!points || !points.length) return;
    const pattern = this.root
      .defs()
      .pattern()
      .attr({ x: this.transform.offsetX, y: this.transform.offsetY });
    pattern.image(imageUrl).size(this.drawImageWidth, this.drawImageHeight);

    points.forEach(point => {
      const _points = Polygon.transformOriginPointsToSVG({
        points: point,
        scale: this.transform.scale,
        offsetX: this.transform.offsetX,
        offsetY: this.transform.offsetY,
      });
  
      const str = _points.map((item) => `${item[0]},${item[1]}`).join(' ');
  
      this.canvas.polygon(str).fill(pattern);
    })
  }

  // 绘制一个图形
  drawLayer(type: LayerTypeEnum, option: IPolygonOptionIn) {
    if (type === LayerTypeEnum.polygon) {
      try {
        this.layers.push(Polygon.init(this, option));
      } catch (e) {
        console.error('drawLayer error', e);
      }
    }
  }

  // 绘制多个图形
  drawLayers(type: LayerTypeEnum.polygon, options: IPolygonOptionMorePoints[]) {
    options.forEach((option) => {
      option.points.forEach((point) => {
        this.drawLayer(type, {
          ...option,
          points: point,
        });
      });
    });
  }

  hideLayers(type: LayerTypeEnum.polygon) {
    this.getLayers(type).forEach((item) => {
      item.dom.style.display = 'none';
    });
  }

  showLayers(type: LayerTypeEnum.polygon) {
    this.getLayers(type).forEach((item) => {
      item.dom.style.display = 'block';
    });
  }

  hideLayersByName(type: LayerTypeEnum.polygon, name: string) {
    this.getLayersByName(type, name).forEach((item) => {
      item.dom.node.style.display = 'none';
    });
  }

  showLayersByName(type: LayerTypeEnum.polygon, name: string) {
    this.getLayersByName(type, name).forEach((item) => {
      item.dom.node.style.display = 'block';
    });
  }

  // 切换图片并且绘制多边形
  async loadImageAndDrawLayers(
    imageUrl: string,
    options?: Array<{ type: LayerTypeEnum.polygon; option: IPolygonOptionMorePoints[] }>,
  ) {
    await this.loadImage(imageUrl);
    (options || []).forEach((option) => {
      if (option.type === LayerTypeEnum.polygon) {
        this.drawLayers(option.type, option.option);
      }
    });
  }
}
