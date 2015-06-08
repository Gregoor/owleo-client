import React from 'react';
import _ from 'lodash';
import Vector from 'wacktor';

import MapNavigationMixin from './mixins/MapNavigationMixin';
import MapPhysicsMixin from './mixins/MapPhysicsMixin';

const LINK_WIDTH = 1;
const ARROW_WIDTH = 5;
const ARROW_HEIGHT = 10;
const LABEL_OFFSET = 15;

let sqr = n => Math.pow(n, 2);

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
		this.baseConcepts = [];
		this.links = [];
		this.onNavStateChange = this.renderCanvas;

		window.addEventListener('resize', this.onResize);
		this.onResize();
	},

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize)
	},

	componentDidMount() {
		this.update(this.props);
		this.renderCanvas(this.navState);
	},

	componentWillReceiveProps(props) {
		this.update(props);
	},

	componentDidUpdate() {
		this.renderCanvas();
	},

	render() {
		let {panning, width, height} = this.state;
		return (
			<canvas ref="base" className={`map ${panning ? 'grabbed' : ''}`}
							width={width} height={height}
							onWheel={this.onScroll} onClick={this.onSelect}
							onMouseMove={this.onMouseMove}/>
		);
	},

	onResize() {
		this.setState({'width': window.innerWidth, 'height': window.innerHeight});
	},

	update(props) {
		let {concepts, physical, selectedConceptId, focusedConceptId,
			filter} = props;

		if (concepts && !this.mapBuilt) {
			this.mapBuilt = true;
			for (let [,concept] of concepts) {
				let {container} = concept;
				if (container) {
					container = concepts.get(container);
					if (!container.children) container.children = [concept];
					else container.children.push(concept);
				} else this.baseConcepts.push(concept);

				for (let req of concept.reqs) {
					req = concepts.get(req);
					let data = {'from': req, 'to': concept};
					req.container == concept.container ?
						this.links.unshift(data) :
						this.links.push(data);
				}
			}
		}

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
			this.startAnimationLoop();
		}
		this.focusOn(focusedConceptId);
	},

	focusOn(conceptId) {
	},

	onSelect(event) {
		if (this.state.wasPanning) return;
		let selected = this.getConceptByEvent(event);
		this.props.onSelect(selected ? selected.id : undefined);
	},

	onMouseMove(event) {
		this.hoveredConcept = this.getConceptByEvent(event);
		this.renderCanvas();
	},

	getConceptByEvent(event) {
		let {pageX, pageY} = event;
		let {left, top} = this.refs.base.getDOMNode().getBoundingClientRect();
		let {pos, scale} = this.navState;

		let {x, y} = new Vector(pageX, pageY)
			.sub(left, top)
			.mul(1 / scale)
			.sub(pos.x, pos.y);

		let checkConcepts = this.baseConcepts.slice();
		let selected;
		while (checkConcepts && checkConcepts.length) {
			let concept = checkConcepts.pop();
			let magSq = new Vector(x, y).sub(concept.absX, concept.absY).magSq();
			if (magSq <= sqr(concept.r)) {
				selected = concept;
				checkConcepts = concept.children ? concept.children.slice() : null;
			}
		}
		return selected;
	},

	renderCanvas() {
		let {pos, scale} = this.navState;
		let canvas = this.refs.base.getDOMNode();
		let ctx = canvas.getContext('2d');
		ctx.save();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.scale(scale, scale);
		ctx.translate(pos.x, pos.y);
		ctx.font = '500 13px Roboto';
		this.renderLayer(ctx, this.baseConcepts);
		this.renderLinks(ctx);
		ctx.restore();
	},

	renderLayer(ctx, concepts, containerColor = 'white', xOff = 0, yOff = 0) {
		let {selectedConceptId} = this.props;
		let {width, height} = this.state;
		const HALF_WIDTH = this.WIDTH / 2;
		const HALF_HEIGHT = this.HEIGHT / 2;
		for (let concept of concepts) {
			let {r, name, children} = concept;
			let color = concept.color || containerColor;
			let x = concept.absX =  concept.x + xOff - HALF_WIDTH;
			let y = concept.absY = concept.y + yOff - HALF_HEIGHT;

			ctx.setLineDash(selectedConceptId == concept.id ? [8, 4] : []);
			ctx.strokeStyle = color || 'white';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(x, y, r, 0, 2 * Math.PI);
			ctx.stroke();
			if (concept.id == selectedConceptId ||
					this.hoveredConcept && this.hoveredConcept.id == concept.id) {
				ctx.fillStyle = 'rgba(255, 255, 255, .05)';
				ctx.fill();
			}

			let textWidth = ctx.measureText(name).width;
			ctx.fillStyle = 'white';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = .2;
			let textArgs = [name, x - textWidth / 2, y + r + LABEL_OFFSET];
			ctx.fillText(...textArgs);
			ctx.strokeText(...textArgs);

			if (children) this.renderLayer(ctx, children, color, x, y);
		}
	},

	renderLinks(ctx) {
		let {selectedConceptId} = this.props;
		for (let link of this.links) {
			let linkOfConcept = conceptId => {
				return link.from.id == conceptId || link.to.id == conceptId;
			};
			let fromV = new Vector(link.from.absX, link.from.absY);
			let toV = new Vector(link.to.absX, link.to.absY);

			let between = fromV.sub(toV).norm();
			let invertBetween = between.norm().neg();
			let orthBetween = (new Vector(-between.y, between.x)).norm();

			if (linkOfConcept(selectedConceptId) ||
					this.hoveredConcept && linkOfConcept(this.hoveredConcept.id)) {
				ctx.globalAlpha = 1;
			} else {
				ctx.globalAlpha = link.from.container == link.to.container ? .1 : .05;
			}

			let fromRad = between.mul(link.from.r);
			let toRad = between.mul(link.to.r);

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

			ctx.beginPath();
			ctx.moveTo(fromL.x, fromL.y);
			[fromR, toR, arrowR, arrowTop, arrowL, toL].forEach(v => {
				ctx.lineTo(v.x, v.y);
			});
			ctx.closePath();
			ctx.fill();
		}
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
			this.renderCanvas();
			this.animationLoop();
		});
	}

});

export default GraphMap;
