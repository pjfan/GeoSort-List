//To-do:
//asynchronous HTTP requests
//error handling
//remove dependence on re-rendering
//tests


function item(title, location, details){
  var iTitle = title;
  var iLocation = location;
  var iDetails = details;
  var iDistance = null;
  var lat = null;
  var lng = null;
  var completed = false;
  this.getTitle = function(){
    return iTitle;
  }
  this.getLocation = function(){
    return iLocation;
  }
  this.getDetails = function(){
    return iDetails;
  }
  this.getDistance = function(){
    return iDistance;
  }
  this.setDistance = function(distance){
    iDistance = distance;
  }
  this.getCoords = function(){
    return [lat,lng]
  }
  this.setCoords = function(latitude,longitude){
    lat = latitude;
    lng = longitude;
  }
  this.setCompleted = function(state){
    completed = state;
  }
  this.getCompleted = function(){
    return completed;
  }
}

var masterList = {
  tasks: [],
  addItem: function(title, location, details){
    var li = new item(title,location,details);
    li.setCoords.apply(this, geoCode(li.getLocation()));
    this.tasks.push(li);
  },
  findItem: function(title){
    for (x=0; x<this.tasks.length; x++){
      if (this.tasks[x].getTitle() === title){
        return true;
      }
    }
    return false;
  },
  removeItem: function(title){
    for (x=0; x<this.tasks.length; x++){
      if (this.tasks[x].getTitle() === title){
        this.tasks.splice(x,1);
      }
    }
  },
  completeItem: function(title){
    for (x=0; x<this.tasks.length; x++){
      if (this.tasks[x].getTitle() === title){
        this.tasks[x].setCompleted(true);
      }
    }
  },
  remCompleteItem: function(title){
    for (x=0; x<this.tasks.length; x++){
      if (this.tasks[x].getTitle() === title){
        this.tasks[x].setCompleted(false);
      }
    }    
  }
}

function renderList(list){
  $(document).ready(function(){
    $('div').remove('.item');
    $('div').remove('.finishedItem');
    for (x=0; x<list['tasks'].length; x++){
      if (list['tasks'][x].getCompleted() === true){
        $('#mlist').append('<div class="item finishedItem"><li><p class="iTitle">'+list['tasks'][x].getTitle()+'</p><p class="iLocation">'+list['tasks'][x].getLocation()+'</p><p class="iDetails">'+list['tasks'][x].getDetails()+'</p></li><input type="checkbox" name="done" class="done_button" checked></input><button type="button" name="remove" class="remove_button">Remove</button></div>');
      }
      else{
        $('#mlist').append('<div class="item"><li><p class="iTitle">'+list['tasks'][x].getTitle()+'</p><p class="iLocation">'+list['tasks'][x].getLocation()+'</p><p class="iDetails">'+list['tasks'][x].getDetails()+'</p></li><input type="checkbox" name="done" class="done_button"></input><button type="button" name="remove" class="remove_button">Remove</button></div>');
      }
    };
  });
}

function bubbleSortList(list){
  var tasks = list['tasks'];
  var swaps=0;
  for (x=0; x < tasks.length-1; x++){
    if (tasks[x].getDistance() > tasks[x+1].getDistance()){
      var temp = tasks[x+1];
      tasks[x+1]=tasks[x];
      tasks[x]=temp;
      swaps++;
    } 
  }
  list['tasks'] = tasks;
  if (swaps>0){
    bubbleSortList(list);
  }
  else{
    return;
  }
}

