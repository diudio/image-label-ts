import { IContainerCanvas } from './ContainerCanvas';

export enum LayerTypeEnum {
  polygon = 'polygon',
  // rect = 'rect',
}

export interface ILayer {
  id: string;
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
  id;
  constructor() {}
}

export class LayerCanvas {
  constructor() {}
}
