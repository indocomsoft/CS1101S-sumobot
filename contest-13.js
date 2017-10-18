#!/usr/bin/env node
var ev3 = require('./node_modules/ev3source/ev3.js');
var source = require('./node_modules/ev3source/source.js');



function getColor() {
    var color = "undefined";
    var r = ev3.colorSensorRed(ev3.colorSensor());
    var g = ev3.colorSensorGreen(ev3.colorSensor());
    var b = ev3.colorSensorBlue(ev3.colorSensor());
    if (r <= 200) {
        if (b <= 120) {
            color = "green";
        } else if (b <= 200) {
            color = "deep blue";
        } else {
            color = "turqoise";
        }
    } else if (r <= 350) {
        if (b <= 100) {
            color = "red";
        } else {
            color = "purple";
        }
    } else {
        color = "yellow";
    }
    source.alert(color + "("+r+","+g+","+b+")");
    return color;
}