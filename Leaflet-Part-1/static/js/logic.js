let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
});

let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let sat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Satellite Map": sat
};

let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let earthquakes = new L.LayerGroup();

d3.json(queryUrl).then(function (data) {

    L.geoJSON(data, {
        onEachFeature: onEachFeature,
        style: formatCircleMarker,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng);
        }}).addTo(earthquakes);
  
let plateQueryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
let plates = new L.layerGroup();

d3.json(plateQueryUrl).then(function (plateData) {

    L.geoJSON(plateData).addTo(plates);
});

let overlayMaps = {
    Earthquakes: earthquakes,
    TectonicPlates: plates
};

L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  earthquakes.addTo(myMap);
  street.addTo(myMap);

  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
};

function chooseColor(depth) {
    var color = "";
    if (depth >= -10 && depth <= 10) {
        return color = "#98ee00";
    }
    else if (depth > 10 && depth <= 30) {
        return color = "#d4ee00";
    }
    else if (depth > 30 && depth <= 50) {
        return color = "#eecc00";
    }
    else if (depth > 50 && depth <= 70) {
        return color =  "#ee9c00";
    }
    else if (depth > 70 && depth <= 90) {
        return color = "#ea822c";
    }
    else if (90 < depth) {
        return color = "#ea2c2c";
    }
    else {
        return color = "black";
    }
  }
  //Define function to select marker size based on magnitude
  function chooseSize(magnitude) {
    if (magnitude === 0) {
      return magnitude * 1
    };
    return magnitude * 5
  };

  function formatCircleMarker (feature, latlng) {
    let format = {
        radius: chooseSize(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        color: chooseColor(feature.geometry.coordinates[2]),
        opacity: 0.5
    }
    return format
  }
  
});
  
let legend = L.control({ position: "bottomright"});

legend.onAdd = function () {
  let div = L.DomUtil.create("div", "info legend");
  
  let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"]
  let depthRange = [-10, 10, 30, 50, 70, 90];

  for (let i = 0; i < depthRange.length; i++) {
    div.innerHTML += 
    "<i style='background: " + colors[i] + " '></i>"  + 
    depthRange[i] + (depthRange[i + 1] ? "&ndash;" + depthRange[i + 1] + "<br>" : "+");
  }
    return div;
};


legend.addTo(myMap);

