import Device from './component/device.js';
import BasicComponent from './component/basic-component.js';

var wsUri = `ws://${location.hostname}:${+location.port+1}`;
var websocket = new WebSocket(wsUri);

function ws_load() {
    console.log("opening websocket ...");
    websocket.onopen    = ws_onOpen;
    websocket.onclose   = ws_onClose;
    websocket.onmessage = ws_onMessage;
    websocket.onerror   = ws_onError;
}

function ws_send(command, value) {
    websocket.send(JSON.stringify({
        command,
        value
    }))
}
      
function ws_onOpen(evt) {
    console.log("websocket opened...");
    ws_send("DATA",true);
    setInterval(() => ws_send("DATA", true), 6e4);
}
      
function ws_onClose(evt) {
    console.log("websocket closed...");
    setTimeout(() => location.reload(), 1000);
}

let deviceStyle = {}

function ws_onMessage(evt) {
    let parsedEvt = JSON.parse(evt.data);
    console.log(parsedEvt);
    switch(parsedEvt.command){
        case "SERVER_STATE":
            for (const deviceName of Object.keys(parsedEvt.payload).sort()) {
                console.log("creating", deviceName);
                devices[deviceName] = new Device(deviceName, parsedEvt.payload[deviceName], {
                    parent: deviceHolder.element(),
                    style: deviceStyle,
                });
            }
            break;
        case "STATE":
            if(devices[parsedEvt.device]) {
                devices[parsedEvt.device].update(parsedEvt.payload);
            } else {
                devices[parsedEvt.device] = new Device(parsedEvt.device, parsedEvt.payload, {
                    parent: deviceHolder.element(),
                    style: deviceStyle,
                });
                console.log("creating", deviceName);
            }
            break;
        case "DATA":
            for (const deviceName in parsedEvt.payload) {
                let measureData = [];
                if(Array.isArray(parsedEvt.payload[deviceName])) {
                    measureData = measureData.concat(
                        parsedEvt.payload[deviceName].reduce((acc,cur) => {
                            if(Array.isArray(cur.DATA)) return acc.concat(cur.DATA);
                        }, [])
                    );
                }

                measureData = measureData.sort((a,b) => {
                    return new Date(a.TIMESTAMP) - new Date(b.TIMESTAMP)
                });

                devices[deviceName].update({ DATA: measureData });
            }
            
    }
}

const devices = {};

function ws_onError(evt) {
    console.log(`WS: ${evt.type}`);
    console.log(evt.data);
}

const deviceHolder = new BasicComponent({
    parent: document.body,
    style: {
        display: "grid",
        margin: "1em",
        gridTemplateColumns: "1fr",
        gridAutoFlow: "row",
        gap: "1em"
    }
});

const run = () => {
    ws_load();
}

document.addEventListener("DOMContentLoaded", run)
