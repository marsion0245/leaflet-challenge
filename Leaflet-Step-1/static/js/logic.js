
/*
	leaflet homework - step 1
	martin hrbac
	The code works either with localy stored data or it pulls data from the web site.
*/

"use strict";

// IIFE
(()=>{
	
	// Set this value to true if you want to load new data from USGS when page is loaded.
	// Leave it false to laod data stored with the solution.
	const loadNewData = true;
	
	// USGS endpoint query 
	// See https://earthquake.usgs.gov/fdsnws/event/1/ for parameters and default values
	// endtime: NOW; starttime: NOW - 30days 
	// Note: The service limits queries to 20000, and any that exceed this limit will generate a HTTP response code “400 Bad Request
	const queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson";
	const eventUrl = "https://earthquake.usgs.gov/earthquakes/eventpage/";

	// API key
	const API_KEY = "pk.eyJ1IjoibWFyc2lvbiIsImEiOiJjazFpZ3Z4Y2cwd281M2dzMDV2eTY0eWFxIn0.XotU1FxYm5MDX7hHU5FT7w";

	// Magnitude scale colors
	const quakeColor = ['#99ff99', '#ccff33', '#ffcc00', '#ff9933', '#ff6600', '#ff5050'];

	const formatTime = d3.timeFormat("%m/%d/%Y %H:%M:%S");

	const maxEvents = 2500; // limit number of events, the value can be increased; I've observer significant slowdown with higher number of events (15k+)

	if(loadNewData){
		// Get earthquake data
		d3.json(queryUrl, function(data) {
			createMap(data.features.slice(0, maxEvents));
		});
	}else{
		createMap(earthquakeDataLocal.features.slice(0, maxEvents));
	}
	
	function addMagnitudeLegend(map){
		// Lengend with colors and quake magnitude
		let getText = (i) => i <  quakeColor.length - 1 ? `${i}&ndash;${i + 1}<br>` : `${i}+`;
		
		let legend = L.control({position: 'bottomright'});
		legend.onAdd = () => {
			let div = L.DomUtil.create('div', 'info legend');
			div.innerHTML = quakeColor.reduce((total, currentValue, idx) => [total, '<i style="background:', currentValue, '"></i>', getText(idx)].join(''), '<b>Magnitude:</b><br>'); // colors array into legend
			return div;
		};
		legend.addTo(map);
	}

	function addMapTitle(qData, map){
		
		let eventCount = qData.length;
		let fromDate = formatTime(qData.reduce((min, p) => p.properties.time < min ? p.properties.time : min, qData[0].properties.time));
		let toDate = formatTime(qData.reduce((max, p) => p.properties.time > max ? p.properties.time : max, qData[0].properties.time));
		
		let legend = L.control({position: 'topright'});
		legend.onAdd = () => {
			let div = L.DomUtil.create('div', 'info maptitle');
			div.innerHTML = [`USGS Earthquake Data<br><hr>`, 
							 `<div class='maptitletxt'><span>From:</span>${fromDate}</div><div class='maptitletxt'><span>To:</span>${toDate}</div>`,
							 `<div class='maptitletxt'><span>Events:</span>${eventCount}</div>`].join('');
			return div;
		};
		legend.addTo(map);
	}

	function createMap(qData){
	
		var hwMap = L.map('hwMap').setView([37.09, -95.71], 5);

		// Map layer
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			maxZoom: 18,
			attribution: `Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, 
						<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>`,
			id: 'mapbox.light',
			accessToken: API_KEY
		}).addTo(hwMap);
		
		
		let addEarthquakePopup = (feature, layer) => 
			layer.bindPopup(
				[`<h4>${feature.properties.title}</h4><hr>`, 
				`<div><b>Time:&nbsp;</b>${formatTime(new Date(feature.properties.time))}</div>`,
				`<div><b>Details:&nbsp;</b><a href="${eventUrl}/${feature.id}" target="_blank">${feature.id}</a></div>`]
				.join('')
			);
		
		// Eartquake location layer
		L.geoJSON(qData, { 
			onEachFeature: addEarthquakePopup,

			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, {
					radius: (1 + feature.properties.mag) * 4, // magnitude scaling 
					fillColor: quakeColor[Math.min(parseInt(feature.properties.mag),5)],
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
				});			
			}
		}).addTo(hwMap);

		addMapTitle(qData, hwMap);
		addMagnitudeLegend(hwMap);
	}	
})();

