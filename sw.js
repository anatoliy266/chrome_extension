'using strict'
//var tabsList = [];


self.addEventListener('install', function(e) {
	console.log('Install event', e);
	e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(e) {
	console.log('activate event', e);
	e.waitUntil(self.clients.claim());
});

self.addEventListener('message', function (e) {
	//console.log("onMessage event called");
	//tabsList = e.data;
	//console.log(tabsList);
});

self.addEventListener('notificationclick', function(event) {
	//console.log("notificationClick event added");
	//console.log(event.notification.data);
	var promise = new Promise(function(resolve) {
		setTimeout(resolve, 1000);
	}).then(self.clients.matchAll({
		includeUncontrolled: true
	}).then(function (clientList) {
		var url = event.notification.data;
		//console.log(clientList);
		clientList[0].postMessage(url);
		//console.log(clientList);
		//for (var i = 0; i < clientList.length; i++) {
		//	var client = clientList[i];
		//	if (client.url == event.notification.data && 'focus' in client) {
		//		return client.focus();
		//	}
		//}
	}).catch(function(err) {
		console.log(err.message);
	}));
	event.waitUntil(promise);
	event.notification.close();
});