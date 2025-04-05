let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let isDrawing = false;
let model;

// Load the model
async function loadModel() {
    try {
        model = await tf.loadLayersModel('mnist_model_js/model.json');
        console.log("✅ Model loaded successfully!");
    } catch (error) {
        console.error("❌ Error loading the model:", error);
    }
}
loadModel();

// Event listeners for mouse drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);

// Event listeners for touch drawing (Mobile support)
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchend", stopDrawing);
canvas.addEventListener("touchmove", draw);

document.getElementById("clear").addEventListener("click", clearCanvas);
document.getElementById("predict").addEventListener("click", predictDigit);

function startDrawing(event) {
    isDrawing = true;
    ctx.beginPath();
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function draw(event) {
    if (!isDrawing) return;

    // For touch events (mobile support)
    let x, y;
    if (event.touches) {
        let touch = event.touches[0];
        x = touch.clientX - canvas.getBoundingClientRect().left;
        y = touch.clientY - canvas.getBoundingClientRect().top;
    } else {
        x = event.offsetX;
        y = event.offsetY;
    }

    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("prediction").innerText = "";
}

async function predictDigit() {
    if (!model) {
        console.error("❌ Model not loaded yet!");
        document.getElementById("prediction").innerText = "Model loading...";
        return;
    }

    // Get image data from canvas
    let imgData = ctx.getImageData(0, 0, 280, 280);
    let img = tf.browser.fromPixels(imgData, 1);
    img = tf.image.resizeBilinear(img, [28, 28]);
    img = img.div(tf.scalar(255)); // Normalize
    img = img.expandDims(0); // Shape (1,28,28,1)

    // Predict digit
    let prediction = model.predict(img);
    let digit = prediction.argMax(1).dataSync()[0];

    console.log("Predicted Digit:", digit);
    document.getElementById("prediction").innerText = digit;
}
