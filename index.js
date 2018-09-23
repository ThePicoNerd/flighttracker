var ExtPlaneJs = require("./ExtPlane");
var express = require("express");
var app = express();

var PORT = 80;

var ExtPlane = new ExtPlaneJs({
  host: "192.168.0.2",
  port: 51000,
  broadcast: true
});

var flightdata = {
  heading: 0,
  altitude: 0,
  ias: 0,
  acceleration: 0,
  verticalSpeed: 0,
  onGround: true,
  latlng: [0, 0],
  engines: 2,
  online: false
}

const subscriptions = {
  "sim/flightmodel/position/longitude": {
    name: "longitude"
  },
  "sim/flightmodel/position/latitude": {
    name: "latitude"
  },
  "sim/cockpit2/gauges/indicators/compass_heading_deg_mag": {
    name: "heading"
  },
  "sim/cockpit2/gauges/indicators/altitude_ft_pilot": {
    name: "altitude"
  },
  "sim/cockpit2/gauges/indicators/airspeed_kts_pilot": {
    name: "ias"
  },
  "sim/cockpit2/gauges/indicators/airspeed_acceleration_kts_sec_pilot": {
    name: "acceleration"
  },
  "sim/cockpit2/gauges/indicators/vvi_fpm_pilot": {
    name: "verticalSpeed"
  },
  "sim/flightmodel/failures/onground_any": {
    name: "onGround"
  },
  "sim/flightmodel/position/groundspeed": {
    name: "groundSpeed"
  },
  "sim/flightmodel/engine/ENGN_N1_": {
    name: "N1"
  },
  "sim/cockpit/warnings/annunciators/reverse": {
    name: "reversers"
  },
  "sim/aircraft/engine/acf_num_engines": {
    name: "engines"
  }
};

ExtPlane.on("loaded", () => {
  ExtPlane.client.interval(.5);

  Object.keys(subscriptions).forEach(subscription => {
    ExtPlane.client.subscribe(subscription);
  });
});

ExtPlane.on("data-ref", (dataref, value) => {
  flightdata.online = true;

  var name = subscriptions[dataref].name;

  switch (name) {
    case "latitude":
      flightdata.latlng[0] = value
      break;

    case "longitude":
      flightdata.latlng[1] = value;
      break;
    
    case "onGround":
      flightdata.onGround = !!value;
      break;
    
    case "groundSpeed":
      flightdata.groundSpeed = value * 0.514444;
      break;
    
    case "N1":
      flightdata.N1 = value.slice(0, flightdata.engines);
      break;
    
    case "reversers":
      flightdata.reversers = !!value;
      break;

    default:
      flightdata[name] = value;
      break;
  }
});

app.get("/", (req, res) => {
  res.json(flightdata);
});

app.get("/latlng", (req, res) => {
  res.json(flightdata.latlng);
});

app.listen(PORT);

console.log(`Up on port ${PORT}.`);