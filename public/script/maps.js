var positions = [];

/**
 * 
 * @param {Array} results 
 */
function init(results) {
  for (result of results) {
    positions.push({
      lat: result.location[1],
      lng: result.location[0],
      name: result.name,
      id: result.placeId
    });
  }
}

function initMap() {
  var center = positions[0] || { lat: 37.540705, lng: 126.956764 };
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: center
  });
  positions.forEach(function (pos) {
    new google.maps.Marker({
      position: { lat: pos.lat, lng: pos.lng },
      map: map,
      title: pos.name
    });
  });
}
