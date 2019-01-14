'using strict'

var optionsURL = chrome.runtime.getURL('options.html');



function showNotification (title, options) {
		if ("Notifications" in window) {
			//console.log("no push in browser");
		}
		else if (Notification.permission === "granted") {
			navigator.serviceWorker.ready.then(function(reg) {
				reg.showNotification(title, options);
				//var note = new Notification(title, options, function(){});
			});
		}			
		else if(Notification.permission !== 'denied') {
			Notification.requestPermission(function (permission) {
				if(!('permission' in Notification)) {
					Notification.permission = permission;
				}
				if (permission === "granted") {
					navigator.serviceWorker.ready.then(function(reg) {
						reg.showNotification(title, options);
						//var note = new Notification(title, options, function(){});
					});
				}
			});
		}
}

function repeat(updTime) {
	var promise = new Promise(function(resolve, reject) {
		setTimeout(function() {
			//console.log("repeat: setTimeoutFunc: working here");
			getData(1000);
			resolve();
		}, 1000);
	});
	
}


function checkNotificationID(id, showedId) {
	var check = false;
	var i = showedId.length;
	//console.log(i);
	if (i == 0) {
		check = true;
	} else {
		while (i--) {
			//console.log(showedId[i]);
			if (showedId[i] == id) {
				check = false;
				break;
			} else {
				check = true;
			}
		}
	}
	return check;
}

function proceed(id, tag, issueInfo) {
	var promise = new Promise(function(resolve, reject) {
		chrome.storage.local.get(id, function(data) {
			//console.log(data);
			resolve(data);
		});
	}).then(function(data){
		//console.log(data[id]);
		if (!data[id]) {
			//console.log("no" + id + "in storage");
			var options = {
				body: issueInfo.project + "\r\n" + issueInfo.title + "\r\n" + issueInfo.description,
				icon: "logo32.png",
				vibrate: [200, 100, 200, 100, 200, 100, 200],
				tag: id,
				data: issueInfo.issueUrl,
				requireInteraction: true
			}
			//console.log(options);
			chrome.storage.local.set({
				[id]: issueInfo
			}, function(){
				showNotification(tag, options);
			});
			
		} else {
			//console.log(id + "in storage");
			if (data[id].comments) {
				var prevCommentsLength = data[id].comments.length;
				var commentsLength = issueInfo.comments.length;
				var cdt = commentsLength - prevCommentsLength;
				if (cdt > 0) {
					for (var i = prevCommentsLength-1; i < commentsLength; i++) {
						var options = {
							body: issueInfo.title + "\r\nNew comment from " + issueInfo.comments[i].author.displayName+ "\r\n" + issueInfo.comments[i].body + "\r\nTime: " + issueInfo.comments[i].updated,
							icon: "logo32.png",
							vibrate: [200, 100, 200, 100, 200, 100, 200],
							tag: id,
							data: issueInfo.issueUrl,
							requireInteraction: true
						}
						//console.log(options);
						chrome.storage.local.set({
							[id]: issueInfo
						}, function(){
							showNotification(tag, options);
						});
						
					}
				} else {
					if (cdt < 0) {
						for (var i = commentsLength-1; i < prevCommentsLength; i++) {
							var options = {
								body: issueInfo.title + "\r\nDeleted comment by " + issueInfo.comments[i].author.displayName,
								icon: "logo32.png",
								vibrate: [200, 100, 200, 100, 200, 100, 200],
								tag: id,
								data: issueInfo.issueUrl,
								requireInteraction: true
							}
							//console.log(options);
							chrome.storage.local.set({
								[id]: issueInfo
							}, function(){
								showNotification(tag, options);
							});
						}
					}
				}
			}
			if (data[id].histories) {
				var prevHistoriesLength = data[id].histories.length;
				var historiesLength = issueInfo.histories.length;
				var hdt = historiesLength - prevHistoriesLength;
				if (hdt > 0) {
					for (var i = prevHistoriesLength; i < historiesLength; i++) {
						var items = issueInfo.histories[i].items;
						var changes = "";
						for (var j = 0; j < items.length; j++) {
							if (items[j].field == "status") {
								changes+=items[j].field+": "+items[j].fromString+" -> "+items[j].toString;
							}
						}
						var options = {
							body: issueInfo.title + "\r\nUpdated from " + issueInfo.histories[i].author.displayName + "\r\n"+ changes,
							icon: "logo32.png",
							vibrate: [200, 100, 200, 100, 200, 100, 200],
							tag: id,
							data: issueInfo.issueUrl,
							requireInteraction: true
						}
						//console.log(options);
						chrome.storage.local.set({
							[id]: issueInfo
						}, function(){
							showNotification(tag, options);
						});
					}
				} else {
					if (hdt < 0) {
						var options = {
							body: issueInfo.title + "\r\nAdmin deleted your history!!!!",
							icon: "logo32.png",
							vibrate: [200, 100, 200, 100, 200, 100, 200],
							tag: id,
							data: issueInfo.issueUrl,
							requireInteraction: true
						}
						//console.log(optons);
						chrome.storage.local.set({
							[id]: issueInfo
						}, function(){
							showNotification(tag, options);
						});
					}
				}
			}
		}
		
	});
};


