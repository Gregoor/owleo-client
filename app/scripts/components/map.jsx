import React from 'react';
import 'd3';
import _ from 'lodash';
import 'victor';

let MapNavigationMixin = require('./mixins/MapNavigationMixin');

const WIDTH = 500, HEIGHT = 500;
const HF_WIDTH = WIDTH / 2, HF_HEIGHT = HEIGHT / 2;
const BASE_RAD = 10;
const OUTER_STRENGTH = -.3;

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

		let svg = d3.select(this.getDOMNode())
			.attr({'width': WIDTH, 'height': HEIGHT});

		this.group = svg.append('g')
			.attr('transform', `translate(${WIDTH / 2}, ${HEIGHT / 2})`);

		this.animated = false;

		this.concepts = concepts;
		let containers = this.containers = new Map();
		for (let [id, concept] of concepts) {
			let {container} = concept;
			if (!containers.has(container)) containers.set(container, [concept]);
			else containers.get(container).push(concept);
		}

		this.stuff(this.group, containers.get(null));

		let links = [];
		for (let [id, c] of concepts) for (let reqData of c.reqs) {
			let req = concepts.get(reqData.id);
			links.push({'from': req, 'to': c});
		}

		this.links = this.group.selectAll('.link')
			.data(links)
			.enter().append('line')
			.attr('class', 'link');
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

		let container = this.concepts.get(concepts[0].container) ||
			{'absX': 0, 'absY': 0};


		let links = [];
		for (let i = 0; i < concepts.length; i++) {
			let concept = concepts[i];
			concept.force = force;
			for (let j = 0; j < concepts.length; j++) {
				if (_.find(concept.reqs, r => r.id == concepts[j].id)) {
					links.push({'source': j, 'target': i});
				}
			}
		}

		force.nodes(concepts).links(links).start();

		let el = parentEl.selectAll('.node').data(concepts).enter()
			.append('g').attr('class', 'node');

		let circle = el.append('circle')
			.style({'stroke': d => d.color || 'white', 'fill': '#1f1f1f'});
			//.call(force.drag);

		circle.append('title').text(d => d.name);

		let label = el.append('text')
			.text(d => d.name)
			.attr({
				'class': 'label',
				'x': function(d) { return -this.getComputedTextLength() / 2 }
			});

		force.on('tick', (e) => {
			el.attr('transform', d => `translate(
            ${d.x - HF_WIDTH},
            ${d.y - HF_HEIGHT})
        `)
				.each((d) => {
					_.assign(d, {
						'absX': container.absX - HF_WIDTH + d.x,
						'absY': container.absY - HF_HEIGHT + d.y
					});
					for (let req of d.reqs) {
						let source = this.concepts.get(req.id);
						let x = source.absX - d.absX, y = source.absY - d.absY;
						let k, sqLength;
						if (sqLength = x * x + y * y) {
							let length = Math.sqrt(sqLength);
							let dist = _(req.siblings)
								.map(id => this.concepts.get(id))
								.reduce((r, c) => c.r + r, - 2 * BASE_RAD);
							console.log(dist);
							length = e.alpha * OUTER_STRENGTH * (length - dist) / length;
							x *= length;
							y *= length;
							d.x -= x * (k = 1 / 2);
							d.y -= y * k;
							source.x += x * (k = 1 - k);
							source.y += y * k;
						}
					}
				});

			this.links.attr({
					'x1': d => d.from.absX,
					'y1': d => d.from.absY,
					'x2': d => d.to.absX,
					'y2': d => d.to.absY
			});

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

			label.attr('y', d => d.r + 18);

			force
				.charge(d => -200 + sqr(d.r) * -.18)
				.linkDistance(d => d.source.r + d.target.r + 2 * BASE_RAD)
				.start();

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
	}

});

export default D3Map;
