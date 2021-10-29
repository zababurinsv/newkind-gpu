export  function mouseMove(e) {
    par = raytracerParams.getParams();

    //let canvas = document.getElementById("myCanvas");
    //console.log('clock',canvas.requestPointerLock);

    //raytracerParams.moveCamera(e.offsetX/100, e.offsetY/100); // yaw = left/right, pitch = up/down
    if(!par.camera.locked) {
        raytracerParams.moveCamera(e.movementX, -e.movementY, 0,0,0); // yaw = left/right, pitch = up/down
        refresh();
    }
}

export function mouseWheel(e) {
    tmpMouseWhellY += e.deltaY;
    tmpMouseWhellY = tmpMouseWhellY>-2000 ? -2000 : tmpMouseWhellY;
    tmpMouseWhellY = tmpMouseWhellY<-8000 ? -8000 : tmpMouseWhellY;
    n = Math.pow(10, tmpMouseWhellY/1000);

    par.ray.rayMinDist = n;
    par.camera.speed = n*10;

    document.querySelector("#rayMinDist").value = Math.floor((-tmpMouseWhellY-2000)/6);
    refresh();
}

export function canvasOnClick_enablePointerLocking(event) {
    if(par.camera.locked) {
        let canvas = event.target;

        canvas.requestPointerLock = canvas.requestPointerLock ||
            canvas.mozRequestPointerLock ||
            canvas.webkitRequestPointerLock;
        // Ask the browser to lock the pointer

        canvas.requestPointerLock();
    }
}

export function lockChange(e) {
    par = raytracerParams.getParams();
    par.camera.locked = !par.camera.locked;
}