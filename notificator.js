'using strict'
var worker = navigator.serviceWorker;
worker.register('sw.js').then(function (reg) {
	//console.log("registered");
});

function showNotification (title, options) {
		
		
		
		if (!Notification) {
			console.log("no notifications in browser");
		}if (Notification.permission === "granted") {
			navigator.serviceWorker.ready.then(function(reg) {
				reg.getNotifications().then(function(notificationsList) {
					if (notificationsList.length > 0) {
						console.log(notificationsList);
						/*if (notificationsList.length > 2) {
							if (options.tag != notification.tag) {
								chrome.storage.local.set({[notificationsList[0].data.id]: notificationsList[0].data}, function() {
									notificationsList[0].close();
								});
							}
							
						} else {
							reg.showNotification(title, options);
						}*/
						var c = false;
						notificationsList.forEach(function(notif){
							if (notif.tag == options.tag){
								c = false;
							} else {
								c = true;
							}
						});
						if (c) {
							reg.showNotification(title, options);
						}
					} else {
						reg.showNotification(title, options);
					}
				
				});
			});
		}			
		else if(Notification.permission !== 'denied') {
			//console.log("notification denied");
			Notification.requestPermission(function (permission) {
				if(!('permission' in Notification)) {
					Notification.permission = permission;
				}
				if (permission === "granted") {
					navigator.serviceWorker.ready.then(function(reg) {
						reg.getNotifications().then(function(notificationsList) {
							if (notificationsList.length > 0) {
						console.log(notificationsList);
						/*if (notificationsList.length > 2) {
							if (options.tag != notification.tag) {
								chrome.storage.local.set({[notificationsList[0].data.id]: notificationsList[0].data}, function() {
									notificationsList[0].close();
								});
							}
							
						} else {
							reg.showNotification(title, options);
						}*/
						var c = false;
						notificationsList.forEach(function(notif){
							if (notif.tag == options.tag){
								c = false;
							} else {
								c = true;
							}
						});
						if (c) {
							reg.showNotification(title, options);
						}
					} else {
						reg.showNotification(title, options);
					}
						});
						
					});
				}
			});
		}
}

function repeat(updTime) {
	var promise = new Promise(function(resolve, reject) {
		setTimeout(function() {
			getData(1000);
			resolve();
		}, 1000);
	}).then(function() {
		chrome.storage.local.get(null, function(data) {
			var keys = Object.keys(data);
			var keys_id = [];
			keys.forEach(function(key) {
				if (key != "jsessionId" && key != "searchString" && key != "server" && key != "unformattedString") {
					keys_id.push(key);
				}
			});
			if (keys_id.length > 20) {
				for (var i = 2; i < keys_id.length-20; i++) {
					console.log(keys_id[i]);
					var id = keys_id[i];
					chrome.storage.local.remove(id, function(){
						console.log(id+"deleted");
					});
				}
			}
		});
	});
	
}
function checkExist(value) {
	if (value) {
		return value;
	} else {
		return "null";
	}
}

