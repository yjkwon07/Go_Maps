var positions = [];
var infobox;
var map;
var isfavorite;
/**
 * 
 * @param {Array} results 
 * @deprecated
 */
function setPositions(results) {
  for (result of results) {
    positions.push({
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      name: result.name,
      id: result.place_id
    });
  }
}

function initMap() {
  var center = positions[0] || { lat: 37.540705, lng: 126.956764 };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: center
  });
  setMarker(isfavorite);
}

function setMarker() {
  if (!positions || positions.length == 0) return;

  positions.forEach(function (position) {
    var marker = new google.maps.Marker({
      position: { lat: position.lat, lng: position.lng },
      map: map,
      title: position.name
    });

    var div = document.createElement('div');
    var h1 = document.createElement('h1');
    h1.textContent = position.name;
    
    if(isfavoriate){
      var button = document.createElement('button');
      button.classList.add('btn');
      button.textContent = '즐겨찾기 추가';
  
      button.onclick = function () {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
          if (xhr.status === 200) {
            location.href = '/';
          }
        };
        xhr.open('POST', `/location/${position.id}/favorite`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
          name: position.name,
          lat: position.lat,
          lng: position.lng
        }));
      };
      div.appendChild(button);
    }
    
    div.appendChild(h1);
    var infowindow = new google.maps.InfoWindow({
      content: div
    });
    marker.addListener('click', function () {
      infobox.close();
      infobox = infowindow;
      infowindow.open(map, marker);
    });
    infobox = infowindow;
  });
}
