let React = require('react');
let d3 = require('d3');
let Hammer = require('hammerjs');
let _ = require('lodash');
let Victor = require('victor');

const RADIUS = 10;

let D3Map = React.createClass({

	getInitialState() {
		let x = 0, y = 0;
		this.stateD3 = {
			'position': {x: window.innerWidth / 2, y: window.innerHeight / 2},
			'panDelta': {x, y},
			'zoom': 1
		};
		return {'panning': false};
	},

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

		let hammer = new Hammer.Manager(this.getDOMNode());
		hammer.add(new Hammer.Pan({'threshold': 0}));
		hammer.add(new Hammer.Pinch());
		hammer.on('panstart', this.onPanStart);
		hammer.on('panmove', this.onPan);
		hammer.on('panend', this.onPanEnd);
		hammer.on('pinch', this.onPinch);
	},

	componentWillReceiveProps(props) {
		let concepts = props.concepts;
		if (_.isEmpty(concepts) || this.props.concepts) return;

		let indexedConcepts = new Map();
		for (let concept of concepts) indexedConcepts.set(concept.name, concept);

		let edgeData = [];
		for (let concept of concepts) for (let req of concept.reqs) {
			let reqV = Victor.fromObject(indexedConcepts.get(req));
			let conceptV = Victor.fromObject(concept);

			let radV = reqV.clone().subtract(conceptV).norm()
				.multiply(new Victor(RADIUS, RADIUS));

			reqV.subtract(radV);
			conceptV.add(radV.clone().multiply(new Victor(2, 2)));

			edgeData.push({
				'from': {'x': reqV.x, 'y': reqV.y},
				'to': {'x': conceptV.x, 'y': conceptV.y}
			});
		}

		let edges = this.group.selectAll('.edge').data(edgeData).enter();
		edges.append('line').attr({
			'class': 'edge',
			'x1': (e) => e.from.x,  'y1': (e) => e.from.y,
			'x2': (e) => e.to.x,   'y2': (e) => e.to.y,
			'marker-end': 'url(#triangle)'
		});

		let conceptNodes = this.group.selectAll('.node').data(props.concepts)
			.enter();
		conceptNodes.append('circle')
			.attr('class', 'node').attr('r', RADIUS)
			.attr({'cx': (n) => n.x, 'cy': (n) => n.y})
			.on('click', (c) => this.props.onSelect(c.name));

		conceptNodes.append('text')
			.text((c) => c.name)
			.attr({
				'class': 'label',
				'x': function(c) { return c.x - this.getComputedTextLength() / 2 },
				'y': (c) => c.y + 23
			});

		this.renderD3();
	},

	render() {
		return (
			<svg className={`map ${this.state.panning ? 'grabbed' : ''}`}
			     onWheel={this.onScroll} onClick={() => this.props.onSelect()}/>
		);
	},

	onPanStart() {
		this.setState({'panning': true});
	},

	onPan(event) {
		let pos = this.stateD3.position;
		let prevDelta = this.stateD3.panDelta;
		let x = event.deltaX, y = event.deltaY;

		this.setStateD3({
			'position': {
				'x': pos.x + (x - prevDelta.x),
				'y': pos.y + (y - prevDelta.y)
			},
			'panDelta': {x, y}
		});
	},

	onPanEnd() {
		this.setStateD3({'panDelta': {'x': 0, 'y': 0}});
		this.setState({'panning': false});
	},

	onPinch(event) {
		this.setStateD3({'zoom': this.stateD3.zoom + (event.deltaY / 500)});
	},

	onScroll(event) {
		this.setStateD3({'zoom': this.stateD3.zoom + (event.deltaY / 3000)});
	},

	setStateD3(obj) {
		_.merge(this.stateD3 , obj);
		this.stateD3.zoom = Math.max(0.1, this.stateD3.zoom);
		this.renderD3();
	},

	renderD3() {
		let zoom = this.stateD3.zoom, pos = this.stateD3.position;
		this.group.attr('transform', `translate(${pos.x}, ${pos.y}) scale(${zoom})`);
	}

});

export default D3Map;
