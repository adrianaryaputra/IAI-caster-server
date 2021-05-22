let deviceState = {};

// database import
const {mongoose, model} = require('./db.model');
mongoose.connect(process.env.DB_LINK, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


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
        case "MODBUS_ERROR":
            ws_broadcast(name, command, msg);
            break;
        case "GET_STATE":
            mq_publish(`CASTER/${name}/SERVER_STATE`, deviceState[name]);
            break;
        case "AI":
            m = msg.payload;
            m[0] = m[0]*0.75;
            m[2] = m[2]*0.75;
            m[4] = m[4];
            m[1] = m[1]*0.0225;
            m[3] = m[3]*0.0225;
            m[5] = m[5]*0.012;
            updateState(name, {[command]: m});
            ws_broadcast(name, "STATE", deviceState[name]);
            db_save(name);
            break;
        default:
            updateState(name, {[command]: msg.payload});
            ws_broadcast(name, "STATE", deviceState[name]);
            db_save(name);
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



async function db_save(name) {
    if(deviceState["AI"] && deviceState["DI"] && deviceState["TEMP"]) {
        // simpan ke DB
        const save = await model.data.updateOne(
            { NAMA_MESIN: name, DATE_FROM: new Date((new Date()).setMinutes(0,0,0)) },
            {
                $push: {
                    DATA: {
                        AI: deviceState["AI"],
                        DI: deviceState["DI"],
                        TEMP: deviceState["TEMP"],
                        TIMESTAMP: new Date(),
                    },
                },
                $inc: { DATA_COUNT: 1 },
                $setOnInsert: { NAMA_MESIN: name, DATE_FROM: new Date((new Date()).setMinutes(0,0,0)) },
            },
            { upsert: true }
        );
        console.log("DB SAVE:", save);
    }
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