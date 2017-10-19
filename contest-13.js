#!/usr/bin/env node
var ev3 = require('./node_modules/ev3source/ev3.js');
var source = require('./node_modules/ev3source/source.js');

// Needs calibration
var leftMotor = ev3.motorB();
var rightMotor = ev3.motorC();
var eyes = ev3.ultrasonicSensor();
var gyro = ev3.gyroSensor();
var maxSpeed = 600;
var timeStep = 50; // in ms; used in runForTime()
// Threshold to determine if a motor running at maxSpeed is pushing something
var pushingThreshold = maxSpeed * 0.65;
// Threshold to determine what value of getColor() is regarded as dangerous
var dangerThreshold = 4;

// ---- Miscellaneous functions ----
// abs not required as Math object is available in node.js
/*
function abs(val){
    return val < 0 ? -val : val;
}
*/
// ---- End of miscellaneous functions ----
//
// ---- State variables ----
var nextState = init_state;
var leftMotorStatus = [0, 0];
var rightMotorRunning = 0;
// ---- End of state variables ----

// ---- Status check functions ----
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

function inDangerZone() {
    return getColor() >= dangerThreshold;
}

function leftPushing(){
    if(leftMotorRunning !== 0){
        return Math.abs(ev3.motorGetSpeed(leftMotor)) < pushingThreshold;
    } else{
        return ev3.motorGetSpeed(leftMotor) !== 0;
    }
}

function updateStats(){

}

// ---- End of status check functions ----



// ---- States ----
function search(){
    if(prevState !== "search"){
        prevState = "search";
    } else{ /* Do nothing */}
    // Just rotate
    ev3.runForTime(leftMotor, timeStep, maxSpeed);
    ev3.runForTime(rightMotor, timeStep, -maxSpeed);
    if(enemyAhead()){
        nextState = attackFront;
    } else if(inDangerZone()){
        nextState = escape;
    }
}
function attackFront(){
    ev3.runForTime(leftMotor, timeStep, maxSpeed);
    ev3.runForTime(rightMotor, timeStep, maxSpeed);

    if(prevState !== "attackFront"){
        prevState = "attackFront";
    } else{ /* Do nothing */}

    // --- Transition code ---
    if(inDangerZone()){
        // Killed an enemy? Or sensed someone's leg; anyway, about to move out
        // of arena. Escape.
        nextState = escape;
    } else if(!enemyAhead()){
        // Lost the enemy? Chase again
        nextState = search;
    } else { /* Do nothing, continue attacking */}
}

function attackRear(){
    ev3.runForTime(leftMotor, timeStep, -maxSpeed);
    ev3.runForTime(rightMotor, timeStep, -maxSpeed);
    if(prevState !== "attackRear"){
        prevState = "attackRear";
    } else{ /* Do nothing */}
    if(inDangerZone()){
        nextState = escape;
    } else if(!pushing()){
        nextState = search;
    } else{ /* Do nothing. Continue attacking. */}
}

function escape(){
    // Just asked to escape? Stop moving first
    if(prevState !== "escape"){
        ev3.motorSetStopAction(leftMotor, "hold");
        ev3.motorSetStopAction(rightMotor, "hold");
        ev3.motorStop(leftMotor);
        ev3.motorStop(rightMotor);
        prevState = "escape";
        // Move in opposite direction of previous move
    } else{ /* Do nothing */ }

    moveInEscapeDirection();

    // --- Transition code ---
    if(!inDangerZone()){
        nextState = search;
    } else{ /* Do nothing, continue escaping */ }
}

// Initial state after button press.
function init_state(){

}
// ---- End of states ----


// The main event loop for the finite state machine

// ev3.waitForButtonPress();
while(true){
    updateStats();
    // Execute the state
    nextState();
}
