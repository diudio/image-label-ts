import { IContainerCanvas } from './ContainerCanvas';

export enum LayerTypeEnum {
  polygon = 'polygon',
  // rect = 'rect',
}

export interface ILayer {
  containerCanvas: IContainerCanvas;
  type: LayerTypeEnum;
  dom: any;
  name: string;
  remove();
  select(); // 被选中
}

export class Layer {
  containerCanvas;
  type;
  dom;
  name;
  constructor() {}
}

export class LayerCanvas {
  constructor() {}
}
