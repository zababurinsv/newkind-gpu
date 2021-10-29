import pkg from "../../package.json";
import RaytracerParams from './class/RaytracerParams.mjs'
import init from './init/default/index.mjs'
import { refresh } from './system/index.mjs'
export let run = (object) => {

    function refreshWindow(timestamp) {

        console.log('this---->',this)
        // redraw only if some render parameter change (user move mose, push button etc.)
        if(!locked) {
            locked = true;
            let par = raytracerParams.getParams();
            let r = raytracerParams.calcRayBase(); // {E, P1M, Bn, Vn};

            raytracer(
                par.ray.calcLight, par.ray.rayMaxSteps, par.ray.rayMinDist,
                r.E.x, r.E.y, r.E.z,
                r.P1M.x, r.P1M.y, r.P1M.z,
                r.QX.x, r.QX.y, r.QX.z,
                r.QY.x, r.QY.y, r.QY.z,
                par.light.x, par.light.y, par.light.z,
            );
        }
        
        window.requestAnimationFrame(refreshWindow);
    }

    function refreshScreenSize() {
        //raytracerParams.setScreenSize(window.innerWidth, window.innerHeight);
        raytracerParams.setScreenSize(500, 500);
        console.log('init', init)
        raytracer = init.initFractalGPU(raytracerParams);
        refresh();
    }

    let raytracerParams = new RaytracerParams();
    let tmpMouseWhellY = -3000;
    let locked = false;
    let start;
    refreshScreenSize();

    init.initGui(raytracerParams);

    window.requestAnimationFrame(refreshWindow);
}
export default pkg