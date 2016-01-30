$(document).ready(function(){

  // Global variables (database, reference to key ui element)
  var db, input, ul

  databaseOpen(function(){
    input = document.querySelector('input');
    ul = document.querySelector('ul');
    document.body.addEventListener('submit', onSubmit);
    document.body.addEventListener('click', onClick);
    databaseTasksGet(renderAllTasks);
  });

  function onClick(e){
    if(e.target.hasAttribute('id')){
      databaseTasksDelete(parseInt(e.target.getAttribute('id'),10), function(){
        databaseTasksGet(renderAllTasks);
      });
    }
  }

  function onSubmit(e){
    e.preventDefault();
    databaseTasksAdd(input.value, function(){
      databaseTasksGet(renderAllTasks)
      input.value = '';
    });
  }

  function renderAllTasks(tasks){
    var html = '';
    tasks.forEach(function(task){
      html += taskToHtml(task);
    });
    ul.innerHTML = html;
  }

  function taskToHtml(task){
    return'<li id="'+task.timeStamp+'">'+ task.text + '</li>';
  }

  function databaseTasksGet(callback){
    var transaction = db.transaction(['task'],'readwrite');
    var store = transaction.objectStore('task');
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);
    var data = [];

    cursorRequest.onsuccess = function(event){
      var result = event.target.result;
      if(result){
        data.push(result.value);
        result.continue();
      } else {
        callback(data);
      }
    };
  }


  function databaseTasksAdd(text, callback){
    var transaction = db.transaction(['task'], 'readwrite');
    var store = transaction.objectStore('task');
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
    var request = indexedDB.open('tasks', version);

    request.onupgradeneeded = function(e){
      db = e.target.result;
      e.target.transaction.onerror = databaseError;
      db.createObjectStore('task', { keyPath: 'timeStamp'});
    };

    request.onsuccess = function(e){
      db = e.target.result;
      callback();
    };
    request.onerror = databaseError;
  }

  function databaseTasksDelete(id, callback) {
    var transaction = db.transaction(['task'], 'readwrite');
    var store = transaction.objectStore('task');
    var request = store.delete(id);
    transaction.oncomplete = function(e) {
      callback();
    };
    request.onerror = databaseError;
  }

  function databaseError(e){
    console.error('An indexDB error has occured',e);
  }
});




