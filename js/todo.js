$(document).ready(function(){

  // global variables - database, ref to key ui elements
	var db, input, ul

  // Open database, get user input, and render stored tasks
	databaseOpen(function(){
		input = document.querySelector('input');
		document.body.addEventListener('dblclick', onDoubleClick);
		databaseTasksGet(renderAllTasks);
	})

	//  main button click function
	$('button#create-task').on('click', function(){

		// remove nothing message
		if ('.nothing-message') {
			$('.nothing-message').hide('slide',{direction:'left'},300)
		};

		// create the new li from the form input
		var task = $('input[name=task-insert]').val();
    console.log(task)
		// add task to IndexDB
		databaseTasksAdd(text, function(){
			console.log('Task succefully added');
			input.value ='';
		})

		$('#task-list').append(task);

		// Alert if the form in submitted empty
		if (task.length == 0) {
			alert('please enter a task');
		};

		// makes other controls fade in when first task is created
		$('#controls').fadeIn();
		$('.task-headline').fadeIn();
	});

	// mark as complete
	$(document).on('click','li',function(){
		$(this).toggleClass('complete');
	});

	// double click to remove
	// $(document).on('dblclick','li',function(event){
	// 	$(this).remove();
	// 	databaseTasksDelete(parseInt(event.target.getAttribute('id'),10), function(){
	// 		console.log('data deleted')
	// 	});
	// });

	// Clear all tasks button
	$('button#clear-all-tasks').on('click', function(){
		$('#task-list li').remove();
		$('.task-headline').fadeOut();
		$('#controls').fadeOut();
		$('.nothing-message').show('fast');
	});
});

	function onDoubleClick(event){
		$(this).remove();
		databaseTasksDelete(parseInt(event.target.getAttribute('id'),10), function(){
			console.log('data deleted')
		});
	}

	function getCreatedTaskObject(text){
		var transaction = db.transaction(['task'], 'readonly');
		var store = transaction.objectStore('task');
		var myIndex = store.index('task');
		console.log(myIndex)
  	var countRequest = myIndex.count();

  	countRequest.onsuccess = function() {
    	console.log(countRequest.result);
  	}

		var task = store.get(index.count());
		return task;
	}

  function databaseOpen(callback){
    var version = 1;
    var request = indexedDB.open('tasks', version);

    request.onupgradeneeded = function(event){
      db = event.target.result;
      event.target.transaction.onerror = databaseError;
      db.createObjectStore('task', { keyPath:'timestamp'});
    };

    request.onsuccess = function(event){
      db = event.target.result;
      callback();
    };
    request.onerror = databaseError;
  }


	function databaseTasksGet(callback){
		var transaction = db.transaction(['task'], 'readwrite');
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
		}
	}

	function databaseTasksAdd(text, callback){
		var transaction = db.transaction(['task'], 'readwrite');
		var store = transaction.objectStore('task');
		var request = store.put({
			text: text,
			timeStamp: Date.now()
		});

		transaction.oncomplete = function(event){
			callback();
		};
		request.onerror = databaseError;
	}

	function databaseTasksDelete(id, callback) {
    var transaction = db.transaction(['task'], 'readwrite');
    var store = transaction.objectStore('task');
    var request = store.delete(id);
    transaction.oncomplete = function(event) {
      callback();
    };
    request.onerror = databaseError;
  }

  function databaseError(event){
    console.error('An indexDB error has occured',event);
  }

  function renderAllTasks(tasks){
			var html = '';
			tasks.forEach(function(task){
				html += taskToHtml(task);
			});
			$('#task-list').append(html);
		}

	function taskToHtml(task){
   	return'<li id="'+task.timeStamp+'">'+ task.text + '</li>';
  }
