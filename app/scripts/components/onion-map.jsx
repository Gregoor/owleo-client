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

const INNER_RAD = 0;
const HEIGHT = 300;

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

      let arc = d3.svg.arc()
        .innerRadius(rad)
        .outerRadius(outerRad)
        .startAngle(pos)
        .endAngle(newPos);

      if (concept.color) color = concept.color;

      this.g.append('path')
        .attr('d', arc)
        .style({'fill': color, 'stroke': 'black'})
        .append('svg:title').text(concept.name);

      let innerArc = d3.svg.arc()
        .innerRadius(rad)
        .outerRadius(rad + height / 2)
        .startAngle(pos)
        .endAngle(newPos);

      this.g.append('path')
        .attr({'d': innerArc, 'id': concept.id})
        .style('fill', 'transparent');

      if (rad * width > 100) this.g.append('text')
        .style('font-size', 20)
        .append('textPath')
          .attr({
            'xlink:href': `#${concept.id}`,
            'textLength': rad * width, 'startOffset': '10%'
          })
          .text(concept.name);

      this.drawLayer(concept.containees, outerRad, height * .8, color, pos,
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
