export default class RaytracerParams {
    constructor() {
        this.params = {
            ray: {rayMaxSteps:512, rayMinDist:0.001, calcLight: 1 },
            eye:    { x:0, y:1, z:0 },
            light:    { x:-10, y:10, z:10 },
            target:    { x:0, y:0, z:1 },
            vertical: { x:0, y:1, z: 0}, // wektor pionu
            screen: { pxWidth: 0, pxHeight: 0 },
            camera: { yaw: 0, pitch: 0, speed: 0.01, rotateSpeed: 0.01, fov: 90, locked: true }
        }
    }

    getParams() {
        return this.params;
    }

    setScreenSize(width, height) {
        this.params.screen.pxWidth = width;
        this.params.screen.pxHeight = height;
        return this;
    }

    // yaw = left/right, pitch = up/down
    // [x,y,z] = position
    moveCamera(yawDelta, pitchDelta, forwardBackward, leftRight, upDown) {
        let e = this.params.eye;
        let t = this.params.target;
        let v = this.params.vertical;
        let d = this.sub(t,e);

        this.params.camera.yaw += yawDelta * this.params.camera.rotateSpeed;
        this.params.camera.pitch += pitchDelta * this.params.camera.rotateSpeed;
        let yaw = this.params.camera.yaw;
        let pitch = this.params.camera.pitch;

        // rotate
        t.x = e.x + Math.sin(yaw)*Math.cos(pitch);
        t.z = e.z + Math.cos(yaw)*Math.cos(pitch);
        t.y = e.y + Math.sin(pitch);

        // move forward
        let fb = this.scale( this.params.camera.speed * forwardBackward , d);
        this.addInPlace(e,fb);
        this.addInPlace(t,fb);


        // move left-right
        let lr = this.scale( this.params.camera.speed * leftRight , this.norm(this.cross(v, d)));
        this.addInPlace(e,lr);
        this.addInPlace(t,lr);

        // move up-down
        let ud = this.scale( this.params.camera.speed * upDown, v);
        this.addInPlace(e,ud);
        this.addInPlace(t,ud);
    }

    calcRayBase() {
        let E = this.params.eye;
        let T = this.params.target;
        let w = this.params.vertical;

        let t = this.sub(T,E); // = viewport center
        let tn = this.norm(t);

        let b = this.cross(w, t);
        let bn = this.norm(b);
        let vn = this.cross(tn,bn);

        let m = this.params.screen.pxHeight;
        let k = this.params.screen.pxWidth;
        let gx = Math.tan((2*Math.PI*this.params.camera.fov/360)/2);
        let gy = gx*m/k;

        // P1M is left bottom viewport pixel
        let P1M = this.add( tn, this.scale(-gx, bn), this.scale(-gy, vn) ) // chnage C to tn (tn= C-E)

        let QX = this.scale(2*gx/(k-1), bn);
        let QY = this.scale(2*gy/(m-1), vn);

        // Pij = P1M + (i-1)*bnp + (j-1)*vnp
        return {E, P1M, QX, QY};

    }

    cross(a,b) {
        let x = a.y*b.z - a.z*b.y;
        let y = a.z*b.x - a.x*b.z;
        let z = a.x*b.y - a.y*b.x;
        return {x,y,z};
    }

    norm(a) {
        let size = 1/Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z);
        return {x: a.x*size, y: a.y*size, z: a.z*size };
    }

    addInPlace(a,b) {
        a.x += b.x;
        a.y += b.y;
        a.z += b.z;
        return a;
    }

    add(...vs) {
        return vs.reduce( (a,b) => ({ x: a.x+b.x, y: a.y+b.y, z: a.z+b.z }) )
        // return {
        //     x: a.x + b.x,
        //     y: a.y + b.y,
        //     z: a.z + b.z
        // }

    }

    sub(a,b) {
        return this.add(a,this.scale(-1,b));
    }

    scale(s, a) {
        return { x: a.x*s, y: a.y*s, z: a.z*s }
    }
};