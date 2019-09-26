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
					{ title: "Hacker News", feedUrl: "http://news.ycombinator.com/rss" },
					{ title: "programming 1", feedUrl: "" },
					{ title: "programming 2", feedUrl: "" },
				]
			}
		],
		feeds: [
			{ title: "Almost Looks Like Work", feedUrl: "https://jasmcole.com/feed/" },
			{ title: "Math \u2229 Programming", feedUrl: "http://blog.echen.me/feeds/all.rss.xml" },
			{ title: "LingPipe Blog", feedUrl: "https://lingpipe-blog.com/feed/" },
			{ title: "Terrence Tao", feedUrl: "https://terrytao.wordpress.com/feed" },
		]
	},
	feedData : {}
}

////////////////////////////////////////////////////////////////////////////////

function addNewFeed(feedTitle, feedUrl){
	global.userFeeds.feeds.push({
		title: feedTitle,
		feedUrl:  feedUrl
	});
	syncUserFeeds();
}

function syncUserFeeds(){
	// sync user feeds / folder hierarchy
	chrome.storage.local.set({ userFeeds: global.userFeeds }, function () {
		console.log('\tstorage :: synced user feeds');
	});
}

////////////////////////////////////////////////////////////////////////////////

// on installed
chrome.runtime.onInstalled.addListener(function(){
	console.log("background.js :: onInstalled()");

	// check for existing list of feeds
	chrome.storage.local.get(['userFeeds'], function (result) {
		if(result && result.userFeeds){
			console.log("\tstorage :: downloaded existing list of feeds");
			console.log(result);
			global.userFeeds = result.userFeeds;
		} else {
			console.log("\tstorage :: no existing list of feeds");
			// use the default feed
			// TODO: uncomment below -- no defaults!
			// global.userFeeds = {};
		}
	});

	syncUserFeeds();

	chrome.storage.local.getBytesInUse(null, function (bytes) {
		console.log("local bytes used:", bytes);
	})
});

// on startup
chrome.runtime.onStartup.addListener(function(){
	console.log("background.js :: onStartup()");

	chrome.storage.local.get(['userFeeds'], function (result) {
		console.log(result);
		if (result && result.userFeeds) {
			console.log("\tstorage :: downloaded existing list of feeds");
			console.log(result);
			global.userFeeds = result.userFeeds;
		} else {
			console.log("\tstorage :: no existing list of feeds");
			// use the default feed
			// TODO: uncomment below -- no defaults!
			// global.userFeeds = {};
		}
	});

	chrome.storage.local.getBytesInUse(null, function (bytes){
		console.log("local bytes used:", bytes);
	})
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
