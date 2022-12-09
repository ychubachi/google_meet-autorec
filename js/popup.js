"use strict";
console.log("Google Meet Autorec: popup.js loaded");
var current_url;
var current_meet_id;
// @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
$("#checkbox_autorec").on("change", save_status);
// @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
$("#textarea_description").on("change", save_status);
// @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
$("#start_recording").on('click', ui_start_recording);
// @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
$("#stop_recording").on('click', ui_stop_recording);
// @ts-expect-error TS(2304): Cannot find name 'chrome'.
chrome.tabs.query({ active: true, currentWindow: true }, (e) => {
    current_url = e[0].url;
    const meet_id = current_url.match("^https://meet.google.com/([a-z-]+).*$");
    if (meet_id && meet_id[1]) {
        current_meet_id = meet_id[1];
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#meet_id").text(`Google Meet ID: ${current_meet_id}`);
    }
    else {
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#title").addClass("w3-gray");
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#title").addClass("w3-orange w3-text-white");
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#main").addClass("w3-text-gray");
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#meet_id").text("This is not Google Meet meeting");
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#textarea_description").prop("disabled", true);
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#checkbox_autorec").prop("disabled", true);
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#start_recording").prop("disabled", true);
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        $("#stop_recording").prop("disabled", true);
    }
    load_status();
});
function ui_start_recording() {
    console.trace();
    // @ts-expect-error TS(2304): Cannot find name 'chrome'.
    chrome.runtime.sendMessage({
        command: "start_recording"
    }, function (response) {
        console.log(response);
    });
}
function ui_stop_recording() {
    console.trace();
    // @ts-expect-error TS(2304): Cannot find name 'chrome'.
    chrome.runtime.sendMessage({
        command: "stop_recording"
    }, function (response) {
        console.log(response);
    });
}
/*
// Code snipets //

// To show all storage data
chrome.storage.sync.get(null, function (result) { console.log(result); });

// To clear all strage data
chrome.storage.sync.clear();
*/
function save_status() {
    console.trace();
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const description = $("#textarea_description").val();
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const enabled = $("#checkbox_autorec").prop("checked");
    // console.log("description=" + description);
    // console.log("enabled=" + enabled);
    // @ts-expect-error TS(2304): Cannot find name 'chrome'.
    chrome.storage.sync.get("autorec", function (result) {
        if (!result["autorec"]) {
            // console.log("create autorec property");
            result = { autorec: {} };
        }
        if (enabled || description) {
            result.autorec[current_meet_id] = { description: description, enabled: enabled };
            // console.log(result.autorec);
        }
        else {
            delete result.autorec[current_meet_id];
        }
        // @ts-expect-error TS(2304): Cannot find name 'chrome'.
        chrome.storage.sync.set({ autorec: result.autorec }, function () {
            // @ts-expect-error TS(2304): Cannot find name 'chrome'.
            chrome.storage.sync.get(null, function (result) {
                console.log("new data:");
                console.log(result);
            });
        });
    });
}
function load_status() {
    console.trace();
    // @ts-expect-error TS(2304): Cannot find name 'chrome'.
    chrome.storage.sync.get("autorec", function (result) {
        if (!result["autorec"]) {
            console.log("create autorec property");
            result = { autorec: {} };
        }
        const data = result.autorec[current_meet_id];
        if (data) {
            console.log(data.enabled);
            console.log(data.description);
            // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $("#checkbox_autorec").prop("checked", data.enabled);
            // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $("#textarea_description").val(data.description);
        }
    });
}
