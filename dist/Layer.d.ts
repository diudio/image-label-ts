import { IContainerCanvas } from './ContainerCanvas.js';
export declare enum LayerTypeEnum {
    polygon = "polygon"
}
export interface ILayer {
    containerCanvas: IContainerCanvas;
    type: LayerTypeEnum;
    dom: any;
    name: string;
    remove(): any;
    select(): any;
}
export declare class Layer {
    containerCanvas: any;
    type: any;
    dom: any;
    name: any;
    constructor();
}
export declare class LayerCanvas {
    constructor();
}
