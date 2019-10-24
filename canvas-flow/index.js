
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

CanvasFlow.prototype.drawAnimatedArc = function (x, y, radius, startAngle, endAngle, animSpeed) {
    let args = Array.prototype.slice.apply(arguments);
    return new Promise((res, rej) => {
        this.__moves.push({
            type: 'arc',
            args: [...args, res, rej]
        })
    })
}

CanvasFlow.prototype.drawLine = function (startPointX, startPointY, endPointX, endPointY, animSpeed, speedX, speedY, xDir, yDir, resolve, reject) {
    let ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(startPointX, startPointY);
    ctx.lineTo(startPointX + speedX, startPointY + speedY);
    ctx.stroke()
    if (((speedX >= 0 && (speedX + startPointX) <= endPointX) && (speedY >= 0 && (speedY + startPointY) <= endPointY)) ||
        ((speedX <= 0 && (speedX + startPointX) >= endPointX) && (speedY <= 0 && (speedY + startPointY) >= endPointY)) ||
        ((speedX >= 0 && (speedX + startPointX) <= endPointX) && (speedY <= 0 && (speedY + startPointY) >= endPointY)) ||
        ((speedX <= 0 && (speedX + startPointX) >= endPointX) && (speedY >= 0 && (speedY + startPointY) <= endPointY))
    ) {
        return [startPointX + speedX, startPointY + speedY, endPointX, endPointY, animSpeed, speedX, speedY, xDir, yDir, resolve, reject]
    } else {
        resolve();
        return false;
    }
}

CanvasFlow.prototype.drawAnimatedLine = function (startPointX, startPointY, endPointX, endPointY, animSpeed) {
    let atan = Math.atan((endPointY - startPointY) / (endPointX - startPointX))
    let speedY = Math.abs(Math.sin(atan) * animSpeed);
    let speedX = Math.abs(Math.cos(atan) * animSpeed);
    speedX = (endPointX - startPointX) > 0 ? speedX : -speedX;
    speedY = (endPointY - startPointY) > 0 ? speedY : -speedY;

    let args = Array.prototype.slice.apply(arguments);


    return new Promise((res, rej) => {
        this.__moves.push(this.move('lin', [...args, speedX, speedY, 1, 1, res, rej]))
        // this.drawLine(...args, speedX, speedY, 1, 1, res, rej)
    })
}

CanvasFlow.prototype.move = function (type, args) { return { type, args } }


CanvasFlow.prototype.drawAnimatedBelzier = function (start, cp1, cp2, end, rate = 0.01) {


    return new Promise((res, rej) => {
        this.__moves.push(this.move('bel', [start, cp1, cp2, end, rate, res, rej, 0]))
    })
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
module.exports = { CanvasFlow }