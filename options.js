'using strict'


function addClickListener(val, element, parent) {
	element.addEventListener('click', function(event) {
		parent.innerHTML = val;
		parent.setAttribute('hiddenVal', element.getAttribute('hiddenVal'));
	});
}

function fillSpace (spaceName, server) {
	var promise = new Promise(function(resolve, reject) {
		var restString = "";
		switch (spaceName) {
			case 'project' :
				restString = "https://" + server + "/rest/api/2/project";
			break;
			case 'user' : 
				restString = "https://" + server + "/rest/api/2/user/search?username=.&startAt=0&maxResults=10000&includeActive=true&includeInactive=false";
			break;
			case 'status' : 
				restString = "https://" + server + "/rest/api/2/status";
			default : 
			break;
		}		
		var request = new XMLHttpRequest();
		request.open("GET", restString, true);
		request.onreadystatechange = function () {
			if (request.readyState == 4) {
				if (request.status == 200) {
					var response = JSON.parse(request.responseText);
					resolve(response);
				}
			}
		}
		request.send();
	}).then(function(response) {
		var projectMenuButton = document.getElementById("projectMenuButton");
		var userMenuButton = document.getElementById("userMenuButton");
		var statusMenuButton = document.getElementById("statusMenuButton");
		console.log(response);
		switch (spaceName) {
			case 'project' :
				for (var i = 0; i < response.length; i++) {
					var projectTag = response[i].key;
					var dropDownElem = document.createElement('a');
					console.log(response[i].name);
					var text = document.createTextNode(response[i].name);
					dropDownElem.appendChild(text);
					dropDownElem.setAttribute('class', 'dropdown-item')
					dropDownElem.setAttribute('hiddenVal', projectTag);
					var projectMenuItemsArea = $("#projectMenuItemsArea");
					addClickListener(response[i].name, dropDownElem, projectMenuButton);
					projectMenuItemsArea.append(dropDownElem);
				}
			break;
			case 'user' : 
				for (var i = 0; i < response.length; i++) {
					var userTag = response[i].key
					var dropDownElem = document.createElement('a');
					//console.log(response[i].displayName);
					var text = document.createTextNode(response[i].displayName);
					dropDownElem.appendChild(text);
					dropDownElem.setAttribute('class', 'dropdown-item');
					dropDownElem.setAttribute('hiddenVal', userTag);
					var userMenuItemsArea = $("#userMenuItemsArea");
					addClickListener(response[i].displayName, dropDownElem, userMenuButton);
					userMenuItemsArea.append(dropDownElem);
				}
			break;
			case 'status' : 
				for (var i = 0; i < response.length; i++) {
					var statusID = response[i].id;
					var dropDownElem = document.createElement('a');
					console.log(response[i].name);
					var text = document.createTextNode(response[i].name);
					dropDownElem.appendChild(text);
					dropDownElem.setAttribute('class', 'dropdown-item');
					dropDownElem.setAttribute('hiddenVal', statusID);
					var statusMenuItemsArea = $("#statusMenuItemsArea");
					addClickListener(response[i].name, dropDownElem, statusMenuButton);
					statusMenuItemsArea.append(dropDownElem);
				}
			default : 
			break;
		}
	});	
}



