(function() {
    /**
     * This is a small polyfill to get event listeners to be 
     * the same for all browsers.
     */
    if(!Element.prototype.addEventListener){var oListeners={};function runListeners(oEvent){if(!oEvent){oEvent=window.event}for(var lstId=0,elId=0,oEvtListeners=oListeners[oEvent.type];elId<oEvtListeners.aEls.length;elId++){if(oEvtListeners.aEls[elId]===this){for(lstId;lstId<oEvtListeners.aEvts[elId].length;lstId++){oEvtListeners.aEvts[elId][lstId].call(this,oEvent)}break}}}Element.prototype.addEventListener=function(sEventType,fListener){if(oListeners.hasOwnProperty(sEventType)){var oEvtListeners=oListeners[sEventType];for(var nElIdx=-1,elId=0;elId<oEvtListeners.aEls.length;elId++){if(oEvtListeners.aEls[elId]===this){nElIdx=elId;break}}if(nElIdx===-1){oEvtListeners.aEls.push(this);oEvtListeners.aEvts.push([fListener]);this["on"+sEventType]=runListeners}else{var aElListeners=oEvtListeners.aEvts[nElIdx];if(this["on"+sEventType]!==runListeners){aElListeners.splice(0);this["on"+sEventType]=runListeners}for(var lstId=0;lstId<aElListeners.length;lstId++){if(aElListeners[lstId]===fListener){return}}aElListeners.push(fListener)}}else{oListeners[sEventType]={aEls:[this],aEvts:[[fListener]]};this["on"+sEventType]=runListeners}};Element.prototype.removeEventListener=function(sEventType,fListener){if(!oListeners.hasOwnProperty(sEventType)){return}var oEvtListeners=oListeners[sEventType];for(var nElIdx=-1,elId=0;elId<oEvtListeners.aEls.length;elId++){if(oEvtListeners.aEls[elId]===this){nElIdx=elId;break}}if(nElIdx===-1){return}for(var lstId=0,aElListeners=oEvtListeners.aEvts[nElIdx];lstId<aElListeners.length;lstId++){if(aElListeners[lstId]===fListener){aElListeners.splice(lstId,1)}}}}

    var _self = this;
    var next_page = false;
    var prev_page = false;
    var isPaused;
    
    var keycodes = 
    {               // The keycodes for up down left and right movement.
        left:   37, // This defaults to the arrow keys, but you could
        up:     38, // just as easily set it to the WASD keys.
        right:  39, // 
        down:   40  // 
    };

    function analyse() {
        // Look for links on the current page that contain
        // the words 'next', 'previous' etc somewhere about
        // themselves.
        $('a').each(function(index){
            var href    = $(this).attr('href')  || '';
            var text    = $(this).text()        || '';
            var cclass  = $(this).attr('class') || '';
            var id      = $(this).attr('id')    || '';
            var title   = $(this).attr('title') || '';
            var vars = [/[^a-zA-Z0-9]?(back|prev|older)[^g]?/i];
            for(var i = 0; i < vars.length; i++){
                if(
                    (text.search(vars[i])    != -1 || 
                    cclass.search(vars[i])  != -1 || 
                    id.search(vars[i])      != -1 || 
                    title.search(vars[i])   != -1) &&
                    prev_page === false
                ){
                    console.log("Found prev: " + href);
                    prev_page = href;
                    break;
                }
            }
            var vars = [/[^a-zA-Z0-9]?(next|forward)[s]?/i];
            for(var i = 0; i < vars.length; i++){
                if(
                    (text.search(vars[i])    != -1 || 
                    cclass.search(vars[i])  != -1 || 
                    id.search(vars[i])      != -1 || 
                    title.search(vars[i])   != -1) &&
                    next_page === false
                ){
                    console.log("Found next: " + href);
                    next_page = href;
                    break;
                }
            }
        });
        
        // If there is no link found on the page, look for a page parameter
        // in the URL and increment/decrement it by 1
        if(prev_page !== false && next_page !== false){
            var page_vars = ["page"];
            for(var i = 0; i < page_vars.length; i++){
                var has_var = getQueryVariable(page_vars[i]) !== false;
                if(has_var){
                    var page = getQueryVariable(page_vars[i]);
                    if(isNumber(page)) {
                        updateUrl(parseInt(page), page_vars[i]);
                        break;
                    }
                }
            }
        }
        if(prev_page !== false || next_page !== false){
            document.addEventListener('keydown',function(e){
                keypad(e);
            }, false);
        }
        
        return {"current": window.location.href.toString(), "next": next_page, "prev": prev_page};
    }
    
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    
    function updateUrl(page, varname){
        var url = window.location.href.toString();
        next_page = url.replace(varname+"="+page,varname+"="+(page+1));
        prev_page = url.replace(varname+"="+page,varname+"="+(page-1));
        return {"current": url, "next": next_page, "prev": prev_page};
    }
    
    function keypad(e){
        if(isPaused) return;
        if(e.keyCode == keycodes.left) {
            if(prev_page !== false){
                window.location.href = prev_page;
            }
        } else if(e.keyCode == keycodes.right) {
            if(next_page !== false){
                window.location.href = next_page;
            }
        }
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        return false;
    }

    chrome.extension.sendRequest({id: 'isPaused?'}, function(response) {
        isPaused = response.value;
        if(!isPaused) {
            analyse();
        }
    });

})();