const { createCanvas, loadImage } = require('canvas');

async function getImageFromMediaStream(mediaStream) {
    const canvas = createCanvas(mediaStream.width, mediaStream.height);
    const ctx = canvas.getContext('2d');

    // Draw the video frame onto the canvas
    ctx.drawImage(mediaStream, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a base64 encoded PNG image
    const base64Image = canvas.toDataURL('image/png');

    return base64Image;
}

// Example usage:
async function captureImageFromStream() {
    // Replace 'mediaStream' with your actual MediaStream object
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });

    // Create a canvas element
    const videoElement = document.createElement('video');
    videoElement.srcObject = mediaStream;
    await videoElement.play();

    const canvas = createCanvas(videoElement.videoWidth, videoElement.videoHeight);
    const ctx = canvas.getContext('2d');

    // Draw the video frame onto the canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Capture the MediaStream from the canvas
    const canvasStream = canvas.captureStream();

    // Get the image data from the MediaStream
    const imageData = await getImageFromMediaStream(canvasStream);

    console.log('Captured image:', imageData);

    // Here you can save the image data to a file or send it wherever you need
}

captureImageFromStream().catch(console.error);