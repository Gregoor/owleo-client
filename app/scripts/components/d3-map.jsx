let React = require('react');
let Router = require('react-router');

let d3 = require('d3');
let _ = require('lodash');
let Victor = require('victor');

let NavigateMapMixin = require('./mixins/NavigateMapMixin');

const RADIUS = 10;

let D3Map = React.createClass({

	mixins: [NavigateMapMixin, Router.State],

	componentDidMount() {
		let svg = d3.select(this.getDOMNode());
		svg.append('defs').append('marker').attr({
				'id': 'triangle',
				'viewBox': '0 -5 10 10',
				'markerWidth': '4',
				'markerHeight': '4',
				'orient': 'auto'
			}).append('path').attr('d', 'M0,-5L10,0L0,5');
		this.group = svg.append('g');

		this.update(this.props);
	},

	componentWillReceiveProps(props) {
		this.update(props);
	},

	update(props) {
		let {concepts, selectedConcept} = props;

		if (!_.isEmpty(concepts) && !this.mapFilled) {
			let indexedConcepts = new Map();
			for (let concept of concepts) indexedConcepts.set(concept.name, concept);
			this.renderEdges(indexedConcepts);
			this.renderNodes(concepts);
			this.renderD3();
			this.mapFilled = true;
		}

		let conceptNodesMap = this.conceptNodesMap;
		let name = selectedConcept ? selectedConcept.name : null;
		if (conceptNodesMap && name && name != 'new') {
			let node = conceptNodesMap.get(name);
			if (node) node.classList.add('selected');
		} else {
			let node = this.group.select('.node.selected').node();
			if (node) node.classList.remove('selected');
		}
	},

	render() {
		return (
			<svg className={`map ${this.state.panning ? 'grabbed' : ''}`}
			     onWheel={this.onScroll} onClick={this.onSelect}/>
		);
	},

	onSelect() {
		this.props.onSelect();
	},

	renderD3() {
		let zoom = this.navState.zoom, pos = this.navState.position;
		this.group.attr('transform', `translate(${pos.x}, ${pos.y}) scale(${zoom})`);
	},

	renderEdges(indexedConcepts) {
		let edgeData = [];
		for (let [name, concept] of indexedConcepts) for (let req of concept.reqs) {
			let reqV = Victor.fromObject(indexedConcepts.get(req));
			let conceptV = Victor.fromObject(concept);

			let radV = reqV.clone().subtract(conceptV).norm()
				.multiply(new Victor(RADIUS, RADIUS));

			reqV.subtract(radV);
			conceptV.add(radV.clone().multiply(new Victor(1.9, 1.9)));

			edgeData.push({
				'from': {'x': reqV.x, 'y': reqV.y},
				'to': {'x': conceptV.x, 'y': conceptV.y}
			});
		}

		this.group.selectAll('.edge').data(edgeData).enter().append('line').attr({
			'class': 'edge',
			'x1': (e) => e.from.x,  'y1': (e) => e.from.y,
			'x2': (e) => e.to.x,   'y2': (e) => e.to.y,
			'marker-end': 'url(#triangle)'
		});
	},

	renderNodes(concepts) {
		let conceptNodesMap = this.conceptNodesMap = new Map();
		let conceptNodes = this.group.selectAll('.node').data(concepts)
			.enter();
		conceptNodes.append('circle')
			.attr('class', 'node').attr('r', RADIUS)
			.attr({'cx': (n) => n.x, 'cy': (n) => n.y})
			.on('click', (c) => this.props.onSelect(c.name)).each(function(c) {
				conceptNodesMap.set(c.name, this);
			});

		conceptNodes.append('text')
			.text((c) => c.name)
			.attr({
				'class': 'label',
				'x': function(c) { return c.x - this.getComputedTextLength() / 2 },
				'y': (c) => c.y + 23
			});
	},

});

export default D3Map;
