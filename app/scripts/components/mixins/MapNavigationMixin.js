import _ from 'lodash';
import Hammer from 'hammerjs';

const ZOOM_STEPS = 5;

export default {

	getInitialState() {
		let x = 0, y = 0;
		this.navState = {
			'pos': {x: window.innerWidth / 2, y: window.innerHeight / 2},
			'panDelta': {x, y},
			'prevScale': 1,
			'scale': 1
		};
		return {'panning': false};
	},

	componentDidMount() {
		let hammer = new Hammer.Manager(this.getDOMNode());
		hammer.add(new Hammer.Pan({'threshold': 5}));
		hammer.add(new Hammer.Pinch());
		hammer.on('panstart', this.onPanStart);
		hammer.on('panmove', this.onPan);
		hammer.on('panend', this.onPanEnd);
		hammer.on('pinch', this.onPinch);
	},

	onPanStart() {
		this.setState({'panning': true, 'wasPanning': true});
	},

	onPan(event) {
		let {pos} = this.navState;
		let prevDelta = this.navState.panDelta;
		let x = event.deltaX, y = event.deltaY;

		this.setNavState({
			'pos': {
				'x': pos.x + (x - prevDelta.x),
				'y': pos.y + (y - prevDelta.y)
			},
			'panDelta': {x, y}
		});
	},

	onPanEnd() {
		this.setNavState({'panDelta': {'x': 0, 'y': 0}});
		this.setState({'panning': false});
	},

	onPinch(event) {
		this.setNavState({'zoom': this.navState.zoom + (event.deltaY / 500)});
	},

	onScroll(event) {
		event.preventDefault();

		let prevScale = this.navState.scale;
		let scale = prevScale + (event.deltaY > 0 ? -1 : 1) / ZOOM_STEPS;
		if (scale == prevScale || scale > 1.5 || scale < .1) return;

		let {pos} = this.navState;
		let {pageX, pageY} = event;

		let scaleD = scale / prevScale;
		let x = scaleD * (pos.x - pageX) + pageX;
		let y = scaleD * (pos.y - pageY) + pageY;

		this.setNavState({prevScale, scale, 'pos': {x, y}});
	},


	setNavState(obj) {
		_.merge(this.navState, obj);
		this.navState.zoom = Math.max(0.1, this.navState.zoom);

		this.onNavStateChange();
	}
}
