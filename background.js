(function() {

    var ONE_DAY = 1000 * 60 * 60 * 24;

    var KEY_LAST_CHANGED_AT = 'lastChangedAt';
    var KEY_OPTIONS = 'options';
    var KEY_PAUSED = 'paused';

    function now() {
        return new Date().getTime();
    }

    function updateBadge(paused) {
        var badgeText = paused ? "OFF" : "";
        chrome.browserAction.setBadgeText( { text: badgeText } );
    }

    function isPaused() {
        var isPaused = localStorage.getItem(KEY_PAUSED);
        if(typeof isPaused === "undefined"){
            isPaused = false;
        } else {
            isPaused = isPaused == 'true';
        }
        return isPaused;
    }

    function setPaused(paused) {
        var lastChangedAt = now();

        localStorage.setItem(KEY_PAUSED, paused);
        chrome.storage.sync.set( { 'paused': paused } );
        updateBadge(paused);

        localStorage.setItem(KEY_LAST_CHANGED_AT, lastChangedAt);
        return lastChangedAt;
    }

    function togglePause(tab) {
        setPaused(!isPaused());

        // Reload the current tab.
        chrome.tabs.update(tab.id, {url: tab.url});
    }

    function onMessage(request, sender, sendResponse) {
        var requestId = request.id;

        if(requestId == 'isPaused?') {
            sendResponse({value: isPaused()});
        }
        else if(requestId == 'setOptions') {
            localStorage.setItem(KEY_OPTIONS, request.options);
        }
    }

    chrome.browserAction.onClicked.addListener(togglePause);
    chrome.extension.onRequest.addListener(onMessage);

    updateBadge(isPaused());

})();