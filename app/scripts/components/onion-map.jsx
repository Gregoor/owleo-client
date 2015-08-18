import React from 'react';
import 'd3';
import _ from 'lodash';
import Vector from 'wacktor';

import MapNavigationMixin from './mixins/MapNavigationMixin';

const SELECTED_CLASS = 'selected';
const HIGHLIGHT_CLASS = 'highlighted';

let sqr = n => Math.pow(n, 2);
let initListOrPush = (map, key, val) => {
  if (map.has(key)) map.get(key).push(val);
  else map.set(key, [val]);
};

const INNER_RAD = 100;
const HEIGHT = 100;

class Onion {

  constructor(svg, concepts) {
    this.g = d3.select(svg).append('g').attr('transform', 'translate(400, 400)');
    this.drawLayer(concepts);
  }

  drawLayer(concepts, rad=INNER_RAD, height=HEIGHT, color='white', pos=0,
            totalWidth=Math.PI * 2) {
    if (!concepts.length) return;
    let total = concepts.reduce((t, concept) => t + concept.containeeCount, 0);

    let outerRad = rad + height;

    for (let concept of concepts) {
      let relWidth = concept.containeeCount / total;
      let width = relWidth * totalWidth;
      let newPos = pos + width;

      if (concept.color) color = concept.color;

      let arc = d3.svg.arc()
        .innerRadius(rad)
        .outerRadius(outerRad)
        .startAngle(pos)
        .endAngle(newPos);

      this.g.append('path')
        .attr('d', arc)
        .style({'fill': color, 'stroke': 'black'})
        .append('svg:title').text(concept.name);

      let circum = (newPos - pos) * (rad + height / 2);
      let middleRad =  rad + height / 2;
      let text = concept.name;
      if (circum > height) {
        let fontSize = Math.min(1.5 * circum / text.length, 90);

        let innerArc = d3.svg.arc()
          .innerRadius(middleRad)
          .outerRadius(middleRad)
          .startAngle(pos)
          .endAngle(newPos);

        let pathLength = this.g.append('path')
          .attr({'d': innerArc, 'id': concept.id})
          .style('fill', 'transparent')
          .node().getTotalLength();

        let textEl = this.g.append('text')
          .style('font-size', fontSize)
          .append('textPath')
          .attr({
            'dominant-baseline': 'central',
            'xlink:href': `#${concept.id}`
          })
          .text(text);
console.log(pathLength / 2, textEl.node().getComputedTextLength() / 2);
        textEl.attr('startOffset', pathLength / 4 - textEl.node().getComputedTextLength() / 2);
      } else {
        let center = pos + width / 2;
        let fontSize = Math.min(circum / 1.2, 150 / text.length);
        let invCenter = Math.PI - center;
        let x = Math.sin(invCenter) * middleRad;
        let y = Math.cos(invCenter) * middleRad;
        let rotation = (center - Math.PI/2) * 57;
        if (center > Math.PI) rotation += 180;
        this.g.append('text')
          .attr({
            x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
            'transform': `rotate(${rotation} ${x},${y})`
          })
          .style({
            'font-size': fontSize, 'fill': 'black'
          })
          .text(text)
      }

      this.drawLayer(concept.containees, outerRad, height, color, pos,
        width);
      pos = newPos;
    }
  }

}

let OnionMap = React.createClass({

  propTypes: {
    concepts: React.PropTypes.object,
    selectedConceptId: React.PropTypes.string,
    focusedConceptId: React.PropTypes.string,
    onSelect: React.PropTypes.func
  },

  mixins: [MapNavigationMixin],

  componentWillMount() {
    this.onNavStateChange = () => {
      let {pos, prevScale, scale} = this.navState;

      this.g.attr('transform',
        `matrix(${scale}, 0, 0, ${scale}, ${pos.x}, ${pos.y})`
      );
    };
  },

  componentWillReceiveProps(props) {
    if (props.concepts) {
      this.g = new Onion(this.refs.map.getDOMNode(), props.concepts).g;
    }
  },

  render() {
    return <svg className={`map ${this.state.panning ? 'grabbed' : ''}`}
                onWheel={this.onScroll} ref="map"></svg>
  }


});

export default OnionMap;
