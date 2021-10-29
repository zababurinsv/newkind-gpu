import {canvasOnClick_enablePointerLocking, lockChange} from '../../../events/index.mjs'
import {GPU} from '../../../modules/gpu/gpu-browser.min.js'
import {sdPlane, mandelbulb, distScene, hsv2rgb, kernelMarchingRays} from '../../../gpu/index.mjs'

export function initFractalGPU(raytracerParams) {
    params = raytracerParams.getParams();
    let pxWidth = params.screen.pxWidth;
    let pxHeight = params.screen.pxHeight;
    let canvas = document.getElementById("myCanvas");
    if(canvas) { canvas.remove(); }
    canvas = document.createElement('canvas');
    canvas.id = 'myCanvas';
    document.body.querySelector('.panel').appendChild(canvas);

    //canvas.width = pxWidth;
    //canvas.height = pxHeight;

    canvas.addEventListener('click', canvasOnClick_enablePointerLocking);
    document.addEventListener('pointerlockchange', lockChange, false);

    const gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
    const gpu = new GPU({ canvas, webGl: gl })
        .addFunction(sdPlane)
        .addFunction(mandelbulb)
        .addFunction(distScene)
        .addFunction(hsv2rgb);
    return gpu.createKernel(kernelMarchingRays)
        .setDebug(true)
        .setConstants({ pxWidth, pxHeight, iterations: 100 })
        .setOutput([pxWidth, pxHeight])
        .setGraphical(true)
        .setLoopMaxIterations(10000);
}