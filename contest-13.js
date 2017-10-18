#!/usr/bin/env node
var ev3 = require('./node_modules/ev3source/ev3.js');
var source = require('./node_modules/ev3source/source.js');


// Return value 0 to 5, the higher the return value, the higher the chance of
// getting kicked out of the arena
function getColor() {
    var color = "undefined";
    var code = -1;
    var r = ev3.colorSensorRed(ev3.colorSensor());
    var g = ev3.colorSensorGreen(ev3.colorSensor());
    var b = ev3.colorSensorBlue(ev3.colorSensor());
    if (r <= 200) {
        if (b <= 120) {
            color = "green";
            code = 3;
        } else if (b <= 200) {
            color = "deep blue";
            code = 1;
        } else {
            color = "turqoise";
            code = 2;
        }
    } else if (r <= 350) {
        if (b <= 100) {
            color = "red";
            code = 5;
        } else {
            color = "purple";
            code = 0;
        }
    } else {
        color = "yellow";
        code = 4;
    }
    source.alert("return "+ code + ", color:" + color + "("+r+","+g+","+b+")");
    return code;
}