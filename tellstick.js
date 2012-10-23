Sensors = new Meteor.Collection("sensors");
SensorReadings = new Meteor.Collection("sensor_readings");
SensorStats = new Meteor.Collection("sensor_stats");

if (Meteor.is_client) {
  Meteor.subscribe("sensors");
  var handle;

  /**
   * Debug output for handlebar contexts, log to console.
   *
   * Usage: {{debug}} or {{debug optionalValue}}
   * 
   */
  Handlebars.registerHelper("debug", function(optionalValue) { 
    console.log("Current Context"); 
    console.log("--------------------"); 
    console.log(this);   
    if (optionalValue) { 
      console.log("Value"); 
      console.log("--------------------"); 
      console.log(optionalValue); 
    } 
  });

  /**
   * Iterate over an object, setting 'key' and 'value' for each property in
   * the object.
   *
   * Usage: {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
   *
   * author: strathmyer, https://gist.github.com/1371586
   *  
   */
  Handlebars.registerHelper("key_value", function(obj, fn) {
      var buffer = "",
          key;

      for (key in obj) {
          if (obj.hasOwnProperty(key)) {
              buffer += fn({key: key, value: obj[key]});
          }
      }

      return buffer;
  });

  Template.sensorList.sensors = function(){
    return Sensors.find({});
  }

  Template.sensorInfo.helpers({
      sensorInfo: function(id, options){
        //console.log(SensorStats.findOne({}));
        return options.fn(SensorStats.findOne({}));
      },
      sensorPlot: function(data){
        if(data === ''){
          return ;
        }

        var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 920 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) { return x(d.timestamp); })
            .y(function(d) { return y(d.value); });

            d3.select("svg").remove();

          console.log();
          var svg = d3.select(".container").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
            
        
        data.forEach(function(d) {
          d.timestamp = new Date(d.timestamp*1000);
          d.value = d.value;
        });



        x.domain(d3.extent(data, function(d) { return d.timestamp; }));
        y.domain(d3.extent(data, function(d) { return d.value; }));

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end");

        svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);
        }




  });

  Template.sensorList.events = { 
    'click a': function(event){
        if(handle !== undefined){
          handle.stop();
        }

        handle = Meteor.subscribe("sensor_stats", event.target.id, function onComplete(){
          console.log("subscription complete");
        })

        return false;
    }
  }

}


  

