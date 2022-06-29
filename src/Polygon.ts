import { IContainerCanvas } from './ContainerCanvas';
import { Layer, ILayer, LayerCanvas } from './Layer';
import { LayerTypeEnum } from './Layer';
import { SelectLayer } from './SelectLayer';
import { merge } from 'lodash-es';

export type TPoints = Array<{ x: number; y: number }>; // 传入和传出的点位格式
export type TPointsSvg = Array<[number, number]>; // svg内部绘制的点位格式

export interface IPolygonStatic {
  init(containerCanvas: IContainerCanvas, option: IPolygonOption): IPolygon;
  new (containerCanvas: IContainerCanvas, option: IPolygonOption): IPolygon;
  transformOriginPointsToSVG(
    points: TPoints,
    scale: number,
    offsetX: number,
    offsetY: number,
  ): TPointsSvg;
  transformSVGPointsToOrigin(
    points: TPointsSvg,
    scale: number,
    offsetX: number,
    offsetY: number,
  ): TPoints;
}

export interface IPolygon extends ILayer, IPolygonOption {
  points: TPoints;
  setOption(option: IPolygonOptionIn);
  reDraw(option: IPolygonOptionIn);

  transformOriginPointsToSVG(points: TPoints): TPointsSvg;
  transformSVGPointsToOrigin(points: TPointsSvg): TPoints;
}

export interface IPolygonOption {
  name: string;
  points: TPoints;
  style: {
    color: string;
    fillColor: string;
    selectFillColor: string;
    strokeWidth: number;
    circleRadius: number;
  };
  able: {
    click: boolean;
    drag: boolean;
    remove: boolean;
  };
}

export interface IPolygonOptionInExceptPoints {
  id?: string;
  name?: string;
  style?: {
    color?: string;
    fillColor?: string;
    selectFillColor?: string;
    strokeWidth?: number;
    circleRadius?: number;
  };
  able?: {
    click?: boolean;
    drag?: boolean;
    remove?: boolean;
  };
}

export interface IPolygonOptionIn extends IPolygonOptionInExceptPoints {
  points: TPoints;
}

const defaultIPolygonOption = {
  name: '',
  points: [],
  style: {
    color: '#E1600A',
    fillColor: 'rgba(0, 0, 0, 0)',
    selectFillColor: 'rgba(0, 0, 0, 0)',
    strokeWidth: 2,
    circleRadius: 4,
  },
  able: {
    click: false,
    drag: true,
    remove: true,
  },
};

export class Polygon extends Layer implements IPolygon {
  points;
  style;
  able;

  canvasOnce: any;

  constructor(canvas: IContainerCanvas, option: IPolygonOptionIn) {
    super();

    this.containerCanvas = canvas;
    const { x, y, width, height } = this.containerCanvas.labelImage.attr([
      'x',
      'y',
      'width',
      'height',
    ]);
    this.canvasOnce = this.containerCanvas.canvas
      .group()
      .attr({ id: 'polygonCanvas-polygon-once', width, height });
    this.canvasOnce.rect(width, height).attr({ x, y });
    this.setOption(option);
    if (!this.id) {
      this.id = Math.floor(Math.random()*1e10).toString()
    }
    this.draw();
  }

  static init(canvas: IContainerCanvas, option: IPolygonOptionIn) {
    return new Polygon(canvas, option);
  }

  static transformOriginPointsToSVG(params: {
    points: TPoints;
    scale: number;
    offsetX: number;
    offsetY: number;
  }) {
    const { points, scale, offsetX, offsetY } = params;
    return points.map((item) => [item.x / scale + offsetX, item.y / scale + offsetY]);
  }
  static transformSVGPointsToOrigin(params: {
    points: TPointsSvg;
    scale: number;
    offsetX: number;
    offsetY: number;
  }) {
    const { points, scale, offsetX, offsetY } = params;
    const res = points.map((item) => ({
      x: Math.round((item[0] - offsetX) * scale),
      y: Math.round((item[1] - offsetY) * scale),
    }));
    res.pop();
    return res;
  }

  transformOriginPointsToSVG(points): TPointsSvg {
    const { scale = 1, offsetX = 0, offsetY = 0 } = this.containerCanvas.transform;
    return points.map((item) => [item.x / scale + offsetX, item.y / scale + offsetY]);
  }

  transformSVGPointsToOrigin(points): TPoints {
    const { scale = 1, offsetX = 0, offsetY = 0 } = this.containerCanvas.transform;
    const res = points.map((item) => ({
      x: Math.round((item[0] - offsetX) * scale),
      y: Math.round((item[1] - offsetY) * scale),
    }));
    res.pop();
    return res;
  }

  remove() {
    this.dom.remove();
  }

  select() {
    this.containerCanvas.event.select(this);
    this.containerCanvas.selectLayer = SelectLayer.init(this);
  }

