const PageTypes = {
	FOLDER_PAGE : 1,
	DETECT_PAGE : 2,
	COLOR_PAGE  : 3,
	FEED_PAGE   : 4,
	ADD_FEED_PAGE : 5
}

class Page {
	constructor(pageType, pageData){
		this.pageType = pageType;
		this.pageData = pageData;
		this.template = document.createElement("div");
		this.template.className = "page";
	}
}

//////////////////////////////////////////////////////////////

var Template = {};

Template.getTemplate = function(templateId){
	// find template
	var template = backgroundPage.document.getElementById(templateId);
	if(!template) throw Error("Template '" + templateId + "' not found.");
	// clone template
	return document.importNode(template.content, true);
}

Template.makePage = function(pageType, pageData){
	console.log("makePage()", pageType, pageData);
	switch(pageType){
		case PageTypes.FOLDER_PAGE:
			return Template.makeFolderPage(pageData);
		case PageTypes.DETECT_PAGE:
			return Template.makeDetectedPage(pageData);
		case PageTypes.FEED_PAGE:
			return Template.makeFeedPage(pageData);
		case PageTypes.ADD_FEED_PAGE:
			return Template.makeAddFeedPage(pageData);
		case PageTypes.COLOR_PAGE:
			return Template.makeColorPage(pageData);
	}
}

/* FOLDER PAGE ------------------------------------------- */

Template.makeFolderPage = function(folder){
	console.log("MakeFolderPage()");
	// init page
	var page = new Page(PageTypes.FOLDER_PAGE, folder);
	page.template = Template.getTemplate("folder-page");

	// set title
	var titleElem = page.template.getElementById("title-text");
	titleElem.textContent = folder.title;

	// build folder list
	var folderListElem = page.template.getElementById("folder-list");
	console.log(folder);
	folder.folders.forEach(function(folder){
		var folderItem = makeFolderElem(folder);
		folderListElem.appendChild(folderItem);

		folderItem.onclick = function(){
			viewController.showPage(PageTypes.FOLDER_PAGE, folder);
		}
	});

	// build feed list
	var feedListElem = page.template.getElementById("feed-list");
	folder.feeds.forEach(function(feed){
		var feedItem = makeFeedElem(feed);
		feedListElem.appendChild(feedItem);
		
		feedItem.onclick = function(){
			viewController.showPage(PageTypes.FEED_PAGE, feed);
		}
	});

	// back button
	var backBtn = page.template.getElementById("back-btn");
	backBtn.onclick = () => { viewController.back(); }

	// new feed button
	var plusBtn = page.template.getElementById("plus-btn");
	plusBtn.onclick = () => { viewController.showPage(
		PageTypes.DETECT_PAGE, 
		backgroundPage.global.detectedFeeds
	); }
	
	return page;
}

Template.makeFeedPage = function (feed) {
	console.log("MakeFeedPage()");
	// init page
	var page = new Page(PageTypes.FEED_PAGE, feed);
	page.template = Template.getTemplate("feed-page");

	// set title
	var titleElem = page.template.getElementById("title-text");
	titleElem.textContent = feed.title;

	// back button
	var backBtn = page.template.getElementById("back-btn");
	backBtn.onclick = () => { viewController.back(); }

	// new feed button
	var plusBtn = page.template.getElementById("plus-btn");
	plusBtn.onclick = () => {
		viewController.showPage(
			PageTypes.DETECT_PAGE,
			backgroundPage.global.detectedFeeds
		);
	}

	// load feed, display articles
	var articleListElem = page.template.getElementById("item-list");
	backgroundPage.loadFeedItems(feed).then(function(result){
		let articles = backgroundPage.parseRssXml(result);
		console.log(articles);

		// build item list
		articles.forEach(function (article) {
			var articleElem = makeArticleElem(article);
			articleListElem.appendChild(articleElem);

			articleListElem.onclick = function () {
				// TODO: go to url
			}
		});
	});

	return page;
}

Template.makeAddFeedPage = function (feed) {
	console.log("MakeAddFeedPage()");
	// init page
	var page = new Page(PageTypes.ADD_FEED_PAGE, feed);
	page.template = Template.getTemplate("add-feed-page");

	// back button
	var backBtn = page.template.getElementById("back-btn");
	backBtn.onclick = () => { viewController.back(); }

	// set default title/url
	var titleInput = page.template.getElementById("newfeed-title");
	var urlInput = page.template.getElementById("newfeed-url");
	titleInput.setAttribute("value", feed.title);
	urlInput.setAttribute("value", feed.feedUrl);

	// add feed button
	var addFeedBtn = page.template.getElementById("add-feed-btn");
	addFeedBtn.onclick = function(){
		backgroundPage.addNewFeed(titleInput.value, urlInput.value);
		viewController.back();
	}

	return page;
}

/* Detected Feeds Page ---------------------------------- */

Template.makeDetectedPage = function(detectedFeeds){
	console.log("MakeDetectedPage()");
	// init page
	var page = new Page(PageTypes.DETECT_PAGE, detectedFeeds);
	page.template = Template.getTemplate("detected-page");
	var feedListElem = page.template.getElementById("feed-list");
	
	// populate page
	detectedFeeds.forEach(function(feed){
		var feedItem = makeFeedElem(feed);
		feedListElem.appendChild(feedItem);
		feedItem.onclick = function(){
			console.log("click");
			//viewController.showPage(PageTypes.COLOR_PAGE, randomColor());
			viewController.showPage(PageTypes.ADD_FEED_PAGE, feed);
		}
	});

	// back button
	var backBtn = page.template.getElementById("back-btn");
	backBtn.onclick = () => { viewController.back(); }
	
	return page;
}

Template.makeColorPage = function(color){
	// build page
	var colorPage = new Page(PageTypes.COLOR_PAGE, null);
	colorPage.template.style.backgroundColor = color;
	// new random color on click
	colorPage.template.onclick = function(){
		viewController.showPage(PageTypes.COLOR_PAGE, randomColor());
	}
	return colorPage;
}

//// VIEW CONTROLLER ///////////////////////////////////////////////////////////

function randomColor(){
	var r = (Math.random() * 256) | 0;
	var g = (Math.random() * 256) | 0;
	var b = (Math.random() * 256) | 0;
	return "rgb(" + r + "," + g + "," + b + ")";
}

class ViewController {
	constructor(container){ 
		// container to hold all views
		this.container = container;
		this.currentPage = null;
		this.pageStack = [];
	}

	showPage(pageType, pageData, back=false){
		console.log("showPage()", pageType, pageData);
		// add previous page to page stack
		if(!back && this.currentPage){
			this.pageStack.push({
				type: this.currentPage.pageType,
				data: this.currentPage.pageData
			});
		}
		// make new page
		let page = Template.makePage(pageType, pageData);
		// show new page
		this.currentPage = page;
		removeAllChildren(this.container);
		this.container.appendChild(this.currentPage.template);
	}

	back(){
		// do nothing if there is nothing to go back to
		if(this.pageStack.length == 0) return;
		// construct and show the desired page
		let page = this.pageStack.pop();
		this.showPage(page.type, page.data, true);
	}
}
