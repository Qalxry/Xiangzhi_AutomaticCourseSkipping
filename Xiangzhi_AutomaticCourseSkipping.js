// ==UserScript==
// @name         向知自动刷课脚本
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  "向知"自动刷课脚本是为了帮助学生在新兴的网络课程学习平台"向知"上自动完成课程观看而开发的。由于该平台相对较新，尚未具备相关自动播放功能，因此我开发了这个脚本，以便学生能够轻松自动播放课程视频，从而解放他们的时间和精力。
// @author       ShizuriYuki
// @match        https://web.lumibayedu.com/*
// @icon         https://web.lumibayedu.com/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const enableAutoMute = true;
    const enableAutoSpeedUp = true;
    const enableLog = true;

    // 自动点击烦人的弹窗
    function autoClickAnnoyingPopup() {
        // find all the buttons with text "继续播放", and click them
        // After having clicked the button, then find the video element and play it.
        const BUTTONS = document.querySelectorAll("button");
        BUTTONS.forEach((button) => {
            if (button.innerText === "继续播放") {
                button.click();
                if (enableLog) console.log("[向知自动刷课脚本][INFO] Clicked.");
                // find the video element and play it
                const VIDEO = document.querySelector("video");
                if (VIDEO) {
                    VIDEO.play();
                    if (enableLog) console.log("[向知自动刷课脚本][INFO] Video played.");
                }
            }
        });
    }

    // 自动静音
    function videoAutoMute() {
        // If the video is unmuted, then mute it.
        const VIDEO = document.querySelector("video");
        if (VIDEO && !VIDEO.muted) {
            VIDEO.muted = true;
            if (enableLog) console.log("[向知自动刷课脚本][INFO] Video muted.");
        }
    }

    // 自动加速3倍速播放
    function videoSpeedUp3x() {
        const VIDEO = document.querySelector("video");
        if (VIDEO && VIDEO.playbackRate !== 3) {
            VIDEO.playbackRate = 3;
            if (enableLog) console.log("[向知自动刷课脚本][INFO] Video speed up 3x.");
        }
    }

    // 自动播放下一个视频
    function nextVideo() {
        /* 
         * English Version:
         * We can find the currently playing video by searching for a div element with the class "titleto seconds".
         * Then, we can determine its index in the playlist using its id in the format "titleto<num>".
         * Based on the index of the currently playing video, we can calculate the index of the next video (by adding one).
         * Next, we can obtain the id of the next video using "titleto<num+1>" 
           and trigger a click event on it to navigate to the next video.
         * Please note that if we cannot find an id for the next video, it means all videos have been played, 
           and we should display a popup message indicating that all videos have been played.
         */
        const currentlyPlayingVideo = document.querySelector(".titleto.seconds");
        if (currentlyPlayingVideo) {
            const currentIndex = parseInt(currentlyPlayingVideo.id.match(/\d+/)[0]);
            const nextIndex = currentIndex + 1;
            const nextVideo = document.getElementById(`titleto${nextIndex}`);
            if (nextVideo) {
                nextVideo.click();
            } else {
                alert("向知自动刷课脚本提示您：已经播放完毕所有视频！");
                clearInterval(intervalId);
            }
        } else {
            console.error("No currently playing video found.");
        }
    }

    // 检查视频是否播放完毕
    function checkIfVideoEnded() {
        const VIDEO = document.querySelector("video");
        if (VIDEO && VIDEO.ended) {
            if (enableLog) console.log("[向知自动刷课脚本][INFO] Video ended. Going to next video.");
            nextVideo();
            // Sleep for 2 seconds to wait for the next video to load
            setTimeout(() => {
                if (enableLog) console.log("[向知自动刷课脚本][INFO] Video played.");
                VIDEO.play();
            }, 2000);
            if (enableLog) console.log("[向知自动刷课脚本][INFO] Successfully played the next video.");
        }
        // Check whether the video is paused, if so, play it.
        else if (VIDEO && VIDEO.paused) {
            if (enableLog) console.log("[向知自动刷课脚本][INFO] Video paused. Going to play it.");
            VIDEO.play();
            if (enableLog) console.log("[向知自动刷课脚本][INFO] Successfully played the video.");
        }
    }

    // 每隔0.5秒检查一次视频是否播放完毕
    let intervalId = setInterval(() => {
        if (enableAutoSpeedUp) videoSpeedUp3x();
        if (enableAutoMute) videoAutoMute();
        autoClickAnnoyingPopup();
        checkIfVideoEnded();
    }, 500);
})();
