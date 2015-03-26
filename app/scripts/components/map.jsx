let React = require('react');
let d3 = require('d3');
let Hammer = require('hammerjs');
let _ = require('lodash');

let Map = React.createClass({

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
		if (_.isEmpty(props.concepts)) return;
		this.group.selectAll('.node')
			.data(props.concepts).enter().append('circle')
			.attr('class', 'node').attr('r', 10).style('fill', 'orange')
			.attr({'cx': (n) => n.x, 'cy': (n) => n.y})
			.on('click', (c) => this.props.onSelect(c.name));

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

export default Map;
