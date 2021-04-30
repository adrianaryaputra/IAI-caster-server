let deviceState = {};

// // database import
// const {mongoose, stateDB, eventDB} = require('./orm');
// mongoose.connect(process.env.DB_LINK, {useNewUrlParser: true, useUnifiedTopology: true});
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', async () => {
//     try{
//         let s = await stateDB.find();
//         deviceState = s.reduce((pre, cur) => {
//             console.log("pre", pre);
//             console.log("cur", cur);
//             pre[cur.NAMA_MESIN] = {
//                 STATS_TOTAL_COUNT: cur.STATS_TOTAL_COUNT,
//                 STATS_NAMA_PELANGGAN: cur.STATS_NAMA_PELANGGAN,
//                 STATS_UKURAN_BAHAN: cur.STATS_UKURAN_BAHAN,
//                 STATS_TEBAL_BAHAN: cur.STATS_TEBAL_BAHAN,
//                 DRIVE_SPEED: cur.DRIVE_SPEED,
//             }
//             return pre;
//         }, {});
//     } catch(e) {
//         console.error(e);
//     }
// })


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
    deviceState[c.id]["DEVICE_STATUS"] = true;
    ws_broadcast(c.id, "STATE", deviceState[c.id]);
    mq_publish(`CASTER/${c.id}/SERVER_STATE`, deviceState[c.id]);
});
aedes.on("clientDisconnect", c => {
    deviceState[c.id] = deviceState[c.id] || {};
    deviceState[c.id]["DEVICE_STATUS"] = false;
    ws_broadcast(c.id, "STATE", deviceState[c.id]);
});
aedes.subscribe("CASTER/#", (a,cb) => {
    const topic = a.topic.split('/');
    const name = topic[1];
    const command = topic[2];
    const msg = JSON.parse(a.payload.toString());
    deviceState[name] = deviceState[name] || {};

    if(msg.success){
        switch(command) {
            case "GET_STATE":
                mq_publish(`CASTER/${name}/SERVER_STATE`, deviceState[name]);
                break;
            default:
                // db_createEvent({
                //     nama: name,
                //     event: command,
                //     value: msg.payload,
                // });
                updateState(name, {[command]: msg.payload});
                ws_broadcast(name, "STATE", deviceState[name]);
        }
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



// async function db_createEvent({
//     nama,
//     event,
//     value
// }) {
//     try{
//         await eventDB.create({
//             NAMA_MESIN: nama,
//             EVENT: event,
//             VALUE: JSON.stringify(value),
//             TIMESTAMP: Date.now(),
//         });
//     } catch(e) { 
//         console.error(e)
//     }
// }



function updateState(name, obj) {
    for (const state in obj) {
        deviceState[name][state] = obj[state];
    }
    // db_updateState(name, obj);
}



// async function db_updateState(namaMesin, newstate) {

//     let exist = await stateDB.find({NAMA_MESIN: namaMesin});
//     try{
//         if(Array.isArray(exist)) if(exist.length == 0) await stateDB.create({NAMA_MESIN: namaMesin, ...newstate});
//         else await stateDB.update({NAMA_MESIN: namaMesin}, newstate);
//         console.log("UPDATING MESIN", namaMesin, newstate);
//     } catch(e) {
//         console.error(e);
//     }
// }