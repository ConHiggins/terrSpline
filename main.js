import * as THREE from 'three';
import { gsap } from "gsap";
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
        [new THREE.Vector3(-25.219469437801024, 242.8010850645163, 135.46805895904217),
        new THREE.Vector3(-53.56300074753207, 171.49711742836848, -14.495472686253045),
        new THREE.Vector3(-91.40118730204415, 176.4306956436485, -6.958271935582161),
        new THREE.Vector3(-156.77721707712354, 279.6077582779644, 215.06634327100545)],
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

// for(let i =0; i< 100; i++) {
//     const geometry = new THREE.SphereGeometry(1, 10, 10);
//     const mat =  new THREE.MeshStandardMaterial({color:0xffffff, side:THREE.DoubleSide});
//     const terr = new THREE.Mesh(geometry, mat);

//     terr.position.set(Math.random()*100,Math.random()*100,Math.random()*100);

//     scene.add(terr);
// }

const tl = new gsap.timeline({repeat:-1});
//tl.pause();
let camTarg = false;

points.forEach((p,i)=> {

    if(!camTarg) camTarg = {x:p.x,y:p.y,z:p.z};
    
    //const newPos = curve.getPointAt((i+1)/points.length)
    tl.to(camera.position, {x:p.x, y:p.y+2, z:p.z, duration:0.1, onStart:()=>{
        const nextP = points[i >= points.length-2?0:i+2];
        const nextNextP = points[i >= points.length-3?0:i+3];
        
        gsap.to(camTarg, {x:nextNextP.x, y:nextNextP.y+2, z:nextNextP.z, duration:0.1, ease:'none'})
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
    const g = new THREE.PlaneGeometry( hMap.image.width, hMap.image.height, 100, 100,);
    const mat =  new THREE.MeshStandardMaterial({color:0xffffff, map:hMap, displacementMap:hMap, displacementScale:100});
    const terr = new THREE.Mesh(g, mat);
    terr.position.set(-200,150,200,)
    terr.rotation.set(1.5,3,1.5);
    terrain = terr;
    scene.add(terr);
});

const ambLight = new THREE.AmbientLight(0xffffff,1);
scene.add(ambLight);

let ribbDR = 100;
function animate() {

    ribbDR++;
    ribbonGeom.setDrawRange(0,ribbDR)

    //if(terrain) terrain.rotation.y += 0.01
	renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );