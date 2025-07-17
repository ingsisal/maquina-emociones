$(document).ready(function () {
  const video = document.getElementById("video");
  const canvas = document.getElementById("overlay");
  const $emocionTexto = $("#emocionDetectada");

  async function cargarModelos() {
    const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js-models@master/models";
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      iniciarCamara();
    } catch (err) {
      console.error("❌ Error cargando modelos:", err);
      $emocionTexto.text("❌ No se pudieron cargar los modelos.");
    }
  }

  async function iniciarCamara() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      video.srcObject = stream;

      video.onloadedmetadata = async () => {
        await video.play();
        esperarVideoYDetectar();
      };
    } catch (err) {
      console.error("❌ Error accediendo a la cámara:", err);
      $emocionTexto.text("❌ No se pudo acceder a la cámara.");
    }
  }

  function esperarVideoYDetectar() {
    const esperar = setInterval(() => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        clearInterval(esperar);
        detectarEmociones();
      }
    }, 500);
  }

  function detectarEmociones() {
    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight
    };

    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    const ctx = canvas.getContext("2d");

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        const resized = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceExpressions(canvas, resized);

        const emociones = detections[0].expressions;
        const emocionPrincipal = Object.entries(emociones).sort((a, b) => b[1] - a[1])[0][0];

        const emojiMap = {
          happy: "😄 Feliz",
          sad: "😢 Triste",
          angry: "😠 Enojado",
          surprised: "😲 Sorprendido",
          disgusted: "🤢 Disgustado",
          fearful: "😨 Asustado",
          neutral: "😐 Neutral"
        };

        $emocionTexto.text(`Emoción detectada: ${emojiMap[emocionPrincipal] || "😐 Desconocida"}`);
      } else {
        $emocionTexto.text("🔍 Buscando rostro...");
      }
    }, 1000);
  }

  cargarModelos();
});
