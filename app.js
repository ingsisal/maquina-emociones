
const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const emotionDiv = document.getElementById("emotion");

const EMOCIONES_ES = {
    "angry": "Estas Enojado",
    "disgusted": "Estas Disgustado",
    "fearful": "Estas de Miedo",
    "happy": "Estas de Felicidad",
    "neutral": "Estas Neutral",
    "sad": "Estas Triste",
    "surprised": "Estas Sorprendido"
};

async function iniciarCamara() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Error accediendo a la camara: " + err.message);
    }
}

async function cargarModelos() {
    const MODEL_URL = "./models/";
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log("Modelos cargados correctamente");
    } catch (err) {
        console.error("Error cargando modelos:", err);
        emotionDiv.textContent = "No se pudieron cargar los modelos.";
    }
}

async function detectar() {
    const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

    const dims = faceapi.matchDimensions(canvas, video, true);
    const resized = faceapi.resizeResults(detections, dims);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceExpressions(canvas, resized);

    if (resized.length > 0) {
        const exp = resized[0].expressions;
        const emotion = Object.entries(exp).sort((a, b) => b[1] - a[1])[0][0];
        const traduccion = EMOCIONES_ES[emotion] || emotion;
        emotionDiv.textContent = "Tu Emocion es : " + traduccion;
    } else {
        emotionDiv.textContent = "Detectando...";
    }
}

video.addEventListener("playing", () => {
    setInterval(detectar, 1000);
});

(async () => {
    await cargarModelos();
    await iniciarCamara();
})();