document.addEventListener('DOMContentLoaded', function(event) {
window.onload = function() {
	var serverInputSpace = $("#serverInputSpace");
	var projectMenuButton = $("#projectMenuButton");
	var userMenuButton = $("#userMenuButton");
	var statusMenuButton = $("#statusMenuButton");
	var containsTextInputSpace = $("#containsText");
	var acessAreaIndicator = $("#acessAreaIndicator");
	var defaultProject = $("#defaultProject");
	var defaultUser = $("#defaultUser");
	var defaultStatus = $("#defaultStatus");
	var confirmFiltersBtn = $("#confirmFiltersBtn");
	var advansedFiltersBtn = $("#advansedFiltersBtn");
	var standardFiltersSpace = $("#standardFilters"); 
	var advancedFiltersSpace = $("#advancedFilters");
	var confirmSpaser = $("#confirmSpaser");

	chrome.storage.local.get(['server'], function (data) {
		var filterContainer = $("#filtersCont");
		console.log(filterContainer);
		if (data.server) {
			filterContainer.css('visibility', "visible");
			fillSpace('project', data.server);
			fillSpace('user', data.server);
			fillSpace('status', data.server);
		} else {
			filterContainer.css('visibility', "hidden");
		}
	});
	//////////////////////////////////
	
	var acessButton = $("#accessBtn");
	
	var filterContainer = $("#filtersCont");
	console.log(acessButton);

	acessButton.bind('click', function(event) {
		console.log("clicked");
		var server = serverInputSpace.val();
		console.log(filterContainer);

		///////////////////////////////
		var promise = new Promise(function (resolve, reject) {
			chrome.storage.local.get(['jsessionId'], function(data) {
				console.log(data);
				if (data.jsessionId != null) {
					resolve(server);
				} else {
					var httpsUrl = server+"/secure/Dashboard.jspa";
					chrome.permissions.request({
						origins: ["http://"+httpsUrl]
					}, function (perm) {
						if (perm) {
							var cookiePromise = new Promise(function(cResolve, cReject) {
								chrome.cookies.get({
									url: "http://"+httpsUrl,
									name: 'atlassian.xsrf.token'
								}, function(value) {
									cResolve(value);
								});
							}).then(function(jsessionId) {
								chrome.storage.local.set({jsessionId: jsessionId}, function() {console.log(jsessionId)});
								acessAreaIndicator.css('backgroundColor', "green");
								acessAreaIndicator.html("server online");
								resolve(server);
							});
						}
					});
				}
			});
		}).then(function(server) {
			chrome.storage.local.set({server: server}, function() {console.log("server addres saved");});
			fillSpace('project', server);
			fillSpace('user', server);
			fillSpace('status', server);
			var promise = new Promise(function(resolve) {
				setTimeout(resolve, 1000);
			}).then(function() {
				acessAreaIndicator.css('backgroundColor', "transparent");
				acessAreaIndicator.html("");
				filterContainer.css('visibility',"visible");
			});
		});
	});
	
	////////////////////////////////
	
	
	defaultProject.bind('click', function(event) {
		projectMenuButton.innerHTML = "Все";
		projectMenuButton.attr('hiddenVal', "");
	});
	defaultUser.bind('click', function(event) {
		userMenuButton.innerHTML = "Текущий";
		userMenuButton.attr('hiddenVal', "currentUser()");
	});
	defaultStatus.bind('click', function(event) {
		statusMenuButton.innerHTML = "Все";
		statusMenuButton.attr('hiddenVal', "");
	});
	
	advansedFiltersBtn.bind('click', function (event) {
		
		var currentFSpace = advansedFiltersBtn.attr('hiddenVal');
		switch (currentFSpace) {
			case "standard":
				standardFiltersSpace.css('visibility', "hidden");
				advancedFiltersSpace.css('visibility', "visible");
				advansedFiltersBtn.attr('hiddenVal', "advanced");
				advansedFiltersBtn.html("Standard");
				console.log(advansedFiltersBtn.attr('hiddenVal'));
				break;
			case "advanced":
				chrome.storage.local.get(['unformattedString'], function(data) {
					if (data.unformattedString != null) {
						containsTextInputSpace.val(data.unformattedString);
						//resolve(data.unformattedString);
					}
					standardFiltersSpace.css('visibility', "visible");
					advancedFiltersSpace.css('visibility', "hidden");
					advansedFiltersBtn.attr('hiddenVal', "srandart");
					advansedFiltersBtn.html("Advanced");
					console.log(advansedFiltersBtn.attr('hiddenVal'));
				});
				break;
			default: 
				break;
		}
	});
	
	confirmFiltersBtn.bind('click', function (event) {
		var searchString = "jql=";
		var _string ="";
		var filtersSetup = advansedFiltersBtn.attr('hiddenVal');
		console.log(filtersSetup+"/////////////////////////");
		if (filtersSetup == "standart") {
			var project = projectMenuButton.attr('hiddenVal');
			var user = userMenuButton.attr('hiddenVal');
			var status = statusMenuButton.attr('hiddenVal');
			
			if (project != undefined && project != "") {
				_string+="project = \""+project+"\" AND ";
			}
			if (status != undefined && user != "") {
				_string+="status = \""+status+"\" AND ";
			}
			if (user != undefined && user != "") {
				_string+="assignee in ("+user+")";
			} else {
				_string+="assignee in (currentUser())";
			}
			searchString+=_string.split(" ").join("%20").split("=").join("%3D");
			console.log(searchString);
			chrome.storage.local.set({searchString: searchString}, function(){
				var promise = new Promise(function(resolve, reject) {
					confirmSpaser.css('backgroundColor', "green");
					confirmSpaser.html("filter installed");
					setTimeout(resolve, 1000);
				}).then(function() {
					confirmSpaser.css('backgroundColor', "transparent");
					confirmSpaser.html("");
				});
				navigator.serviceWorker.controller.postMessage("prepared");
				window.close();
			});
		}
		if (filtersSetup == "advanced") {
			//chrome.storage.local.set({unformattedString: containsTextInputSpace.val()}, function(){});
			searchString += containsTextInputSpace.val().split(" ").join("%20").split("=").join("%3D");;
			console.log(searchString);
			chrome.storage.local.set({searchString: searchString, unformattedString: containsTextInputSpace.val()}, function(){
				var promise = new Promise(function(resolve, reject) {
					confirmSpaser.css('backgroundColor', "green");
					confirmSpaser.html("filter installed");
					setTimeout(resolve, 1000);
				}).then(function() {
					confirmSpaser.css('backgroundColor', "transparent");
					confirmSpaser.innerHTML = "";
				});
				navigator.serviceWorker.controller.postMessage("prepared");
				window.close();
			});
		}
	});
}	
	
});




