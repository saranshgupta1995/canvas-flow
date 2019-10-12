const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const WIDTH_CANVAS = canvas.width;
const HEIGHT_CANVAS = canvas.height;
const rect = canvas.getBoundingClientRect();
ctx.strokeStyle = 'black';

let i = 0;
let mousePosX  = 0, mousePosY = 0;

const buffer = 0;

canvas.addEventListener('click', (event) => {
    mousePosX = event.clientX - rect.left;
    mousePosY = event.clientY - rect.top;
    ctx.clearRect(0,0, WIDTH_CANVAS, HEIGHT_CANVAS);
    window.requestAnimationFrame(drawCircle)
    i = 0;
})


function drawCircle() {
    ctx.clearRect(0,0, WIDTH_CANVAS, HEIGHT_CANVAS);
    ctx.beginPath();
    ctx.arc(mousePosX, mousePosY, 45, deg2rad(buffer), deg2rad(buffer+i));
    ctx.stroke();
    i = i + 5;
    if(i <= (buffer+360)) {
        window.requestAnimationFrame(drawCircle)
    }
}


// function animateCanvas(x, y, length, angle) {
//     if(length < 10) return;
//     let pos = lineAtAngle(x, y, length, angle);
//     animateCanvas(pos.x, pos.y, length*0.90, angle+25)
// }

// const lineAtAngle = (x, y, length, angle) => {
//     angle = deg2rad(angle);
//     ctx.beginPath();
//     ctx.moveTo(x, y);
//     ctx.lineTo(x + length * Math.cos(angle), y + length * Math.sin(angle));
//     ctx.stroke();
//     ctx.closePath();
//     return {
//         x: x + length * Math.cos(angle),
//         y: y + length * Math.sin(angle)
//     }
// }


let deg2rad = (deg) => {
    return deg * (Math.PI / 180);
}


// let getCos = (deg) => {
//     return Math.cos(deg2rad(deg))
// }

// let getSin = (deg) => {
//     return Math.sin(deg2rad(deg))
// }