function proceed(id, tag, issueInfo) {
	
	var promise = new Promise(function(resolve, reject) {
		chrome.storage.local.get(id, function(data) {
			resolve(data);
		});
	}).then(function(data){
		//console.log("proceed");
		//console.log(data);
		if (!data[id]) {
			var options = {
				body: issueInfo.project + "\r\n" + issueInfo.title + "\r\n" + issueInfo.description,
				//icon: "phone-square-solid.svg",
				icon: "icon32.png",
				vibrate: [200, 100, 200, 100, 200, 100, 200],
				tag: id,
				//data: issueInfo.issueUrl,
				data: issueInfo,
				eventTime: Date.now() + 15000,
				renotify: true
			}
			chrome.storage.local.set({
				[id]: issueInfo
			}, function(){
				showNotification(tag, options);
			});
			
		} else {
			//comments//
			/*actions = [];
			if (data[id].comments) {
				var prevCommentsLength = data[id].comments.length;
				var commentsLength = issueInfo.comments.length;
				var cdt = commentsLength - prevCommentsLength;
				if (cdt > 0) {
					var act = {};
					var prev = 0;
					if (prevCommentsLength != 0) {
						prev = prevCommentsLength;
					}
					//console.log(prev);
					if (cdt == 1) {
						act = {
							action: "comment",
							//title: "New comment from " + checkExist(issueInfo.comments[i].author.displayName)+ "\r\nTime: " + checkExist(issueInfo.comments[i].updated),
							title: "New comment from " + checkExist(issueInfo.comments[commentsLength-1].author.displayName),
							icon: "dial.png"
						}
					} else {
						act = {
							action: "comment",
							//title: "New comment from " + checkExist(issueInfo.comments[i].author.displayName)+ "\r\nTime: " + checkExist(issueInfo.comments[i].updated),
							title: Math.abs(cdt)+" new comments, last from " + checkExist(issueInfo.comments[commentsLength-1].author.displayName),
							icon: "dial.png"
						}
					}
					//console.log(act);
					if (act.action) {
						actions.push(act);
					}
				} else {
					var act = {};
					if (cdt < 0) {
						
						if (cdt == -1) {
							act = {
								action: "comment",
								//title: "New comment from " + checkExist(issueInfo.comments[i].author.displayName)+ "\r\nTime: " + checkExist(issueInfo.comments[i].updated),
								title: "Comment deleted " + checkExist(data[id].comments[prevCommentsLength-1].author.displayName),
								icon: "dial.png"
							}
						} else {
							act = {
								action: "comment",
								//title: "New comment from " + checkExist(issueInfo.comments[i].author.displayName)+ "\r\nTime: " + checkExist(issueInfo.comments[i].updated),
								title: Math.abs(cdt)+" comments deleted, last by " + checkExist(data[id].comments[prevCommentsLength-1].author.displayName),
								icon: "dial.png"
							}
						}
					}
					//console.log(act);
					if (act.action) {
						actions.push(act);
					}
					
				}
			}
			//histories//
			if (data[id].histories) {
				var prevHistoriesLength = data[id].histories.length;
				var historiesLength = issueInfo.histories.length;
				var hdt = historiesLength - prevHistoriesLength;
				if (hdt > 0) {
					var act = {};
					var items = issueInfo.histories[historiesLength-1].items;
					var changes = "";
					for (var j = 0; j < items.length; j++) {
						if (items[j].field != "Comment") {
							changes+=items[j].field+": "+items[j].fromString+" -> "+items[j].toString;
							if (hdt == 1) {
								act = {
									action: "updating",
									//title: "Updated from " + checkExist(issueInfo.histories[i].author.displayName) + "\r\n"+ changes,
									title: "Updated: "+ changes,
									icon: "settings.png"
								}
							} else {
								act = {
									action: "updating",
									//title: "Updated from " + checkExist(issueInfo.histories[i].author.displayName) + "\r\n"+ changes,
									title: Math.abs(hdt)+" updatings, last: "+ changes,
									icon: "settings.png"
								}
							}
							//console.log(act);
							if (act.action) {
								actions.push(act);
							}
						}
					}
				} else {
					if (hdt < 0) {
						var act = {
							action: "updating",
							title: "history has been deleted!!!",
							icon: "settings.png"
						};
						actions.push(act);
					}
				}
			}
			if (actions.length != 0) {
				//console.log(actions);
				var options = {
					body: checkExist(issueInfo.title),
					//icon: "phone-square-solid.svg",
					icon: "icon32.png",
					vibrate: [200, 100, 200, 100, 200, 100, 200],
					tag: id,
					actions: actions,
					//data: checkExist(issueInfo.issueUrl),
					data: issueInfo,
					eventTime: Date.now() + 15000,
					renotify: true
				}
				showNotification(tag, options);
			} */
		}
	});
};


function parse(data) {
	//console.log(data);
	var i = data.issues.length;
	while(i--) {
		var issue = checkExist(data.issues[i]);
		var id = checkExist(issue.id);
		var tag = checkExist(issue.key);
		/////------------------------
		var issueFields = checkExist(issue.fields);
		var user = "";
		if (issueFields.assignee) {
			user = issueFields.assignee.displayName;
		} else {
			user = "null";
		}
		var issueType = checkExist(issueFields.issuetype.name);
		var project = checkExist(issueFields.project.name);
		var description = checkExist(issueFields.description);
		var title = checkExist(issueFields.summary);
		var status = checkExist(issueFields.status.description);
		/////-------------------------------------
		var issueInfo = {
			id: id,
			tag: tag,
			user: user,
			issueType: issueType,
			project: project,
			description: description,
			title: title,
			status: status,
			comments: issueFields.comment.comments,
			histories: issue.changelog.histories,
			issueUrl: "http://pc146:8080/secure/EditIssue!default.jspa?id="+id
		}
		proceed(id, tag, issueInfo);
	}
	repeat(1000);
}


//jql=(assignee%20in%20(currentUser())%20OR%20reporter%20in%20(currentUser()))%20AND%20status%20not%20in%20(Done%2C%20"Waiting%20reporter")%20ORDER%20BY%20updated%20DESC

function getData(updTime) {
	var timeoutPromise = new Promise(function(resolve, reject) {
		chrome.storage.local.get(['server', 'searchString', 'jsessionId'], function(data) {
			var req = new XMLHttpRequest();
			req.open("GET", "http://"+data.server+"/rest/api/2/search?expand=changelog&fields=assignee,issuetype,project,summary,comment,description,resolution,status&"+data.searchString+"&startAt=0&maxResults=3", true);
			req.setRequestHeader('Set-Cookie', data.jsessionId);
			req.onreadystatechange = function() {
				if (req.readyState == 4) {
					if (req.status == 200) {
						var response = JSON.parse(req.responseText);
						resolve(response);
					}
				}
			}
			req.send();
		});
	}).then(parse);
}

