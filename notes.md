### Goals

RSS is simple, reliable, and free.  There should be a simple, reliable, and free RSS reader available as a Chrome extension.  Many existing feed readers lock basic features behind a "premium" upgrade, which just isn't right.

**FeedMe** has all the features you would expect from a feed reader:

* Lists all items present in each RSS feed, with basic sorting options.
* Convenient dropdown menu / indicator icon to check for new feed items.
* Organize feeds into folders, with drag-and-drop rearrangement
* Sync your feeds and settings as long as you're logged in to Chrome
* (Optional) Detect feeds available on the current page.

Importantly, **FeedMe** differs from most feed readers available on the Chrome Web Store in the following aspects:

* No need to log in or make a third-party account!
* No external dependencies!  Built with pure JavaScript, using only built-in Chrome APIs for storage and communication.
* No arbitrary limits on refresh rates!
* Responsive interface with no unnecessary animations.
* One hundred percent free!  No arbitrary cutoff for "premium" features, and no advertisements.

Additional features:

* When logged in to Chrome, your feeds and settings will sync across all your devices.
* Ability to import / export feeds (as `*.opml`), including folders!  This makes it easy to back up your feeds or transfer them to another device without loggin in to Chrome.
* Manually mark feeds as read, individually or by folder.
* (Optional) Automatically mark feed items as read.

### Bug Reports

If you find a bug, please submit an issue on [GitHub]() and I will do my best to respond promptly.  Here is a list of known limitations:

* By default, *FeedMe* uses the most recent refesh date to check for new feed items.  If date information is not present, or if feed authors do not correctly format their dates, *FeedMe* may have trouble identifying whether a feed is read or unread.
* Since *FeedMe* uses the Chrome Extension Storage API to save your feeds, there is a maximum limit to the amount of data that can be synced across devices.  To avoid hitting this limit, your read / unread history is not synced across devices, only your list of feeds itself.

### Detecting RSS Feeds

Many pages use the following tag to signal the presence of an RSS feed:

```html
<link rel="alternate" type="application/rss+xml" title="RSS" href="rss">
```

