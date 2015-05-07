import React from 'react';
import 'd3';
import _ from 'lodash';
import Victor from 'victor';

import MapNavigationMixin from './mixins/MapNavigationMixin';
import MapPhysicsMixin from './mixins/MapPhysicsMixin';

const SELECTED_CLASS = 'selected';

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

	componentDidMount() {
		this.concepts = new Map();
		this.layers = [];
		this.reqLinks = new Map();
		this.update(this.props);
	},

	componentWillReceiveProps(props) {
		this.update(props);
	},

	update(props) {
		let {concepts, physical, selectedConceptId, focusedConceptId} = props;

		this.buildMap(concepts);

		if (this.physicsInited) {
			if (physical) {
				this.startPhysics();
				this.startAnimationLoop();
			} else {
				this.stopPhysics();
				this.stopAnimationLoop();
			}
		} else if (physical && this.layers) {
			this.physicsInited = true;
			this.layers.forEach(l => this.addPhysicsTo(l));
			this.startAnimationLoop();
		}

		if (selectedConceptId && this.links &&
				selectedConceptId != this.props.selectedConceptId) {
			this.group.selectAll(`.link.${SELECTED_CLASS}`)
				.classed(SELECTED_CLASS, false);
			let linkNodes = this.reqLinks.get(selectedConceptId);
			if (linkNodes) linkNodes.forEach(el => {
				el.classList.add(SELECTED_CLASS);
			});
		}

		this.focusOn(focusedConceptId);
	},

	buildMap(concepts) {
		if (!concepts || this.mapBuilt) return;
		const {WIDTH, HEIGHT} = this;
		this.mapBuilt = true;
		let svg = d3.select(this.getDOMNode())
			.attr({'width': WIDTH, 'height': HEIGHT});

		let glowFilter = svg.append('defs')
			.append('filter').attr('id', 'white-glow');

		glowFilter.append('feColorMatrix').attr({'type': 'matrix', 'values': `
			0 0 0 0 .8
			0 0 0 0 .8
			0 0 0 0 .8
			.3 .3 .3 .3 0
		`});

		glowFilter.append('feGaussianBlur')
			.attr({'stdDeviation': 2.5, 'result': 'boloredBlur'});
		let blurMerge = glowFilter.append('feMerge');
		blurMerge.append('feMergeNode').attr('in', 'colordBlur');
		blurMerge.append('feMergeNode').attr('in', 'SourceGraphic');

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
			.enter().append('line')
			.attr('class', 'link')
			.each(function (d) {
				initListOrPush(reqLinks, d.from.id, this);
				initListOrPush(reqLinks, d.to.id, this);
			});

		this.createHierarchy(this.group, containers.get(null));
		this.renderLinks();
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
			.append('g').attr('class', 'node');

		let self = this;
		let onClick = function(d) {
			if (!self.state.wasPanning) self.props.onSelect(d.id);
		};
		let circle = el.append('circle')
			.style({
				'stroke': d => d.color || (d.color = container.color) || 'white',
				'fill': 'rgba(0, 0, 0, .05)'
			})
			.on('mouseover', function(d) {
				let linkNodes = self.reqLinks.get(d.id);
				if (linkNodes) linkNodes.forEach(el => {
					d3.select(el).attr('filter', 'url(#white-glow)');
				});
				d3.select(this).attr('filter', 'url(#white-glow)');
			})
			.on('mouseout', function(d) {
				let linkNodes = self.reqLinks.get(d.id);
				if (linkNodes) linkNodes.forEach(el => {
					d3.select(el).attr('filter', null);
				});
				d3.select(this).attr('filter', null);
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
			});

		let layer = {container, concepts, links, el, circle, label};
		this.layers.push(layer);
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
		else this.props.onSelect();
	},

	renderD3() {
		let {pos, scale} = this.navState;

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
			this.layers.forEach(l => this.renderLayer(l));
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
