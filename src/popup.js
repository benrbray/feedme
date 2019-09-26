"use strict";

// background page
var backgroundPage = chrome.extension.getBackgroundPage();

// make debugging easier by forwarding popup console output
function debug(message){
	console.log(message);
}

////////////////////////////////////////////////////////////////////////////////

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

	popupContainer.onmousedown = function(evt){
		switch (evt.button) {
			case 3: // back button
				viewController.back();
				break;
			case 4: // forward button
				break;
		}
	}
	
	// folder page
	viewController.showPage(PageTypes.FOLDER_PAGE, backgroundPage.global.userFeeds);
}

////////////////////////////////////////////////////////////////////////////////

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

function makeArticleElem(article) {
	// feed item
	var articleElem = document.createElement("div");
	articleElem.className = "article";

	var title = (article.title ? article.title : "[UNTITLED]");
	articleElem.appendChild(document.createTextNode(title));

	return articleElem;
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