const canvas = document.getElementById("meme-canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const laserImageTemplate = new Image();
laserImageTemplate.src = "https://darkmagapfp.netlify.app/laser_large.png";
laserImageTemplate.crossOrigin = "anonymous";

let canvasImage = new Image();
let lasers = [];
let isDragging = false;
let currentLaser = null;
let offsetX, offsetY;
const MAX_WIDTH = 640;
const MAX_HEIGHT = 480;

let originalImageWidth, originalImageHeight;

document
  .getElementById("image-upload")
  .addEventListener("change", function (e) {
    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById("h1-title").style.display = "none";
      canvasImage.onload = function () {
        originalImageWidth = canvasImage.width;
        originalImageHeight = canvasImage.height;

        // Scale the image to fit within the specified limits
        const scale = Math.min(
          MAX_WIDTH / canvasImage.width,
          MAX_HEIGHT / canvasImage.height,
          1
        );
        canvas.width = canvasImage.width * scale;
        canvas.height = canvasImage.height * scale;
        drawCanvas();
        document.querySelector(".button-container").style.display = "flex";
      };
      canvasImage.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  });

document
  .getElementById("add-laser-button")
  .addEventListener("click", function () {
    const laser = {
      image: laserImageTemplate,
      width: (canvas.width / 5) * 3, // Double the size
      height: (canvas.height / 5) * 3, // Double the size
      x: canvas.width / 2 - canvas.width / 10,
      y: canvas.height / 2 - canvas.height / 10,
      rotation: 0,
    };
    lasers.push(laser);
    drawCanvas();
  });

document
  .getElementById("resize-slider")
  .addEventListener("input", function (e) {
    const scale = e.target.value;
    lasers.forEach((laser) => {
      const centerX = laser.x + laser.width / 2;
      const centerY = laser.y + laser.height / 2;
      laser.width = (canvas.width / 5) * scale * 2;
      laser.height = (canvas.height / 5) * scale * 2;
      laser.x = centerX - laser.width / 2;
      laser.y = centerY - laser.height / 2;
    });
    drawCanvas();
  });

document
  .getElementById("rotate-slider")
  .addEventListener("input", function (e) {
    const rotation = (e.target.value * Math.PI) / 180;
    lasers.forEach((laser) => {
      laser.rotation = rotation;
    });
    drawCanvas();
  });

canvas.addEventListener("mousedown", function (e) {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  currentLaser = null;

  lasers.forEach((laser) => {
    if (
      mouseX > laser.x &&
      mouseX < laser.x + laser.width &&
      mouseY > laser.y &&
      mouseY < laser.y + laser.height
    ) {
      laser.isDragging = true;
      offsetX = mouseX - laser.x;
      offsetY = mouseY - laser.y;
      currentLaser = laser;
    }
  });

  if (currentLaser) {
    isDragging = true;
  }
});

canvas.addEventListener("mousemove", function (e) {
  if (isDragging && currentLaser) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    currentLaser.x = mouseX - offsetX;
    currentLaser.y = mouseY - offsetY;
    drawCanvas();
  }
});

canvas.addEventListener("mouseup", function () {
  if (currentLaser) {
    currentLaser.isDragging = false;
    isDragging = false;
    currentLaser = null;
  }
});

// Add touch event listeners
canvas.addEventListener("touchstart", function (e) {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (touch.clientX - rect.left) * scaleX;
  const mouseY = (touch.clientY - rect.top) * scaleY;
  currentLaser = null;

  lasers.forEach((laser) => {
    if (
      mouseX > laser.x &&
      mouseX < laser.x + laser.width &&
      mouseY > laser.y &&
      mouseY < laser.y + laser.height
    ) {
      laser.isDragging = true;
      offsetX = mouseX - laser.x;
      offsetY = mouseY - laser.y;
      currentLaser = laser;
    }
  });

  if (currentLaser) {
    isDragging = true;
  }
});

canvas.addEventListener("touchmove", function (e) {
  if (isDragging && currentLaser) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (touch.clientX - rect.left) * scaleX;
    const mouseY = (touch.clientY - rect.top) * scaleY;
    currentLaser.x = mouseX - offsetX;
    currentLaser.y = mouseY - offsetY;
    drawCanvas();
  }
});

canvas.addEventListener("touchend", function () {
  if (currentLaser) {
    currentLaser.isDragging = false;
    isDragging = false;
    currentLaser = null;
  }
});

document
  .getElementById("download-button")
  .addEventListener("click", function () {
    const fullResCanvas = document.createElement("canvas");
    fullResCanvas.width = originalImageWidth;
    fullResCanvas.height = originalImageHeight;
    const fullResCtx = fullResCanvas.getContext("2d", { willReadFrequently: true });

    // Draw the original image at full resolution
    fullResCtx.drawImage(canvasImage, 0, 0, fullResCanvas.width, fullResCanvas.height);

    // Apply the gradient map filter to the full resolution canvas
    applyFullResGradientMapFilter(fullResCtx, fullResCanvas.width, fullResCanvas.height);

    const scaleX = fullResCanvas.width / canvas.width;
    const scaleY = fullResCanvas.height / canvas.height;

    lasers.forEach((laser) => {
      fullResCtx.save();
      fullResCtx.translate(
        laser.x * scaleX + (laser.width * scaleX) / 2,
        laser.y * scaleY + (laser.height * scaleY) / 2
      );
      fullResCtx.rotate(laser.rotation);
      fullResCtx.drawImage(
        laser.image,
        -(laser.width * scaleX) / 2,
        -(laser.height * scaleY) / 2,
        laser.width * scaleX,
        laser.height * scaleY
      );
      fullResCtx.restore();
    });

    const imageDataUrl = fullResCanvas.toDataURL();
    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = "dark_pfp_full_res.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing
  ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height);
  applyGradientMapFilter(ctx, canvas.width, canvas.height);

  lasers.forEach((laser) => {
    ctx.save();
    ctx.translate(laser.x + laser.width / 2, laser.y + laser.height / 2);
    ctx.rotate(laser.rotation);
    ctx.drawImage(
      laser.image,
      -laser.width / 2,
      -laser.height / 2,
      laser.width,
      laser.height
    );
    ctx.restore();
  });
}

function applyGradientMapFilter(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  const redColor = [243, 4, 13]; // #f3040d
  const blueColor = [7, 11, 40]; // #070b28

  // Apply gradient map
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

    const factor = brightness / 255;
    const adjustedFactor = Math.pow(factor, 0.9);

    data[i] = blueColor[0] + adjustedFactor * (redColor[0] - blueColor[0]);
    data[i + 1] =
      blueColor[1] + adjustedFactor * (redColor[1] - blueColor[1]);
    data[i + 2] =
      blueColor[2] + adjustedFactor * (redColor[2] - blueColor[2]);
  }

  context.putImageData(imageData, 0, 0);
}

function applyFullResGradientMapFilter(context, width, height) {
  // Applying the gradient map filter at full resolution
  applyGradientMapFilter(context, width, height);
}