function firstRound() {
	console.log("first round started");
	var promise = new Promise(function(resolve, reject) {
		chrome.storage.local.get(['server', 'jsessionId', 'searchString'], function(data) {
			var freq = new XMLHttpRequest();
			freq.open("GET", "http://"+data.server+"/rest/api/2/search?expand=changelog&fields=assignee,issuetype,project,summary,comment,description,resolution,status&"+data.searchString+"&startAt=0", true);
			freq.setRequestHeader('Set-Cookie', data.jsessionId);
			freq.onreadystatechange = function() {
				if (freq.readyState == 4) {
					if (freq.status == 200) {
						var response = JSON.parse(freq.responseText);
						resolve(response);
					}
				}
			}
			freq.send();
		});
	}).then(function(data) {
		//console.log(data);
		var i = data.issues.length;
		//console.log(i);
		while(i--) {
			var issue = checkExist(data.issues[i]);
			var id = checkExist(issue.id);
			var tag = checkExist(issue.key);
		/////------------------------
			var issueFields = checkExist(issue.fields);
			var user = "";
			if (issueFields.assignee) {
				user = issueFields.assignee.displayName;
			} else {
				user = "null";
			}
			//var user = issueFields.assignee.displayName;
			var issueType = checkExist(issueFields.issuetype.name);
			var project = checkExist(issueFields.project.name);
			var description = checkExist(issueFields.description);
			var title = checkExist(issueFields.summary);
			var status = checkExist(issueFields.status.description);
		/////-------------------------------------
			var issueInfo = {
				id: id,
				tag: tag,
				user: user,
				issueType: issueType,
				project: project,
				description: description,
				title: title,
				status: status,
				//comments: issueFields.comment.comments,
				//histories: issue.changelog.histories,
				issueUrl: "http://pc146:8080/browse/" + tag
			}
			chrome.storage.local.set({[id] : issueInfo}, function() {});
		}
		//console.log("start repeating");
		repeat(1000);
	});
}


document.addEventListener('DOMContentLoaded', function() {
	var promise = new Promise(function(resolve, reject) {
		chrome.storage.local.get(['filterString', 'server'], function(data) {resolve(data)});
	}).then(function(data) {
		console.log(data);
		if (data.server) {
			server = data.server;
			firstRound();
			//repeat(1000);
			/*var auth = new XMLHttpRequest();
			auth.open("GET", "http://"+server+"/rest/auth/1/session", true);
			auth.onreadystatechange = function() {
				if (auth.readyState == 4) {
					if (auth.status == 200) {
						//repeat(1000);
						
					} else {
						var tabsList = chrome.windows.getAll({populate: true}, function(winList) {
							for (var i = 0; i < winList.length; i++) {
								var tabsList = winList[i].tabs;
								for (var j = 0; j < tabsList.length; j++) {
									if (tabsList[j].url == server+"/login.jsp") {
										chrome.tabs.reload(tabsList[j].id);
										return chrome.tabs.update(tabsList[j].id, {active: true});
									}
								}
								return chrome.tabs.create({url: server+"/login.jsp"});
							}
						});
						//return chrome.tabs.create({url: server+"/login.jsp"});
					}
				}
			}*/
			
		} else {
			showNotification("Good time!", {
				body: "Welcome to my jira notification plugin \r\n First, click on button below, or open options page",
				//icon: "logo32.png",
				icon: "icon32.png",
				vibrate: [200, 100, 200, 100, 200, 100, 200],
				tag: "welcome note",
				//data: "options",
				requireInteraction: true,
				actions: [{
					action: "button",
					title: "Options",
					icon: "settings.png"
				}]
			});
		}
	});
});
//D:\projects\jiraPopup

navigator.serviceWorker.addEventListener('message', function(event) {
	var msg = event.data.msg;
	var e = event.data.e;
	switch (e) {
		case "activate" :
			firstRound();
			break;
		case "options" :
			chrome.runtime.openOptionsPage();
			break;
		case "openTab" :
			var url = msg.issueUrl;
			chrome.storage.local.set({[msg.id] : msg}, function(){});
			var tabsList = chrome.windows.getAll({populate: true}, function(winList) {
				for (var i = 0; i < winList.length; i++) {
					var tabsList = winList[i].tabs;
					for (var j = 0; j < tabsList.length; j++) {
						if (tabsList[j].url == url) {
							chrome.tabs.reload(tabsList[j].id);
							return chrome.tabs.update(tabsList[j].id, {active: true});
						}
					}
					return chrome.tabs.create({url: url});
				}
			});
			break;
		case "save" :
			chrome.storage.local.set({[msg.id] : msg}, function(){});
			break;
	}
});

		