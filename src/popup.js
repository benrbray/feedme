"use strict";

// background page
var backgroundPage = chrome.extension.getBackgroundPage();

// make debugging easier by forwarding popup console output
function debug(message){
	backgroundPage.console.log(message);
}

////////////////////////////////////////////////////////////////////////////////

class Feed {
	constructor(name, rssUrl, count){
		this.name = name;
		this.rssUrl = rssUrl;
		this.count = count;
	}
}

////////////////////////////////////////////////////////////////////////////////

// feed data
var userFeeds = [
	new Feed("Hacker News", "http://news.ycombinator.com/rss", 128),
	new Feed("Almost Looks Like Work", "https://jasmcole.com/feed/", 0),
	new Feed("Math ∩ Programming", "https://jeremykun.com/feed/", 1),
	new Feed("LingPipe Blog", "https://lingpipe-blog.com/feed/", 0),
	new Feed("Brandon Amos", "http://bamos.github.io/atom.xml", 3),
	new Feed("Terrence Tao", "https://terrytao.wordpress.com/feed", 3)
]

// onload
window.onload = function(){
	debug("popup.js :: window.onload()");
	init();
}

// removes all children from a DOM element
function removeAllChildren(elem){
	while(elem.firstChild){
		elem.removeChild(elem.firstChild);
	}
}

////////////////////////////////////////////////////////////////////////////////

// page elements
var popupContainer;
var viewController;

function init(){
	debug("init()");
	
	// initialize views
	popupContainer = document.getElementById("popup-container");
	viewController = new ViewController(popupContainer);
	
	// folder page
	viewController.showFolderPage(backgroundPage.global.userFeeds);
}

////////////////////////////////////////////////////////////////////////////////

function showFeedItems(feedItems){
	// clear current view
	debug(feedListElem);
	removeAllChildren(feedListElem);
	debug(feedListElem);
	
	// display feed items
	feedItems.forEach(function(feedItem){
		var listItem = makeFeedItemElem(feedItem);
		feedListElem.appendChild(listItem);
	});
}

////////////////////////////////////////////////////////////////////////////////

function makeFeedElem(feed){
	// feed item
	var feedItem = document.createElement("div");
	feedItem.className = "feed-item";

	var title = (feed.title ? feed.title : feed.feedUrl);
	feedItem.appendChild(document.createTextNode(title));
	
	// feed count
	var feedCount = document.createElement("span");
	feedCount.innerText = feed.count;
	feedItem.appendChild(feedCount);
	
	return feedItem;
}

function makeFeedItemElem(feedItem){
	var listItem = document.createElement("div");
	listItem.className = "feed-item";
	listItem.appendChild(document.createTextNode(feedItem.title));
	
	return listItem;
}

function makeFolderElem(folder){
	// feed item
	var folderElem = document.createElement("div");
	folderElem.className = "folder";

	var title = (folder.title ? folder.title : "Unnamed Folder");
	folderElem.appendChild(document.createTextNode(title));
	
	// feed count
	var countElem = document.createElement("span");
	countElem.innerText = folder.count;
	folderElem.appendChild(countElem);
	
	return folderElem;
}