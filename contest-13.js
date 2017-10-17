#!/usr/bin/env node
var ev3 = require('./node_modules/ev3source/ev3.js');
var source = require('./node_modules/ev3source/source.js');



var color = "undefined";
ev3.runForTime(ev3.motorB(), 10000, 50);
ev3.runForTime(ev3.motorC(), 10000, 50);


function recurring() {
    ev3.runForTime(ev3.motorB(), 10000, 50);
    ev3.runForTime(ev3.motorC(), 10000, 50);
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
    ev3.speak("Fucking " + color);
    source.alert(color + "("+r+","+g+","+b+")");
    ev3.pause(1000);
}

ev3.runForever(recurring);