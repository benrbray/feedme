let feeds = [];

document.querySelectorAll("link[rel=alternate]").forEach(function(elt){
	// get href attribute
	let href = elt.getAttribute("href");
	if(href.length == 0) return;

	// (URL object handles absolute vs. relative hrefs!)
	let feed = { 
		feedUrl: new URL(href, window.location),
		type: "", title: ""
	};

	// get type attribute
	let type = elt.getAttribute("type");
	if(type == "application/rss+xml")       { feed.type = "rss";  }
	else if(type == "application/atom+xml") { feed.type = "atom"; }
	else                                    { return; }

	// get title attribute
	let title = elt.getAttribute("title");
	if(title.length > 0) { feed.title = title; }
	else                 { feed.title = false; }
	
	// save feed
	feeds.push(feed);
});

// send message to background.html
if(feeds.length > 0){
	chrome.runtime.sendMessage({
		type: "DETECT_FEEDS",
		feeds: feeds
	});
} else {
	chrome.runtime.sendMessage({
		type: "DETECT_NONE",
	});
}