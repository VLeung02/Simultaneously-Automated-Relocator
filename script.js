    // The value for 'accessToken' begins with 'pk...'
    mapboxgl.accessToken = 'pk.eyJ1IjoidmxldW5nMjAiLCJhIjoiY2wwZDN0b2VzMDQ3NTNpcG91djI2N29xcCJ9.JtDhq3_bi7JFVefK-PcgoQ'


    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, { enableHighAccuracy: true})

    function successLocation(position) {
      setupMap([position.coords.longitude, position.coords.latitude]);
    }

    function errorLocation(){
      setupMap([50.4501, 30.5234])
    }

    function setupMap(center){
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11', 
      center: center,
      zoom: 15
    })

    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav)

    var directions = new MapboxDirections ({
      accessToken: mapboxgl.accessToken
    });

    map.addControl(directions, 'top-left')
  };