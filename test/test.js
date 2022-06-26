'use strict';
import { expect }  from 'chai';
import { Polygon }  from '../dist/index.js';
import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.topoly.js';

describe('Polygon transformOriginPointsToSVG', () => {
  it('should return right', () => {
    const result = Polygon.transformOriginPointsToSVG({
      points: [{x: 100, y: 100}, {x: 150, y: 150}, {x: 100, y: 150}],
      scale: 1, 
      offsetX: 0, 
      offsetY: 0, 
    });
    expect(result).to.equal([[100, 100], [150, 150], [100, 150]]);
  });
});