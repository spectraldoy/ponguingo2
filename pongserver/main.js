// based on the example on https://www.npmjs.com/package/@abandonware/noble

const noble = require('@abandonware/noble');
const express = require("express");
const cors = require("cors");

const uuid_service_p1 = "1101";
const uuid_values_p1 = ["2101", "2102", "2103", "3101", "3102", "3103"];

const uuid_service_p2 = "4101";
const uuid_values_p2 = ["5101", "5102", "5103", "6101", "6102", "6103"];

const value_names = ["ax", "ay", "az", "gx", "gy", "gz"];

let sensorValuesP1 = {
  ax: NaN,
  ay: NaN,
  az: NaN,
  gx: NaN,
  gy: NaN,
  gz: NaN
}

let sensorValuesP2 = {
  ax: NaN,
  ay: NaN,
  az: NaN,
  gx: NaN,
  gy: NaN,
  gz: NaN
}

const interval_ms = 10;

let connected_peripherals = {}

noble.on('stateChange', async (state) => {
  if (state === 'poweredOn') {
    console.log("start scanning")
    await noble.startScanningAsync([uuid_service_p1], false);
  }
});

noble.on('discover', async (peripheral) => {
  await peripheral.connectAsync();

  const uuid = peripheral.advertisement.serviceUuids[0];

  connected_peripherals[uuid] = peripheral;
  if (Object.keys(connected_peripherals).length != 2) {
    await noble.startScanningAsync([uuid_service_p2], false);
    return;
  }

  await noble.stopScanningAsync();

  for (let uuid of [uuid_service_p1, uuid_service_p2]) {
    let peripheral = connected_peripherals[uuid];
    let player;
    let uuid_service;
    let uuid_values;
    if (uuid === uuid_service_p1) {
      player = 1;
      uuid_service = uuid_service_p1;
      uuid_values = uuid_values_p1;
    } else if (uuid === uuid_service_p2) {
      player = 2;
      uuid_service = uuid_service_p2;
      uuid_values = uuid_values_p2;
    }
    
    const {characteristics} = await peripheral.discoverSomeServicesAndCharacteristicsAsync([uuid_service], uuid_values);
    
    for (const chrstic of characteristics) {
      const uuid = chrstic.uuid;
      const idx = uuid_values.indexOf(uuid);
      if (idx == -1) continue;

      const name = value_names[idx];

      readData(chrstic, name, player);
    }
  };
});

//
// read data periodically
//
let readData = async (characteristic, name, player) => {
  const value = (await characteristic.readAsync());
  let reading = value.readFloatLE();
  console.log(player, name, reading);


  if (player == 1)
    sensorValuesP1[name] = reading;
  else if (player == 2)
    sensorValuesP2[name] = reading;

  // read data again in t milliseconds
  setTimeout(() => {
    readData(characteristic, name, player);
  }, interval_ms);
}

const app = express();
const port = 3001;

app.get("/", (_req, res) => {
  res.send("Hello");
});

app.use(cors({
  origin: "*",
}))

app.post("/playerOne", (_req, res) => {
  res.status(200).send(sensorValuesP1);
});

app.post("/playerTwo", (_req, res) => {
  res.status(200).send(sensorValuesP2);
});

app.listen(port, () => {
  console.log(`Bluetooth listener listening on port ${port}`)
})
