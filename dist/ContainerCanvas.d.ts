import '@svgdotjs/svg.panzoom.js';
import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.topoly.js';
import { LayerTypeEnum } from './Layer';
import { IPolygon, IPolygonOptionIn, IPolygonOptionInExceptPoints, TPoints } from './Polygon';
import { ISelectLayer } from './SelectLayer';
export interface IContainerCanvasStatic {
    new (el: HTMLElement, option: IContainerCanvasOptionIn): IContainerCanvas;
    init(el: HTMLElement, option: IContainerCanvasOptionIn): IContainerCanvas;
}
export declare enum ModeEnum {
    default = "default",
    drag = "drag",
    poly = "poly"
}
interface IPolygonOptionMorePoints extends IPolygonOptionInExceptPoints {
    points: TPoints[];
}
export interface IContainerCanvas extends IContainerCanvasOption {
    root: any;
    canvas: any;
    layerCanvas: any;
    layers: IPolygon[];
    labelImage: any;
    transform: {
        scale: number;
        fixedOffset: Boolean;
        offsetX: number;
        offsetY: number;
    };
    setOption(option: IContainerCanvasOptionIn): any;
    setMode(mode: ModeEnum): any;
    toggleMode(mode1: ModeEnum, mode2: ModeEnum): any;
    clear(): any;
    getLayers(type: LayerTypeEnum): IPolygon[];
    getLayersByName(type: LayerTypeEnum, name: string): IPolygon[];
    removeLayerByLayer(layer: IPolygon): any;
    drawDone(): any;
    loadImage(imageUrl: string, imageWidth?: number, imageHeight?: number): any;
    drawLayer(type: LayerTypeEnum.polygon, option: IPolygonOptionIn): any;
    drawLayers(type: LayerTypeEnum.polygon, option: IPolygonOptionMorePoints[]): any;
    hideLayers(type: LayerTypeEnum.polygon): void;
    showLayers(type: LayerTypeEnum.polygon): void;
    hideLayersByName(type: LayerTypeEnum.polygon, name: string): void;
    showLayersByName(type: LayerTypeEnum.polygon, name: string): void;
    loadImageAndDrawLayers(imageUrl: string, options?: Array<{
        type: LayerTypeEnum.polygon;
        option: IPolygonOptionMorePoints[];
    }>): any;
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
        beforeLoadImage?(): void;
        loadedImage?(): void;
    };
    transform?: {
        fixedOffset?: Boolean;
        offsetX?: number;
        offsetY?: number;
    };
}
export declare const defaultContainerCanvasOption: {
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
        draw: () => void;
        select: () => void;
        remove: () => void;
        dragEnd: () => void;
        beforeLoadImage: () => void;
        loadedImage: () => void;
    };
    transform: {
        scale: number;
        fixedOffset: boolean;
        offsetX: number;
        offsetY: number;
    };
};
export declare class ContainerCanvas {
    root: any;
    canvas: any;
    layerCanvas: any;
    layers: IPolygon[];
    labelImage: any;
    selectLayer: ISelectLayer | undefined;
    polygonCanvas: any;
    width: any;
    height: any;
    zoom: any;
    style: any;
    layerName: any;
    mode: ModeEnum;
    event: any;
    transform: any;
    private imageUrl;
    private drawImageWidth;
    private drawImageHeight;
    constructor(el: HTMLElement, option: IContainerCanvasOptionIn);
    static init(el: HTMLElement, option: IContainerCanvasOptionIn): IContainerCanvas;
    setOption(option: IContainerCanvasOptionIn): void;
    setMode(mode: ModeEnum): void;
    toggleMode(mode1: ModeEnum, mode2: ModeEnum): void;
    clear(): void;
    getLayers(type: LayerTypeEnum): IPolygon[];
    getLayersByName(type: LayerTypeEnum, name: string): IPolygon[];
    removeLayerByLayer(layer: IPolygon): void;
    drawDone(): void;
    private loadImageStack;
    private loadImagePool;
    loadImage(imageUrl: string, imageWidth?: number, imageHeight?: number): Promise<void>;
    private _loadImage;
    drawMask(color: any): void;
    drawPolygonImage(points: any, imageUrl?: string): void;
    drawLayer(type: LayerTypeEnum, option: IPolygonOptionIn): void;
    drawLayers(type: LayerTypeEnum.polygon, options: IPolygonOptionMorePoints[]): void;
    hideLayers(type: LayerTypeEnum.polygon): void;
    showLayers(type: LayerTypeEnum.polygon): void;
    hideLayersByName(type: LayerTypeEnum.polygon, name: string): void;
    showLayersByName(type: LayerTypeEnum.polygon, name: string): void;
    loadImageAndDrawLayers(imageUrl: string, options?: Array<{
        type: LayerTypeEnum.polygon;
        option: IPolygonOptionMorePoints[];
    }>): Promise<void>;
}
export {};