function parse(data) {
	//console.log(data);

		var i = data.issues.length;
		//console.log(i);
		while(i--) {
			//console.log(i);
			var issue = data.issues[i];
			var id = issue.id;
			var tag = issue.key;
			/////------------------------
			var issueFields = issue.fields;
			var user = issueFields.assignee.displayName;
			var issueType = issueFields.issuetype.name;
			var project = issueFields.project.name;
			var description = issueFields.description;
			var title = issueFields.summary;
			var status = issueFields.status.description;
			/////-------------------------------------
			var issueInfo = {
				tag: tag,
				user: user,
				issueType: issueType,
				project: project,
				description: description,
				title: title,
				status: status,
				comments: issueFields.comment.comments,
				histories: issue.changelog.histories,
				issueUrl: "https://jira.550550.ru/browse/" + tag
			}
			//console.log(id);
			
			proceed(id, tag, issueInfo);
			
			
			
			
			//var options = {
			//	body: project + "\r\n" + issueType + "\r\n" + description,
			//	icon: "logo32.png",
			//	vibrate: [200, 100, 200, 100, 200, 100, 200],
			//	tag: id,
			//	data: issueUrl
			//};
			
		}
		//console.log("iteration finished");
		repeat(1000);
}




function getData(updTime) {
	var timeoutPromise = new Promise(function(resolve, reject) {
		//console.log('start operation');
		//console.log(updTime);
		var req = new XMLHttpRequest();
		req.open("GET", "https://jira.550550.ru/rest/api/2/search?expand=changelog&fields=assignee,issuetype,project,summary,comment,description,resolution,status&jql=assignee%20in%20(currentUser())%20ORDER%20BY%20updated%20DESC&startAt=0&maxResults=5", true);
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				if (req.status == 200) {
					var response = JSON.parse(req.responseText);
					resolve(response);
				}
			}
		}
		req.send();
	}).then(parse);
}


document.addEventListener('DOMContentLoaded', function() {
	var worker = navigator.serviceWorker;
	worker.register('sw.js').then(function (reg) {
		//console.log("registered");
	});
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://jira.550550.ru/rest/auth/1/session", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				console.log("dom content loaded event: auth already exist");
				repeat(1000);
			}
			if (xhr.status == 401) {
				console.log("failed");
			}
		}
	}
	xhr.send();
});
//D:\projects\jiraPopup

navigator.serviceWorker.addEventListener('message', function(event) {
	//console.log("message event from sw detected");
	var url = event.data;
	//console.log(url);
	var tabsList = chrome.windows.getAll({populate: true}, function(winList) {
		//console.log(winList);
		for (var i = 0; i < winList.length; i++) {
			var tabsList = winList[i].tabs;
			for (var j = 0; j < tabsList.length; j++) {
				//console.log(tabsList[j].url);
				if (tabsList[j].url == url) {
					return chrome.tabs.update(tabsList[j].id, {active: true});
				}
			}
			return chrome.tabs.create({url: url});
		}
	});
});

		