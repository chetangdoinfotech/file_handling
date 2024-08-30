const JsonFileDb = require('./jsonFileDb');
require('dotenv').config();

// Initialize the database with the path to the JSON file
const notificationdb = new JsonFileDb('miner_alert_notification.json');


// this will come from .env
//CLIENT_DELTA_TIME='[{"1":{"firstdelta":120,"delta":10}},{"2":{"firstdelta":150,"delta":10}},{"3":{"firstdelta":360,"delta":10}}]'
let clients_delta_json = process.env.CLIENT_DELTA_TIME || '[{"0":{"firstdelta":240,"delta":10}}]'; 
let clients_delta_time = JSON.parse(clients_delta_json);

class myJsondbClass{
    constructor(){    
    }
    
    getData(monitorSystemId, msgContent, _dbfilename){
        try{
            const notificationdb = new JsonFileDb(_dbfilename);

            let noti_data = notificationdb.get(monitorSystemId.toString());
            console.log("... noti_data ...", noti_data);

            if(typeof noti_data === 'undefined'){
                console.log(":: CAN_SEND_MESSAGE ::");
                return "CAN_SEND_MESSAGE";
            }else{
                console.log("... noti_data ...", noti_data);
                console.log("... noti_data.reasontext ...", noti_data.reasontext);
                const results = noti_data.filter(entry => entry.reasontext.includes(msgContent));

                if(results.length > 0){
                    console.log("Found entries:", results[0]);
                    console.log("... string matched .. check time..");
                    let messageSenderOpensAfter =  JSON.parse(JSON.stringify(results[0])).messageSenderOpensAfter;
                    console.log("... messageSenderOpensAfter ...", messageSenderOpensAfter);
                    console.log("... parseInt(Date.now()) ...", parseInt(Date.now()));
                    
                    if(parseInt(Date.now()) > parseInt(messageSenderOpensAfter)){
                        console.log(":: CAN_SEND_MESSAGE ::");
                        return "CAN_SEND_MESSAGE_OLD_MESSAGE_EXISTS";
                    }else{
                        console.log(":: DENY_TO_SEND_MESSAGE ::");
                        return "DENY_TO_SEND_MESSAGE";
                    }
                } else {
                    console.log("No entries found.");
                    console.log(":: In else ...CAN_SEND_MESSAGE ::");
                    return "CAN_SEND_MESSAGE";
                }
            }
        
        }catch(e){
            console.log("Error/ getData ..", e)
        }
    }
    
    setData(_reasontext, _monitorSystemId, _dbfilename){
        try{
            let _searchText = _reasontext;
            console.log("_________________________________________")
            console.log(".. searchText ..", _searchText);
            console.log("_________________________________________")
            const notificationdb = new JsonFileDb(_dbfilename);

            let mins = 240;// if not present
            // retrieve the object from array
            let myelement = clients_delta_time.find(item => item[_monitorSystemId.toString()]);
            if(typeof myelement !=='undefined'){
                let _mydelta = myelement[_monitorSystemId.toString()].firstdelta;
                mins = _mydelta || 240;
            }

            let _InMillis = mins * 60 * 1000;
            let curtime = Date.now()
            let futuretimestamp = curtime + _InMillis;

            ///
            let mynotif_data = notificationdb.get(monitorSystemId.toString()) || [];
            console.log("... mynoti_data ...", mynotif_data);
            let obj_to_push = {
                "reasontext": _reasontext.toString(),
                "messageSenderOpensAfter": futuretimestamp.toString(),
                "isThisFirstMessage": 1, // message sending first time
                "LastSentTimestamp": Date.now()
            };
            
            mynotif_data.push(obj_to_push);
            console.log("... mynotif_data ...", mynotif_data);
            ///
            /*
            notificationdb.set(_monitorSystemId.toString(), [{
                "reasontext": _resontext.toString(),
                "messageSenderOpensAfter": futuretimestamp.toString(),
                "isThisFirstMessage": 1, // message sending first time
                "LastSentTimestamp": Date.now()
            }]);
            */
            // set updated array in db
            if(mynotif_data.length > 0){
                const newData = {
                  "reasontext": _reasontext.toString(),
                  "messageSenderOpensAfter": futuretimestamp.toString(),
                  "isThisFirstMessage": 0,
                  "LastSentTimestamp": curtime
                };

                // Iterate over the array and replace all matching entries
                mynotif_data = mynotif_data.map(entry => {
                  if (entry.reasontext.trim() === _searchText.trim()) {
                    return newData;
                  }
                  return entry;
                });
                console.log("... ### mynotif_data ### ...", mynotif_data);
                // all done lets replace data ..
                notificationdb.set(_monitorSystemId.toString(), mynotif_data);
            }else{
                notificationdb.set(_monitorSystemId.toString(), [{
                    "reasontext": _reasontext.toString(),
                    "messageSenderOpensAfter": futuretimestamp.toString(),
                    "isThisFirstMessage": 1, // message sending first time
                    "LastSentTimestamp": Date.now()
                }]);
            }
        }catch(e){
            console.log("Error/ setData ..", e)
        }
    }

