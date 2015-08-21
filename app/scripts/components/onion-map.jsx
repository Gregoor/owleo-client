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

  constructor(svg, concepts, opts) {
    this.g = d3.select(svg).append('g').attr('transform', 'translate(400, 400)');
    this.opts = _.assign({
      'onClick': _.noop
    }, opts);
    this.groups = new Map();
    this.hiddenGroups = [];
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

      let text = concept.name;
      let group = this.g.append('g');

      this.groups.set(concept.id, group);

      group.append('path')
        .attr('d', arc)
        .style({'fill': color, 'stroke': 'black', 'cursor': 'pointer'})
        .on('click', () => this.onClick(concept))
        .append('svg:title').text(text);

      let circum = (newPos - pos) * (rad + height / 2);
      let middleRad =  rad + height / 2;

      if (circum > height) {
        let fontSize = Math.min(1.5 * circum / text.length, 90);

        let innerArc = d3.svg.arc()
          .innerRadius(middleRad)
          .outerRadius(middleRad)
          .startAngle(pos)
          .endAngle(newPos);

        let pathLength = group.append('path')
          .attr({'d': innerArc, 'id': concept.id})
          .style('fill', 'transparent')
          .node().getTotalLength();

        let textEl = group.append('text')
          .style({
            'font-size': fontSize, 'cursor': 'pointer', 'pointer-events': 'none'
          })
          .append('textPath')
          .attr({
            'dominant-baseline': 'central',
            'xlink:href': `#${concept.id}`
          })
          .text(text);

        textEl.attr('startOffset', pathLength / 4 - textEl.node().getComputedTextLength() / 2);
      } else {
        let center = pos + width / 2;
        let fontSize = Math.min(circum / 1.2, 150 / text.length);
        let invCenter = Math.PI - center;
        let x = Math.sin(invCenter) * middleRad;
        let y = Math.cos(invCenter) * middleRad;
        let rotation = (center - Math.PI/2) * 57;
        if (center > Math.PI) rotation += 180;
        group.append('text')
          .attr({
            x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
            'transform': `rotate(${rotation} ${x},${y})`
          })
          .style({
            'font-size': fontSize, 'fill': 'black',
            'cursor': 'pointer', 'pointer-events': 'none'
          })
          .text(text)
      }

      this.drawLayer(concept.containees, outerRad, height, color, pos,
        width);
      pos = newPos;
    }
  }

  onClick(concept) {
    this.opts.onClick(concept);
  }

  highlight(conceptId) {
    if (conceptId) for (let [id, group] of this.groups) {
      if (id != conceptId) {
        this.hiddenGroups.push(group.style('opacity', .3));
      } else {
        group.style('opacity', 1);
      }
    } else {
      this.hiddenGroups.forEach(group => group.style('opacity', 1));
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
    let self = this;
    let {concepts, selectedConceptId} = props;

    if (!this.onion && concepts) {
      let svgNode = this.refs.map.getDOMNode();
      this.onion = new Onion(svgNode, concepts, {
        onClick(concept) {
          self.props.onSelect(concept.id);
        }
      });
      this.onion.highlight(selectedConceptId);
      this.g = this.onion.g;
    }

    if (this.onion && selectedConceptId != this.props.selectedConceptId) {
      this.onion.highlight(selectedConceptId);
    }
  },

  render() {
    return <svg className={`map ${this.state.panning ? 'grabbed' : ''}`}
                onWheel={this.onScroll} ref="map"></svg>
  }


});

export default OnionMap;
