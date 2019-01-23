'using strict'


self.addEventListener('install', function(e) {
	console.log('Install event', e);
	e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(e) {
	console.log('activate event', e);
	e.waitUntil(self.clients.claim());
});

self.addEventListener('message', function (e) {
	console.log(e.data);
	if (e.data == "prepared") {
		self.clients.matchAll({
			includeUncontrolled: true
		}).then(function (clientList) {
			console.log(clientList);
			clientList.forEach(function(client) {
				client.postMessage({msg: "", e: "activate"});
			});
		}).catch(function(err) {
			console.log(err.message);
		});
	}
});

self.addEventListener('notificationclick', function(event) {
	console.log(event);
	var promise = new Promise(function(resolve) {
		setTimeout(resolve, 1000);
	}).then(self.clients.matchAll({
		includeUncontrolled: true
	}).then(function (clientList) {
		clientList.forEach(function(client) {
			if (event.action == "button") {
				client.postMessage({msg: "", e: "options"});
				//chrome.runtime.sendMessage({msg: "openOptionsPage"});
			} else {
				var url = event.notification.data;
				client.postMessage({msg: url, e: "openTab"});
				//chrome.runtime.sendMessage({msg: url});
			}
		});
		
		
	}).catch(function(err) {
		console.log(err.message);
	}));
	event.waitUntil(promise);
	
	event.notification.close();
});

self.addEventListener('notificationclose', function(event) {
	console.log("notification closed");
	var data = event.notification.data;
	if (data.id) {
		self.clients.matchAll({
			includeUncontrolled: true
		}).then(function (clientList) {
			clientList.forEach(function(client) {
				client.postMessage({msg: data, e: "save"});
			});
		});
	}
});

self.addEventListener('show', function(event) {
	console.log(event);
	console.log("notification show");
});

