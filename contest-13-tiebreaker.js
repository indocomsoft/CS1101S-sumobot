#!/usr/bin/env node
var ev3 = require('./node_modules/ev3source/ev3.js');
var source = require('./node_modules/ev3source/source.js');

// Needs calibration
var maxSpeed = 800;

// Time required to turn 90 degrees
var time90deg = 3500;

var eyeThreshold = 15;

// Sensors and Motor objects
var leftMotor = ev3.motorB();
var rightMotor = ev3.motorC();
var eyes = ev3.ultrasonicSensor();
var nextState = skidLeft;

function skidLeft() {
    if (ev3.ultrasonicSensorDistance(eyes) <= eyeThreshold) {
        nextState = skidRight;
    } else {
        ev3.runForTime(leftMotor, time, -0.5 * maxSpeed);
        ev3.runForTime(rightMotor, time, maxSpeed);
    }
}

function skidRight() {
    if (ev3.ultrasonicSensorDistance(eyes) > eyeThreshold) {
        nextState = skidLeft;
    } else {
        ev3.runForTime(leftMotor, time, maxSpeed);
        ev3.runForTime(rightMotor, time, -0.5 * maxSpeed);
    }
}

while(true) {
    nextState();
}