import BasicComponent from './basic-component.js';
import LabelText from './label-text.js';
import TitleText from './title-text.js';
import Indicator from './indicator.js';
export default class Device extends BasicComponent{

    constructor(name, state = {}, options) {
        super(options);
        this.name = name;
        this.draw();
        this.update(state);
        this.stylize(this.element(), {
            display: "grid",
            gap: ".3em",
            backgroundColor: "rgba(255,255,255,0.1)",
            fontSize: "1.2rem",
            padding: "1em",
            borderRadius: "1em",
        });
    }

    update(state) {
        this.state = state;
        for (const key in state) {
            switch(key) {
                case "DEVICE_STATUS":
                    this.deviceStatus.toggle(state[key]);
                    break;
                case "AI":
                    this.millMotorTopS.setValue(state[key][0].toFixed(2));
                    this.millMotorTopC.setValue(state[key][1].toFixed(2));
                    this.millMotorBtmS.setValue(state[key][2].toFixed(2));
                    this.millMotorBtmC.setValue(state[key][3].toFixed(2));
                    this.coilerMotorS.setValue(state[key][4].toFixed(2));
                    this.coilerMotorC.setValue(state[key][5].toFixed(2));
                    break;

                case "DI":
                    this.motorPK1.toggle(state[key][1] === false);
                    this.motorPK2.toggle(state[key][0] === false);
                    this.coolingTower1.toggle(state[key][13] === false);
                    this.coolingTower2.toggle(state[key][3] === false);
                    this.motorPB1.toggle(state[key][4] === false);
                    this.motorPB2.toggle(state[key][5] === true);
                    this.motorBending1.toggle(state[key][7] === true);
                    this.motorBending2.toggle(state[key][8] === true);
                    this.millON.toggle(state[key][11] === false);
                    this.coilerON.toggle(state[key][12] === false);
                    this.oilCoolant.toggle(state[key][6] === true);
                    this.hidrolikPK.toggle(state[key][9] === true);
                    this.hidrolikPB.toggle(state[key][10] === true);
                    break;

            }
        }
        return this;
    }

    draw() {
        this.headerHolder = new BasicComponent({
            parent: this.element(),
            style: {
                fontSize: "1.5rem",
                margin: "0 0 var(--normal) .3em",
                display: "grid",
                gridTemplateColumns: "minmax(max-content, 1fr) 200px"
            }
        });

        this.deviceName     = new TitleText(this.name, { parent: this.headerHolder.element() });
        this.deviceStatus   = new Indicator({ valueON: "ONLINE", valueOFF: "OFFLINE" }, { parent: this.headerHolder.element() });

        this.analogData     = new BasicComponent({
            parent: this.element(),
            style: {
                display: "grid",
                margin: "1em 0",
                gridTemplateColumns: "repeat(2, minmax(340px, 1fr))",
                gap: "1em"
            }
        });

        this.millMotorTopS  = new LabelText("Mill Top Spd.", "###", { parent: this.analogData.element() });
        this.millMotorTopC  = new LabelText("Mill Top Cur.", "###", { parent: this.analogData.element() });

        this.millMotorBtmS  = new LabelText("Mill Btm Spd.", "###", { parent: this.analogData.element() });
        this.millMotorBtmC  = new LabelText("Mill Btm Cur.", "###", { parent: this.analogData.element() });

        this.coilerMotorS   = new LabelText("Coiler Spd.", "###", { parent: this.analogData.element() });
        this.coilerMotorC   = new LabelText("Coiler Cur.", "###", { parent: this.analogData.element() });

        this.digitalData    = new BasicComponent({
            parent: this.element(),
            style: {
                display: "grid",
                margin: "1em 0",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gridAutoFlow: "row",
                gap: "1em"
            }
        });

        this.motorPK1       = new Indicator({ valueON: "Motor PK1",         valueOFF: "Motor PK1",         }, { parent: this.digitalData.element() });
        this.motorPK2       = new Indicator({ valueON: "Motor PK2",         valueOFF: "Motor PK2",         }, { parent: this.digitalData.element() });
        this.coolingTower1  = new Indicator({ valueON: "Cooling Tower 1",   valueOFF: "Cooling Tower 1",   }, { parent: this.digitalData.element() });
        this.coolingTower2  = new Indicator({ valueON: "Cooling Tower 2",   valueOFF: "Cooling Tower 2",   }, { parent: this.digitalData.element() });
        this.motorPB1       = new Indicator({ valueON: "Motor PB1",         valueOFF: "Motor PB1",         }, { parent: this.digitalData.element() });
        this.motorPB2       = new Indicator({ valueON: "Motor PB2",         valueOFF: "Motor PB2",         }, { parent: this.digitalData.element() });
        this.motorBending1  = new Indicator({ valueON: "Motor Bending 1",   valueOFF: "Motor Bending 1",   }, { parent: this.digitalData.element() });
        this.motorBending2  = new Indicator({ valueON: "Motor Bending 2",   valueOFF: "Motor Bending 2",   }, { parent: this.digitalData.element() });
        this.millON         = new Indicator({ valueON: "Mill",              valueOFF: "Mill",              }, { parent: this.digitalData.element() });
        this.coilerON       = new Indicator({ valueON: "Coiler",            valueOFF: "Coiler",            }, { parent: this.digitalData.element() });
        this.oilCoolant     = new Indicator({ valueON: "Oil Coolant",       valueOFF: "Oil Coolant",       }, { parent: this.digitalData.element() });
        this.hidrolikPK     = new Indicator({ valueON: "Hidrolik PK",       valueOFF: "Hidrolik PK",       }, { parent: this.digitalData.element() });
        this.hidrolikPB     = new Indicator({ valueON: "Hidrolik PB",       valueOFF: "Hidrolik PB",       }, { parent: this.digitalData.element() });
    }

}