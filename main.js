import * as THREE from "three";
import { gsap } from "gsap";
globalThis.GSAP = gsap;
import heightmap from "./Assets/heightmap_2.png";
import maptex from "./Assets/heightmap_tex_2.png";
import { EffectComposer } from "./node_modules/three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "./node_modules/three/examples/jsm/postprocessing/RenderPass";
import { FilmPass } from "./node_modules/three/examples/jsm/postprocessing/FilmPass";
import { AfterimagePass } from "./node_modules/three/examples/jsm/postprocessing/AfterimagePass";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

camera.position.z = 100;
// camera.position.y = 200;

// camera.rotation.x = -10;
// camera.rotation.y = -10.5;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
renderPass.renderToScreen = true;

const filmPass = new FilmPass(1, true);
composer.addPass(filmPass);

const afterImage = new AfterimagePass(0.7);
composer.addPass(afterImage);

scene.fog = new THREE.Fog(0x332277, 150, 250);
scene.background = new THREE.Color(0x332277);

const MAIN_TL = new GSAP.timeline({ repeat: -1 });

//MAIN_TL.pause();

let camTarg = { x: 0, y: 0, z: 0 };
MAIN_TL.to(camTarg, {
    x: 200,
    y: -120,
    z: 200,
    duration: 7,
    ease: "power4.inOut",
    onStart: () => {
        camera.position.set(0, 50, 0);
    },
    onUpdate: () => {
        camera.position.set(camTarg.x - 10, camera.position.y + (camTarg.y - camera.position.y) * 0.1, camTarg.z - 10);
        camera.lookAt(camTarg.x, camTarg.y, camTarg.z);
    },
    onComplete: () => {
        camTarg = { x: 0, y: 0, z: 0 };
        //camera.position.set(camTarg.x + 10, camTarg.y, camTarg.z + 10);
    },
});
MAIN_TL.to(camTarg, {
    x: -100,
    z: -100,
    duration: 5,
    ease: "none",
    onStart: () => {
        camTarg = { x: 0, y: -150, z: 0 };
        camera.position.set(camTarg.x + 10, camTarg.y + 120, camTarg.z + 10);
        camera.lookAt(camTarg.x, camTarg.y, camTarg.z);
    },
    onUpdate: () => {
        camera.position.set(camTarg.x + 10, camTarg.y + 120, camTarg.z + 10);
        camera.lookAt(camTarg.x, camTarg.y, camTarg.z);
    },
    onComplete: () => {
        camTarg = { x: 0, y: 0, z: 0 };
    },
});

