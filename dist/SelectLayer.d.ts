import { IPolygon } from './Polygon';
import { IContainerCanvas } from './ContainerCanvas';
export interface ISelectLayerStatic {
    containerCanvas: IContainerCanvas;
    layer: IPolygon;
    new (layer: IPolygon): ISelectLayer;
    init(layer: IPolygon): ISelectLayer;
}
export interface ISelectLayer {
    containerCanvas: IContainerCanvas;
    layer: IPolygon;
    selectDom: any;
    cloneDom: any;
    removeLayer(): void;
    removeSelect(): void;
}
export declare class SelectLayer {
    containerCanvas: IContainerCanvas;
    layer: IPolygon;
    selectDom: any;
    cloneDom: any;
    constructor(layer: IPolygon);
    static init(layer: IPolygon): SelectLayer;
    removeSelect(): void;
    removeLayer(): void;
    private createCloseBtn;
    private createLayerDraggableCircle;
    private layerMaskCircleDragmoveHandler;
    private layerMaskDragendHandler;
    private dragEnd;
    private layerMaskDragendCircleHandler;
}
