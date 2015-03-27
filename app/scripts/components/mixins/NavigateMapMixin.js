let _ = require('lodash');
let Hammer = require('hammerjs');

export default {

	getInitialState() {
		let x = 0, y = 0;
		this.navState = {
			'position': {x: window.innerWidth / 2, y: window.innerHeight / 2},
			'panDelta': {x, y},
			'zoom': 1
		};
		return {'panning': false};
	},

	componentDidMount() {
		let hammer = new Hammer.Manager(this.getDOMNode());
		hammer.add(new Hammer.Pan({'threshold': 0}));
		hammer.add(new Hammer.Pinch());
		hammer.on('panstart', this.onPanStart);
		hammer.on('panmove', this.onPan);
		hammer.on('panend', this.onPanEnd);
		hammer.on('pinch', this.onPinch);
	},

	onPanStart() {
		this.setState({'panning': true});
	},

	onPan(event) {
		let pos = this.navState.position;
		let prevDelta = this.navState.panDelta;
		let x = event.deltaX, y = event.deltaY;

		this.setNavState({
			'position': {
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
		this.setNavState({'zoom': this.navState.zoom + (event.deltaY / 3000)});
	},

	setNavState(obj) {
		_.merge(this.navState , obj);
		this.navState.zoom = Math.max(0.1, this.navState.zoom);
		this.renderD3();
	}

}
