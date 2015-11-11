'use strict';

var _ = require('lodash');
var request = require('request');

var Weather = require('./weather.model');

// Get weather now from Wunderground
// Allow to run for every 2 minutes from 6AM to 6PM
var tick = 120000; //2 minutes
var currentConditions, canCheck = false;
var interval = setInterval(function(){
  canCheck = true;
}, tick)

exports.now = function(req, res) {
  var lat = req.params.lat;
  var lon = req.params.lon;
  //Allowing Access-Control-Allow-Origin
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  function getWeather(lat,lon, cb){
    var weatherAPIOptions = {
      uri: 'http://api.wunderground.com/api/' + process.env.WUNDERGROUND_KEY + '/conditions/lang:VU/q/' + lat + "," + lon + ".json",
      json: true
    };
    //console.log(weatherAPIOptions.uri);
    request(weatherAPIOptions, function(error, response, body) {
      if (error || response.statusCode !== 200) {return cb('Error', {});}
      return cb(null, body);
    })
  };

  function weatherNow(){
    /**
     * TODO: finding a way to detect user public ip
    var locationAPIOptions = {
      uri: 'http://ip-api.com/json',
      json: true
    };

    request(locationAPIOptions, function(error, response, body) {
      if (error || response.statusCode !== 200) {return res.status(500).json({});}
      getWeather(body.lat, body.lon, function(err, data) {
        if (err) {return res.status(500).json({});}
        currentConditions = data;
        return res.status(200).json(currentConditions);
      })
    });
    */

    getWeather(lat, lon, function(err, data) {
      if (err) {return res.status(500).json({});}
      currentConditions = data;
      return res.status(200).json(currentConditions);
    });
  };

  if (canCheck || !currentConditions) {
    weatherNow();
    canCheck = false;
    console.log('New data');
  } else {
    console.log('Old data');
    return res.status(200).json(currentConditions);
  }

};

// Get list of weathers
exports.index = function(req, res) {
  Weather.find(function (err, weathers) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(weathers);
  });
};

// Get a single weather
exports.show = function(req, res) {
  Weather.findById(req.params.id, function (err, weather) {
    if(err) { return handleError(res, err); }
    if(!weather) { return res.status(404).send('Not Found'); }
    return res.json(weather);
  });
};

// Creates a new weather in the DB.
exports.create = function(req, res) {
  Weather.create(req.body, function(err, weather) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(weather);
  });
};

// Updates an existing weather in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Weather.findById(req.params.id, function (err, weather) {
    if (err) { return handleError(res, err); }
    if(!weather) { return res.status(404).send('Not Found'); }
    var updated = _.merge(weather, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(weather);
    });
  });
};

// Deletes a weather from the DB.
exports.destroy = function(req, res) {
  Weather.findById(req.params.id, function (err, weather) {
    if(err) { return handleError(res, err); }
    if(!weather) { return res.status(404).send('Not Found'); }
    weather.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
