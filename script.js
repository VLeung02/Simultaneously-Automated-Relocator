// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken = 'pk.eyJ1IjoidmxldW5nMjAiLCJhIjoiY2wwZDN0b2VzMDQ3NTNpcG91djI2N29xcCJ9.JtDhq3_bi7JFVefK-PcgoQ'
var long = 0; // global, updated long
var lat = 0; // global, updated lat
var visibility;

var userlong = 0;
var userlat = 0;

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, { enableHighAccuracy: true })

function successLocation(position) {
  setupMap([position.coords.longitude, position.coords.latitude])
  userlong = position.coords.longitude
  userlat = position.coords.latitude;
}

// invoke this everytime in the async, use if state to see diff and use flyto
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function errorLocation() {
  setupMap([50.4501, 30.5234])
}

function setupMap(center) {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: center,
    zoom: 15
  })

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav)

  var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken
  });

  map.addControl(directions, 'top-left')

  map.on('load', async () => {
    // Get the initial location of the International Space Station (ISS).
    const geojson = await getLocation();
    // Add the ISS location as a source.
    map.addSource('iss', {
      type: 'geojson',
      data: geojson
    });
    // Add the rocket symbol layer to the map.
    map.addLayer({
      'id': 'iss',
      'type': 'symbol',
      'source': 'iss',
      'layout': {
        'icon-image': 'rocket-15'
      }
    });
    // Add the text layer
    // !!!
    map.addLayer({
      'id': 'textfield',
      'type': 'symbol',
      'source': 'iss',
      'layout': {
        'icon-image': 'custom-marker',
        'text-field': "I am the ISS",
        'text-font': [
          'Open Sans Semibold',
          'Arial Unicode MS Bold'
        ],
        'text-offset': [0, 1.25],
        'text-anchor': 'top'
      }
    });



    // Update the source from the API every 2 seconds.
    const updateSource = setInterval(async () => {
      const geojson = await getLocation(updateSource);
      map.getSource('iss').setData(geojson);
    }, 2000);

    async function getLocation(updateSource) {
      // Make a GET request to the API and return the location of the ISS.
      try {
        const response = await fetch(
          'https://api.wheretheiss.at/v1/satellites/25544',
          { method: 'GET' }
        );
        const { latitude, longitude } = await response.json();


        long = longitude
        lat = latitude


        const popup = new mapboxgl.Popup({ offset: 25 }).setText(
          "I was the ISS at: " + long + " " + lat
        );

        const el = document.createElement('div');
        el.id = 'marker';

        const marker1 = new mapboxgl.Marker()
          .setLngLat([long, lat])
          .setPopup(popup)
          .addTo(map);

        if (getDistanceFromLatLonInKm(userlong, userlat, long, lat) <= 2500) { // if iss is within 2500km from user, fly to ISS
            map.flyTo({
           center: [longitude, latitude],
            speed: 0.5
          });
        }


        // make a marker for each feature and add to the map
        // Return the location of the ISS as GeoJSON.
        return {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [longitude, latitude]
              }
            }
          ]
        };
      } catch (err) {
        // If the updateSource interval is defined, clear the interval to stop updating the source.
        if (updateSource) clearInterval(updateSource);
        throw new Error(err);
      }
    }
  });
};