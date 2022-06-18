<template>
  <div style="padding: 20px">
    <div ref="markImageRef" class="markImage"></div>
    <button @click="onMark">标注</button>
    <button @click="show = !show">隐藏/显示</button>
  </div>
</template>
<script setup lang="ts" name="test1">
  import { ContainerCanvas, IContainerCanvas } from '../ContainerCanvas';
  import { LayerTypeEnum } from '../Layer';
  import { ModeEnum } from '../ContainerCanvas';

  import cat from './miao.jpg';

  const markImageRef = ref<HTMLElement>();
  let containerCanvas: IContainerCanvas;
  const layerName = 'name-dsadas';
  onMounted(async () => {
    markImageRef.value &&
      (containerCanvas = ContainerCanvas.init(markImageRef.value, {
        width: 500,
        height: 400,
        mode: ModeEnum.drag,
        zoom: {
          zoomFactor: 1,
          zoomMin: 0.5,
          zoomMax: 20,
        },
        style: {
          color: 'blue',
          fillColor: 'green',
          selectFillColor: 'red',
          strokeWidth: 5,
          circleRadius: 10,
        },
        layerName: layerName,
        event: {
          draw(layer) {
            console.log('draw', layer);
          },
          select(layer) {
            console.log('select', layer);
          },
          remove(layer) {
            console.log('remove', layer);
          },
          dragEnd(layer) {
            console.log('dragEnd', layer);
          },
          beforeLoadImage() {
            console.log('beforeLoadImage');
          },
          loadedImage() {
            console.log('loadedImage');
          },
        },
      }));
    await containerCanvas.loadImageAndDrawLayers(cat, [
      {
        type: LayerTypeEnum.polygon,
        option: [
          {
            name: layerName,
            points: [
              [
                { x: 0, y: 0 },
                { x: 0, y: 100 },
                { x: 100, y: 100 },
                { x: 100, y: 0 },
              ],
            ],
            style: {
              color: 'blue',
              fillColor: 'rgba(100, 100, 100, .3)',
              selectFillColor: 'rgba(100, 100, 100, .7)',
              strokeWidth: 5,
              circleRadius: 10,
            },
            able: {
              click: true,
              drag: true,
              remove: true,
            },
          },
        ],
      },
    ]);
    containerCanvas.drawMask('rgba(0, 0, 0, 0.5)');
    containerCanvas.drawPolygonImage([
      // { x: 100, y: 100 },
      // { x: 200, y: 100 },
      // { x: 200, y: 300 },
      // { x: 100, y: 300 },
      { x: 30, y: 50 },
      { x: 30, y: 200 },
      { x: 300, y: 200 },
      { x: 300, y: 50 },
    ]);
    containerCanvas.drawLayers(LayerTypeEnum.polygon, [
      {
        name: layerName,
        points: [
          [
            { x: 50, y: 0 },
            { x: 50, y: 100 },
            { x: 100, y: 100 },
            { x: 100, y: 0 },
          ],
        ],
        style: {
          color: 'blue',
          fillColor: 'rgba(100, 100, 100, .3)',
          selectFillColor: 'rgba(100, 100, 100, .7)',
          strokeWidth: 5,
          circleRadius: 10,
        },
        able: {
          click: true,
          drag: true,
          remove: true,
        },
      },
    ]);
  });
  const onMark = () => {
    if (containerCanvas) {
      containerCanvas.toggleMode(ModeEnum.drag, ModeEnum.poly);
    }
  };

  const show = ref(true);
  watch(
    () => show.value,
    (v) => {
      console.log('v', v);
      if (v) {
        containerCanvas?.showLayersByName(LayerTypeEnum.polygon, layerName);
      } else {
        containerCanvas?.hideLayersByName(LayerTypeEnum.polygon, layerName);
      }
    },
  );
</script>
<style>
  .markImage {
    width: 500px;
    height: 400px;
  }
</style>
