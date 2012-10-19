Sensors = new Meteor.Collection("sensors");
SensorReadings = new Meteor.Collection("sensor_readings");

if (Meteor.is_client) {
  Meteor.subscribe("sensors");
  Meteor.subscribe("current_readings");


  Template.sensor_list.sensors = function(){
    return Sensors.find({}, {sort: {name: 1}});
  }

  Template.sensor_heading.helpers({
    temp: function (id) {
      return "temp";
    }
  });
}

if (Meteor.is_server) {

  Meteor.publish("sensors", function () {
    var self = this;
    var handle = Sensors.find({}).observe({
      added: function (doc, idx) {
        self.set("sensors", doc._id, doc);
        self.flush();
      },
      removed: function (doc, idx) {
        self.unset("sensors", doc._id, _.keys(doc));
        self.flush();
      },   
      changed: function (newDocument, atIndex, oldDocument) {
        //Only update on name change
        if(newDocument.name !== oldDocument.name){
          self.set("sensors", doc._id, doc);
          self.flush();
        }
      }
    });

    // remove data and turn off observe when client unsubs
    self.onStop(function () {
      handle.stop();
    });

    });
}

