let getValue, isCheckbox, isMultiChoice, toggleValue;

isCheckbox = (el) => el.getAttribute('type') === 'checkbox';

isMultiChoice = (checkbox) => checkbox.getAttribute('value') != null;

toggleValue = (arr, val) => {
	let valueIndex;
	valueIndex = arr.indexOf(val);
	if (valueIndex !== -1) {
		arr.splice(valueIndex, 1);
	} else {
		arr.push(val);
	}
	return arr;
};

getValue = (el, currentValue) => {
	if (!isCheckbox(el)) {
		return el.value;
	}

	if (isMultiChoice(el)) {
		if (currentValue == null) currentValue = [];
		return toggleValue(currentValue, el.value);
	}

	return el.checked;
};

module.exports = {
	componentWillMount() {
		if (this.getInitialFormData != null) {
			return this.formData = this.getInitialFormData();
		} else {
			return this.formData = {};
		}
	},
	updateFormData(e) {
		let key, t;
		t = e.target;
		key = t.getAttribute('name');
		if (key != null) {
			let matches, prevVal;
			if (matches = key.match(/(.+)\[(.+)]\[(\d+)]/)) {
				key = matches[1];

				let arr = this.formData[key];
				if (!arr) arr = this.formData[key] = [];

				let obj = arr[matches[3]];
				if (!obj) obj = arr[matches[3]] = {};
				prevVal = obj[matches[2]];
				obj[matches[2]] = getValue(t, prevVal);
			} else {
				this.setFormData(key, getValue(t, this.formData[key]));
			}

			if (this.formDataDidChange != null) {
				return this.formDataDidChange();
			}
		}
	},
	setFormData(key, value) {
		return this.formData[key] = value;
	},
	clearFormData: function() {
		return this.formData = {};
	},
	resetFormData: function(obj) {
		this.clearFormData();
		return Object.keys(obj).forEach(((_this) => {
			return (key) => _this.formData[key] = obj[key];
		})(this));
	}
};
