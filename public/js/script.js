// Google map, Tampere area

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 61.497752, lng: 23.760954 },
    zoom: 12,
  });
}

window.onload = function () {
  const items = []; // array for spot description
  const items2 = []; // array for spot coordinates

  // Item object is used for coordinate point names, converted coordinates and addresses
  const Item = function (name, coords, descr) {
    this.addName = function (name) {
      this.name = name;
    };

    this.addCoords = function (coords) {
      this.coords = coords;
    };
    this.addDescr = function (descr) {
      this.description = descr;
    };
  };

  // json coordinate data is loaded

  $.get( "http://opendata.navici.com/tampere/opendata/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=opendata:WFS_RULLALAUTAILUALUE_MVIEW&outputFormat=json", function( response ) {
    //console.log(`tre ${response.features}`);

    const datat = response.features;
    let trecoords;
    let tempcoords;
    let tempitem;

    datat.forEach(function(el) {
      //console.log(`type ${el.geometry.type}`);

      // only point-type coordinates are handled
      // point names are stored as Item objects
      // coordinates are stored to string variable 'trecoords'
      if (el.geometry.type == 'Point') {
        tempitem = new Item();
        tempitem.addName(el.properties.ALUE_NIMI);
        tempitem.addDescr(el.properties.ALUE_SIJ);
        items.push(tempitem);

        tempcoords = el.geometry.coordinates.toString();
        //console.log(`tmp tre ${tempcoords}`);

        // coordinate string with ';' separator
        if (trecoords) {
          trecoords = trecoords+";"+tempcoords;
        } else {
          trecoords = tempcoords;
        }
      }
    }); // forEach

    //console.log(`trecoords2 ${trecoords}`);
    const nametable = JSON.stringify(items);
    console.log(nametable);

    // coordinate conversion
    $.getJSON( "http://epsg.io/trans?data="+trecoords+"&s_srs=3878&&t_srs=4326", function( response ) {
      // infowindow popup for markers
      let infowindow = null;
      // marker creation with coordinates and point names
      response.forEach(function(el, index) {
        const tempitem = new Item();
        tempitem.addCoords("{\"lat\": "+parseFloat(el.y)+", \"lng\": "+parseFloat(el.x)+"}");

        items2.push(tempitem.coords);
        //console.log(`name ${items[index].name}`);

        // new marker

		const marker = new google.maps.Marker({
		  position: {lat: parseFloat(el.y), lng: parseFloat(el.x)},
		  map: map,
		  title: items[index].name
		});

        // contents for infowindows, items is array with spot description info
				
		const contentString = '<div id="content">'
		  +'<div id="siteNotice">'
		  +'</div>'
		  +'<h1 id="firstHeading" class="firstHeading">'+items[index].name+'</h1>'
		  +'<div id="bodyContent">'
		  +'<p>'+items[index].description+'</p>'
		  +'</div>'
		  +'</div>';		

        infowindow = new google.maps.InfoWindow({
          content: contentString,
        });

        // click functionality for markers, opening infowindows

        marker.addListener('mousedown', function() {
          infowindow.close();
          infowindow = new google.maps.InfoWindow({
            content: contentString,
          });

          infowindow.open(map, marker);
        });

        items2.push(marker);
      }); // forEach
    }); // getJSON
  }) // get coords
    .fail(function() {
      alert('Sorry, could not load the coordinate data. Please try again later. If the problem persists, contact the administrator.');
    });
}; // window.onload
