import BasicComponent from './basic-component.js';
export default class LabelText extends BasicComponent{

    constructor(label, value, options) {
        super(options);
        this.label = label;
        this.value = value;
        this.draw();
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


        this.elem.label = document.createElement("h3");
        this.element().appendChild(this.elem.label);
        this.setLabel(this.label);
        this.stylize(this.elem.label, {
            padding: ".1em .3em",
        });

        this.elem.value = document.createElement("h3");
        this.element().appendChild(this.elem.value);
        this.setValue(this.value)
        this.stylize(this.elem.value, {
            backgroundColor: "var(--color-background)",
            padding: ".1em .3em",
            borderRadius: "inherit",
        });
    }

    setValue(val) {
        this.elem.value.innerText = val;
        this.elem.value.style.after
    }

    setLabel(lbl) {
        this.elem.label.innerText = lbl;
    }

}