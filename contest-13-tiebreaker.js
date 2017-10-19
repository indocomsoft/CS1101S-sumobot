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

ev3.runForTime(leftMotor, 4000, maxSpeed);
ev3.runForTime(rightMotor, 4000, maxSpeed);
ev3.pause(4000);
ev3.runForTime(leftMotor, 3300, -maxSpeed);
ev3.runForTime(rightMotor, 3300, maxSpeed);
ev3.pause(3300);

//ev3.waitForButtonPress();
while(true) {
    ev3.runForTime(leftMotor, 6000, maxSpeed);
    ev3.runForTime(rightMotor, 6000, maxSpeed);
    ev3.pause(6000);
    ev3.runForTime(leftMotor, 3300, -maxSpeed);
    ev3.runForTime(rightMotor, 3300, maxSpeed);
    ev3.pause(3300);
    ev3.runForTime(leftMotor, 9000, maxSpeed);
    ev3.runForTime(rightMotor, 9000, maxSpeed);
    ev3.pause(9000);
    ev3.runForTime(leftMotor, 3300, -maxSpeed);
    ev3.runForTime(rightMotor, 3300, maxSpeed);
    ev3.pause(3300);
}
