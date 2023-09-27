// ==UserScript==
// @name         向知自动刷课脚本
// @namespace    http://tampermonkey.net/
// @version      1.0
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
    const enableLog = false;
    let enableRun = 1;

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

    function resetVideoStatus() {
        const VIDEO = document.querySelector("video");
        if (VIDEO) {
            VIDEO.playbackRate = 1;
            if (enableLog) console.log("[向知自动刷课脚本][INFO] Video status reset.");
        }
    }

    
    // 在页面右下角显示脚本状态
    // Create a style element
    const style = document.createElement("style");
    // Define the keyframes animation
    style.textContent = `
    @keyframes blinking {
        0% {
                   opacity: 1;
               }
               50% {
                   opacity: 0;
                }
               100% {
                   opacity: 1;
               }
           }
           `;
    // Append the style element to the document head
    document.head.appendChild(style);
    // Create a container div
    const container = document.createElement("div");
    container.id = "scriptContainer";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.backgroundColor = "white";
    container.style.borderRadius = "8px";
    container.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
    container.style.padding = "10px";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.zIndex = "999999";
    container.style.cursor = "pointer";
    // Create a green dot
    const dot = document.createElement("div");
    dot.id = "scriptDot";
    dot.style.width = "10px";
    dot.style.height = "10px";
    dot.style.backgroundColor = "green";
    dot.style.borderRadius = "50%";
    dot.style.marginRight = "8px";
    // CSS 动画：Dot 每隔1秒闪烁一次
    dot.style.animation = "blinking 1s infinite";
    // Create text
    const runningText = "向知自动刷课脚本正在运行，点击暂停脚本";
    const pausedText = "向知自动刷课脚本已暂停，点击继续脚本";
    const notText = "请进入向知视频播放页面运行脚本";
    const text = document.createElement("div");
    text.id = "scriptText";
    text.textContent = runningText;
    text.style.color = "black";
    // Append the dot and text to the container
    container.appendChild(dot);
    container.appendChild(text);
    // Add event listener to the container
    container.addEventListener("click", () => {
        if (enableRun == 1) {
            enableRun = 0;
            text.textContent = pausedText;
            dot.style.backgroundColor = "red";
            dot.style.animation = "none";
            resetVideoStatus();
        } else if (enableRun == 0) {
            enableRun = 1;
            text.textContent = runningText;
            dot.style.backgroundColor = "green";
            dot.style.animation = "blinking 1s infinite";
        }
    });
    // Append the container to the document body
    document.body.appendChild(container);

    function checkURL() {
        const URL = window.location.href;
        if (URL.includes("video")) {
            if (enableRun == 2) {
                enableRun = 1;
                const DOT = document.getElementById("scriptDot");
                const TEXT = document.getElementById("scriptText");
                DOT.style.backgroundColor = "green"
                DOT.style.animation = "blinking 1s infinite";
                TEXT.textContent = runningText;
            }
            return true;
        } else {
            if (enableRun != 2) {
                enableRun = 2;
                const DOT = document.getElementById("scriptDot");
                const TEXT = document.getElementById("scriptText");
                DOT.style.backgroundColor = "orange";
                DOT.style.animation = "none";
                TEXT.textContent = notText;
            }
            return false;
        }
    }

    // 每隔0.5秒检查一次视频是否播放完毕
    let intervalId = setInterval(() => {
        checkURL();
        if (enableRun === 1) {
            if (enableAutoSpeedUp) videoSpeedUp3x();
            if (enableAutoMute) videoAutoMute();
            autoClickAnnoyingPopup();
            checkIfVideoEnded();
        }
    }, 500);
})();
