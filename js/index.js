async function getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    return videoDevices;
}

async function getStream(deviceId) {
    const constraints = {
        video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: {
                ideal: 4096
            },
            height: {
                ideal: 2160
            }
            // aspectRatio: 16/9
        } 
    }
    
    return await navigator.mediaDevices.getUserMedia(constraints);
}

async function init() {
    const videoElement = document.querySelector('.js-camera');
    const cameraSelect = document.querySelector('.js-select-camera');
    
    const cameras = await getCameras();

    cameras.forEach(camera => {
        const option = document.createElement('option');
        option.value = camera.deviceId;
        option.text = camera.label || `Camera ${cameraSelect.length + 1}`;
        cameraSelect.appendChild(option);
    });

    cameraSelect.onchange = async () => {
        if (window.currentStream) {
            window.currentStream.getTracks().forEach(track => track.stop());
        }

        const stream = await getStream(cameraSelect.value);
        window.currentStream = stream;
        videoElement.srcObject = stream;
    };

    if (cameras.length > 0) {
        const stream = await getStream(cameras[0].deviceId);
        window.currentStream = stream;
        videoElement.srcObject = stream;
    }
}

init();

const fullscreenBtn = document.querySelector(".js-fullscreen"),
flipBtn = document.querySelector(".js-flip"),
captureBtn = document.querySelector(".js-capture"),
webcam = document.querySelector(".js-camera"),
frameCanvas = document.querySelector("#js-captured-frame")

let fullscreen = false
let flipped = false

function fullscreenVideo() {
    switch (fullscreen) {
        case true:
            document.exitFullscreen()
            fullscreenBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/></svg>`
            fullscreen = false
            break
        case false:
            document.body.requestFullscreen()
            fullscreenBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z"/></svg>`
            fullscreen = true
            break
    }
}

fullscreenBtn.addEventListener("click", fullscreenVideo)
window.addEventListener("keydown", function(e) {
    if (e.key.toLowerCase() === "f") {
        fullscreenVideo()
    } else if (e.key.toLocaleLowerCase() === "escape") {
        fullscreenVideo()
    }
})

function captureVideo() {
    const ctx = frameCanvas.getContext("2d")

    frameCanvas.width = webcam.videoWidth
    frameCanvas.height = webcam.videoHeight

    ctx.drawImage(webcam, 0, 0, frameCanvas.width, frameCanvas.height)

    const result = frameCanvas.toDataURL()

    const a =  document.createElement("a")
    a.href = result
    a.download = `${Date.now()}.png`
    a.click()
    a.remove()
}

captureBtn.addEventListener("click", captureVideo)
window.addEventListener("keydown", function(e) {
    if (e.key.toLowerCase() === "c") {
        captureVideo()
    }
})

function flipVideo() {
    switch (flipped) {
        case true:
            webcam.style.transform = `scaleX(0)`
            webcam.style.filter = `none`
            flipped = false
            break
        case false:
            webcam.style.transform = `scaleX(-1)`
            webcam.style.filter = `FlipH`
            flipped = true
            break
    }
}

flipBtn.addEventListener("click", flipVideo)
window.addEventListener("keydown", function(e) {
    if (e.key.toLowerCase() === "r") {
        flipVideo()
    }
})