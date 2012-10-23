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
  var now = Math.round(new Date().getTime() / 1000);


  console.log('number of docs in SensorReadings per sensor: ' + SensorReadings.find({id:id}).count());
  var counter = SensorReadings.find({id: id}).count();
  var handle = SensorReadings.find({id: id}).observe({
    added: function (doc, idx) {
      if(counter <= 1){
        reading = SensorReadings.findOne({id: id}, {sort:{lastUpdated: -1}});
        statObj = {
          id: id,
          name: reading.name,
          currentData: reading.data,
          stats: getStats(id),
          data: {
            day: getPlotData(id, now-DAY, now),
            week: getPlotData(id, now-WEEK, now)
          } 
        }

        self.set("sensor_stats", uuid, statObj);
        self.flush();
      }

      counter--;
    }
  });

  self.complete(); 

  // remove data and turn off observe when client unsubs
  self.onStop(function () {
    handle.stop();
  });

  });


function getPlotData(id, from, to){
  var readings = SensorReadings.find({id: id, lastUpdated:{$gt:from, $lte:to}}, {sort: {lastUpdated: 1}, fields: {data:1, lastUpdated:1}});
  var ret = {};

  readings.forEach(function(reading){
    var timestamp = reading.lastUpdated; 
    reading.data.forEach(function(data){
      if(ret[data.name] === undefined){
        ret[data.name] = [];
      }
      ret[data.name].push({timestamp: timestamp, value: parseFloat(data.value)});
    })
  });

  return ret;
}

function getReadingsData(id, from, to){
  var readings = SensorReadings.find({id: id, lastUpdated:{$gt:from, $lte:to}}, {sort: {lastUpdated: 1}, fields: {data:1, lastUpdated:1}});
  var ret = {};

  readings.forEach(function(reading){
    reading.data.forEach(function(data){
      if(ret[data.name] === undefined){
        ret[data.name] = [];
      }
      ret[data.name].push(parseFloat(data.value));
    })
  });

  return ret;
}

function getStatsFromPeriod(id, from, to){
  
  var ret = {
    max:[],
    min:[],
    mean:[],
  }

  stats = getReadingsData(id, from, to);

  for (var key in stats) {
    if (stats.hasOwnProperty(key)) {
      var mean = _.reduce(stats[key], function(memo, num){ return memo + num;}, 0) / stats[key].length;
      var max = _.max(stats[key]);
      var min = _.min(stats[key]);

      ret.mean.push({name: key, value: mean.toFixed(1)});
      ret.max.push({name: key, value: max});
      ret.min.push({name: key, value: min});
    }
  }

  return ret;
}

function getStats(id){
  var now = Math.round(new Date().getTime() / 1000);

  var ret = {
    day: getStatsFromPeriod(id, now-DAY, now),
    week: getStatsFromPeriod(id, now-WEEK, now),
    month: getStatsFromPeriod(id, now-MONTH, now),
    year: getStatsFromPeriod(id, now-YEAR, now)
  }
  return ret;
}
