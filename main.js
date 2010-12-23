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
 
/*global window, QUOTA_EXCEEDED_ERR, alert, confirm */

var checklistApp = {

//get all items and displays the list
getAllItems: function() {

	var checklist = '',
		myArray = [],
		completed = 0, //total number of checked items
		total = 0, //total number of items in list
		listlength = window.localStorage.length-1, //the total number of items held in localStorage
		item = '';

	for (var i = 0; i <= listlength; i++) {
		item = window.localStorage.key(i);
		myArray.push(item);
	}

	myArray.sort();

	for (var j = 0; j <= listlength; j++) {

		var sorteditem = myArray[j];

		//check item is not temporary (i.e. stored on key-up from user input)
		if (sorteditem !== 'inputvalue') {

			//is the item checked
			if (window.localStorage.getItem(sorteditem) === '1') {

				checklist += '<li role="listitem"><input type="checkbox" checked/><label class="done">' + sorteditem + '</label><span class="delete" tabindex="0">&times;</span></li>';
				completed ++;
				total ++;
			}
			else if (window.localStorage.getItem(sorteditem) === '0') {

				checklist += '<li role="listitem"><input type="checkbox" /><label>' + sorteditem + '</label><span class="delete" tabindex="0">&times;</span></li>';
				total ++;
			}
		}
		else {
			document.querySelector('#name').value = window.localStorage.getItem(sorteditem);
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
			target = event.target,
			name = '',
			data = 0;
			
		//<label>	
		if(target.tagName.toLowerCase() === 'label') {
		
			name = target.innerHTML;
			
			if (target.previousSibling.checked) {
				data = 0;
			}
			else {
				data = 1;
			}

			try {
				window.localStorage.setItem(name, data);
			} catch (err) {
			
				if (err == QUOTA_EXCEEDED_ERR) {
					alert('Quota exceeded!');
				}
			}
			checklistApp.getAllItems();
		}
		//<input>
		else if(target.tagName.toLowerCase() === 'input') { 
		
			name = target.nextSibling.innerHTML;
				
			if (target.checked) {
				data = 1;
			}
			else {
				data = 0;
			} 

			try {
				window.localStorage.setItem(name, data);
			} catch (error) {
			
				if (error == QUOTA_EXCEEDED_ERR) {
					alert('Quota exceeded!');
				}
			}
			checklistApp.getAllItems();
		}
		//<span>
		else if(target.tagName.toLowerCase() === 'span') {
		
			name = target.previousSibling.innerHTML;
			
			if (!confirm("Delete item: " + name + "?")) {
				return;
			}
			window.localStorage.removeItem(name);
			checklistApp.getAllItems();
		}
	};
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
			window.localStorage.setItem(strippedString, data);
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
				alert('Quota exceeded!');
			}
		}
		//clear the input value
		document.querySelector('#name').value = "";
		//remove temporary item from storage
		window.localStorage.removeItem('inputvalue');
		checklistApp.getAllItems();
	}
	else {
		alert('Nothing to add!');
	}
},

//delete all checked items
deleteChecked: function() {

	if (!confirm("Delete checked items?")) { return; }

	var i = 0,
		length = window.localStorage.length - 1;
			
	while (i <= length) {		
		var key = window.localStorage.key(i);
		if (window.localStorage.getItem(key) === '1') {
			window.localStorage.removeItem(key);
		}
		else { i++; }
	}
	checklistApp.getAllItems();
},

//delete all items
deleteAll: function() {

	if (!confirm("Delete all items?")) { return; }

	window.localStorage.clear();
	checklistApp.getAllItems();
},

//updates the URL in mail items buttons
updateMail: function() {

	//clear current mail link
	document.querySelector('#maillink').href = '';
	
	var mail = 'mailto:?',
		subject = 'List',
		list = '',
		length = window.localStorage.length,
		key = 0,
		i = 0;
	
	if (length !== 0) {
	
		for (i = 0; i <= length-1; i++) {
		
			key = window.localStorage.key(i);
			
			//append to list if not checked
			if (window.localStorage.getItem(key) === '0') {
				list += window.localStorage.key(i) + '\n';
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
		
		if (maillist.style.display === 'none') {
			maillist.style.display = 'block';
		}
		else {
			maillist.style.display = 'none';
		}
	}
	else {
		alert("You have no items to mail!");
	}
},

//store temporary item in localStorage
storeInput: function() {
	window.localStorage.setItem('inputvalue', this.value);
}

};

function loaded() {

	//hide the address bar in Mobile Safari
	window.scrollTo(0,0);
	
	//hack to enable active pseudo selectors on buttons in mobile webkit
	document.addEventListener("touchstart", function() {},false);
	
	//check if the browser supports localStorage
	if (typeof(window.localStorage) == 'undefined' ) {
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