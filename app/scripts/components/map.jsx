import React from 'react';
import 'd3';
import _ from 'lodash';
import Victor from 'victor';

let MapNavigationMixin = require('./mixins/MapNavigationMixin');

const WIDTH = 500, HEIGHT = 500;
const HF_WIDTH = WIDTH / 2, HF_HEIGHT = HEIGHT / 2;
const BASE_RAD = 10;
const OUTER_STRENGTH = -.3;

let sqr = n => Math.pow(n, 2);

let GraphMap = React.createClass({

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

		let links = [];
		for (let [id, c] of concepts) for (let req of c.reqs) {
			links.push({'from': concepts.get(req), 'to': c});
		}

		this.links = this.group.selectAll('.link')
			.data(links)
			.enter().append('line')
			.attr('class', 'link');

		this.renderLinks();
		this.createDeepForces(this.group, containers.get(null));
	},

	createDeepForces(parentEl, concepts) {
		let self = this;
		if (!concepts || concepts.length == 0) return;

		this.createForceLayout(parentEl, concepts).each(function (d) {
			self.createDeepForces(d3.select(this), self.containers.get(d.id));
		});
	},

	createForceLayout(parentEl, concepts) {
		let force = d3.layout.force().size([WIDTH, HEIGHT]);

		let container = this.concepts.get(concepts[0].container) ||
			{'absX': 0, 'absY': 0};

		let links = [];
		for (let i = 0; i < concepts.length; i++) {
			let concept = concepts[i];
			concept.force = force;
			for (let j = 0; j < concepts.length; j++) {
				if (_.includes(concept.reqs, concepts[j].id)) {
					links.push({'source': j, 'target': i});
				}
			}
		}

		force.nodes(concepts).links(links).start();

		let el = parentEl.selectAll('.node').data(concepts).enter()
			.append('g').attr('class', 'node');

		let onClick = (d => {
			if (!this.state.wasPanning) this.props.onSelect(d.id);
		}).bind(this);
		let circle = el.append('circle')
			.style({'stroke': d => d.color || 'white', 'fill': 'transparent'})
			.on('click', onClick);
			//.call(force.drag);

		circle.append('title')
			.text(d => d.name).on('click', onClick);

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
					//for (let i = 0; i < d.reqs.length; i++) {
					//	let req = d.reqs[i];
					//	if (!_.isObject(req)) req = d.reqs[i] = {
					//		'other': this.concepts.get(req), 'lastDists': [], 'targetDist': 50
					//	};
					//	let {other, lastDists} = req;
					//	let x = other.absX - d.absX, y = other.absY - d.absY;
					//	let k, sqDist;
					//	if (sqDist = x * x + y * y) {
					//		let dist = Math.sqrt(sqDist);
                    //
					//		//lastDists.push(dist);
					//		//lastDists = req.lastDists = _.drop(lastDists, lastDists.length - 30);
                    //
					//		//let total = lastDists.reduce((n, t) => t + n, 0);
					//		//let deviation = (total - req.targetDist) / (lastDists.length || 1);
					//		//if (deviation > 50) req.targetDist += .3;
					//		//else if (deviation < 30) req.targetDist -= .1;
                    //
					//		let distFrac = (dist - req.targetDist) / dist;
					//		let multiplier = (e.alpha / 4) * OUTER_STRENGTH * distFrac;
					//		x *= multiplier;
					//		y *= multiplier;
					//		d.x -= x * (k = 1 / 2);
					//		d.y -= y * k;
					//		req.x += x * (k = 1 - k);
					//		req.y += y * k;
					//	}
					//}
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
				.charge(d => -200 + sqr(d.r) * -.19)
				.linkDistance(d => d.source.r + d.target.r + 2 * BASE_RAD)
				.start();

			//if (container && container.force) container.force.resume();
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

	renderLinks() {
		this.links
			.each(d => {
				let scale = (v, n) => v.clone().multiply(new Victor(n, n));
				let fromV = new Victor(d.from.absX, d.from.absY);
				let toV = new Victor(d.to.absX, d.to.absY);

				let betweenV = fromV.clone().subtract(toV).norm();

				let fromRadV = scale(betweenV, d.from.r);
				let toRadV = scale(betweenV, d.to.r);

				fromV.subtract(fromRadV);
				toV.add(toRadV);

				_.assign(d, {
					'x1': fromV.x, 'y1': fromV.y,
					'x2': toV.x, 'y2': toV.y
				});
			})
			.attr({
				'x1': d => d.x1, 'y1': d => d.y1,
				'x2': d => d.x2, 'y2': d => d.y2
			});

		window.requestAnimationFrame(this.renderLinks);
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

export default GraphMap;
