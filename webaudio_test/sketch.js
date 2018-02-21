var audioContext = new AudioContext();
var buffer = null;
var source = audioContext.createBufferSource();

var request = new XMLHttpRequest();
request.open('GET', 'okl.mp3', true);
request.responseType = 'arraybuffer';
request.send();

request.onload = function () {
    var res = request.response;
    audioContext.decodeAudioData(res, function (buf) {
        source.buffer = buf;
    });
    setTimeout(startBgm, 900);
};

source.connect(audioContext.destination);
source.start(0);


var sched = new WebAudioScheduler({ context: audioContext });
function startBgm()
{
    sched.start(metronome);
}

function metronome(e) 
{
    var t0 = e.playbackTime;

    sched.insert(t0 + 60/92 * 0, ticktack);
    sched.insert(t0 + 60/92 * 1, ticktack, { frequency: 140, duration: 0.2 });
    sched.insert(t0 + 60/92 * 2, ticktack, { frequency: 240, duration: 0.2 });
    sched.insert(t0 + 60/92 * 3, ticktack, { frequency: 340, duration: 0.2 });
    sched.insert(t0 + 60/92 * 4, metronome);
}

function ticktack(e) {
    console.log("ok");
}



