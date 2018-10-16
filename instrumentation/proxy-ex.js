class Person {
	constructor(name) {
		this.name = name;
		// ...
	}
}

const person = new Person('Jean-Luc Picard');
const handler = {
	get(target, property, receiver) {
		if (property === 'name') {
			return 'Locutus of Borg';
		}

		return Reflect.get(...arguments);
	},

	set(target, property, value, receiver) {
		// Don't actually set. 
		console.log('Resistance is futile.');
		return true;
	}
};

const borg = new Proxy(person, handler);
