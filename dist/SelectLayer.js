import { Polygon } from './Polygon.js';
import { LayerTypeEnum } from './Layer.js';
export class SelectLayer {
    containerCanvas;
    layer;
    selectDom;
    cloneDom;
    constructor(layer) {
        this.layer = layer;
        this.containerCanvas = layer.containerCanvas;
        this.removeSelect();
        this.selectDom = this.containerCanvas.canvas.group().size().attr({ id: 'select' });
        this.cloneDom = this.layer.dom
            .clone()
            .attr({
            stroke: this.layer.style.color,
            fill: this.layer.style.selectFillColor,
            name: 'select-polygon',
            'stroke-dasharray': '10,10',
        })
            .on('click', function (e) {
            e.stopPropagation();
        })
            .addTo(this.containerCanvas.canvas.findOne('#select'));
        if (this.layer.able.remove) {
            this.createCloseBtn();
        }
        if (this.layer.able.drag) {
            this.selectDom.draggable().on('dragstart', () => {
                // 拖动遮罩区域时，隐藏选中图形
                layer.dom.hide();
            });
            this.createLayerDraggableCircle();
            this.selectDom.on('dragend', this.layerMaskDragendHandler.bind(this));
        }
    }
    static init(layer) {
        return new SelectLayer(layer);
    }
    removeSelect() {
        this.containerCanvas.canvas.find('#select').remove();
    }
    removeLayer() {
        this.removeSelect();
        this.layer.dom.remove();
        this.containerCanvas.event.remove && this.containerCanvas.event.remove(this.layer);
    }
    createCloseBtn() {
        let minIndex = 0;
        let left = 5;
        let top = -40;
        const points = this.layer.dom.plot();
        points.forEach((item, index) => {
            if (item[1] < points[minIndex][1]) {
                minIndex = index;
            }
        });
        if (points[minIndex][0] + 45 > this.containerCanvas.width) {
            left = -45;
        }
        if (points[minIndex][1] - 40 < 0) {
            top = 0;
        }
        if (this.selectDom.closeBtn) {
            this.selectDom.closeBtn.remove();
        }
        this.selectDom.closeBtn = this.containerCanvas.canvas
            .image(new URL('./icon_close.png', import.meta.url).href)
            .size(40, 40)
            .attr({
            x: points[minIndex][0] + left,
            y: points[minIndex][1] + top,
            style: 'cursor: pointer',
        })
            .on('click', () => {
            this.removeLayer();
            this.containerCanvas.removeLayerByLayer(this.layer);
        })
            .addTo(this.containerCanvas.canvas.findOne('#select'));
    }
    createLayerDraggableCircle() {
        const points = [...this.cloneDom.array()];
        points.pop();
        points.map(([cx, cy], index) => {
            const circle = this.selectDom.circle();
            return circle
                .radius(this.layer.style.circleRadius / this.containerCanvas.root.zoomNum)
                .attr({
                cx,
                cy,
                fill: this.layer.style.color,
                index,
            })
                .draggable()
                .on('click', (e) => {
                e.stopPropagation();
            })
                .on('dragstart', () => {
                this.layer.dom.hide();
            })
                .on('dragmove', this.layerMaskCircleDragmoveHandler.bind(this, circle))
                .on('dragend', this.layerMaskDragendCircleHandler.bind(this));
        });
    }
    layerMaskCircleDragmoveHandler(circle) {
        const { cx, cy, index } = circle.attr(['cx', 'cy', 'index']);
        const pointsArray = this.cloneDom.array();
        pointsArray[index] = [cx, cy];
        if (index === 0) {
            pointsArray[pointsArray.length - 1] = [cx, cy];
        }
        this.cloneDom.plot(pointsArray.join().replace(/,/g, ' '));
    }
    layerMaskDragendHandler() {
        this.layer.dom._array = this.cloneDom.array();
        this.layer.dom.plot(this.cloneDom.array().join().replace(/,/g, ' ')).show();
        this.dragEnd();
    }
    dragEnd() {
        // 多边形
        if (this.layer.type === LayerTypeEnum.polygon) {
            const points = Polygon.transformSVGPointsToOrigin({
                points: this.cloneDom.array(),
                scale: this.containerCanvas.transform.scale,
                offsetX: this.containerCanvas.transform.offsetX,
                offsetY: this.containerCanvas.transform.offsetY,
            });
            this.layer.setOption({
                points: points,
            });
        }
        if (this.containerCanvas.event.dragEnd) {
            this.containerCanvas.event.dragEnd(this.layer);
        }
    }
    layerMaskDragendCircleHandler() {
        this.layer.dom.plot(this.cloneDom.array().join().replace(/,/g, ' ')).show();
        this.selectDom.closeBtn.remove();
        this.selectDom.closeBtn = null;
        this.createCloseBtn();
        this.dragEnd();
    }
}
//# sourceMappingURL=SelectLayer.js.map