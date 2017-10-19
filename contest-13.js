#!/usr/bin/env node
var ev3 = require('./node_modules/ev3source/ev3.js');
var source = require('./node_modules/ev3source/source.js');

// !!!!! CHANGE TO FALSE!!!!
var debug = false;
// !!!!! IMPORTANT ^

// Needs calibration
var maxSpeed = 1000;
var timeStep = 50; // in ms; used in runForTime()
// Time required to turn 90 degrees
var time90deg = 3500;
// Threshold to determine if a motor running at maxSpeed is pushing something
var pushingThreshold = maxSpeed * 0.65;
// Threshold to determine what value of getColor() is regarded as dangerous
var dangerThreshold = 4;
// Threshold to determine max distance of object to be recognised as an enemy
var eyesThreshold = 40; // in cm
// Threshold to determine when to start turning in the other direction during search
var searchStopThreshold = 0.2; // as a fraction of maxSpeed

// Sensors and Motor objects
var leftMotor = ev3.motorB();
var rightMotor = ev3.motorC();
var eyes = ev3.ultrasonicSensor();
var gyro = ev3.gyroSensor();
var colorSensor = ev3.colorSensor();

// ---- Miscellaneous functions ----
// abs not required as Math object is available in node.js
/*
function abs(val){
    return val < 0 ? -val : val;
}
*/
function not(direction) {
    return direction === "left" ? "right" : "left";
}

function turn(direction, time) {
    if (direction === "left") {
        ev3.runForTime(leftMotor, time, -maxSpeed);
        ev3.runForTime(rightMotor, time, maxSpeed);
    } else {
        ev3.runForTime(leftMotor, time, maxSpeed);
        ev3.runForTime(rightMotor, time, -maxSpeed);
    } 
}

function escapeturn(direction, time) {
    if (direction === "left") {
        ev3.runForTime(leftMotor, time, -maxSpeed);
        ev3.runForTime(rightMotor, time, 0.5 * maxSpeed);
    } else {
        ev3.runForTime(leftMotor, time, 0.5 * maxSpeed);
        ev3.runForTime(rightMotor, time, -maxSpeed);
    } 
}

// ---- End of miscellaneous functions ----
//
// ---- State variables ----
var nextState = init_state;
var lastSearch = undefined;
var leftMotorLast = undefined;
var rightMotorLast = undefined;
// ---- End of state variables ----

// ---- Status check functions ----
// Return value 0 to 5, the higher the return value, the higher the chance of
// getting kicked out of the arena
function getColor() {
    //var color = "undefined";
    var code = -1;

    var r = ev3.colorSensorRed(colorSensor);
    var g = ev3.colorSensorGreen(colorSensor);
    var b = ev3.colorSensorBlue(colorSensor);
    if (r <= 200) {
        if (b <= 120) {
            //color = "green";
            code = 3;
        } else if (b <= 200) {
            //color = "deep blue";
            code = 1;
        } else {
            //color = "turqoise";
            code = 2;
        }
    } else if (r <= 350) {
        if (b <= 100) {
            //color = "red";
            code = 5;
        } else {
            //color = "purple";
            code = 0;
        }
    } else {
        //color = "yellow";
        code = 4;
    }
    // source.alert("return "+ code + ", color:" + color + "("+r+","+g+","+b+")");
    return code;
}

function inDangerZone() {
    if (debug) return false;
    else return getColor() >= dangerThreshold;
}

// function leftPushing(){
//     if(leftMotorRunning !== 0){
//         return Math.abs(ev3.motorGetSpeed(leftMotor)) < pushingThreshold;
//     } else{
//         return ev3.motorGetSpeed(leftMotor) !== 0;
//     }
// }


function enemyAhead() {
    return ev3.ultrasonicSensorDistance(eyes) <= eyesThreshold;
}

function updateStats(){

}

// ---- End of status check functions ----



// ---- States ----
function search(){
    source.alert("search");
    var firstTime = false;
    if(prevState !== "search"){
        prevState = "search";
        firstTime = true;
    } else{ /* Do nothing */}
    // Rotate if motor is not already running
    if (Math.abs(ev3.motorGetSpeed(leftMotor)) < searchStopThreshold * maxSpeed) {
        if (firstTime) {
            // First call of search
            turn(lastSearch, time90deg);
            firstTime = false;
        } else {
            // search calling search, meaning sweep in one direction has failed
            lastSearch = not(lastSearch);
            turn(lastSearch, time90deg * 4);
        }
    }
    if(enemyAhead()){
        nextState = attackFront;
    } else if(inDangerZone()){
        nextState = escape;
    }
}

function attackFront(){
    source.alert("attackFront");
    // Run for 500ms for smooth ride
    ev3.runForTime(leftMotor, 500, maxSpeed);
    ev3.runForTime(rightMotor, 500, maxSpeed);

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


// function attackRear(){
//     source.alert("attackRear");
//     prevAttackMode = "attackRear";
//     ev3.runForTime(leftMotor, timeStep, -maxSpeed);
//     ev3.runForTime(rightMotor, timeStep, -maxSpeed);
//     if(prevState !== "attackRear"){
//         prevState = "attackRear";
//     } else{ /* Do nothing */}
//     if(inDangerZone()){
//         nextState = escape;
//     } else if(!pushing()){
//         nextState = search;
//     } else{ /* Do nothing. Continue attacking. */}
// }

function escape(){
    source.alert("escape");
    // Just asked to escape? Stop moving first
    if(prevState !== "escape"){
        ev3.motorSetStopAction(leftMotor, "hold");
        ev3.motorSetStopAction(rightMotor, "hold");
        ev3.motorStop(leftMotor);
        ev3.motorStop(rightMotor);
        prevState = "escape";
    } else{ /* Do nothing */ }

    // Rotate
    escapeturn(lastSearch, time90deg);
    // ev3.runForTime(leftMotor, 500, -maxSpeed);
    // ev3.runForTime(rightMotor, 500, -maxSpeed);
        

    // --- Transition code ---
    if(getColor() <= dangerThreshold - 1){
        lastSearch = not(lastSearch);
        nextState = search;
        ev3.motorStop(leftMotor);
        ev3.motorStop(rightMotor);
    } else{ source.alert(getColor());/* Do nothing, continue escaping */ }
}

// Initial state after button press.
function init_state(){
    // Always hold the ground
    ev3.motorSetStopAction(leftMotor, "hold");
    ev3.motorSetStopAction(rightMotor, "hold");
    // Very general scenario: directly search
    lastSearch = "left";
    prevState = "search";
    nextState = search;
    /*
    // Scenario 1: head-on →←
    prevState = "attackFront";
    nextState = attackFront;
    */
    
    /*
    // Scenario 2: parallel and facing same direction ↑↑

    */

    /*
    // Scenario 3: facing away from each other ←→
    */
}
// ---- End of states ----


// The main event loop for the finite state machine

// ev3.waitForButtonPress();
while(true){
    updateStats();
    // Execute the state
    nextState();
}
