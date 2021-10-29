export  let kernelMarchingRays = function(calcLight, rayMaxSteps, rayMinDist, Ex,Ey,Ez, P1Mx, P1My, P1Mz, QXx, QXy, QXz, QYx, QYy,QYz, Lx, Ly, Lz) {
    let i = this.thread.x;
    let j = this.thread.y;
    let rx = P1Mx + QXx*(i-1) + QYx*(j-1);
    let ry = P1My + QXy*(i-1) + QYy*(j-1);
    let rz = P1Mz + QXz*(i-1) + QYz*(j-1);

    let sr = 1/Math.sqrt(rx*rx + ry*ry + rz*rz);
    let rnx = rx*sr;
    let rny = ry*sr;
    let rnz = rz*sr;

    let totalDistance = 0.0;
    let MaximumRaySteps= rayMaxSteps; //255;
    let MinimumDistance= rayMinDist; //0.0001;
    let stepsVal = 0;
    let ppx = 0;
    let ppy = 0;
    let ppz = 0;
    let distance = 0;
    let hit = 0;
    let dd= [0,0,0];
    let hitObjectId = 0; // 0 = no hit

    for (let steps=0 ; steps < MaximumRaySteps; steps++) {
        ppx = Ex + totalDistance * rnx;
        ppy = Ey + totalDistance * rny;
        ppz = Ez + totalDistance * rnz;

        dd = distScene(ppx,ppy,ppz);
        distance = dd[0]; // --- Distance estimator

        totalDistance += distance;
        if (distance < MinimumDistance) {
            stepsVal = steps;
            hit=1;
            hitObjectId = dd[2];
            break
        }
    }

    let iterFrac = dd[1];

    let color_r = 0;
    let color_g = 0;
    let color_b = 0;

    // --- calculate normals and light ---
    if(calcLight==1) {
        let eps = rayMinDist*10;
        if(eps>0.00015) { eps = 0.00015; }

        dd = distScene(ppx + eps, ppy, ppz);
        let nx = dd[0] - distance; // - distScene(ppx - eps, ppy, ppz);
        dd = distScene(ppx, ppy + eps, ppz);
        let ny = dd[0] - distance; // - distScene(ppx, ppy - eps, ppz);
        dd = distScene(ppx, ppy, ppz + eps);
        let nz = dd[0] - distance; // - distScene(ppx, ppy, ppz - eps);

        let sn = 1/Math.sqrt(nx*nx + ny*ny + nz*nz);
        nx = nx * sn;
        ny = ny * sn;
        nz = nz * sn;

        let lx = Lx - ppx;
        let ly = Lz - ppy;
        let lz = Lz - ppz;
        let sl = 1/Math.sqrt(lx*lx + ly*ly + lz*lz);
        lx *= sl;
        ly *= sl;
        lz *= sl;

        //let colBcg = hsv2rgb(0.6,1,0.2*(0.4+((i+j))/(1024)));
        //let colBcg = [j/4024,i/4024,0];
        let colBcg = [0,0,0];
        let light = lx * nx + ly*ny + lz*nz;
        light = (light+1)/2;
        //let col = hsv2rgb(((iterFrac*666)%100)/10, 1, light);
        let distLight = -10/Math.log2(rayMinDist);///totalDistance; //1.0/(Math.pow(totalDistance,5));
        //if(distLight>1) distLight=1;
        let col = hsv2rgb(
            (ppx+ppy+ppz),
            1,
            distLight*8*light*stepsVal/MaximumRaySteps
        );

        color_r = col[0];
        color_g = col[1];
        color_b = col[2];

        if(hitObjectId===0) {
            color_r = colBcg[0];
            color_g = colBcg[1];
            color_b = colBcg[2];
        }

        if(hitObjectId===1) {
            color_r = 0;
            color_g = 1*light;
            color_b = 0;
        }

        //color_r = Math.max(light,0) + hit*0.2;
        //color_g = light;
        //color_b = light;

    } else {
        let trace= 2*stepsVal/MaximumRaySteps;
        color_r = trace;
        color_g = trace;
        color_b = trace;
    }

    this.color(color_r, color_g, color_b ,1);
}

export function hsv2rgb(h,s,v) {
    //h = 3.1415*2*(h%360)/360;
    // h=3.1415*2*h/100; // 100 is from max number of function mandelbulb iterations

    let c = v*s;
    let k = (h%1)*6;
    let x = c*(1 - Math.abs(k%2-1));

    let r=0;
    let g=0;
    let b=0;

    if(k>=0 && k<=1) { r=c; g=x }
    if(k>1 && k<=2)  { r=x; g=c }
    if(k>2 && k<=3)  { g=c; b=x }
    if(k>3 && k<=4)  { g=x; b=c }
    if(k>4 && k<=5)  { r=x; b=c }
    if(k>5 && k<=6)  { r=c; b=x }

    let m = v-c;

    return [r+m,g+m,b+m];
}

// x,y,z - point on ray (marching)
export function distScene(x,y,z) {
    //let p = sdPlane(x,y,z, 0,1,0,1);
    let mm = mandelbulb(x,y,z);
    let m = mm[0];
    let letIter = mm[1];
    let dis = m; //Math.min(p,m);
    //let dis = Math.min(p,m);
    let objId = 1; // 1= plane
    if(dis===m) objId = 2; // 2= plane

    return [ dis, letIter, objId ] ;
}

export function sdPlane(px,py,pz, nx,ny,nz,nw) {
    return px*nx + py*ny + pz*nz + nw;
}

export function mandelbulb(px,py,pz) {
    let zx=px; let zy=py; let zz=pz;
    let dr = 1;
    let r = 0;
    let bailout = 2;
    let power = 8;
    let j=0;

    for (let i=0 ; i < this.constants.iterations; i++) {
        r = Math.sqrt(zx*zx + zy*zy + zz*zz);
        if (r>bailout) break;

        // convert to polar coordinates
        let theta = Math.acos(zz/r);
        let phi = Math.atan(zy,zx);

        dr =  Math.pow( r, power-1.0)*power*dr + 1.0;

        // scale and rotate the point
        let zzr = Math.pow( r,power);
        theta = theta*power;
        phi = phi*power;

        // convert back to cartesian coordinates
        zx = zzr * Math.sin(theta) * Math.cos(phi);
        zy = zzr * Math.sin(phi) * Math.sin(theta);
        zz = zzr * Math.cos(theta);
        zx+=px;
        zy+=py;
        zz+=pz;

        j++;
    }
    return [0.5*Math.log(r)*r/dr, j];
}