const texLoader = new THREE.TextureLoader();
let o, z, terrain, bterrain, ribbonGeom;
const displacement = texLoader.load(heightmap, (heightmap) => {
    heightmap.repeat.set(1, 1);
    const texture = texLoader.load(maptex, (maptex) => {
        maptex.anisotropy = 16;
        const oG = new THREE.PlaneGeometry(maptex.image.width, maptex.image.height, 1500, 1500);
        const oM = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            map: heightmap,

            displacementMap: displacement,
            displacementScale: 35,
            displacementBias: 0,
            normalMap: texture,
            //normalScale: 0.1,
            lightMap: displacement,
            lightMapIntensity: 0.5,
        });
        const zG = new THREE.PlaneGeometry(maptex.image.width * 10, maptex.image.height * 10, 120, 120);
        const zM = new THREE.MeshStandardMaterial({
            color: 0x000000,

            displacementMap: displacement,
            displacementScale: 100,
            displacementBias: 0,
            normalMap: texture,
            //normalScale: 0.1,
            lightMap: displacement,
            lightMapIntensity: 0.5,
        });
        o = new THREE.Mesh(oG, oM);
        z = new THREE.Mesh(zG, zM);
        z.material.width = maptex.image.width * 100;
        z.material.height = maptex.image.height * 100;
        //o.material.map.minFilter = THREE.NearestFilter;
        scene.add(o);
        scene.add(z);
        o.rotation.set(4.65, 0, 0);
        o.position.set(0, -135, 0);
        z.rotation.set(4.65, 0, 0);
        z.position.set(0, -180, 0);
        const bG = new THREE.SphereGeometry(750, 16, 16, Math.PI / 2, Math.PI * 2, 0, Math.PI);
        const bM = new THREE.MeshStandardMaterial({
            color: 0x666666,
            side: THREE.DoubleSide,
            map: texture,

            displacementMap: displacement,
            displacementScale: 100,
        });
        b = new THREE.Mesh(bG, bM);
        //o.material.map.minFilter = THREE.NearestFilter;
        scene.add(b);
        b.rotation.set(1, 6, 0);
        b.position.set(0, -50, 0);
        terrain = o;
        bterrain = b;
        const curve = new THREE.CatmullRomCurve3(
            [
                new THREE.Vector3(105.53658600915125, -112.0875563254486, -46.30187821604742),
                new THREE.Vector3(38.541787168277516, -118.47313071358522, 32.39779655778614),
                new THREE.Vector3(-25.34364474371857, -100.79085851874208, -15.3559424113106),
                new THREE.Vector3(-129.38287681651283, -94.05147362537608, 120.96704795314453),
                new THREE.Vector3(-52.919798971896384, -91.87978743659392, 89.47095703156256),
                new THREE.Vector3(67.91291525700443, -105.58798592225462, 129.9484677729775),
                new THREE.Vector3(-132.0366318146835, -90.071112950911, -95.04756167803897),
            ],
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
        pts2.forEach((p) => {
            p.z += width;
        });
        pts = pts.concat(pts2);

        ribbonGeom = new THREE.BufferGeometry().setFromPoints(pts);

        var indices = [];
        for (let iy = 0; iy < widthSteps; iy++) {
            // the idea taken from PlaneBufferGeometry
            for (let ix = 0; ix < pointsCount; ix++) {
                var a = ix + pointsCount1 * iy;
                var b = ix + pointsCount1 * (iy + 1);
                var c = ix + 1 + pointsCount1 * (iy + 1);
                var d = ix + 1 + pointsCount1 * iy;
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        ribbonGeom.setIndex(indices);
        ribbonGeom.computeVertexNormals();
        ribbonGeom.setDrawRange(0, 100);

        var ribbon = new THREE.Mesh(
            ribbonGeom,
            new THREE.MeshNormalMaterial({
                side: THREE.DoubleSide,
            })
        );
        ribbon.position.set(500, 5000, 500);
        scene.add(ribbon);

        var line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
                color: "red",
                depthTest: false,
                side: THREE.DoubleSide,
            })
        );
        //scene.add(line);

        const tl = new GSAP.timeline({
            onStart: () => {
                terrain.rotation.z = 0;
            },
            onUpdate: () => {
                terrain.rotation.z -= 0.0021;
            },
        });
        //tl.pause();
        let camTarg = false;

        points.forEach((p, i) => {
            if (!camTarg) camTarg = { x: p.x, y: p.y, z: p.z };

            //const newPos = curve.getPointAt((i+1)/points.length)
            tl.to(camera.position, {
                x: p.x,
                y: p.y + 2,
                z: p.z,
                duration: 0.5,
                onStart: () => {
                    const nextP = points[i >= points.length - 2 ? 0 : i + 2];
                    const nextNextP = points[i >= points.length - 3 ? 1 : i + 3];

                    GSAP.to(camTarg, { x: nextNextP.x, y: nextNextP.y + 2, z: nextNextP.z, duration: 0.5, ease: "none" });
                    camera.lookAt(camTarg.x, camTarg.y, camTarg.z);
                },
                onUpdate: () => {
                    ribbDR++;
                    if (ribbonGeom) ribbonGeom.setDrawRange(0, ribbDR);
                    const nextP = points[i >= points.length - 2 ? 0 : i + 2];
                    const nextNextP = points[i >= points.length - 3 ? 0 : i + 3];
                    camera.lookAt(camTarg.x, camTarg.y, camTarg.z);
                },
                ease: "none",
            });
        });
        MAIN_TL.add(tl);
    });
});

const ambLight = new THREE.AmbientLight(0x88aaff, 0.5);
ambLight.position.set(0, 10, 10);

const plight = new THREE.PointLight(0xffaa22, 0.5, 100, 1.0);
plight.position.set(camera.position.x, camera.position.y, camera.position.z);
scene.add(ambLight);
scene.add(plight);

//const fog = new THREE.Fog(0x222255, 0, 700);
scene.fog = new THREE.Fog(0x332277, 150, 1000);
scene.background = new THREE.Color(0x112233);

camera.rotation.set(0, 0, 0);

let ribbDR = 500;
function animate() {
    if (bterrain) {
        //camera.position.set(bterrain.position.x, bterrain.position.y, bterrain.position.z);
        //bterrain.rotation.z -= 0.001;
    }
    //renderer.render(scene, camera);
    composer.render();
}
renderer.setAnimationLoop(animate);
