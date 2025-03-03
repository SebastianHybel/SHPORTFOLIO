import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Tween, Group, Easing } from '@tweenjs/tween.js';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const initialCameraPosition = { x: -1.1, y: 1.4, z: 2.3 };
const initialCameraRotation = { x: 0, y: 0, z: 0 }; 
camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z);
camera.rotation.set(initialCameraRotation.x, initialCameraRotation.y, initialCameraRotation.z);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// FLOOR
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: .3, metalness: 0 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

// LIGHT
const directionalLight = new THREE.DirectionalLight(0xffffff, .9);
directionalLight.position.set(0, 0, 0);
scene.add(directionalLight);

// SCENE LIGHTS
const sunLight = new THREE.DirectionalLight(0x435c72, 0.08);
sunLight.position.set(-3, 0, -3);
scene.add(sunLight);

const fillLight = new THREE.PointLight(0x88b2d9, 2.7, 4, 3);
fillLight.position.set(3, 3, 1.8);
scene.add(fillLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// TWEEN GROUP
const tweenGroup = new Group();

// MODEL
const loader = new GLTFLoader();
loader.load(
    '/assets/model/apeWithSkull.glb',
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        model.rotation.set(0, -.5, 0);
    },
    undefined, (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);

// MOUSELIGHT
window.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    directionalLight.position.set(x * 5, y * 5, 2);
});

// TITLE
const title = document.createElement('div');
title.innerText = 'Sebastian Hybel';
title.classList.add('title');
document.body.appendChild(title);

// TOGGLES
document.addEventListener("DOMContentLoaded", function () {
    const menuItems = [
        { 
            id: "about", 
            title: "What I've been working on", 
            content: "Content about me...", 
            zoom: { x: -2, y: 1.5, z: 3 }, 
            rotation: { x: 0.1, y: 0.2, z: 0 } 
        },
        { 
            id: "cv", 
            title: "CV", 
            content: "CV details...", 
            zoom: { x: -1, y: 1.1, z: 2 }, 
            rotation: { x: 0, y: 0.5, z: 0 } 
        },
        { 
            id: "contact", 
            title: "Contact", 
            content: "Contact details...", 
            zoom: { x: -0.5, y: 1.2, z: 1.5 }, 
            rotation: { x: -0.2, y: 0.3, z: 0 }
        }
    ];

    // Create menu container
    const menu = document.createElement("div");
    menu.id = "menu";
    document.body.appendChild(menu);

    // Generate menu items
    menuItems.forEach((item) => {
        const toggle = document.createElement("div");
        toggle.classList.add("toggle");
        toggle.dataset.toggle = item.id;

        const headline = document.createElement("div");
        headline.classList.add("toggle-headline");
        headline.innerText = item.title;

        const closeButton = document.createElement("span");
        closeButton.classList.add("close-btn");
        closeButton.innerText = "x";

        const content = document.createElement("div");
        content.classList.add("toggle-content");
        content.innerText = item.content;

        headline.appendChild(closeButton);
        toggle.appendChild(headline);
        toggle.appendChild(content);
        menu.appendChild(toggle);

        // Click event to open/close toggle
        headline.addEventListener("click", () => {
            const isOpen = toggle.classList.contains("open");

            // Hide all toggles
            document.querySelectorAll(".toggle").forEach((t) => {
                t.classList.remove("open");
                t.style.display = "none"; 
            });

            if (!isOpen) {
                toggle.style.display = "block";
                toggle.classList.add("open");
                toggle.style.transform = "translateY(-100%)";
                animateCamera(item.zoom, item.rotation);
            } else {
                resetMenu();
                animateCamera(initialCameraPosition, initialCameraRotation);
            }
        });

        // Close button event
        closeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            resetMenu();
            animateCamera(initialCameraPosition, initialCameraRotation);
        });

        function resetMenu() {
            document.querySelectorAll(".toggle").forEach((t) => {
                t.classList.remove("open");
                t.style.display = "block"; 
                t.style.transform = "translateY(0)"; 
            });
        }
    });

    function animateCamera(targetPosition, targetRotation) {
        const positionTween = new Tween(camera.position)
            .to(targetPosition, 1000)
            .easing(Easing.Quadratic.InOut)
            .start();

        const rotationTween = new Tween({
            x: camera.rotation.x,
            y: camera.rotation.y,
            z: camera.rotation.z
        })
            .to(targetRotation, 1000)
            .easing(Easing.Quadratic.InOut)
            .onUpdate(({ x, y, z }) => {
                camera.rotation.set(x, y, z);
            })
            .start();

        tweenGroup.add(positionTween);
        tweenGroup.add(rotationTween);
    }
});

// WINDOW RESIZE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ANIMATION LOOP
function animate(time) {
    requestAnimationFrame(animate);
    tweenGroup.update(time);
    renderer.render(scene, camera);
}
animate();