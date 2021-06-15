import BasicComponent from './basic-component.js';
export default class InputDateTime extends BasicComponent{

    constructor({
        label = "",
        value = new Date(),
        listener = {},
    }, options
    ) {
        super(options);
        this.label = label;
        this.value = value;
        this.listener = listener;
        this.draw();
        this.execListener();
    }

    draw() {

        // set holder style
        this.stylize(this.element(), {
            display: "grid",
            gap: ".5em",
            gridTemplateColumns: "minmax(200px,.5fr) minmax(250px,1fr)",
            gridAutoFlow: "row",
            // backgroundColor: "#000",
            borderRadius: ".3em",
            justifyItems: "stretch",
        });

        this.elem.label = document.createElement("label");
        this.elem.label.textContent = this.label;
        this.stylize(this.elem.label, {
            padding: ".3em",
            fontWeight: "bold",
        });
        this.element().appendChild(this.elem.label);

        this.elem.value = document.createElement("input");
        this.elem.value.type = "datetime-local";
        this.elem.value.value = this.toLocalISODate(this.value);
        this.stylize(this.elem.value, {
            padding: ".3em"
        });
        this.element().appendChild(this.elem.value);
        
        this.stylize(this.elem.value, {});
    }

    toLocalISODate(date) {
        console.log(date);
        return `${
            date.getFullYear()}-${
            String(date.getMonth()+1).padStart(2,'0')}-${
            String(date.getDate()).padStart(2,'0')}T${
            String(date.getHours()).padStart(2,'0')}:${
            String(date.getMinutes()).padStart(2,'0')
        }`
    }

    execListener() {
        for (const key in this.listener) {
            this.element().addEventListener(key, this.listener[key]);
        }
    }

    getValue() {
        return new Date(this.elem.value.value);
    }

    setValue(date) {
        this.elem.value.value = this.toLocalISODate(date);
    }

}