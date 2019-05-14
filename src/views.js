function Page(){
	this.template = document.createElement("div");
	this.template.className = "page";
	return;
}

var Template = {};

Template.getTemplate = function(templateId){
	// find template
	var template = backgroundPage.document.getElementById(templateId);
	if(!template) throw Error("Template '" + templateId + "' not found.");
	// clone template
	return document.importNode(template.content, true);
}

Template.MakeFolderPage = function(folder){
	console.log("MakeFolderPage()");
	// init page
	var page = new Page();
	page.template = Template.getTemplate("folder-page");

	// build folder list
	var folderListElem = page.template.getElementById("folder-list");
	folder.folders.forEach(function(folder){
		var folderItem = makeFolderElem(folder);
		folderListElem.appendChild(folderItem);

		folderItem.onclick = function(){
			viewController.showFolderPage(folder);
		}
	});

	// build feed list
	var feedListElem = page.template.getElementById("feed-list");
	folder.feeds.forEach(function(feed){
		var feedItem = makeFeedElem(feed);
		feedListElem.appendChild(feedItem);
		
		feedItem.onclick = function(){
			//backgroundPage.loadFeedItems(feed).then(showFeedItems);
			viewController.showColorPage(randomColor());
		}
	});

	// new feed button
	var plusBtn = page.template.getElementById("plus-btn");
	plusBtn.onclick = () => { viewController.showDetectedPage(); }
	var backBtn = page.template.getElementById("back-btn");
	
	return page;
}

Template.MakeDetectedPage = function(detectedFeeds){
	console.log("MakeDetectedPage()");
	// init page
	var page = new Page();
	page.template = Template.getTemplate("detected-page");
	var feedListElem = page.template.getElementById("feed-list");
	
	// populate page
	detectedFeeds.forEach(function(feed){
		var feedItem = makeFeedElem(feed);
		feedListElem.appendChild(feedItem);
		
		feedItem.onclick = function(){
			//backgroundPage.loadFeedItems(feed).then(showFeedItems);
			viewController.showColorPage(randomColor());
		}
	});
	
	return page;
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

	showPage(page){
		// transition current page
		removeAllChildren(this.container);
		// show new page
		this.currentPage = page;
		this.container.appendChild(this.currentPage.template);
	}


	/* Page Definitions ------------------------------------------------------*/
	
	showColorPage(color) {
		// build page
		var colorPage = new Page();
		colorPage.template.style.backgroundColor = color;
		// new random color on click
		colorPage.template.onclick = function(){
			viewController.showColorPage(randomColor());
		}
		// show
		this.showPage(colorPage);
	}
	
	showFolderPage(folder){
		console.log("showFolderPage()");
		this.showPage(Template.MakeFolderPage(folder));
	}

	showDetectedPage(){
		console.log("showDetectedPage()");
		console.log(this);
		this.showPage(Template.MakeDetectedPage(backgroundPage.global.detectedFeeds));
	}
}
