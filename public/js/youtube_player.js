var tag = document.createElement('script');
var lessonDuration = 0.5; // in minutes
var count = lessonDuration * 60; // convert minutes to seconds
window.done = false;

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%', // Set height to auto
        width: '100%', // Set width to 100% of the parent element
        videoId: lessonVideoId, 
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Format the time as MM:SS
function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0');
}

// Update timer display every second
setInterval(function() {
    if (done) {
        document.getElementById("timer").innerHTML = '<i class="fa-solid fa-circle-check" style="color: #ffffff;"></i>';
    } else {
        document.getElementById("timer").innerHTML = formatTime(count); // Display the time in MM:SS format
    }
}, 1000);

function onPlayerReady(event) {
    event.target.playVideo();
}

var countInterval;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        if (!countInterval) { 
            countInterval = setInterval(() => {
                if (count <= 0) {
                    clearInterval(countInterval);
                    countInterval = null;
                    done = true;
                } else {
                    count -= 1;
                }
            }, 1000);
        }
    } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
        clearInterval(countInterval);
        countInterval = null; 
    }
}

function stopVideo() {
    player.stopVideo();
}
