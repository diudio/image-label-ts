import { IContainerCanvas } from './ContainerCanvas.js';
import { Layer, ILayer, LayerCanvas } from './Layer.js';
export declare type TPoints = Array<{
    x: number;
    y: number;
}>;
export declare type TPointsSvg = Array<[number, number]>;
export interface IPolygonStatic {
    init(containerCanvas: IContainerCanvas, option: IPolygonOption): IPolygon;
    new (containerCanvas: IContainerCanvas, option: IPolygonOption): IPolygon;
    transformOriginPointsToSVG(points: TPoints, scale: number, offsetX: number, offsetY: number): TPointsSvg;
    transformSVGPointsToOrigin(points: TPointsSvg, scale: number, offsetX: number, offsetY: number): TPoints;
}
export interface IPolygon extends ILayer, IPolygonOption {
    points: TPoints;
    setOption(option: IPolygonOptionIn): any;
    reDraw(option: IPolygonOptionIn): any;
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
export declare class Polygon extends Layer implements IPolygon {
    points: any;
    style: any;
    able: any;
    canvasOnce: any;
    constructor(canvas: IContainerCanvas, option: IPolygonOptionIn);
    static init(canvas: IContainerCanvas, option: IPolygonOptionIn): Polygon;
    static transformOriginPointsToSVG(params: {
        points: TPoints;
        scale: number;
        offsetX: number;
        offsetY: number;
    }): number[][];
    static transformSVGPointsToOrigin(params: {
        points: TPointsSvg;
        scale: number;
        offsetX: number;
        offsetY: number;
    }): {
        x: number;
        y: number;
    }[];
    transformOriginPointsToSVG(points: any): TPointsSvg;
    transformSVGPointsToOrigin(points: any): TPoints;
    remove(): void;
    select(): void;
    setOption(option: IPolygonOptionIn): void;
    private draw;
    reDraw(option: IPolygonOptionIn): void;
}
export declare class PolygonCanvas extends LayerCanvas {
    containerCanvas: IContainerCanvas;
    polygonCanvas: any;
    private tempPath;
    private polyPath;
    private closePoint;
    constructor(canvas: IContainerCanvas);
    static init(canvas: IContainerCanvas): PolygonCanvas;
    private drawTempPath;
    private drawPolyPathHandler;
    private polygonCountIsClose;
    private pathToPolygon;
    remove(): void;
    private currentNodeMovePosition;
    private mouseMoveFollow;
    private removeFollower;
}
