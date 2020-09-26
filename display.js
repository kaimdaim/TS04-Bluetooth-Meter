/*
This script takes the values from the JSON object generated by ble.js
and puts them in the elements of a page. This page is very basic. You might
want to do something more with it.

created 6 Aug 2018
by Tom Igoe
*/

function fillDisplay(thisMeter) {
  // Is the meter connected or not?
  if (thisMeter.status !== null) {
    document.getElementById('status').value = thisMeter.status;
  } else {
    document.getElementById('status').value = 'Connected';
  }
  // assemble the meter reading's value, units, and order of magnitude:
  document.getElementById('value').value = thisMeter.negativePolarity
  + thisMeter.value;
  document.getElementById('units').value =  thisMeter.magnitude
  + thisMeter.units;
  // IF measuring voltage or amperage, indicate AC/DC:
  if (thisMeter.units === 'volts' || thisMeter.units === 'amps') {
    document.getElementById('acDc').value = thisMeter.acDc;
  } else {
    document.getElementById('acDc').value = '';
  }
  // if measuring non-contact voltage, indicate that, and clear units:
  if (thisMeter.ncv) {
    document.getElementById('value').value = thisMeter.ncv;
    document.getElementById('units').value = '';
  }
  // is auto-ranging on?
  if (thisMeter.autoRange) {
    document.getElementById('autoRange').value = 'AutoRange';
  } else {
    document.getElementById('autoRange').value = '';
  }
  // is the hold button on?
  if (thisMeter.hold) {
    document.getElementById('hold').value = 'hold';
  } else {
    document.getElementById('hold').value = '';
  }
  // what setting are you on?
  document.getElementById('setting').value = thisMeter.setting;
}
}


// clear all the display elements except the connection status:
function clearDisplay(meter) {
  document.getElementById('connected').value = 'Disconnected';
  document.getElementById('value').value = '';
  document.getElementById('units').value =  '';
  document.getElementById('acDc').value = '';
  document.getElementById('autoRange').value = '';
  document.getElementById('hold').value = '';
  document.getElementById('setting').value = '';
}
