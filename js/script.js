const connectButton = document.getElementById('connectBleButton');
const disconnectButton = document.getElementById('disconnectBleButton');
const bleStateContainer = document.getElementById('bleState');
const buzzerController = document.getElementById('buzzerControlButton');
const buzzerActiveContainer = document.getElementById('buzzerState');
const mode1Button = document.getElementById('selectMode1');
const mode2Button = document.getElementById('selectMode2');
const mode3Button = document.getElementById('selectMode3');
const modeStateContainer = document.getElementById('modeState');

var deviceName ='BuzzBox';
var bleService = '19b10000-e8f2-537e-4f6c-d104768a1214';
var ledCharacteristic = '19b10002-e8f2-537e-4f6c-d104768a1214';
var sensorCharacteristic= '19b10001-e8f2-537e-4f6c-d104768a1214';
var modeCharacteristic = '9c2758bc-8cf5-4b18-a0fb-3d60fa523c18';
var patternCharacteristic = 'c9108ecc-0dde-4694-9735-e084da2ba23d';

var bleServer;
var bleServiceFound;

connectButton.addEventListener('click', (event) => {
    if (isWebBluetoothEnabled()){
        connectToDevice();
    }
});

disconnectButton.addEventListener('click', disconnectDevice);

buzzerController.addEventListener('click', () => {
if (bleServer && bleServer.connected) {

    buzzerController.classList.toggle('active');
    if (buzzerController.classList.contains('active')){
        console.log("Buzzer State: Active");
        buzzerActiveContainer.innerHTML = 'Active';
        buzzerActiveContainer.style.color = "#24af37";
        writeOnCharacteristic(1);
    } else {
        console.log("Buzzer State: Inactive");
        buzzerActiveContainer.innerHTML = 'Inactive';
        buzzerActiveContainer.style.color = "#d13a30";
        writeOnCharacteristic(0);
    }

} else {
    // Throw an error if Bluetooth is not connected
    console.error("Bluetooth is not connected.");
    window.alert("Bluetooth is not connected.")
}      
    
});

mode1Button.addEventListener('click', ()=> {

    if (bleServer && bleServer.connected) {

    modeStateContainer.innerHTML = "Manual";
    writeMode(1);

} else {
    // Throw an error if Bluetooth is not connected
    console.error("Bluetooth is not connected.");
    window.alert("Bluetooth is not connected.")
}      
    
})

mode2Button.addEventListener('click', ()=> {

    if (bleServer && bleServer.connected) {
    
    modeStateContainer.innerHTML = "Pulse";
    writeMode(2);

} else {
    // Throw an error if Bluetooth is not connected
    console.error("Bluetooth is not connected.");
    window.alert("Bluetooth is not connected.")
}      
    
})

mode3Button.addEventListener('click', ()=> {

    if (bleServer && bleServer.connected) {

    modeStateContainer.innerHTML = "Pattern";
    writeMode(3);

} else {
    // Throw an error if Bluetooth is not connected
    console.error("Bluetooth is not connected.");
    window.alert("Bluetooth is not connected.")
}      
    
})

function isWebBluetoothEnabled() {
    if (!navigator.bluetooth) {
        console.log("Web Bluetooth API is not available in this browser!");
        bleStateContainer.innerHTML = "Web Bluetooth API is not available in this browser!";
        return false
    }
    console.log('Web Bluetooth API supported in this browser.');
    return true
}

function connectToDevice(){
    console.log('Initializing Bluetooth...');
    navigator.bluetooth.requestDevice({
        filters: [{name: deviceName}],
        optionalServices: [bleService]
    })
    .then(device => {
        console.log('Device Selected:', device.name);
        bleStateContainer.innerHTML = 'Connected';
        bleStateContainer.style.color = "#24af37";
        device.addEventListener('gattserverdisconnected', onDisconnected);
        return device.gatt.connect();
    })
    .then(gattServer =>{
        bleServer = gattServer;
        console.log("Connected to GATT Server");
        return bleServer.getPrimaryService(bleService);
    })
    .then(service => {
    bleServiceFound = service;
    console.log("Service discovered:", service.uuid);
    })
    .catch(error => {
        console.log('Error: ', error);
    })
}

function onDisconnected(event){
    console.log('Device Disconnected');
    bleStateContainer.innerHTML = "Disconnected";
    bleStateContainer.style.color = "#d13a30";
}

function writeOnCharacteristic(value){
    if (bleServer && bleServer.connected) {
        bleServiceFound.getCharacteristic(ledCharacteristic)
        .then(characteristic => {
            console.log("Found the LED characteristic: ", characteristic.uuid);
            const data = new Uint8Array([value]);
            return characteristic.writeValue(data);
        })
        .catch(error => {
            console.error("Error writing to the LED characteristic: ", error);
        });
    } else {
            console.error ("Bluetooth is not connected. Cannot activate.")
            window.alert("Bluetooth is not connected. Cannot activate. \n Connect to Bluetooth first!")
    }
}

function writeMode(value){
    if (bleServer && bleServer.connected) {
        bleServiceFound.getCharacteristic(modeCharacteristic)
        .then(characteristic => {
            console.log("Mode: "+ value);
            console.log("Found the Mode characteristic: ", characteristic.uuid);
            const data = new Uint8Array([value]);
            return characteristic.writeValue(data);
        })
        .catch(error => {
            console.error("Error writing to the Mode characteristic: ", error);
        });
    } else {
            console.error ("Bluetooth is not connected. Cannot change.")
            window.alert("Bluetooth is not connected. Cannot change. \n Connect to Bluetooth first!")
    }
}

function disconnectDevice() {
    console.log("Disconnect Device.");
    if (bleServer && bleServer.connected) {
        return bleServer.disconnect()
    } else {
        // Throw an error if Bluetooth is not connected
        console.error("Bluetooth is not connected.");
        window.alert("Bluetooth is not connected.")
    }
}