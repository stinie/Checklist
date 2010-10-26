/*
 * 
 * Find more about this app by visiting
 * http://miniapps.co.uk/
 *
 * Copyright (c) 2010 Alex Gibson, http://miniapps.co.uk/
 * Released under MIT license
 * http://miniapps.co.uk/license/
 *
 */
 
var checklistApp = {

//get all items and displays the list
getAllItems: function() {
   	
   	var checklist = '',
  		myArray = [],
   		completed = 0, //total number of checked items
   		total = 0, //total number of items in list
   		listlength = localStorage.length-1, //the total number of items held in localStorage
   		item = '';
   		
   	for (var i = 0; i <= listlength; i++) {
    	item = localStorage.key(i);
    	myArray.push(item);
    }
    
    myArray.sort();
    
    for (var j = 0; j <= listlength; j++) {
    
    	var sorteditem = myArray[j];
    	
    	//check item is not temporary (i.e. stored on key-up from user input)
    	if (sorteditem !== 'inputvalue') {
    	
    		//is the item checked
     		if (localStorage.getItem(sorteditem) === '1') {
     		
     			checklist += '<li role="listitem"><input type="checkbox" checked/><label class="done">' + sorteditem + '</label><span class="delete" tabindex="0">&times;</span></li>';
     			completed ++;
     			total ++;
     		}
     		else if (localStorage.getItem(sorteditem) === '0') {
     		
     			checklist += '<li role="listitem"><input type="checkbox" /><label>' + sorteditem + '</label><span class="delete" tabindex="0">&times;</span></li>';
     			total ++;
     		}
     	}
     	else {
     		document.querySelector('#name').value = localStorage.getItem(sorteditem);
     	}
   	}
   	
   	if (checklist === '') {
   		checklist = '<li role="listitem" class="empty">List empty</li>';
   	}
   	
   	//update totals
   	document.querySelector('#remaining').innerHTML = total - completed;
   	document.querySelector('#total').innerHTML = total;
   	
   	//if all items are completed and the mail list button is showing, hide it.
   	if (completed === total) {
   		document.querySelector('#maillist').style.display = 'none';
   	}
   	
   	//update view
   	document.querySelector('#checklist').innerHTML = checklist;
   	document.querySelector('#checklist').lastChild.style.border = '0';
},

//capture click events in list
eventDelegation: function() {

	var listitems = document.querySelector('#checklist');
	
	listitems.onclick = function (e) {
	
		var event = e,
			target = event.target;
			
		//<label>	
		if(target.tagName.toLowerCase() === 'label') {
		
			var name = target.innerHTML,
				data;
			
			target.previousSibling.checked ? data = 0 : data = 1;

			try {
				localStorage.setItem(name, data);
			} catch (e) {
			
				if (e == QUOTA_EXCEEDED_ERR) {
					alert('Quota exceeded!');
				}
			}
			checklistApp.getAllItems();
		}
		//<input>
		else if(target.tagName.toLowerCase() === 'input') { 
		
			var name = target.nextSibling.innerHTML,
				data;
				
			target.checked ? data = 1 : data = 0;

			try {
				localStorage.setItem(name, data);
			} catch (e) {
			
				if (e == QUOTA_EXCEEDED_ERR) {
					alert('Quota exceeded!');
				}
			}
			checklistApp.getAllItems();
		}
		//<span>
		else if(target.tagName.toLowerCase() === 'span') {
		
			var name = target.previousSibling.innerHTML;
			if (!confirm("Delete item: " + name + "?")) {
				return;
			}
			localStorage.removeItem(name);
			checklistApp.getAllItems();
		}
	}
},

//adds a single item
addNewItem: function() {
	
	var name = document.querySelector('#name').value,
		data = 0,
		strippedString = '';
		
	//strip html tags
	strippedString = name.replace(/(<([^>]+)>)/ig, "");
		
	//encode special characters
	strippedString = strippedString.replace(/&/,"&amp;");
	strippedString = strippedString.replace(/</,"&lt;");
	strippedString = strippedString.replace(/>/,"&gt;");
		
	//add item
	if (strippedString !== "") {
	
		try {
			localStorage.setItem(strippedString, data);
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
				alert('Quota exceeded!');
			}
		}
		//clear the input value
   		document.querySelector('#name').value = "";
   		//remove temporary item from storage
   		localStorage.removeItem('inputvalue');
   		checklistApp.getAllItems();
   }
   else {
   		alert('Nothing to add!');
   }
},

//delete all checked items
deleteChecked: function() {

	if (!confirm("Delete checked items?")) return;

	var i = 0,
		length = localStorage.length - 1;
			
	while (i <= length) {		
		var key = localStorage.key(i);
		if (localStorage.getItem(key) === '1') {
			localStorage.removeItem(key);
		}
		else { i++; }
	}
	checklistApp.getAllItems();
},

//delete all items
deleteAll: function() {

	if (!confirm("Delete all items?")) return;

	localStorage.clear();
	checklistApp.getAllItems();
},

//updates the URL in mail items buttons
updateMail: function() {

	//clear current mail link
	document.querySelector('#maillink').href = '';
	
	var mail = 'mailto:?',
		subject = 'List',
		list = '',
		length = localStorage.length,
		key = 0;
	
	if (length !== 0) {
	
		for (i = 0; i <= length-1; i++) {
		
			key = localStorage.key(i);
			
			//append to list if not checked
			if (localStorage.getItem(key) === '0') {
				list += localStorage.key(i) + '\n';
			}
		}

		if (list !== '') {
			mail += 'subject=' + encodeURIComponent(subject);
			mail += '&body=' + encodeURIComponent(list);
			document.querySelector('#maillink').href = mail;
		}
	}
},

//toggle mail items button
sendMail: function() {

	var remaining = document.querySelector('#remaining').innerHTML,
		maillist = document.querySelector('#maillist');
		
   	if (remaining !== '0') {
   	
   		checklistApp.updateMail();

   		maillist.style.display === 'none' ? maillist.style.display = 'block' : maillist.style.display = 'none';
   	}
   	else {
   		alert("You have no items to mail!");
   	}
},

//store temporary item in localStorage
storeInput: function() {
	localStorage.setItem('inputvalue', this.value);
}

};

function loaded() {

	//hide the address bar in Mobile Safari
	window.scrollTo(0,0);
	
	//check if the browser supports localStorage
	if (typeof(localStorage) == 'undefined' ) {
		alert('Your browser does not support HTML5 localStorage. Try upgrading.');
	} 
	else {
	
		//hide the mail list button
		document.querySelector('#maillist').style.display = 'none';
		
		//display all saved items
		checklistApp.getAllItems();
		checklistApp.eventDelegation();
		
		document.querySelector('#name').addEventListener('keyup', checklistApp.storeInput, false);
		document.querySelector('#deleteall').addEventListener('click', checklistApp.deleteAll, false);
		document.querySelector('#deletechecked').addEventListener('click', checklistApp.deleteChecked, false);
		document.querySelector('#sendmail').addEventListener('click', checklistApp.sendMail, false);
		document.querySelector('#add').addEventListener('click', checklistApp.addNewItem, false);
	}

}

window.addEventListener("load", loaded, true);

