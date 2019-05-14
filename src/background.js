"use strict";

var global = {
	detectedFeeds : [],
	userFeeds : {
		title: "All Feeds",
		folders: [
			{
				title: "Programming",
				folders: [],
				feeds: [
					{ title: "programming 1", feedUrl: "", count: 0 },
					{ title: "programming 2", feedUrl: "", count: 0 },
					{ title: "programming 3", feedUrl: "", count: 0 },
				]
			}
		],
		feeds: [
					{ title: "feed 1", feedUrl: "", count: 0 },
					{ title: "feed 2", feedUrl: "", count: 0 },
					{ title: "feed 3", feedUrl: "", count: 0 },
					{ title: "feed 4", feedUrl: "", count: 0 },
		]
	}
}

////////////////////////////////////////////////////////////////////////////////

// on installed
chrome.runtime.onInstalled.addListener(function(){
	console.log("background.js :: onInstalled()");

	// synced variable
	chrome.storage.sync.set({color: '#4aa757'}, function(){
		console.log("the color is green");
	});
});

// on alarm
chrome.alarms.onAlarm.addListener(function(alarm){
	console.log("background.js :: onAlarm()", alarm);
});

// on message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.type == "DETECT_FEEDS"){
		console.log("background.js :: feeds detected on current page");
		handleDetectedFeeds(request.feeds);
	} else if(request.type == "DETECT_NONE"){
		console.log("background.js :: no feeds detected on current page");
		handleDetectedNone();
	} else {
		console.log("background.js :: message received, but ignored");
	}
	sendResponse(false);
});

async function handleDetectedFeeds(feeds){
	global.detectedFeeds = feeds;
	// change icon
	chrome.browserAction.setIcon({ path: "img/rss-icon-blue.png" });
	// load feed items
	let result = await loadFeedItems(feeds[0]);
	console.log(result);
}

async function handleDetectedNone(){
	global.detectedFeeds = [];
	// change icon
	chrome.browserAction.setIcon({ path: "img/rss-icon-orange.png" });
}

////////////////////////////////////////////////////////////////////////////////

async function loadFeedItems(feed){
	let result = await getXmlAsync(feed.feedUrl);
	return result;
}

function parseRssXml(rssXml){
	// parse rss items
	var items =  rssXml.getElementsByTagName("item");
	var result = [];
	
	// required fields
	var fields = ["title", "pubDate", "link"];
	
	for(var k = 0; k < items.length; k++){
		// parse item
		var itemElem = items[k];
		var item = {};
		
		fields.forEach(function(field){
			// query for field
			var query = itemElem.getElementsByTagName(field);
			if(query.length == 0) return;
			// store first value
			item[field] = query[0].textContent;
		});
		
		result.push(item);
	}
	
	return result;
}

////////////////////////////////////////////////////////////////////////////////

function parseXml(xml){
	return new window.DOMParser().parseFromString(xml, "text/xml");
}

function getXmlAsync(url){
	return new Promise(function(resolve, reject){
		// prepare request
		var request = new XMLHttpRequest();
		request.open("GET", url);
		
		// return parsed xml on success
		request.onload = function(){
			if(request.status == 200){
				if(request.responseXML){
					resolve(request.responseXML);
				} else if(request.responseText){
					resolve(parseXml(request.responseText));
				} else {
					reject(Error("No response body."));
				}
			} else {
				reject(Error(request.statusText));
			}
		}
		
		// handle network errors
		request.onerror = function(){
			reject(Error("Network Error"));
		}
		
		// make request
		request.send();
	});
}
