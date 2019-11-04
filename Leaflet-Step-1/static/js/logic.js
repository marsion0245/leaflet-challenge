
/*
	leaflet homework
	martin hrbac
*/

"use strict";

// IIFE
(()=>{
	// USGS endpoint query 
	// See https://earthquake.usgs.gov/fdsnws/event/1/ for parameters and default values
	// endtime: NOW; starttime: NOW - 30days 
	// Note: The service limits queries to 20000, and any that exceed this limit will generate a HTTP response code “400 Bad Request
	const queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson";
	const eventUrl = "https://earthquake.usgs.gov/earthquakes/eventpage/";

	// API key
	const API_KEY = "pk.eyJ1IjoibWFyc2lvbiIsImEiOiJjazFpZ3Z4Y2cwd281M2dzMDV2eTY0eWFxIn0.XotU1FxYm5MDX7hHU5FT7w";

	// Scale colors
	const quakeColor = ['#99ff99', '#ccff33', '#ffcc00', '#ff9933', '#ff6600', '#ff5050'];

	// Get earthquake data
	// d3.json(queryUrl, function(data) {
		// getEarthquakeData(data.features);
	// });

	function getEarthquakeData(quakeEvents){
		
		let reddata = quakeEvents.map(d => {
			return {
				id: d.id,
				title: d.properties.title,
				mag: d.properties.mag,
				time: new Date(d.properties.time),
				coordinates: d.geometry.coordinates
			};
		});

		// console.log(reddata);
		
		// quakeEvents.forEach((q)=>{
			// console.log(q.properties.mag);
		// });
	}
	
	function onEachFeature(feature, layer) {
		// Popup
		var formatTime = d3.timeFormat("%m/%d/%Y %H:%M:%S");
		layer.bindPopup(
			[`<h4>${feature.properties.title}</h4><hr>`, 
			`<div><b>Time:&nbsp;</b>${formatTime(new Date(feature.properties.time))}</div>`,
			`<div><b>Details:&nbsp;</b><a href="${eventUrl}/${feature.id}" target="_blank">${feature.id}</a></div>`]
			.join('')
		);
	}

	function addLegend(map){
		// Lengend with colors and quake magnitude
		let getText = (i) => i <  quakeColor.length - 1 ? `${i}&ndash;${i + 1}<br>` : `${i}+`;
		
		let legend = L.control({position: 'bottomright'});
		legend.onAdd = () => {
			let div = L.DomUtil.create('div', 'info legend');
			div.innerHTML = quakeColor.reduce((total, currentValue, idx) => [total, '<i style="background:', currentValue, '"></i>', getText(idx)].join(''), '<b>Magnitide:</b><br>'); // colors array into legend
			return div;
		};
		legend.addTo(map);
	}

	function createMap(){
	
		var hwMap = L.map('hwMap').setView([37.09, -95.71], 5);

		// Map layer
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			maxZoom: 18,
			attribution: `Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, 
						<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>`,
			id: 'mapbox.light',
			accessToken: API_KEY
		}).addTo(hwMap);
		
		// Eartquake location layer
		L.geoJSON(quakeData.features.slice(0, 1000), { 
			onEachFeature: onEachFeature,

			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, {
					radius: (1 + feature.properties.mag) * 4,
					fillColor: quakeColor[Math.min(parseInt(feature.properties.mag),5)],
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
				});			
			}
		}).addTo(hwMap);
		
		addLegend(hwMap);
	}	

	createMap();


	//getEarthquakeData(quakeData.features);



})();


/*
        {
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -104.9788452,
                    39.6933755
                ]
            },
            "type": "Feature",
            "properties": {
                "popupContent": "This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!"
            },
            "id": 74
        }


One value from returned data
{
"type":"Feature",
"id":"us700062kx",
"properties":{
	"mag":5.0999999999999996,
	"place":"Off the east coast of the North Island of New Zealand",
	"time":1572797249046,
	"updated":1572799743040,
	"tz":720,
	"url":"https://earthquake.usgs.gov/earthquakes/eventpage/us700062kx",
	"detail":"https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=us700062kx&format=geojson",
	"felt":null,
	"cdi":null,
	"mmi":null,
	"alert":null,
	"status":"reviewed",
	"tsunami":0,
	"sig":400,
	"net":"us",
	"code":"700062kx",
	"ids":",us700062kx,",
	"sources":",us,",
	"types":",geoserve,origin,phase-data,",
	"nst":null,
	"dmin":2.7269999999999999,
	"rms":0.58999999999999997,
	"gap":60,
	"magType":"mww",
	"type":"earthquake",
	"title":"M 5.1 - Off the east coast of the North Island of New Zealand"
},
"geometry":{
	"type":"Point",
	"coordinates":
	[179.52850000000001,-35.014600000000002,54.149999999999999] // lat, lon, depth (km)
}
}
*/