var require = __meteor_bootstrap__.require;
var Future = require('fibers/future');


var oauth = OAuth(config);

function success(data) {
  removeDeletedSensors(Sensors.find({}).fetch(), data.sensor);

  data.sensor.forEach(function(sensor){
    Sensors.update({id:sensor.id},sensor,{upsert:true});

    var future = new Future;
    oauth.getJSON('http://api.telldus.com/json/sensor/info?id=' + sensor.id, function(data){SensorReadings.insert(data); future.return(); }, function(data){console.log(data)});
    future.wait();

  });
}

function failure(data) {
   console.log(data);
}

function removeDeletedSensors(oldSensorArr, newSensorArr){
  var oldIdArr = [];
  var newIdArr = [];

  oldSensorArr.forEach(function(oldSensor){
    oldIdArr.push(oldSensor.id);
  });

  newSensorArr.forEach(function(newSensor){
    newIdArr.push(newSensor.id);
  });

  var removableSensors = _.difference(oldIdArr, newIdArr);

  removableSensors.forEach(function(sensorId){
    Sensors.remove({id: sensorId});
  });

}

Meteor.startup(function () {

  Meteor.setInterval(function(){ oauth.getJSON('http://api.telldus.com/json/sensors/list', success, failure); }, 10000);

});