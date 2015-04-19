import React from 'react';
import 'd3';
import 'lodash';
import 'victor';

let MapNavigationMixin = require('./mixins/MapNavigationMixin');

const WIDTH = 500, HEIGHT = 500;
const HF_WIDTH = WIDTH / 2, HF_HEIGHT = HEIGHT / 2;
const BASE_RAD = 10;

let sqr = n => Math.pow(n, 2);

let D3Map = React.createClass({

	propTypes: {
		concepts: React.PropTypes.object,
		selectedConcept: React.PropTypes.object,
		focusedConceptId: React.PropTypes.string,
		onSelect: React.PropTypes.func
	},

	mixins: [MapNavigationMixin],

	componentDidMount() {
		this.concepts = new Map();
		this.buildMap(this.props);
	},

	componentWillReceiveProps(props) {
		this.buildMap(props);
	},

	buildMap(props) {
		let {concepts} = props;
		if (!concepts || this.mapBuilt) return;
		this.mapBuilt = true;

		this.concepts = concepts;
		let containers = this.containers = new Map();
		for (let [id, concept] of concepts) {
			let {container} = concept;
			if (!containers.has(container)) containers.set(container, [concept]);
			else containers.get(container).push(concept);
		}

		let svg = d3.select(this.getDOMNode())
			.attr({'width': WIDTH, 'height': HEIGHT});

		this.group = svg.append('g')
			.attr('transform', `translate(${WIDTH / 2}, ${HEIGHT / 2})`);

		this.animated = false;

		this.stuff(this.group, containers.get(null));
	},

	stuff(parentEl, concepts) {
		let self = this;
		if (!concepts || concepts.length == 0) return;

		this.addToForceLayout(parentEl, concepts).each(function (d) {
			self.stuff(d3.select(this), self.containers.get(d.id));
		});
	},

	addToForceLayout(parentEl, concepts) {
		let force = d3.layout.force().size([WIDTH, HEIGHT]);

		for (let concept of concepts) concept.force = force;

		force.nodes(concepts).start();

		let el = parentEl.selectAll('.node').data(concepts).enter()
			.append('g').attr('class', 'node');

		let circle = el.append('circle')
			.style({'stroke': d => d.color || 'white', 'fill': 'transparent'})
			.call(force.drag);

		circle.append('title').text(d => d.name);

		force.on('tick', () => {
			el.attr('transform', d => `translate(
            ${d.x - HF_WIDTH},
            ${d.y - HF_HEIGHT})
        `);

			circle.attr('r', d => d.r = BASE_RAD +
				(!this.containers.has(d.id) ? 0 :
					this.containers.get(d.id).reduce((maxR, concept) => {
						let {x, y, r} = concept;
						if (!r) r = BASE_RAD;
						return Math.max(
							maxR,
							r + Math.sqrt(sqr(x - HF_WIDTH) + sqr(y - HF_HEIGHT))
						);
					}, 0)
				)
			);

			force
				.charge(d => -200 + sqr(d.r) * -.18)
				.linkDistance(d => d.source.r + d.target.r + 2 * BASE_RAD)
				.start();

			let container = this.concepts.get(concepts[0].container);
			if (container && container.force) container.force.resume();
		});

		return el;
	},

	render() {
		return (
			<svg className={`map ${this.state.panning ? 'grabbed' : ''}`}
					 onWheel={this.onScroll} onClick={this.onSelect}/>
		);
	},

	onSelect() {
		if (this.state.wasPanning) this.setState({'wasPanning': false});
		else this.props.onSelect();
	},

	renderD3() {
		let pos = this.navState.position;
		let scale = this.navState.scale;

		this.getGroup().attr('transform',
			`matrix(${scale}, 0, 0, ${scale}, ${pos.x}, ${pos.y})`
		);

	},

	getGroup() {
		if (this.animated) {
			this.animated = false;
			return this.group.transition();
		} else {
			return this.group;
		}
	},

});

export default D3Map;
