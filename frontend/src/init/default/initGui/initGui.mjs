import { refresh } from '../../../system/index.mjs'
import { mouseWheel, mouseMove } from '../../../events/index.mjs'

export  function initGui(raytracer) {
    raytracer.canvas.addEventListener('wheel',(event) => { mouseWheel(event); return false; }, false);
    raytracer.canvas.addEventListener('mousemove',(event) => { mouseMove(event); return false; }, false);
    document.onkeypress = (e) => {
        if(e.key === "w") moveCamera(1,0,0);
        if(e.key === "s") moveCamera(-1,0,0);
        if(e.key === "a") moveCamera(0,-1,0);
        if(e.key === "d") moveCamera(0,1,0);
        if(e.key === "e") moveCamera(0,0,1);
        if(e.key === "c") moveCamera(0,0,-1);

        if(e.key === "+") mouseWheel({deltaY: -10});
        if(e.key === "-") mouseWheel({deltaY: 10});
    };
    chceckScreenResize();

    refresh();
}