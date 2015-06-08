import React from 'react';
import 'd3';
import _ from 'lodash';
import Vector from 'wacktor';

import MapNavigationMixin from './mixins/MapNavigationMixin';
import MapPhysicsMixin from './mixins/MapPhysicsMixin';

const SELECTED_CLASS = 'selected';
const HIGHLIGHT_CLASS = 'highlighted';

const LINK_WIDTH = 1;
const ARROW_WIDTH = 5;
const ARROW_HEIGHT = 10;

let sqr = n => Math.pow(n, 2);
let initListOrPush = (map, key, val) => {
	if (map.has(key)) map.get(key).push(val);
	else map.set(key, [val]);
};

let GraphMap = React.createClass({

	WIDTH: 500,
	HEIGHT: 500,
	BASE_RAD: 10,

	propTypes: {
		concepts: React.PropTypes.object,
		selectedConceptId: React.PropTypes.string,
		focusedConceptId: React.PropTypes.string,
		onSelect: React.PropTypes.func,
		physical: React.PropTypes.bool
	},

	mixins: [MapNavigationMixin, MapPhysicsMixin],

	componentWillMount() {
		this.concepts = new Map();
		this.conceptNodes = new Map();
		this.layers = new Map();
		this.reqLinks = new Map();
		this.labels = [];
		this.selectedAt = 0;

		this.onNavStateChange = this.renderD3;
	},

	componentDidMount() {
		this.update(this.props);
	},

	componentWillReceiveProps(props) {
		this.update(props);
	},

	update(props) {
		let {concepts, physical, selectedConceptId, focusedConceptId,
			filter} = props;

		this.buildMap(concepts);

		if (this.physicsInited) {
			if (physical) {
				this.startPhysics();
				this.startAnimationLoop();
			} else {
				this.stopPhysics();
				this.stopAnimationLoop();
			}
		} else if (physical) {
			this.physicsInited = true;
			for (let layer of this.layers.values()) this.addPhysicsTo(layer);
			this.startAnimationLoop();
		}

		if (this.links && selectedConceptId != this.state.selectedConceptId) {
			this.setState({selectedConceptId});
			this.group.selectAll(`.${SELECTED_CLASS}`)
				.classed(SELECTED_CLASS, false);
			if (selectedConceptId) {
				let conceptNode = this.conceptNodes.get(selectedConceptId);
				if (conceptNode) {
					conceptNode.classList.add(SELECTED_CLASS);
					let linkNodes = this.reqLinks.get(selectedConceptId);
					if (linkNodes) linkNodes.forEach(el => {
						el.classList.add(SELECTED_CLASS);
					});
				}
			}
		}

		this.focusOn(focusedConceptId);
	},

	buildMap(concepts) {
		if (!concepts || this.mapBuilt) return;
		const {WIDTH, HEIGHT} = this;
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
			if (container && !concept.color) concept.color = container.color;
			initListOrPush(containers, container, concept);
		}

		let links = [];
		for (let [id, c] of concepts) for (let req of c.reqs) {
			links.push({'from': concepts.get(req), 'to': c});
		}

		let reqLinks = this.reqLinks;
		this.links = this.group.selectAll('.link')
			.data(links)
			.enter().append('polygon')
			.attr('class', 'link')
			.each(function (d) {
				initListOrPush(reqLinks, d.from.id, this);
				initListOrPush(reqLinks, d.to.id, this);
			});

		this.createHierarchy(this.group, containers.get(null));
		this.renderLinks();
		this.renderD3();
	},

	focusOn(conceptId) {
		let focusedConcept = this.concepts.get(conceptId);
		if (!conceptId || !focusedConcept) return;

		let boundingRect = this.getDOMNode().getBoundingClientRect();
		this.transitioning = true;
		this.setNavState({
			'pos': {
				'x': boundingRect.width / 2 - focusedConcept.absX,
				'y': boundingRect.height / 2 - focusedConcept.absY
			}
		});
	},

	createHierarchy(parentEl, concepts) {
		let self = this;
		if (!concepts || concepts.length == 0) return;

		this.createNodesFor(parentEl, concepts).each(function (d) {
			self.createHierarchy(d3.select(this), self.containers.get(d.id));
		});
	},

	createNodesFor(parentEl, concepts) {
		let self = this;
		let container = this.concepts.get(concepts[0].container) ||
			{'absX': 0, 'absY': 0};

		let links = [];
		for (let i = 0; i < concepts.length; i++) {
			let concept = concepts[i];
			for (let j = 0; j < concepts.length; j++) {
				if (_.includes(concept.reqs, concepts[j].id)) {
					links.push({'source': j, 'target': i});
				}
			}
		}

		let el = parentEl.selectAll('.node').data(concepts).enter()
			.append('g').attr('class', 'node')
			.each(function(d) {
				self.conceptNodes.set(d.id, this);
			});

		let onClick = function(d) {
			if (!self.state.wasPanning) {
				self.props.onSelect(d.id);
				this.selectedAt = Date.now();
			}
		};
		let circle = el.append('circle')
			.style({
				'stroke': d => d.color || (d.color = container.color) || 'white',
				'fill': 'rgba(0, 0, 0, .05)'
			})
			.on('mouseover', function(d) {
				let linkNodes = self.reqLinks.get(d.id);
				if (linkNodes) linkNodes.forEach(el => {
					d3.select(el).classed(HIGHLIGHT_CLASS, true);
				});
				d3.select(this).classed(HIGHLIGHT_CLASS, true);
			})
			.on('mouseout', function(d) {
				let linkNodes = self.reqLinks.get(d.id);
				if (linkNodes) linkNodes.forEach(el => {
					d3.select(el).classed(HIGHLIGHT_CLASS, false);
				});
				d3.select(this).classed(HIGHLIGHT_CLASS, false);
			})
			.on('click', onClick);

		circle.append('title').text(d => d.name);

		let label = el.append('text')
			.text(d => d.name)
			.on('click', onClick)
			.attr({
				'class': 'label',
				'x': function (d) {
					return -this.getComputedTextLength() / 2
				}
			})
			.each(function() {
				self.labels.push(this);
			});

		let layer = {container, concepts, links, el, circle, label};
		this.layers.set(container.id, layer);
		this.renderLayer(layer);

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
		else if (Date.now() - this.selectedAt > 1000) this.props.onSelect();
	},

	renderD3() {
		let {pos, prevScale, scale} = this.navState;

		const MIN_TEXT_R = 9;
		if (prevScale != scale) {
			let invScale = 1 / scale;
			d3.selectAll(this.labels)
				.attr('transform', `scale(${invScale})`)
				.attr('y', d => (d.r + 18) * scale)
				.style('opacity', d => {
					let scaledR = d.r * scale;
					return scaledR > MIN_TEXT_R ? 1 : Math.pow(scaledR, 5) / Math.pow(MIN_TEXT_R, 5);
				});
			d3.selectAll(Array.from(this.conceptNodes.values()))
				.style('opacity', d => {
					let scaledR = d.r * scale;
					return scaledR > MIN_TEXT_R ? 1 : scaledR / MIN_TEXT_R;
				});
		}

		this.getGroup().attr('transform',
			`matrix(${scale}, 0, 0, ${scale}, ${pos.x}, ${pos.y})`
		);
	},

	renderLayer(layer) {
		const HALF_WIDTH = this.WIDTH / 2;
		const HALF_HEIGHT = this.HEIGHT / 2;
		const {BASE_RAD} = this;
		let {el, circle, label, container} = layer;

		el.attr('transform', d => `translate(
            ${d.x - HALF_WIDTH},
            ${d.y - HALF_HEIGHT})
        `)
			.each((d) => {
				_.assign(d, {
					'absX': container.absX - HALF_WIDTH + d.x,
					'absY': container.absY - HALF_HEIGHT + d.y
				});
			});

		circle.attr('r', d => d.r = BASE_RAD +
				(!this.containers.has(d.id) ? 0 :
					this.containers.get(d.id).reduce((maxR, concept) => {
						let {x, y, r} = concept;
						if (!r) r = BASE_RAD;
						return Math.max(
							maxR,
							r + Math.sqrt(sqr(x - HALF_WIDTH) + sqr(y - HALF_HEIGHT))
						);
					}, 0)
				)
		);

		label.attr('y', d => d.r + 18);
	},

	renderLinks() {
		this.links
			.each(function(d) {
				let fromV = new Vector(d.from.absX, d.from.absY);
				let toV = new Vector(d.to.absX, d.to.absY);

				let between = fromV.sub(toV).norm();
				let invertBetween = between.norm().neg();
				let orthBetween = (new Vector(-between.y, between.x)).norm();

				if (d.from.container != d.to.container) {
					this.classList.add('long-distance-relationship');
				}

				let fromRad = between.mul(d.from.r);
				let toRad = between.mul(d.to.r);

				fromV = fromV.sub(fromRad);
				let arrowTop = toV = toV.add(toRad);

				toV = toV
					.sub(invertBetween.mul(ARROW_HEIGHT))
					.sub(invertBetween.mul(4));

				let fromL = fromV.add(orthBetween.mul(LINK_WIDTH));
				let fromR = fromV.sub(orthBetween.mul(LINK_WIDTH));

				let toL = toV.add(orthBetween.mul(LINK_WIDTH));
				let toR = toV.sub(orthBetween.mul(LINK_WIDTH));

				let arrowL = orthBetween.mul(ARROW_WIDTH).add(toV);
				let arrowR = orthBetween.mul(-ARROW_WIDTH).add(toV);

				d.points = [fromL, fromR, toR, arrowR, arrowTop, arrowL, toL];
			})
			.attr('points', d => d.points.reduce((str, v) => {
				return `${str} ${v.x},${v.y}`;
			}, ''));
	},

	startAnimationLoop() {
		if (this.animated) return;
		this.animated = true;
		this.animationLoop();
	},

	stopAnimationLoop() {
		this.animated = false;
	},

	animationLoop() {
		if (!this.animated) return;
		window.requestAnimationFrame(() => {
			for (let layer of this.layers.values()) this.renderLayer(layer);
			this.renderLinks();
			this.animationLoop();
		});
	},

	getGroup() {
		if (this.transitioning) {
			this.transitioning = false;
			return this.group.transition();
		} else {
			return this.group;
		}
	}

});

export default GraphMap;
