<h1 align='center'>Canvas-Flow</h1>
A utility that lets you easily draw animations using lines and circles. This also exposes all drawing functions as promises to which you can listen to.
<hr>

> 💁 _**Note:** Requires browser support for Promises and ES6

- [Getting Started](#getting-started)
- [Examples](#examples)

## Getting Started

```shell
$ npm i --save @saransh184/canvas-flow
```

```javascript
import { CanvasFlow } from '@saransh184/canvas-flow';
```

## Examples

```javascript

let cnv = new CanvasFlow(ctx);

cnv.drawAnimatedBelzier({ x: 200, y: 200 }, { x: 200, y: 300 }, { x: 300, y: 400 }, { x: 200, y: 400 });
cnv.drawAnimatedArc(100,100,100,0,360,2);
cnv.drawAnimatedLine(100,100,200,200,1);

cnv.run();

```