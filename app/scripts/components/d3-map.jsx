let React = require('react');
let Router = require('react-router');

let d3 = require('d3');
let _ = require('lodash');
let Victor = require('victor');

let MapNavigationMixin = require('./mixins/MapNavigationMixin');

const RADIUS = 10;

let D3Map = React.createClass({

	mixins: [MapNavigationMixin, Router.State],

	componentDidMount() {
		let svg = d3.select(this.getDOMNode());
		svg.append('defs').append('marker').attr({
				'id': 'triangle',
				'viewBox': '0 -5 10 10',
				'markerWidth': '4',
				'markerHeight': '4',
				'orient': 'auto',
				'fill': 'context-fill'
			}).append('path').attr('d', 'M0,-5L10,0L0,5');
		this.group = svg.append('g');

		this.debugAxis = false;

		this.update(this.props);
	},

	componentWillReceiveProps(props) {
		this.update(props);
	},

	update(props) {
		let {concepts, selectedConcept, focusedConceptId} = props;

		if (!_.isEmpty(concepts) && !this.mapFilled) {
			this.indexedConcepts = new Map();
			for (let concept of concepts) this.indexedConcepts.set(concept.id, concept);
			this.renderEdges(this.indexedConcepts);
			this.renderNodes(concepts);
			if (this.debugAxis) this.renderAxis();
			this.isDirty = true;
			this.mapFilled = true;
		}

		this.updateFocusedPosition(focusedConceptId);

		if (this.isDirty) {
			this.renderD3();
			this.isDirty = false;
		}

		let conceptNodesMap = this.conceptNodesMap;
		let id = selectedConcept ? selectedConcept.id : null;
		if (conceptNodesMap && id && id != 'new') {
			let node = conceptNodesMap.get(id);
			if (node) node.classList.add('selected');
		} else {
			let node = this.group.select('.node.selected').node();
			if (node) node.classList.remove('selected');
		}
	},

	renderAxis() {
		let {width, height} = this.group[0][0].getBoundingClientRect();
		let w = width/2, h = height/2;

		let xScale = d3.scale.linear()
			.domain([-w, w])
			.range([-w,w]);

		let yScale = d3.scale.linear()
			.domain([-h, h])
			.range([-h,h]);

		let xAxis = d3.svg.axis()
			.scale(xScale)
			.orient('bottom')
			.ticks(w * 2 / 50 + 1)
			.tickSize(3);

		let yAxis = d3.svg.axis()
			.scale(yScale)
			.orient('left')
			.ticks(h * 2 / 50 + 1)
			.tickSize(3);

		this.group.append("svg:g")
			.attr("class", "xaxis")
			.call(xAxis);

		this.group.append("svg:g")
			.attr("class", "yaxis")
			.call(yAxis);

	},

	updateFocusedPosition(id) {
		if (!id) return;

		let boundingRect = this.getDOMNode().getBoundingClientRect();

		let focusedConcept = this.indexedConcepts.get(id);
		let focusedPosition = {
			x: boundingRect.width / 2 - focusedConcept.x,
			y: boundingRect.height / 2 - focusedConcept.y
		};

		if (focusedPosition === this.navState.focusedPosition) return;

		this.isDirty = true;
		this.navState.position =
			this.navState.focusedPosition = focusedPosition;
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

		this.group.attr('transform',
			`matrix(${scale}, 0, 0, ${scale}, ${pos.x}, ${pos.y})`
		);
	},

	renderEdges(indexedConcepts) {
		let edgeData = [];
		for (let [id, concept] of indexedConcepts) {
			let {container, reqs} = concept;

			for (let reqId of reqs) edgeData.push(
				this.calcEdgeAnchors(indexedConcepts.get(reqId), concept)
			);

			if (container) edgeData.push(
				this.calcEdgeAnchors(indexedConcepts.get(container), concept)
			);
		}

		this.group.selectAll('.edge').data(edgeData).enter().append('line').attr({
			'class': 'edge',
			'x1': e => e.from.x,  'y1': e => e.from.y,
			'x2': e => e.to.x,    'y2': e => e.to.y,
			'marker-end': 'url(#triangle)',
			'stroke': e => e.stroke || '#bdc3c7'
		});
	},

	calcEdgeAnchors(from, to) {
		let fromV = Victor.fromObject(from);
		let toV = Victor.fromObject(to);

		let radV = fromV.clone().subtract(toV).norm()
			.multiply(new Victor(RADIUS, RADIUS));

		fromV.subtract(radV);
		toV.add(radV.clone().multiply(new Victor(1.9, 1.9)));

		return {
			'from': {'x': fromV.x, 'y': fromV.y},
			'to': {'x': toV.x, 'y': toV.y},
			'stroke': from.color
		};
	},

	renderNodes(concepts) {
		let conceptNodesMap = this.conceptNodesMap = new Map();
		let conceptNodes = this.group.selectAll('.node').data(concepts).enter();

		conceptNodes.append('circle')
			.attr('class', 'node')
			.attr({
				'r': RADIUS, 'fill': n => n.color || 'lightgrey',
				'cx': n => n.x, 'cy': n => n.y
			})
			.on('click', (c) => this.props.onSelect(c.id)).each(function(c) {
				conceptNodesMap.set(c.id, this);
			});

		conceptNodes.append('text')
			.text((c) => c.name)
			.attr({
				'class': 'label',
				'x': function(c) { return c.x - this.getComputedTextLength() / 2 },
				'y': (c) => c.y + 23
			})
			.on('click', (c) => this.props.onSelect(c.id));
	}

});

export default D3Map;