  // todo 此api出错率高，可做单元测试
  setOption(option: IPolygonOptionIn) {
    this.type = LayerTypeEnum.polygon;
    const _option = merge({}, defaultIPolygonOption, this, JSON.parse(JSON.stringify(option))); // 深度合并
    Object.keys(_option).forEach((key) => {
      this[key] = option[key] ? _option[key] : this[key] || defaultIPolygonOption[key];
    });
  }

  private draw() {
    const pointsFormat = this.transformOriginPointsToSVG(this.points).map((item) => {
      return ['L', item[0], item[1]];
    });
    pointsFormat.unshift([
      'M',
      pointsFormat[pointsFormat.length - 1][1],
      pointsFormat[pointsFormat.length - 1][2],
    ]);

    const polyPath = this.containerCanvas.canvas
      .path()
      .plot(['M', pointsFormat[0][1], pointsFormat[0][2]].join().replace(/,/g, ' '))
      .attr({
        stroke: this.style.color,
        fill: 'none',
        'stroke-width': this.style.strokeWidth / this.containerCanvas.root.zoomNum,
      });
    try {
      this.dom = polyPath
        .plot(pointsFormat.join().replace(/,/g, ' '))
        .toPoly()
        .attr({
          color: this.style.color,
          stroke: this.style.color,
          'stroke-width': this.style.strokeWidth / this.containerCanvas.root.zoomNum,
          fill: this.style.fillColor,
          type: 'polygon',
        })
        .addTo(this.containerCanvas.canvas);
    } catch (e) {
      console.error('draw error', e);
      this.canvasOnce.remove();
      this.canvasOnce = null;
    }

    this.dom.attr({ name: this.name });
    if (this.able.click) {
      this.dom.on('click', (e) => {
        this.select();
        e.stopPropagation();
      });
    }

    this.canvasOnce.remove();
    this.canvasOnce = null;
    return this;
  }

  // todo
  reDraw(option: IPolygonOptionIn) {
    this.setOption(option);
    // ...
  }
}

export class PolygonCanvas extends LayerCanvas {
  containerCanvas: IContainerCanvas;
  polygonCanvas: any;
  private tempPath: any; // 描述手动绘图的dom对象
  private polyPath: any; // 描述手动绘图的dom对象
  private closePoint: any; // 手动绘图时首尾连通的那个点

  constructor(canvas: IContainerCanvas) {
    super();

    this.containerCanvas = canvas;
    const { x, y, width, height } = this.containerCanvas.labelImage.attr([
      'x',
      'y',
      'width',
      'height',
    ]);
    this.polygonCanvas = this.containerCanvas.canvas
      .group()
      .attr({ id: 'drawLayer', width, height });
    this.polygonCanvas
      .rect(width, height)
      .attr({ x, y, 'fill-opacity': 0 })
      .on('mousemove', this.mouseMoveFollow.bind(this));

    this.polygonCanvas.pathPoints = [];
    this.tempPath = null;
    this.polygonCanvas.on('mousemove', this.drawTempPath.bind(this));
    this.polygonCanvas.on('mousemove', this.polygonCountIsClose.bind(this));
    this.polygonCanvas.on('click', this.drawPolyPathHandler.bind(this));
  }

  static init(canvas: IContainerCanvas) {
    return new PolygonCanvas(canvas);
  }

  private drawTempPath(e) {
    if (this.polygonCanvas.pathPoints.length > 0) {
      const [x, y] = this.currentNodeMovePosition(e);
      const tempPathArray = this.polyPath.array();
      tempPathArray[this.polygonCanvas.pathPoints.length] = ['L', x, y];
      if (!this.tempPath) {
        this.tempPath = this.polygonCanvas
          .path()
          .plot(tempPathArray.join().replace(/,/g, ' '))
          .attr({
            stroke: this.containerCanvas.style.color,
            fill: this.containerCanvas.style.fillColor,
            'fill-opacity': 0.6,
            'stroke-width':
              this.containerCanvas.style.strokeWidth / this.containerCanvas.root.zoomNum,
            'stroke-dasharray': '10,10',
          });
      } else {
        this.tempPath.plot(tempPathArray.join().replace(/,/g, ' '));
      }
    }
  }

  // 点击回调事件，绘点
  private drawPolyPathHandler(e) {
    const [x, y] = this.currentNodeMovePosition(e);
    if (this.polygonCanvas.pathPoints.length === 0) {
      this.polygonCanvas.pathPoints.push(
        this.polygonCanvas
          .circle()
          .radius(this.containerCanvas.style.circleRadius / this.containerCanvas.root.zoomNum)
          .attr({ cx: x, cy: y, fill: this.containerCanvas.style.color, id: 'begin' }),
      );
      this.polyPath = this.polygonCanvas
        .path()
        .plot(['M', x, y].join().replace(/,/g, ' '))
        .attr({
          stroke: this.containerCanvas.style.color,
          fill: 'none',
          'stroke-width':
            this.containerCanvas.style.strokeWidth / this.containerCanvas.root.zoomNum,
        });
    } else {
      this.polygonCanvas.pathPoints.push(
        this.polygonCanvas
          .circle()
          .radius(this.containerCanvas.style.circleRadius / this.containerCanvas.root.zoomNum)
          .attr({ cx: x, cy: y, fill: this.containerCanvas.style.color }),
      );
      // pathArray 为构成图形的点位
      const pathArray = this.polyPath.array();
      pathArray.push(['L', x, y]);
      this.polyPath.plot(pathArray.join().replace(/,/g, ' '));
    }
  }