    updateData(_searchText, _resontext, _monitorSystemId, _dbfilename){
        try{
            const notificationdb = new JsonFileDb(_dbfilename);

            let mins = 30;// if not present
            // retrieve the object from array
            let myelement = clients_delta_time.find(item => item[_monitorSystemId.toString()]);
            if(typeof myelement !=='undefined'){
                let _mydelta = myelement[_monitorSystemId.toString()].delta;
                mins = _mydelta || 30;
            }
            
            let _inMilliseconds = mins * 60 * 1000;
            let curtime = Date.now()
            let futuretimestamp = curtime + _inMilliseconds;
            let noti_data = notificationdb.get(_monitorSystemId.toString());
            const results = noti_data.filter(entry => entry.reasontext.includes(_searchText));;

            if(noti_data.length > 0){
                const newData = {
                  "reasontext": _resontext.toString(),
                  "messageSenderOpensAfter": futuretimestamp.toString(),
                  "isThisFirstMessage": 0,
                  "LastSentTimestamp": curtime
                };

                // Iterate over the array and replace all matching entries
                noti_data = noti_data.map(entry => {
                  if (entry.reasontext.trim() === _searchText.trim()) {
                    return newData;
                  }
                  return entry;
                });
                // all done lets replace data ..
                notificationdb.set(_monitorSystemId.toString(), noti_data);
            }
        }catch(e){
            console.log("Error/ updateData ..", e)
        }
    }
}


let myob = new myJsondbClass();
let monitorSystemId = 1;
let messageContent = " this is reason text1 .."; // this is message that we have to search in json file with monitorSystemid

// Select JSON file decide as per message to send
const miner_dbfilename = './notifications/miner_alert_notification.json';
const explorer_dbfilename = './notifications/explorer_alert_notification.json';
const bridge_dbfilename = './notifications/bridge_alert_notification.json';
const signer_dbfilename = './notifications/signer_alert_notification.json';

// set this
let dbfilename = explorer_dbfilename;

let mydbresponse = myob.getData(monitorSystemId, messageContent, dbfilename);
console.log(".. mydbresponse ..", mydbresponse);
console.log("___________________________________")


if(mydbresponse === 'DENY_TO_SEND_MESSAGE'){
    console.log(".. time not lapse yet .. delta remain ..")
}else if(mydbresponse ==='CAN_SEND_MESSAGE'){
    console.log(".. can send message .. allowed ..");
    let reasontext = " this is reason text ..";
 
    myob.setData(reasontext, monitorSystemId, dbfilename);
    // add new entry in json db file
}else if(mydbresponse==="CAN_SEND_MESSAGE_OLD_MESSAGE_EXISTS"){
    console.log(".. can send message .. allowed ..");
    // update entry of json db file

    let resontext = messageContent;
    myob.updateData(messageContent, resontext, monitorSystemId, dbfilename);
    console.log(".. message timestamp updated ..");
}else{
    console.log("... may be something accomodate here later..")
}

