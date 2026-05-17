const video =
    document.getElementById("video");

const controls =
    document.getElementById("controls");

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");

const ascii =
    document.getElementById("ascii");

const startBtn =
    document.getElementById("startBtn");

const photoBtn =
    document.getElementById("photoBtn");

const recordBtn =
    document.getElementById("recordBtn");

const colorBtn =
    document.getElementById("colorBtn");



// ASCII RESOLUTION

const WIDTH = 200;

const HEIGHT = 140;



// ASCII CHARSET

const ASCII_CHARS =
"@#S%?*+;:,. ";



// COLORS

const COLORS = [
    "white",
    "red",
    "lime",
    "cyan",
    "yellow"
];

let currentColor = 0;



// RECORDING

let mediaRecorder;

let recordedChunks = [];

let isRecording = false;



// OFFSCREEN RECORDING CANVAS

const recordCanvas =
    document.createElement("canvas");

const recordCtx =
    recordCanvas.getContext("2d");

recordCanvas.width = 1920;

recordCanvas.height = 1080;



/* START CAMERA */

startBtn.addEventListener(
    "click",
    async () => {


        document
    .getElementById("landing")
    .style.opacity = "0";



setTimeout(() => {

    document
        .getElementById("landing")
        .style.display = "none";

}, 1000);



ascii.style.opacity = "1";



controls.style.opacity = "1";

controls.style.pointerEvents = "all";
        const stream =
            await navigator
                .mediaDevices
                .getUserMedia({
                    video: true,
                    audio: false
                });

        video.srcObject = stream;

        setupRecorder();

        video.onloadedmetadata = () => {

            startCamera();
        };
    }
);



/* SETUP ASCII VIDEO RECORDER */

function setupRecorder() {

    const stream =
        recordCanvas.captureStream(30);

    mediaRecorder =
        new MediaRecorder(stream);

    mediaRecorder.ondataavailable = e => {

        recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {

        const blob =
            new Blob(
                recordedChunks,
                {
                    type: "video/webm"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;

        a.download =
            "ascii-video.webm";

        a.click();

        recordedChunks = [];
    };
}



/* RECORD BUTTON */

recordBtn.addEventListener(
    "click",
    () => {

        if (!isRecording) {

            mediaRecorder.start();

            isRecording = true;

            recordBtn.classList.add(
                "recording"
            );

        } else {

            mediaRecorder.stop();

            isRecording = false;

            recordBtn.classList.remove(
                "recording"
            );
        }
    }
);



/* PHOTO BUTTON */

photoBtn.addEventListener(
    "click",
    () => {

        const image =
            recordCanvas.toDataURL(
                "image/png"
            );

        const a =
            document.createElement("a");

        a.href = image;

        a.download =
            "ascii-photo.png";

        a.click();
    }
);



/* COLOR SWITCH BUTTON */

colorBtn.addEventListener(
    "click",
    () => {

        currentColor++;

        if (
            currentColor >= COLORS.length
        ) {
            currentColor = 0;
        }

        ascii.style.color =
            COLORS[currentColor];
    }
);



/* BRIGHTNESS */

function getBrightness(r, g, b) {

    let brightness =

        0.299 * r +
        0.587 * g +
        0.114 * b;

    brightness *= 1.4;

    brightness =
        Math.min(255, brightness);

    return brightness;
}



/* PIXEL TO ASCII */

function pixelToChar(brightness) {

    const index = Math.floor(

        (brightness / 255) *

        (ASCII_CHARS.length - 1)
    );

    return ASCII_CHARS[
        ASCII_CHARS.length - 1 - index
    ];
}



/* MAIN RENDER LOOP */

function startCamera() {

    canvas.width = WIDTH;

    canvas.height = HEIGHT;



    function render() {

        ctx.clearRect(
            0,
            0,
            WIDTH,
            HEIGHT
        );



        // MIRROR CAMERA

        ctx.save();

        ctx.scale(-1, 1);

        ctx.drawImage(
            video,
            -WIDTH,
            0,
            WIDTH,
            HEIGHT
        );

        ctx.restore();



        const frame =
            ctx.getImageData(
                0,
                0,
                WIDTH,
                HEIGHT
            );

        const pixels =
            frame.data;

        let asciiImage = "";



        for (let y = 0; y < HEIGHT; y++) {

            for (let x = 0; x < WIDTH; x++) {

                const index =
                    (y * WIDTH + x) * 4;

                const r =
                    pixels[index];

                const g =
                    pixels[index + 1];

                const b =
                    pixels[index + 2];



                const brightness =
                    getBrightness(r, g, b);



                asciiImage +=
                    pixelToChar(brightness);
            }

            asciiImage += "\n";
        }



        ascii.textContent =
            asciiImage;



        /* DRAW ASCII INTO RECORDING CANVAS */

        recordCtx.fillStyle = "black";

        recordCtx.fillRect(
            0,
            0,
            recordCanvas.width,
            recordCanvas.height
        );



        recordCtx.fillStyle =
            ascii.style.color || "white";



        recordCtx.font =
            "12px monospace";



        const lines =
            asciiImage.split("\n");



        for (
            let i = 0;
            i < lines.length;
            i++
        ) {

            recordCtx.fillText(
                lines[i],
                20,
                20 + i * 12
            );
        }



        requestAnimationFrame(
            render
        );
    }

    render();
}