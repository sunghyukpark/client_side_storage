$(document).ready(function(){
  databaseOpen(function(){
    input = document.querySelector('input');
    document.body.addEventListener('submit', onSubmit);
    databaseTodosGet(function(todos){
      console.log(todos)
    });
  });

  function onSubmit(e){
    e.preventDefault();
    databaseTodosAdd(input.value, function(){
      input.value = '';
    });
  }

});

var db, input;

function databaseTodosGet(callback){
  var transaction = db.transaction(['todo'],'readwrite');
  var store = transaction.objectStore('todo');
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);
  var data = [];

  cursorRequest.onsuccess = function(e){
    var result = e.target.result;
    if(result){
      data.push(result.value);
      result.continue();
    } else {
      callback(data);
    }
  };
}


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


