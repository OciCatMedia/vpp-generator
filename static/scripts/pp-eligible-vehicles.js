window.addEventListener('DOMContentLoaded', (event) => {
    const brands = [
        'Chevrolet',
        'Buick',
        'GMC',
        'Cadillac',
    ];
    const sizes = [
        'trucks',
        'mpv/van',
        'crossover/suv',
        'luxury',
        'large',
        'midsize',
        'sport',
        'small/compact',       
    ];

    Brand.init(brands);
    Size.init(sizes);

    document.querySelectorAll('.parse-input').forEach((button) => {
        const field = document.getElementById('input-field');
        const edit = (button.dataset.act === 'edit');

        button.addEventListener('click', (event) => {
            const input = field.value;
            const json = (input ? JSON.parse(input) : {});

            Vehicle.init(json.vehicles || [], edit);
        });
    });
});

class Vehicle {
    static all = [];
    static details = [];

    static template;
    static cardList;
    static counter;
    static output;

    constructor (vehicle, edit = false) {
        Vehicle.all.push(this);

        this.id = Vehicle.all.length;
        this.imageSource;

        this.details = {
            id: this.id,
            name: {},
            brand: '',
            year: '',
            image: {
                src: '',
                alt: {},
                title: {},
            },
            size: 0,
            link: {
                href: {}
            },
            build: {
                href: {}
            },
        };
    
        if (vehicle) {
            this.details.name = vehicle.name;
            this.details.brand = vehicle.brand;
            this.details.year = vehicle.year;
            this.details.image = vehicle.image;
            this.details.size = vehicle.size;
            this.details.link = vehicle.link;
            this.details.build = vehicle.build;
        }

        if (!vehicle || edit) {
            this.createCard(edit);
        }

        Vehicle.details.push(this.details);
    }

    static init(data, edit) {
        Vehicle.template = document.getElementById('template-vehicle-card').content;
        Vehicle.cardList = document.getElementById('vehicle-list');
        Vehicle.counter = document.getElementById('vehicle-count');
        Vehicle.output = document.getElementById('output-field');

        data.forEach((vehicle) => new Vehicle(vehicle, edit));

        document.getElementById('generate-cards').addEventListener('submit', (event) => {
            const count = parseInt(document.getElementById('new-count').value) || 1;

            event.preventDefault();
            Vehicle.addVehicle(count);
        });
    
        document.querySelectorAll('.generate-output').forEach((button) => {
            const minify = (button.dataset.act === 'minify');

            button.addEventListener('click', (event) => {
                Vehicle.dumpOutput(minify);
            });
        });

        document.getElementById('input').setAttribute('hidden', '');
        document.getElementById('vehicle').removeAttribute('hidden');
        document.getElementById('output').removeAttribute('hidden');

        Vehicle.updateCount();
    }

    static addVehicle(count = 1) {
        for (let i = 0; i < count; i++) {
            new Vehicle;
        }

        Vehicle.updateCount();
    }

    static dumpOutput(minify = true) {
        const output = {
            vehicles: Vehicle.details,
            vehicleBrands: Brand.vehicleBrands,
            vehicleSize: Size.vehicleSize,
        };

        if (minify) {
            Vehicle.output.value = JSON.stringify(output);
        } else {
            Vehicle.output.value = JSON.stringify(output, false, '  ');
        }
    }

    static updateCount() {
        Vehicle.counter.value = Vehicle.all.length;
    }

    createCard(edit = false) {
        this.element = Vehicle.template.cloneNode(true);

        this.element.querySelector('h3').textContent = this.id;
        this.element.querySelector('[data-field="brand"]').appendChild(Brand.clone());
        this.element.querySelector('[data-field="size"]').appendChild(Size.clone());

        this.element.querySelectorAll('[name]').forEach((field) => {
            const key = field.name.split('-');
            let value;

            if (key[0] === 'image') {
                const filepath = this.details.image.src.split('/');
                const filename = filepath[filepath.length - 1];

                this.imageSource = filename;
                value = filename;
            } else if (key.length === 3) {
                value = this.details[key[0]][key[1]][key[2]];
            } else if (key.length === 2) {
                value = this.details[key[0]][key[1]];
            } else {
                value = this.details[key[0]];
            }

            field.value = value || '';
        });

        this.element.querySelectorAll('input, select').forEach((field) => {
            field.addEventListener('change', (event) => {
                this.updateAttribute(event.target);
            });
        });
        
        Vehicle.cardList.appendChild(this.element);
    }

    updateAttribute(field) {
        const key = field.name.split('-');
        const value = field.value.trim();

        if (key[0] === 'name') {
            this.details.name[key[1]] = value;
            this.details.image.alt[key[1]] = value;
            this.details.image.title[key[1]] = value;
        } else if (key[0] === 'image') {
            this.imageSource = value;
        } else if (key.length === 3) {
            this.details[key[0]][key[1]][key[2]] = value;
        } else if (key.length === 2) {
            this.details[key[0]][key[1]] = value;
        } else {
            this.details[key[0]] = value;
        }

        if (key[0] === 'year' || key[0] === 'brand' || key[0] === 'image') {
            this.details.image.src = '/content/img/jellybeans/' + this.details.year + '/' + this.details.brand + '/' + this.imageSource;
        }
        
    }
}

class Brand {
    static all = [];
    static vehicleBrands = {
        english: ['All'],
        french: ['Tout'],
    };
    static template;
    static templateSelect;

    constructor (brand) {
        Brand.all.push(this);

        this.id = Brand.all.length;
        this.name = brand;

        const element = document.createElement('option');
        element.value = this.name;
        element.text = this.name;

        Brand.templateSelect.add(element);

        Brand.vehicleBrands.english.push(this.name);
        Brand.vehicleBrands.french.push(this.name);
    }

    static init(data) {
        Brand.template = document.getElementById('template-brand-select').content;
        Brand.templateSelect = Brand.template.querySelector('select');

        data.forEach((brand) => new Brand(brand));
    }

    static clone() {
        return Brand.template.cloneNode(true);
    }
}

class Size {
    static all = [];
    static vehicleSize = {};
    static template;
    static templateSelect;

    constructor(size) {
        Size.all.push(this);

        this.id = Size.all.length;
        this.name = size;

        const element = document.createElement('option');
        element.value = this.id;
        element.text = this.name;

        Size.templateSelect.add(element);
        
        Size.vehicleSize[this.name] = this.id;
    }

    static init(data) {
        Size.template = document.getElementById('template-size-select').content;
        Size.templateSelect = Size.template.querySelector('select');

        data.forEach((size) => new Size(size));
    }

    static clone() {
        return Size.template.cloneNode(true);
    }
}