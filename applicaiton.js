$(document).ready(function(){
  // open database
  databaseOpen(function(){
    alert("The database has been opened");
  });;


})

var db;

function databaseOpen(callback){
  var version = 1;
  var request = indexDB.open('todos', version);

  request.onsuccess = function(e){
    db = e.target.result;
    callback();
  };
  request.onerror = databaseError;
}

function databaseError(e){
  console.error('An indexDB error has occured',e);
}


