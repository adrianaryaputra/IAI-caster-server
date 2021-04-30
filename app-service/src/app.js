let deviceState = {};


// mq import
const aedes = require('aedes')();
const mqserver = require('net').createServer(aedes.handle);
mqserver.listen(process.env.MQ_PORT, () => console.log("MQTT listening on", process.env.MQ_PORT));


// ws import
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.WS_PORT }, () => console.log("WS is listening on", process.env.WS_PORT));


// mq sub -> ws pub
aedes.on("clientReady", c => {
    deviceState[c.id] = deviceState[c.id] || {};
    deviceState[c.id].DEVICE_STATUS = true;
    ws_broadcast(c.id, "STATE", deviceState[c.id]);
    mq_publish(`CASTER/${c.id}/SERVER_STATE`, deviceState[c.id]);
});
aedes.on("clientDisconnect", c => {
    deviceState[c.id] = deviceState[c.id] || {};
    deviceState[c.id].DEVICE_STATUS = false;
    ws_broadcast(c.id, "STATE", deviceState[c.id]);
});
aedes.subscribe("CASTER/#", (a,cb) => {
    const topic = a.topic.split('/');
    const name = topic[1];
    const command = topic[2];
    const msg = JSON.parse(a.payload.toString());
    deviceState[name] = deviceState[name] || {};

    console.log(topic, msg);

    switch(command) {
        case "SERVER_STATE":
            break;
        case "GET_STATE":
            mq_publish(`CASTER/${name}/SERVER_STATE`, deviceState[name]);
            break;
        default:
            updateState(name, {[command]: msg.payload});
            ws_broadcast(name, "STATE", deviceState[name]);
    }

    cb();
});


// ws sub
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({
        command: "SERVER_STATE",
        payload: deviceState
    }));
    ws.on('message', (message) => {
        parsedMsg = JSON.parse(message);
        console.log(parsedMsg);
        ws_handleIncoming(ws, parsedMsg.command, parsedMsg.value);
    });
});



function ws_broadcast(device, command, payload) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                device,
                command, 
                payload,
            }));
        }
    });
}



function mq_publish(topic, payload) {
    aedes.publish({
        topic,
        payload: JSON.stringify({
            success: true,
            payload
        })
    });
}



function ws_handleIncoming(client, command, value) {
    switch(command) {
        case "GET_STATE":
            client.send(JSON.stringify({
                command,
                payload: deviceState
            }));
            break;
    }
}



function updateState(name, obj) {
    for (const state in obj) {
        deviceState[name][state] = obj[state];
    }
}