///rest/api/2/project - проекты доступные юзеру
///rest/api/2/resolution  - статусы


/*var lpArea = $(document.createElement('div'));
				var lInput = $(document.createElement('input'));
				var pInput = $(document.createElement('input'));
				var authBtn = $(document.createElement('button'));
				lpArea.addClass("container-fluid");
				authBtn.addClass("btn");
				lpArea.append(lInput);
				lpArea.append(pInput);
				lpArea.append(authBtn);
				authBtn.bind('click', function(event) {
					console.log("working here");
					var authProm = new Promise(function(aResolve, aReject) {
						var xhr = new XMLHttpRequest();
						//var body = "{username: "+ lInput.val()+", password: "+pInput.val()+"}";
						var body = JSON.stringify({
							username: "\""+lInput.val()+"\"",
							password: "\""+pInput.val()+"\""
						});
						console.log(body);
						xhr.open("GET", "http://"+server+"/rest/auth/1/session", true);
						//xhr.setRequestHeader('Content-Type', "application/json");
						xhr.setRequestHeader( 'Authorization', "Basic " + window.btoa( lInput.val() + ":" + pInput.val() ) );
						//xhr.withCredentials = true;
						xhr.onreadystatechange = function() {
							if (xhr.readyState == 4) {
								console.log("ready status = 4");
								console.log(xhr.responseText);
								if (xhr.status == 200) {
									var session = JSON.parse(xhr.responseText);
									var jsessionId = session.value;
									console.log(jsessionId);
									aResolve(jsessionId);
								}
							}
						}
						xhr.send();
					}).then(function(jsessionId){
						console.log(jsessionId);
					});
					
				});
				var serverSpace = $("#serverSpace");
				serverSpace.append(lpArea);*/