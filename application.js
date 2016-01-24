$(document).ready(function(){
  databaseOpen(function(){
    input = document.querySelector('input');
    document.body.addEventListener('submit', onSubmit);
  });

  function onSubmit(e){
    e.preventDefault();
    databaseTodosAdd(input.value, function(){
      input.value = '';
    });
  }

});



var db, input;

function databaseTodosAdd(text, callback){
  var transaction = db.transaction(['todo'], 'readwrite');
  var store = transaction.objectStore('todo');
  var request = store.put({
    text: text,
    timeStamp: Date.now()
  });

  transaction.oncomplete = function(e){
    callback();
  };
  request.onerror = databaseError;
}


function databaseOpen(callback){
  var version = 1;
  var request = indexedDB.open('todos', version);

  request.onupgradeneeded = function(e){
    db = e.target.result;
    e.target.transaction.onerror = databaseError;
    db.createObjectStore('todo', { keyPath: 'timeStamp'});
  };

  request.onsuccess = function(e){
    db = e.target.result;
    callback();
  };
  request.onerror = databaseError;
}


function databaseError(e){
  console.error('An indexDB error has occured',e);
}