$(document).ready(function(){
  //---------------This code block just pushes some example items on the list so that it's not empty when you load it.
  var ex1 = ['Get Tuition Refund Check', 'Chapel Hill, SASB', 'This is an Example. Get your $$$ Back'];
  var ex2 = ['Celebrate Joseph\'s Bday', 'Charlotte, NC', 'This is an Example. Happy 22nd Birthday, Lil Bro'];
  var ex3 = ['Attend end of the year Jam', 'Singapore', 'This is an Example. The Final Showdown B-boy Jam.'];
  var ex4 = ['Job Interview', 'Madison, WI', 'This is an Example. Do your on-site interview for Epic.'];
  var ex5 = ['Find the FungBros', 'New York City', 'This is an Example. Boba Life.'];
  var ex6 = ['Visit Vanessa', 'Johns Hopkins University, Baltimore, MD', 'This is an Example. Go see your Junior Sister'];
  exampleList = [ex1,ex2,ex3,ex4,ex5,ex6];
  for (x=0; x<exampleList.length; x++){
    exampleItem = exampleList[x];
    masterList.addItem(exampleItem[0],exampleItem[1],exampleItem[2]);
  }
  //----------------------------
  renderList(masterList);
  $('#add_button').click(function(){
    var addedTitle = $('input[name=Title]').val();
    var addedLocation = $('input[name=Location]').val();
    var addedDetails = $('input[name=Details]').val();
    if (masterList.findItem(addedTitle) === false){
      masterList.addItem(addedTitle, addedLocation, addedDetails);
      renderList(masterList);
    }
  })
  $('#geo_button').click(function(){
    getLocation();
  })
  $(document).on('click', '.remove_button', function(){
    sibs = $(this).siblings("li");
    title = sibs.children(".iTitle").text();
    masterList.removeItem(title);
    renderList(masterList);
  })
  $(document).on('click', '.done_button', function(){
//    console.log('clicked');
    if (this.checked === true){
//      console.log('checked');
      sibs = $(this).siblings("li");
      title = sibs.children(".iTitle").text();
      masterList.completeItem(title);
      $(this).parent().addClass("finishedItem");
    }
    else{
      sibs = $(this).siblings("li");
      title = sibs.children(".iTitle").text();
      masterList.remCompleteItem(title);
      $(this).parent().removeClass("finishedItem");
//      console.log('unchecked');
    }
  }) 
});

function geoCodeList(list, myPos){
  for (x=0; x<list['tasks'].length; x++){
    var coordinates = list['tasks'][x].getCoords();
    if (coordinates[0] === null || coordinates[1] === null){
      coordinates = geoCode(list['tasks'][x].getLocation());
      list['tasks'][x].setCoords(coordinates[0], coordinates[1]);
    } 
    var distance = findDistance(coordinates[0], coordinates[1], myPos[0], myPos[1]);
    list['tasks'][x].setDistance(distance);
//    console.log(list['tasks'][x].getLocation()+':'+distance);
  };
}

function acceptPos(position, list=masterList){
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  //var response = JSON.parse(httpGet('http://nominatim.openstreetmap.org/reverse?format=json&lat='+latitude+'&lon='+longitude));
  myPos = [latitude,longitude];
  geoCodeList(list, myPos);
  bubbleSortList(list);
  renderList(list);
}

function geoCode(address){
  var response = httpGet('https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key=');
  //REMEMBER TO DELETE THE API KEY BEFORE YOU SAVE OR COMMIT OR UPLOAD THIS FILE!
  var resp_obj = JSON.parse(response);
  var lat = resp_obj['results'][0]['geometry']['location']['lat'];
  var lng = resp_obj['results'][0]['geometry']['location']['lng'];
  return [lat,lng];
}

function findDistance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getLocation(){
  navigator.geolocation.getCurrentPosition(acceptPos, handleError);
}

function handleError(err){
  alert('There was an error with the navigator object. Make sure your browser supports geolocation.')
  console.log('error!');
  if (err.code == 1){
    console.log('User declined to share location, In order for this application to work, user must share location!');
    //user said no!
  }
  return null;
}

function httpGet(URL){
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open('GET', URL, false);
  //change the false in above stmnt to true once you figure out how to make async requests properly.  
  xmlHttp.onload = function (e) {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
      //console.log(xmlHttp.responseText);
        return xmlHttp.responseText;
      } else {
        console.error(xmlHttp.statusText);
      }
    }
  };
  xmlHttp.onerror = function (e) {
    console.error(xmlHttp.statusText);
  };
  xmlHttp.send(null);
  return xmlHttp.responseText;
  }



