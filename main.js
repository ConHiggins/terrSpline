import * as THREE from 'three';
import {gsap} from "gsap";
globalThis.GSAP = gsap;
import hMap from "./heightmap.png";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );


 

 camera.position.z = 100;
// camera.position.y = 200;

// camera.rotation.x = -10;
// camera.rotation.y = -10.5;

const curve = new THREE.CatmullRomCurve3(
        // [new THREE.Vector3(-25.219469437801024, 242.8010850645163, 135.46805895904217),
        // new THREE.Vector3(-53.56300074753207, 171.49711742836848, -14.495472686253045),
        // new THREE.Vector3(-91.40118730204415, 176.4306956436485, -6.958271935582161),
        // new THREE.Vector3(-156.77721707712354, 279.6077582779644, 215.06634327100545)],
        [new THREE.Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
          new THREE.Vector3(-495.18195695639054, 193.31396511741877, 59.95508622767104),
          new THREE.Vector3(-91.40118730204415, 185.68320027526232, -27.251235277094107),
          new THREE.Vector3(-184.02622870788628, 456.29196584269283, 56.940164428852334),
          new THREE.Vector3(-38.89065330307983, 324.5417505492295, 439.12586479256095),
          new THREE.Vector3(-265.73308195501477, 171.22197532682318, -28.52379411975558),
          new THREE.Vector3(-323.4657351725009, 236.46129853302375, -74.51353922169632),
          new THREE.Vector3(-399.8161949463873, 95.11692813297348, -259.92176619908884)],
        true,
        "chordal"
);

var pointsCount = 200;
var pointsCount1 = pointsCount + 1;
var points = curve.getPoints(pointsCount);

var pts = curve.getPoints(pointsCount);
var width = 2;
var widthSteps = 1;
let pts2 = curve.getPoints(pointsCount);
pts2.forEach(p => {
  p.z += width;
});
pts = pts.concat(pts2);

var ribbonGeom = new THREE.BufferGeometry().setFromPoints(pts);

var indices = [];
for (let iy = 0; iy < widthSteps; iy++) { // the idea taken from PlaneBufferGeometry
  for (let ix = 0; ix < pointsCount; ix++) {
    var a = ix + pointsCount1 * iy;
    var b = ix + pointsCount1 * (iy + 1);
    var c = (ix + 1) + pointsCount1 * (iy + 1);
    var d = (ix + 1) + pointsCount1 * iy;
    // faces
    indices.push(a, b, d);
    indices.push(b, c, d);
  }
}
ribbonGeom.setIndex(indices);
ribbonGeom.computeVertexNormals();
ribbonGeom.setDrawRange(0,100)

var ribbon = new THREE.Mesh(ribbonGeom, new THREE.MeshNormalMaterial({
  side: THREE.DoubleSide
}));
scene.add(ribbon);



var line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({
  color: "red",
  depthTest: false,
  side: THREE.DoubleSide
}));
scene.add(line);
 
const tl = new GSAP.timeline({repeat:-1});
//tl.pause();
let camTarg = false;

points.forEach((p,i)=> {

    if(!camTarg) camTarg = {x:p.x,y:p.y,z:p.z};
    
    //const newPos = curve.getPointAt((i+1)/points.length)
    tl.to(camera.position, {x:p.x, y:p.y+2, z:p.z, duration:0.1, onStart:()=>{
        const nextP = points[i >= points.length-2?0:i+2];
        const nextNextP = points[i >= points.length-3?1:i+3];
        
        GSAP.to(camTarg, {x:nextNextP.x, y:nextNextP.y+2, z:nextNextP.z, duration:0.1, ease:'none'})
        camera.lookAt(camTarg.x, camTarg.y, camTarg.z);
       
    }, onUpdate:()=>{
        const nextP = points[i >= points.length-2?0:i+2];
        const nextNextP = points[i >= points.length-3?0:i+3];
        camera.lookAt(camTarg.x, camTarg.y, camTarg.z)
    }, ease:'none'});
})

let terrain;
const tLoader = new THREE.TextureLoader();
tLoader.load(hMap, (hMap)=>{
    const s = new THREE.SphereGeometry(100, 50, 20, 0, Math.PI*2+0.1, 1, 1 )
    const g = new THREE.PlaneGeometry( hMap.image.width, hMap.image.height, 100, 400,);
    const c = new THREE.BoxGeometry(hMap.image.width*1.3,hMap.image.width*1.5,hMap.image.width*1.1,50,50,50);
    const mat =  new THREE.MeshStandardMaterial({color:0xffffff, map:hMap, displacementMap:hMap, displacementScale:100, side:THREE.DoubleSide});
    const terr = new THREE.Mesh(g, mat);
    const oTerr = new THREE.Mesh(s, mat);
    const cTerr = new THREE.Mesh(c, mat);

    const terrSides = [terr.clone(),terr.clone(),terr.clone(),terr.clone()];
    // terrSides.forEach((t,i) => {
    //   const j = i+1
    //   t.rotation.set(1.4,3,1.5);
    //   t.position.set(j*150,j*250,j*180)
    //   scene.add(t);
    // })
    oTerr.position.set(-150,120,-80,)
    terr.rotation.set(1.3,3.2,1.9);
    oTerr.position.set(-150,120,-80,)
    oTerr.rotation.set(3,3.2,1.9);
    terrain = oTerr;
    scene.add(terr);
    scene.add(oTerr);
    scene.add(cTerr);
});

const ambLight = new THREE.AmbientLight(0xaaeeff,1);
scene.add(ambLight);

const fog = new THREE.Fog(0x222255, 0, 700);
scene.fog = fog;

scene.background= new THREE.Color(0x222255);

let ribbDR = 100;
function animate() {

    ribbDR++;
    ribbonGeom.setDrawRange(0,ribbDR)

    //if(terrain) terrain.position.x += 1
	renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );