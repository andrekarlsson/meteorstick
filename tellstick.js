Sensors = new Meteor.Collection("sensors");
SensorReadings = new Meteor.Collection("sensor_readings");
SensorStats = new Meteor.Collection("sensor_stats");
TL = TLog.getLogger(TLog.LOGLEVEL_MAX,true);

if (Meteor.is_client) {
  Meteor.subscribe("sensors");
  var handle;
  
  Template.sensor_list.sensors = function(){
    return Sensors.find({});
  }

  Template.sensor_info.sensor_info = function(id, options){
    console.log(SensorStats.findOne({}));
    return options.fn(SensorStats.findOne({}));
  }

  Template.sensor_list.events = { 
    'click a': function(event){
        if(handle !== undefined){
          handle.stop();
        }

        handle = Meteor.subscribe("sensor_stats", event.target.id, function onComplete(){
          console.log(SensorStats.find({}).count());
        })

        return false;
    }
  }

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

  Meteor.publish("sensor_stats", function (id) {
    var self = this;
    var uuid = Meteor.uuid();
    var handle = SensorReadings.find({id: id}).observe({
      added: function (doc, idx) {
        statObj = {
          id: id,
          currentData: SensorReadings.findOne({id: id}).data
        }
        self.set("sensor_stats", uuid, statObj);
        self.flush();
      },
      removed: function (doc, idx) {
        self.unset("sensor_stats", doc._id, _.keys(doc));
        self.flush();
      }
    });

    self.complete(); 

    // remove data and turn off observe when client unsubs
    self.onStop(function () {
      handle.stop();
    });

    });
}

