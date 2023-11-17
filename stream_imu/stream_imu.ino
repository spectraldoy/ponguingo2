/*
 * Aditya Gomatam Fall 2023 ECE M119 Lab 4
 * Copied from Lab 3
 * Stream IMU data via Bluetooth to my laptop
 */

#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>

#define BLE_UUID_IMU_SERVICE "1101"
#define BLE_UUID_ACCELEROMETER_X "2101"
#define BLE_UUID_ACCELEROMETER_Y "2102"
#define BLE_UUID_ACCELEROMETER_Z "2103"
#define BLE_UUID_GYROSCOPE_X "3101"
#define BLE_UUID_GYROSCOPE_Y "3102"
#define BLE_UUID_GYROSCOPE_Z "3103"

#define BLE_DEVICE_NAME "AG Nano 33 IoT"
#define BLE_LOCAL_NAME "AG Nano 33 IoT"

BLEService IMUService(BLE_UUID_IMU_SERVICE);

BLEFloatCharacteristic chrsticAccX(BLE_UUID_ACCELEROMETER_X, BLERead | BLENotify);
BLEFloatCharacteristic chrsticAccY(BLE_UUID_ACCELEROMETER_Y, BLERead | BLENotify);
BLEFloatCharacteristic chrsticAccZ(BLE_UUID_ACCELEROMETER_Z, BLERead | BLENotify);

BLEFloatCharacteristic chrsticGyrX(BLE_UUID_GYROSCOPE_X, BLERead | BLENotify);
BLEFloatCharacteristic chrsticGyrY(BLE_UUID_GYROSCOPE_Y, BLERead | BLENotify);
BLEFloatCharacteristic chrsticGyrZ(BLE_UUID_GYROSCOPE_Z, BLERead | BLENotify);

void print_three_tabbed_floats(float a, float b, float c) {
  Serial.print(a);
  Serial.print('\t');
  Serial.print(b);
  Serial.print('\t');
  Serial.print(c);
}

void setCharacteristics(float ax, float ay, float az, float gx, float gy, float gz) {
  chrsticAccX.writeValue(ax);
  chrsticAccY.writeValue(ay);
  chrsticAccZ.writeValue(az);

  chrsticGyrX.writeValue(gx);
  chrsticGyrY.writeValue(gy);
  chrsticGyrZ.writeValue(gz);

  print_three_tabbed_floats(ax, ay, az);
  Serial.print('\t');
  print_three_tabbed_floats(gx, gy, gz);
  Serial.println('\t');
}

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);

  // initialize Serial
  Serial.begin(9600);
  while (!Serial);

  // initialize IMU
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU");
    while (true);
  }

  // initialize BLE
  if (!BLE.begin()) {
    Serial.println("starting Bluetooth® Low Energy module failed!");

    while (true);
  }

  BLE.setDeviceName(BLE_DEVICE_NAME);
  BLE.setLocalName(BLE_LOCAL_NAME);
  BLE.setAdvertisedService(IMUService);

  IMUService.addCharacteristic(chrsticAccX);
  IMUService.addCharacteristic(chrsticAccY);
  IMUService.addCharacteristic(chrsticAccZ);
  IMUService.addCharacteristic(chrsticGyrX);
  IMUService.addCharacteristic(chrsticGyrY);
  IMUService.addCharacteristic(chrsticGyrZ);

  BLE.addService(IMUService);

  setCharacteristics(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);

  // start advertisiing
  BLE.advertise();

  Serial.println("BLE IMU Peripheral");
}


float ax, ay, az, gx, gy, gz;

void loop() {
  BLEDevice central = BLE.central();

  if (IMU.accelerationAvailable() && IMU.gyroscopeAvailable()) {
    digitalWrite(LED_BUILTIN, HIGH);
    IMU.readAcceleration(ax, ay, az);
    IMU.readGyroscope(gx, gy, gz);

    setCharacteristics(ax, ay, az, gx, gy, gz);
  } else {
    digitalWrite(LED_BUILTIN, LOW);
  }
}
