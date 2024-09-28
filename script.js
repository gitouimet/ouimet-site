// scene, camera, and renderer
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1b1b1b, 0.002);  

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });
renderer.setSize(window.innerWidth * 0.85, window.innerHeight * 0.85);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x1b1b1b);  

// size adjustment when window size changes
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth * 0.85, window.innerHeight * 0.85);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

//  lights
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(100, 100, 100);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);  // Soft light
scene.add(ambientLight);

//  snowy terrain
const terrainGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
const terrainMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

const positionAttribute = terrainGeometry.attributes.position;
for (let i = 0; i < positionAttribute.count; i++) {
    const z = Math.random() * 10 - 5;  
    positionAttribute.setZ(i, z);
}
positionAttribute.needsUpdate = true;

const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
scene.add(terrain);

//  snow particles
const snowGeometry = new THREE.BufferGeometry();
const snowCount = 5000;
const snowPositions = new Float32Array(snowCount * 3);

for (let i = 0; i < snowCount * 3; i++) {
    snowPositions[i] = (Math.random() - 0.5) * 1000;
    if (i % 3 === 1) {
        snowPositions[i] = Math.random() * 1000 - 500;  
    }
}

snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

const snowMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: Math.random() * 1.5 + 0.5,  
    transparent: true,
    opacity: 0.9
});

const snow = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snow);

camera.position.set(0, 50, 200);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// loop for falling snow effect
function animate() {
    requestAnimationFrame(animate);

    // snow particles fall and apply wind
    const positions = snow.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 1;  
        positions[i - 1] += (Math.random() - 0.5) * 0.2;  

        // Reset snow to top
        if (positions[i] < -500) {
            positions[i] = 500;
        }
    }
    snow.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}
animate();

// name animation
const nameOverlay = document.getElementById('name-overlay');
const buttons = document.getElementById('buttons');
const content = document.getElementById('content');
const skipBtn = document.getElementById('skip-btn'); 
const projectBlurbs = document.getElementById('project-blurbs'); 

window.onload = () => {
    gsap.to(nameOverlay, { opacity: 1, fontSize: "5rem", duration: 2, onComplete: shrinkAndMove });
    document.getElementById('loading-spinner').style.display = 'none'; 
};

function shrinkAndMove() {
    gsap.to(nameOverlay, { duration: 1, onComplete: () => {
        nameOverlay.style.top = '10px';
        nameOverlay.style.left = '10px';
        nameOverlay.style.transform = 'translate(0, 0)';
        gsap.to(nameOverlay, { fontSize: '3rem', duration: 0.5 });
        showButtons();
    }});
}

function showButtons() {
    buttons.style.display = 'flex';
    gsap.to(buttons, { opacity: 1, duration: 1 });
}

// new text with callback
function typeText(text, element, callback) {
    element.classList.remove('hidden');  
    element.textContent = ''; 
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            element.textContent += text.charAt(i);  
            i++;
            setTimeout(typeWriter, 50); 
        } else if (callback) {
            callback();  
        }
    }

    typeWriter();
}

let typingInProgress = false;  

function showTextSequence() {
    const textSequence = [
        "Hello.",
        "Welcome to my little corner of the internet.",
        "What began as as a silly little thing has now become my passion project.",
        "This is always a work in-progress,",
        "So I hope you come back once in a while to see the changes.",
        "My name is Nicholas, and I am an aspiring Web Developer.",
        "Feel free to email me at ouimetn98@gmail.com for any questions, or if you want to hire me.",
        "Enjoy your stay."
    ];

    let currentIndex = 0;
    typingInProgress = true;  
    skipBtn.classList.remove('hidden');  

    function displayNextText() {
        if (currentIndex < textSequence.length && typingInProgress) {
            const currentText = textSequence[currentIndex];

            typeText(currentText, content, () => {
                const displayTime = Math.max(3000, currentText.length * 100);  // Calculate time based on string length

                gsap.to(content, { opacity: 1, duration: 1, onComplete: () => {
                    gsap.to(content, { opacity: 0, delay: displayTime / 1000, duration: 1, onComplete: () => {
                        currentIndex++;
                        displayNextText();  
                    }});
                }});
            });
        } else {
            // end sequence
            typingInProgress = false;
            skipBtn.classList.add('hidden');  
            gsap.to(content, { opacity: 1, duration: 0.5 }); 
            gsap.to([nameOverlay, buttons], { opacity: 1, duration: 1 });  // Restore the name and nav bar
        }
    }

    displayNextText();  
}


skipBtn.addEventListener('click', () => {
    typingInProgress = false;  
    gsap.killTweensOf(content);  
    content.textContent = '';  
    gsap.to([nameOverlay, buttons], { opacity: 1, duration: 0.5 }); 
    skipBtn.classList.add('hidden');  
});


document.getElementById('about-btn').addEventListener('click', () => {
    gsap.to([nameOverlay, buttons], { opacity: 0, duration: 0.5, onComplete: showTextSequence });
});


document.getElementById('projects-btn').addEventListener('click', () => {
    if (projectBlurbs.classList.contains('show')) {
        gsap.to(projectBlurbs, { opacity: 0, duration: 0.5, onComplete: () => {
            projectBlurbs.classList.remove('show');
        }});
    } else {
        projectBlurbs.classList.add('show');
        gsap.to(projectBlurbs, { opacity: 1, duration: 0.5 });
    }
});


document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const targetId = event.target.id.replace('-btn', '-section');
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
    });
});


document.getElementById('contact-btn').addEventListener('click', () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection.classList.contains('show')) {
        gsap.to(contactSection, { opacity: 0, duration: 0.5, onComplete: () => {
            contactSection.classList.remove('show');
            contactSection.classList.add('hidden');
        }});
    } else {
        contactSection.classList.remove('hidden');
        contactSection.classList.add('show');
        gsap.to(contactSection, { opacity: 1, duration: 0.5 });
    }
});

document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();  
    alert('Message sent!');  
});