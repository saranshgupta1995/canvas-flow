const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const WIDTH_CANVAS = canvas.width;
const HEIGHT_CANVAS = canvas.height;
const rect = canvas.getBoundingClientRect();
ctx.strokeStyle = 'black';

let deg2rad = (deg) => {
    return deg * (Math.PI / 180);
}

class CanvasFlow {

    constructor(ctx) {
        Object.defineProperty(this, 'ctx', {
            value: ctx,
            writable: false
        });

        Object.defineProperty(this, '__moves', {
            value: [],
            writable: false
        });

    }

}

CanvasFlow.prototype.move = function (type, args) { return { type, args } }

CanvasFlow.prototype.drawArc = function (x, y, radius, startAngle, endAngle, animSpeed, resolve, reject, deg = 0) {
    let ctx = this.ctx
    if (!deg) deg = animSpeed;
    ctx.beginPath();
    ctx.arc(x, y, radius, deg2rad(startAngle + deg - animSpeed), deg2rad(startAngle + deg));
    ctx.stroke();
    if (deg <= (endAngle - startAngle)) {
        return [x, y, radius, startAngle, endAngle, animSpeed, resolve, reject, deg + animSpeed]
    } else {
        resolve(true);
        return false
    }
}

CanvasFlow.prototype.drawBelzierSegment = function (start, cp1, cp2, end, rate, res, rej, t) {
    let ctx = this.ctx;
    let getP = (t, p) => {
        return (1 - t) ** 3 * start[p] + 3 * (1 - t) ** 2 * t * cp1[p] + 3 * (1 - t) * t ** 2 * cp2[p] + t ** 3 * end[p]
    }
    ctx.beginPath();
    ctx.moveTo(getP(t - rate, 'x'), getP(t - rate, 'y'));
    ctx.lineTo(getP(t, 'x'), getP(t, 'y'));
    ctx.stroke();
    if (t <= 1) {
        window.requestAnimationFrame(() => this.drawBelzierSegment(start, cp1, cp2, end, rate, res, rej, t + rate))
    } else {
        res();
    }
}


CanvasFlow.prototype.drawLine = function (startPointX, startPointY, endPointX, endPointY, speedX, speedY, xDir, yDir, resolve, reject) {
    let ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(startPointX, startPointY);
    ctx.lineTo(startPointX + speedX, startPointY + speedY);
    ctx.stroke()
    if (
        ((!speedX || (speedX > 0 && (speedX + startPointX) < endPointX)) && (!speedY || (speedY > 0 && (speedY + startPointY) < endPointY))) ||
        ((!speedX || (speedX < 0 && (speedX + startPointX) > endPointX)) && (!speedY || (speedY < 0 && (speedY + startPointY) > endPointY))) ||
        ((!speedX || (speedX > 0 && (speedX + startPointX) < endPointX)) && (!speedY || (speedY < 0 && (speedY + startPointY) > endPointY))) ||
        ((!speedX || (speedX < 0 && (speedX + startPointX) > endPointX)) && (!speedY || (speedY > 0 && (speedY + startPointY) < endPointY)))
    ) {
        return [startPointX + speedX, startPointY + speedY, endPointX, endPointY, speedX, speedY, xDir, yDir, resolve, reject]
    } else {
        resolve();
        return false;
    }
}

CanvasFlow.prototype.run = function () {
    for (let i = 0; i < this.__moves.length; i++) {
        const move = this.__moves[i];

        if (move.staged === false) {
            continue;
        }
        switch (move.type) {
            case 'arc':
                move.staged = this.drawArc(...(move.staged || move.args))
                break;

            case 'lin':
                move.staged = this.drawLine(...(move.staged || move.args))
                break;

            case 'bel':
                move.staged = this.drawBelzierSegment(...(move.staged || move.args))
                break;

            default:
                break;
        }
    }
    window.requestAnimationFrame(() => this.run())
}

CanvasFlow.prototype.drawAnimatedArc = function (x, y, radius, options = {
    mode: 'speed',
    startAngle: 0,
    endAngle: 360,
    animSpeed: 3
}) {
    const { startAngle, endAngle, animSpeed } = options;
    return new Promise((res, rej) => {
        this.__moves.push({
            type: 'arc',
            args: [x, y, radius, startAngle, endAngle, animSpeed, res, rej]
        })
    })
}


CanvasFlow.prototype.drawAnimatedLine = function (startPointX, startPointY, endPointX, endPointY, options = { mode: 'speed', speed: 1 }) {
    let atan = Math.atan((endPointY - startPointY) / (endPointX - startPointX))
    let speedY = Math.abs(Math.sin(atan) * options.speed);
    let speedX = Math.abs(Math.cos(atan) * options.speed);
    speedX = (endPointX - startPointX) > 0 ? speedX : -speedX;
    speedY = (endPointY - startPointY) > 0 ? speedY : -speedY;

    if((speedX<0.0001) && (speedX>-0.0001) ){
        speedX=0;
    }

    if((speedY<0.0001) && (speedY>-0.0001) ){
        speedY=0;
    }

    return new Promise((res, rej) => {
        this.__moves.push(this.move('lin', [startPointX, startPointY, endPointX, endPointY, speedX, speedY, 1, 1, res, rej]))
    })
}

CanvasFlow.prototype.drawAnimatedBelzier = function (start, cp1, cp2, end, options = { mode: 'speed', rate: 0.001 }) {

    const { rate } = options;

    return new Promise((res, rej) => {
        this.__moves.push(this.move('bel', [start, cp1, cp2, end, rate, res, rej, 0]))
    })
}

let cnv = new CanvasFlow(ctx);
ctx.moveTo(100,100);
ctx.bezierCurveTo(100,200,200,100,200,300);
ctx.stroke();
cnv.drawAnimatedBelzier({ x: 100, y: 100 }, { x: 100, y: 200 }, { x: 200, y: 100 }, { x: 200, y: 200 });
// cnv.drawAnimatedBelzier({ x: 200, y: 200 }, { x: 200, y: 300 }, { x: 300, y: 400 }, { x: 200, y: 400 });
cnv.drawAnimatedArc(150, 150, 50);
cnv.drawAnimatedLine(100, 100, 200, 200)
cnv.drawAnimatedLine(100, 100, 200, 100)
cnv.drawAnimatedLine(200, 100, 100, 200)
cnv.drawAnimatedLine(200, 100, 200, 200)
cnv.drawAnimatedLine(200, 200, 100, 200)
cnv.drawAnimatedLine(100, 200, 100, 100)
cnv.run()