
$(document).ready(function(){
  $('#add_button').click(function(){
    var addedTitle = $('input[name=Title]').val();
    var addedLocation = $('input[name=Location]').val();
    var addedDetails = $('input[name=Details]').val();
    master_list.add_task(addedTitle, addedLocation, addedDetails);
    $('#mlist').append('<div class="item"><li><p class="iTitle">'+addedTitle+'</p><p class="iLocation">'+addedLocation+'</p><p class="iDetails">'+addedDetails+'</p></li><input type="checkbox" name="done" id="done_button"></input><button type="button" name="remove" id="remove_button">Remove</button></div>')
  })
});

function show_map(position){
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var response = JSON.parse(httpGet("http://nominatim.openstreetmap.org/reverse?format=json&lat="+latitude+"&lon="+longitude));
  console.log(typeof(response));
  console.log(response["display_name"]);
  console.log(master_list["tasks"]);
  for (x=0; x<master_list.tasks.length; x++){
    var coord_array = geo_code(master_list["tasks"][x]["iLocation"]);
    var distance = get_distance(coord_array[0],coord_array[1],latitude,longitude);
    console.log(distance);
  };
   console.log(get_distance(35.904458, -79.044765, latitude, longitude));
  alert("latitude: " + latitude + " longitude: " + longitude);
}

function geo_code(address){
  var response = httpGet("https://maps.googleapis.com/maps/api/geocode/json?address="+address+"&keyAIzaSyCRCV8gybqRUqKHCDP_OcvUFezO0VgYNDI");
  var resp_obj = JSON.parse(response);
  var lat = resp_obj["results"][0]["geometry"]["location"]["lat"];
  var lng = resp_obj["results"][0]["geometry"]["location"]["lng"]
  console.log(resp_obj["results"][0]["geometry"]["location"]["lat"]);
  console.log(resp_obj["results"][0]["geometry"]["location"]["lng"]);

  return [lat,lng];
}

function get_distance(lat1,lon1,lat2,lon2) {
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

function get_location(){
  navigator.geolocation.getCurrentPosition(show_map, handle_error);
}

function handle_error(err){
  console.log("error!");
  if (err.code == 1){
    //user said no!
  }
}

function sayHello() {
   alert("Hello World")
}

function httpGet(URL){
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", URL, false);
  xmlHttp.send(null);
  console.log(xmlHttp.responseText);
  return xmlHttp.responseText;
}


function list_item(title, location, details){
  this.iTitle = title;
  this.iLocation=location;
  this.iDetails=details;
}

var master_list ={
  tasks: [],
  add_task: function(title,location,details){
    var li = new list_item(title,location,details);
    this.tasks.push(li);
  }
};
