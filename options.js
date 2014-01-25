var startingOptions = JSON.parse(localStorage.getItem("options"));

function setOptions() {
    var options = {
    };
    chrome.extension.sendRequest({name: "setOptions", options: JSON.stringify(options)});
}