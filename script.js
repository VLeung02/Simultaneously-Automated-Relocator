// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken = 'pk.eyJ1IjoidmxldW5nMjAiLCJhIjoiY2wwZDN0b2VzMDQ3NTNpcG91djI2N29xcCJ9.JtDhq3_bi7JFVefK-PcgoQ'
let long = 0;
var lat;
var visibility;

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, { enableHighAccuracy: true })

function successLocation(position) {
  setupMap([position.coords.longitude, position.coords.latitude]);
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
      //map.getSource('text-field').setText(geojson);
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
        // Fly the map to the location.
        map.flyTo({
          center: [longitude, latitude],
          speed: 0.5
        });
        long = long + 1;

      
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