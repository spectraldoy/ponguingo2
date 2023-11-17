// based on the example on https://www.npmjs.com/package/@abandonware/noble

const noble = require('@abandonware/noble');
const express = require("express");
const cors = require("cors");

const uuid_service = "1101";
const uuid_values = ["2101", "2102", "2103", "3101", "3102", "3103"];
const value_names = ["ax", "ay", "az", "gx", "gy", "gz"];

let sensorValues = {
  ax: NaN,
  ay: NaN,
  az: NaN,
  gx: NaN,
  gy: NaN,
  gz: NaN
}

const interval_ms = 10;

noble.on('stateChange', async (state) => {
  if (state === 'poweredOn') {
    console.log("start scanning")
    await noble.startScanningAsync([uuid_service], false);
  }
});

noble.on('discover', async (peripheral) => {
  await noble.stopScanningAsync();
  await peripheral.connectAsync();
  const {characteristics} = await peripheral.discoverSomeServicesAndCharacteristicsAsync([uuid_service], uuid_values);
  
  for (const chrstic of characteristics) {
    const uuid = chrstic.uuid;
    const idx = uuid_values.indexOf(uuid);
    if (idx == -1) continue;

    const name = value_names[idx];

    readData(chrstic, name);
  }
});

//
// read data periodically
//
let readData = async (characteristic, name) => {
  const value = (await characteristic.readAsync());
  sensorValues[name] = value.readFloatLE();
  console.log(name, sensorValues[name]);

  // read data again in t milliseconds
  setTimeout(() => {
    readData(characteristic, name)
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

app.post("/", (_req, res) => {
  res.status(200).send(sensorValues);
});

app.listen(port, () => {
  console.log(`Bluetooth listener listening on port ${port}`)
})