  // 检测鼠标是否移动到了多边形的第一个点（是否形成封闭多边形）
  private polygonCountIsClose(e) {
    if (this.polygonCanvas.pathPoints.length > 2) {
      const [x, y] = this.currentNodeMovePosition(e);
      const { cx, cy } = this.polygonCanvas.pathPoints[0].attr(['cx', 'cy']);
      const a = Math.abs(cx - x);
      const b = Math.abs(cy - y);
      if (Math.sqrt(a * a + b * b) < 15 / this.containerCanvas.root.zoomNum) {
        if (!this.closePoint) {
          this.closePoint = this.polygonCanvas
            .circle()
            .radius(15 / this.containerCanvas.root.zoomNum)
            .attr({
              cx,
              cy,
              fill: this.containerCanvas.style.color,
              'fill-opacity': 0.5,
            })
            .on('click', (e) => {
              this.pathToPolygon();
              e.stopPropagation();
            });
        }
        this.polygonCanvas.followCircle && this.polygonCanvas.followCircle.hide();
        this.closePoint?.show();
        const tempPathArray = this.polyPath.array();
        tempPathArray[this.polygonCanvas.pathPoints.length] = ['L', cx, cy];
        this.tempPath.plot(tempPathArray.join().replace(/,/g, ' '));
      } else {
        if (this.closePoint) {
          this.closePoint.remove();
          this.closePoint = null;
        }
        this.polygonCanvas.followCircle && this.polygonCanvas.followCircle.show();
      }
    }
  }

  private pathToPolygon() {
    const points = this.polyPath.array().map((item) => {
      return [item[1], item[2]];
    });

    const formatPoints = Polygon.transformSVGPointsToOrigin({
      points,
      scale: this.containerCanvas.transform.scale,
      offsetX: this.containerCanvas.transform.offsetX,
      offsetY: this.containerCanvas.transform.offsetY,
    });

    this.containerCanvas.drawLayer(LayerTypeEnum.polygon, {
      name: this.containerCanvas.layerName,
      points: formatPoints,
      style: {
        color: this.containerCanvas.style.color,
        fillColor: this.containerCanvas.style.fillColor,
        selectFillColor: this.containerCanvas.style.selectFillColor,
        strokeWidth: this.containerCanvas.style.strokeWidth,
        circleRadius: this.containerCanvas.style.circleRadius,
      },
      able: {
        click: true,
        drag: true,
        remove: true,
      },
    });

    this.remove();
    this.containerCanvas.drawDone && this.containerCanvas.drawDone();
  }

  remove() {
    if (this.containerCanvas.canvas.findOne('#drawLayer')) {
      this.containerCanvas.canvas.findOne('#drawLayer').remove();
    }
    this.polygonCanvas = null;
    this.tempPath = null;
    this.polyPath = null;
    this.closePoint = null;
  }

  private currentNodeMovePosition(e) {
    const bgNode = this.containerCanvas.root.findOne('#labelImage-background').node;
    const { x, y } = bgNode === null ? { x: 0, y: 0 } : bgNode.getClientRects()[0];
    return [
      (1 / this.containerCanvas.root.zoomNum) *
        (e.clientX - x + this.containerCanvas.transform.offsetX),
      (1 / this.containerCanvas.root.zoomNum) *
        (e.clientY - y + this.containerCanvas.transform.offsetY),
    ];
  }

  private mouseMoveFollow(e) {
    const [cx, cy] = this.currentNodeMovePosition(e);
    this.containerCanvas.root.on('mousemove', this.removeFollower.bind(this));
    const polygonCanvas = this.polygonCanvas;
    if (!polygonCanvas.followCircle) {
      polygonCanvas.followCircle = polygonCanvas
        .circle()
        .radius(this.containerCanvas.style.circleRadius / this.containerCanvas.root.zoomNum)
        .attr({ cx, cy, fill: this.containerCanvas.style.color })
        .on('mousemove', (e) => {
          const [x, y] = this.currentNodeMovePosition(e);
          polygonCanvas.followCircle.attr({ cx: x, cy: y });
        });
    } else {
      polygonCanvas.followCircle.attr({ cx, cy });
    }
  }

  private removeFollower(e) {
    if (this.containerCanvas.root) {
      const polygonCanvas = this.polygonCanvas;
      const [cx, cy] = this.currentNodeMovePosition(e);
      const { width, height } = polygonCanvas.attr(['width', 'height']);
      if (cx > width || cy > height || cx < 0 || cy < 0) {
        if (polygonCanvas.followCircle) {
          polygonCanvas.followCircle.remove();
          polygonCanvas.followCircle = null;
          this.containerCanvas.root.off('mousemove');
        }
      }
    }
  }
}
