import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// ==========================================
// 1. SETUP SCENA
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000814); // Notte piu scura
scene.fog = new THREE.FogExp2(0x000814, 0.012);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    precision: 'highp',
    powerPreference: 'high-performance',
    alpha: false,
    stencil: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Leggera riduzione qualità per performance
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.sortObjects = true; // Abilita renderOrder
const clock = new THREE.Clock();

// ⭐ IMPORTANTE: Nascondi il canvas finché la landing page p5 non finisce
renderer.domElement.style.display = 'none';
renderer.domElement.id = 'threejs-canvas';

document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-0.5, 2, 1);
camera.lookAt(-0.5, 4.5, 50);

// ==========================================
// 2. LUCI
// ==========================================
// Luce ambientale più neutra
const ambientLight = new THREE.AmbientLight(0xffffff, 0.18); 
scene.add(ambientLight);

// Luce direzionale principale molto forte
const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(-35, 25, -30);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.far = 100;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.bias = -0.0003;
dirLight.shadow.normalBias = 0.02;
dirLight.shadow.darkness = 0.2;
scene.add(dirLight);

// Luce direzionale calda per contrasto
const dirLight2 = new THREE.DirectionalLight(0xff9966, 0.7);
dirLight2.position.set(-45, 15, -40);
dirLight2.castShadow = false;
scene.add(dirLight2);

// Luce blu fredda aggiuntiva - ridotta
const dirLight3 = new THREE.DirectionalLight(0x6699ff, 0.25);
dirLight3.position.set(-30, 8, -30);
dirLight3.castShadow = false;
scene.add(dirLight3);

// Point light aggiuntiva per illuminazione locale forte
const pointLight = new THREE.PointLight(0xffffff, 1.6, 28);
pointLight.position.set(-10, 12, -10);
pointLight.castShadow = false;
scene.add(pointLight);

// ========== SPOTLIGHT 1 ==========
const spotlight1 = new THREE.SpotLight(0xffffff, 6.5, 40, Math.PI / 3, 0.5, 1);
spotlight1.position.set(-4.5, 13.5, 4);
spotlight1.target.position.set(-5, 0, -5);
spotlight1.castShadow = true;
spotlight1.shadow.mapSize.width = 1024;
spotlight1.shadow.mapSize.height = 1024;
spotlight1.shadow.bias = -0.0002;
spotlight1.shadow.normalBias = 0.02;
scene.add(spotlight1);
scene.add(spotlight1.target);

// ========== SPOTLIGHT 2 ==========
const spotlight2 = new THREE.SpotLight(0xffffff, 6.5, 40, Math.PI / 3, 0.5, 1);
spotlight2.position.set(-5.5, 11.5, -11);
spotlight2.target.position.set(-15, 0, -15);
spotlight2.castShadow = true;
spotlight2.shadow.mapSize.width = 1024;
spotlight2.shadow.mapSize.height = 1024;
spotlight2.shadow.bias = -0.0002;
spotlight2.shadow.normalBias = 0.02;
scene.add(spotlight2);
scene.add(spotlight2.target);

// Lampade interne (punti luce caldi con piccolo bulbo visibile)
const lampPositions = [
    new THREE.Vector3(-0.5, 7, 16),
    new THREE.Vector3(10, 5.5, 7),
    new THREE.Vector3(9.5, 5.5, 21),
    new THREE.Vector3(-8, 5.5, 18),
    new THREE.Vector3(-8, 5.5, 10),
    new THREE.Vector3(5, 5.5, 35)
];

lampPositions.forEach((pos) => {
    const lampLight = new THREE.SpotLight(0xffd2a6, 11.4, 56, Math.PI / 4, 0.3, 1.2);
    lampLight.position.copy(pos);
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.width = 512;
    lampLight.shadow.mapSize.height = 512;
    lampLight.shadow.bias = -0.0002;
    lampLight.shadow.normalBias = 0.02;
    scene.add(lampLight);

    const lampTarget = new THREE.Object3D();
    lampTarget.position.copy(pos).add(new THREE.Vector3(0, -5, 0));
    scene.add(lampTarget);
    lampLight.target = lampTarget;

});

// ==========================================
// 3. IL PERCORSO (BINARIO)
// ==========================================
const pathPoints = [
    new THREE.Vector3(-0.5, 2, 1),   // Punto 0 - START
    new THREE.Vector3(-0.5, 2, 16),   // Punto 1 - punto minimo per la curva
    new THREE.Vector3(7, 2, 15),   // Punto 2 - uguale al punto 1
    new THREE.Vector3(10, 2, 10),   // Punto 3 - uguale al punto 2
    new THREE.Vector3(10, 2, 7),   // Punto 4 - uguale al punto 3
    new THREE.Vector3(5, 2, 6.5),   // Punto 5 - uguale al punto 4
    new THREE.Vector3(7, 2, 20),   // Punto 6 - uguale al punto 5
    new THREE.Vector3(9.5, 2, 21),   // Punto 7 - uguale al punto 6
    new THREE.Vector3(9, 2, 23),   // Punto 8 - uguale al punto 7
    new THREE.Vector3(6, 2, 16.5),   // Punto 9 - uguale al punto 8
    new THREE.Vector3(-8, 2, 18),   // Punto 10 - uguale al punto 9
    new THREE.Vector3(-6.7, 2, 19.3),   // Punto 11 - uguale al punto 10
    new THREE.Vector3(-11, 2, 22),   // Punto 12 - uguale al punto 11
    new THREE.Vector3(-8, 2, 10),   // Punto 13 - uguale al punto 12
    new THREE.Vector3(-10, 2, 9.5),   // Punto 14 - uguale al punto 13
    new THREE.Vector3(-2, 2, 20),   // Punto 15 - uguale al punto 14
    new THREE.Vector3(-1.5, 2, 33),   // Punto 16 - uguale al punto 15
    new THREE.Vector3(5, 2, 35)   // Punto 17 - uguale al punto 16
];

const cameraPath = new THREE.CatmullRomCurve3(pathPoints);

// Linea Rossa Debug (Commentala alla fine)
// const points = cameraPath.getPoints(50);
// const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
// const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
// const pathLine = new THREE.Line(lineGeo, lineMat);
// scene.add(pathLine);

// ==========================================
// 4. CONTROLLO (SENZA GUI)
// ==========================================
let manualControl = false; // Flag per controllo manuale - FALSE per permettere scroll

const cameraControls = {
    controlloManuale: false,
    x: -0.5,
    y: 2,
    z: 1,
    lookX: -0.5,
    lookY: 4.5,
    lookZ: 50
};

const spotlight1Controls = {
    x: -5,
    y: 20,
    z: -5,
    intensity: 3,
    distance: 100,
    angle: Math.PI / 6
};

const spotlight2Controls = {
    x: -15,
    y: 20,
    z: -15,
    intensity: 3,
    distance: 100,
    angle: Math.PI / 6
};

// ==========================================
let manicomioModel = null;
let muraModel = null;
let cassettoObj = null;
let cassettoHelper = null;
let cassettoAperto = false;
let valigiaObj = null;
let valigiaHelper = null;
let valigiaAperta = false;
let mixer = null;
let cassettoAnimation = null;
let allAnimations = []; // Array per tutte le animazioni del cassetto/fogli
let hoveredObject = null;
let originalMaterial = null;

// Variabili per i fogli
let currentPaperIndex = 0;
let isInPaperMode = false;

const cassettoPaperNames = ['folliacircolare1', 'folliacircolare2', 'folliacircolare3', 'folliacircolare4'];
const monomaniaPaperNames = ['monomaniaimpulsiva1', 'monomaniaimpulsiva2', 'monomaniaimpulsiva3', 'monomaniaimpulsiva4'];
const nevrasteniaPaperNames = ['nevrastenia1', 'nevrastenia2', 'nevrastenia3', 'nevrastenia4'];
const isteriaPaperNames = ['isteria1', 'isteria2', 'isteria3', 'isteria4'];
const megalomaniaPaperNames = ['megalomania1', 'megalomania2', 'megalomania3', 'megalomania4'];
const delirioPaperNames = ['delirio1', 'delirio2', 'delirio3', 'delirio4'];
const specimenPaperNames = ['specimen'];
const letteraincmpletaPaperNames = ['letteraincompleta'];

const paperSets = {
    cassetto: {
        names: cassettoPaperNames,
        objects: [],
        stack: [0, 1, 2, 3],
        basePositions: [],
        originalPositions: [],
        originalRotations: [],
        positionsSaved: false,
        closedPositions: [],
        closedRotations: [],
        restPositions: [],
        restRotations: [],
        lifted: false,
        animations: [],
        container: 'cassetto'
    },
    monomania: {
        names: monomaniaPaperNames,
        objects: [],
        stack: [0, 1, 2, 3],
        basePositions: [],
        originalPositions: [],
        originalRotations: [],
        positionsSaved: false,
        restPositions: [],
        restRotations: [],
        lifted: false,
        animations: []
    },
    nevrastenia: {
        names: nevrasteniaPaperNames,
        objects: [],
        stack: [0, 1, 2, 3],
        basePositions: [],
        originalPositions: [],
        originalRotations: [],
        positionsSaved: false,
        restPositions: [],
        restRotations: [],
        lifted: false,
        animations: []
    },
    isteria: {
        names: isteriaPaperNames,
        objects: [],
        stack: [0, 1, 2, 3],
        basePositions: [],
        originalPositions: [],
        originalRotations: [],
        positionsSaved: false,
        restPositions: [],
        restRotations: [],
        lifted: false,
        animations: []
    },
    megalomania: {
        names: megalomaniaPaperNames,
        objects: [],
        stack: [0, 1, 2, 3],
        basePositions: [],
        originalPositions: [],
        originalRotations: [],
        positionsSaved: false,
        restPositions: [],
        restRotations: [],
        lifted: false,
        animations: []
    },
    delirio: {
        names: delirioPaperNames,
        objects: [],
        stack: [0, 1, 2, 3],
        basePositions: [],
        originalPositions: [],
        originalRotations: [],
        positionsSaved: false,
        closedPositions: [],
        closedRotations: [],
        restPositions: [],
        restRotations: [],
        lifted: false,
        animations: [],
        container: 'valigia'
    },
    specimen: {
        names: specimenPaperNames,
        objects: [],
        stack: [0],
        basePositions: [],
        originalPositions: [],
        originalRotations: [],
        positionsSaved: false,
        restPositions: [],
        restRotations: [],
        lifted: false,
        animations: []
    },
    letteraincompleta: {
        names: letteraincmpletaPaperNames,
        objects: [],
        stack: [0],
        basePositions: [],
        originalPositions: [],
        originalRotations: [],
        positionsSaved: false,
        restPositions: [],
        restRotations: [],
        lifted: false,
        animations: []
    }
};

let activePaperSetKey = 'cassetto';
let activePaperSet = paperSets.cassetto;
let currentPaperObject = null; // Foglio attualmente visualizzato

// ==========================================
// 5. CARICAMENTO MODELLO
// ==========================================
const loader = new GLTFLoader();
const loadingScreen = document.getElementById('loading-screen');
const blackScreen = document.getElementById('black-screen');
const slide1 = document.getElementById('slide1');
const slide2 = document.getElementById('slide2');
const slide3 = document.getElementById('slide3');

// ========== LOGICA SEQUENZA INTRODUZIONE ==========
// NOTA: La landing page è ora gestita da p5.js (landing-sketch.js)
// Quando lo sketch finisce lo zoom animation, setta window.landingPageComplete = true
// Questo codice aspetta quel segnale per avviare il caricamento del gioco Three.js

let gameStarted = false;
let modelLoaded = false;
let introCompleted = false;
let canScroll = false;
let scrollUnlocked = false;

// Assicurati che le slide vecchie rimangono nascoste (gestite da HTML DOMContentLoaded)
blackScreen.classList.add('hidden');
slide1.classList.add('hidden');
slide2.classList.add('hidden');
slide3.classList.add('hidden');
loadingScreen.classList.add('hidden');

// Monitora quando la landing page p5 finisce il suo ciclo
const updateLandingPageState = () => {
    if (window.landingPageComplete && !introCompleted) {
        introCompleted = true;
        
        // ⭐ MOSTRA IL CANVAS DI THREE.JS
        const threeCanvas = document.getElementById('threejs-canvas');
        if (threeCanvas) {
            threeCanvas.style.display = 'block';
        }
        
        // Mostra la loading screen
        loadingScreen.classList.remove('hidden');
        
        // La loading screen rimane visibile per 5 secondi durante il caricamento del modello
        setTimeout(() => {
            if (modelLoaded) {
                // Se il modello è già caricato, nascondi subito la loading screen
                loadingScreen.classList.add('hidden');
                updateScrollAvailability();
            }
        }, 5000);
    }
};

// Controlla lo stato della landing page ogni frame
const checkLandingPageInterval = setInterval(updateLandingPageState, 100);

// NUOVO CODICE:
const githubZipUrl = 'https://github.com/giopolimi/frenocomio-dei-caratteri-alienati/releases/download/v1.0/manicomio.glb.zip';

// Determina l'URL del modello
let glbUrl;
let muraGlbUrl;

if (isLocalDevelopment()) {
    // Sviluppo locale: usa i file locali
    glbUrl = 'assets/manicomio.glb';
    muraGlbUrl = 'assets/mura.glb';
} else {
    // Produzione: prova prima Bunny CDN, se fallisce usa GitHub
    glbUrl = 'https://Tipocomio.b-cdn.net/manicomio.glb';
    muraGlbUrl = 'https://Tipocomio.b-cdn.net/mura.glb';
}

// Funzione per caricare il modello principale
async function loadMainModel() {
    try {
        // Se non siamo in locale e il file non è su Bunny CDN, scarica da GitHub
        if (!isLocalDevelopment()) {
            // Testa se Bunny CDN ha il file
            try {
                const testResponse = await fetch(glbUrl, { method: 'HEAD' });
                if (!testResponse.ok) {
                    throw new Error('File non trovato su Bunny CDN');
                }
            } catch (error) {
                console.log('📦 Caricamento da GitHub Releases...');
                // Carica da GitHub con barra di progresso
                glbUrl = await loadGLBFromZip(githubZipUrl, (percent, message) => {
                    // Aggiorna la schermata di caricamento
                    if (loadingScreen && loadingScreen.querySelector('.loading-text')) {
                        loadingScreen.querySelector('.loading-text').textContent = message;
                    }
                });
            }
        }

        // Carica il modello con GLTFLoader
        loader.load(glbUrl, 
            (gltf) => {
                manicomioModel = gltf.scene;
                manicomioModel.position.set(0, 0, 0);
                manicomioModel.scale.set(1.6, 1.6, 1.6);
                
                // ... TUTTO IL RESTO DEL CODICE RIMANE IDENTICO ...
                // (copia tutto il contenuto della funzione onLoad esistente)
                
                // Abilita le ombre per gli oggetti, disabilita su muri/pareti
                manicomioModel.traverse((child) => {
                    // [... tutto il codice traverse esistente ...]
                });
                
                // Carica le animazioni
                if (gltf.animations && gltf.animations.length > 0) {
                    // [... tutto il codice animazioni esistente ...]
                }
                
                scene.add(gltf.scene);
                modelLoaded = true;
                updateScrollAvailability();
            },
            (progress) => {
                // Progress callback
            },
            (error) => {
                loadingScreen.innerHTML = `<div style="color: red; font-size: 20px;">ERRORE: ${error.message}<br>URL: ${glbUrl}</div>`;
            }
        );
    } catch (error) {
        console.error('Errore nel caricamento del modello:', error);
        if (loadingScreen) {
            loadingScreen.innerHTML = `<div style="color: red; font-size: 20px;">ERRORE: ${error.message}</div>`;
        }
    }
}

// Avvia il caricamento
loadMainModel();

loader.load(muraGlbUrl,
    (gltf) => {
        muraModel = gltf.scene;
        muraModel.position.set(0, 0, 0);
        muraModel.scale.set(1.6, 1.6, 1.6);
        scene.add(muraModel);
    },
    (progress) => {
    },
    (error) => {
    }
);

// ==========================================
// 6. LOGICA GIOCO
// ==========================================
let scrollProgress = 0;
let scrollTarget = 0;
let isZoomedIn = false;

function updateScrollAvailability() {
    canScroll = modelLoaded && introCompleted;
    if (canScroll && !scrollUnlocked) {
        scrollUnlocked = true;
        scrollProgress = 0;
        scrollTarget = 0;
        
        // Nascondi la loading screen quando tutto è pronto
        loadingScreen.classList.add('hidden');
        
        // Smetti di controllare lo stato della landing page
        clearInterval(checkLandingPageInterval);
    }
}

// Scroll
window.addEventListener('wheel', (e) => {
    if (!canScroll || isZoomedIn) return;
    scrollTarget += e.deltaY * 0.0001875;
    scrollTarget = Math.max(0, Math.min(1, scrollTarget));
});

// Click
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('close-btn');

// Elementi per popup fogli
const fogliOverlay = document.getElementById('fogli-overlay');
const fogliClosBtn = document.getElementById('fogli-close-btn');
const fogliPrevBtn = document.getElementById('fogli-prev-btn');
const fogliNextBtn = document.getElementById('fogli-next-btn');
const fogliCounter = document.getElementById('fogli-counter');
const fogliPrompt = document.getElementById('fogli-prompt');
const fogliPromptTitle = fogliPrompt ? fogliPrompt.querySelector('.fogli-prompt-title') : null;
const defaultFogliPromptTitle = fogliPromptTitle ? fogliPromptTitle.textContent : '';

function showFogliPrompt(setKey) {
    if (!fogliPrompt) return;
    if (fogliPromptTitle) {
        const titleMap = {
            monomania: 'MONOMANIA',
            nevrastenia: 'NEVRASTENIA',
            isteria: 'ISTERIA',
            megalomania: 'MEGALOMANIA',
            delirio: 'DELIRIO',
            specimen: 'SPECIMEN',
            letteraincompleta: 'LETTERA'
        };
        fogliPromptTitle.textContent = titleMap[setKey] || defaultFogliPromptTitle;
    }
    fogliPrompt.classList.remove('hidden');
}

function hideFogliPrompt() {
    if (!fogliPrompt) return;
    fogliPrompt.classList.add('hidden');
}

function setActivePaperSet(setKey) {
    if (!paperSets[setKey]) return;
    activePaperSetKey = setKey;
    activePaperSet = paperSets[setKey];
    if (!Array.isArray(activePaperSet.stack) || activePaperSet.stack.length === 0) {
        activePaperSet.stack = [0, 1, 2, 3];
    }
}

function getPaperInfoFromObject(obj) {
    if (!obj) return null;
    if (obj.userData && obj.userData.isPaper) {
        return { setKey: obj.userData.paperSet, paper: obj };
    }
    if (obj.parent && obj.parent.userData && obj.parent.userData.isPaper) {
        return { setKey: obj.parent.userData.paperSet, paper: obj.parent };
    }

    const objName = (obj.name || '').toLowerCase();
    const parentName = (obj.parent && obj.parent.name ? obj.parent.name : '').toLowerCase();

    const patternMap = {
        monomania: ['monomania', 'impulsiv'],
        nevrastenia: ['nevrastenia', 'neurasthenia'],
        isteria: ['isteria', 'hysteria'],
        megalomania: ['megalomania', 'megaloman'],
        delirio: ['delirio', 'delirium'],
        cassetto: ['follia', 'circolare', 'scattered']
    };

    for (const [setKey, set] of Object.entries(paperSets)) {
        const patterns = patternMap[setKey] || [];
        const isExactMatch = set.names.some(name => {
            const n = name.toLowerCase();
            return objName.includes(n) || parentName.includes(n);
        });
        const isPatternMatch = patterns.some(pattern =>
            objName.includes(pattern) || parentName.includes(pattern)
        );
        if (isExactMatch || isPatternMatch) {
            const exact = set.objects.find(paperObj => paperObj && paperObj.name && (
                paperObj.name.toLowerCase() === objName || paperObj.name.toLowerCase() === parentName
            ));
            if (exact) {
                return { setKey, paper: exact };
            }

            const numberMatch = (obj.name || obj.parent?.name || '').match(/(\d+)/);
            if (numberMatch) {
                const idx = parseInt(numberMatch[1], 10) - 1;
                if (idx >= 0 && idx < 4 && set.objects[idx]) {
                    return { setKey, paper: set.objects[idx] };
                }
            }

            return { setKey, paper: obj };
        }
    }

    return null;
}

function liftPaperSet(setKey) {
    const set = paperSets[setKey];
    
    if (!set || set.lifted) {
        return;
    }

    // Salva le posizioni riposate (a terra) prima di animare
    set.objects.forEach((paper, index) => {
        if (!paper) return;
        if (!set.restPositions[index]) {
            set.restPositions[index] = paper.position.clone();
            set.restRotations[index] = paper.rotation.clone();
        }
    });

    // Riproduce le animazioni di Blender
    if (set.animations && set.animations.length > 0) {
        const liftSpeed = 3.5;
        set.animations.forEach((action, i) => {
            action.timeScale = liftSpeed;
            action.reset();
            action.enabled = true;
            action.paused = false;
            action.time = 0;
            action.play();
        });

        // Applica subito il primo frame per evitare delay percepiti
        if (mixer) {
            mixer.update(0);
        }
        
        // Setta lifted = true dopo che le animazioni sono partite (con un piccolo delay)
        setTimeout(() => {
            set.lifted = true;
            
            // Mostra il prompt per tutti i set
            showFogliPrompt(setKey);
        }, 100);
    } else {
        set.lifted = true;
    }
}

// Hover detection
window.addEventListener('mousemove', (event) => {
    if (isInPaperMode) return;
    if (isZoomedIn && !cassettoAperto && !valigiaAperta) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Ripristina l'oggetto precedentemente evidenziato
    if (hoveredObject && hoveredObject.material !== originalMaterial) {
        hoveredObject.material = originalMaterial;
        hoveredObject = null;
        originalMaterial = null;
    }

    document.body.style.cursor = 'default';

    // Hover immediato sui fogli quando sono lifted
    Object.entries(paperSets).forEach(([setKey, set]) => {
        if ((setKey === 'cassetto' && (cassettoAperto || set.lifted)) ||
            (setKey === 'delirio' && (valigiaAperta || set.lifted)) ||
            (setKey !== 'cassetto' && setKey !== 'delirio' && set.lifted)) {
            const paperHits = raycaster.intersectObjects(set.objects.filter(Boolean), true);
            if (paperHits.length > 0) {
                document.body.style.cursor = 'pointer';
                return;
            }
        }
    });

    // Controlla se stiamo passando sopra ai fogli (priorità) o ai contenitori
    if (intersects.length > 0) {
        for (let i = 0; i < intersects.length; i++) {
            const obj = intersects[i].object;
            const paperInfo = getPaperInfoFromObject(obj);
            if (paperInfo) {
                const { setKey } = paperInfo;
                // Permetti hover sui fogli se sono nelle condizioni giuste
                if (setKey === 'cassetto' && !cassettoAperto && !paperSets.cassetto.lifted) {
                    continue;
                }
                if (setKey === 'delirio' && !valigiaAperta && !paperSets.delirio.lifted) {
                    continue;
                }
                document.body.style.cursor = 'pointer';
                return;
            }
        }

        for (let i = 0; i < intersects.length; i++) {
            const obj = intersects[i].object;
            const isOnCassetto = obj.userData.isCassetto || (obj.parent && obj.parent.userData.isCassetto);
            const isOnValigia = obj.userData.isValigia || (obj.parent && obj.parent.userData.isValigia);

            if (isOnCassetto) {
                const target = obj.userData.isCassetto ? obj : obj;
                if (target.isMesh && target.material) {
                    hoveredObject = target;
                    originalMaterial = target.material;
                    // Crea materiale evidenziato
                    const highlightMaterial = originalMaterial.clone();
                    highlightMaterial.emissive = new THREE.Color(0x444444);
                    highlightMaterial.emissiveIntensity = 0.3;
                    target.material = highlightMaterial;
                    document.body.style.cursor = 'pointer';
                }
                break;
            }
            
            if (isOnValigia) {
                const target = obj.userData.isValigia ? obj : obj;
                if (target.isMesh && target.material) {
                    hoveredObject = target;
                    originalMaterial = target.material;
                    // Crea materiale evidenziato
                    const highlightMaterial = originalMaterial.clone();
                    highlightMaterial.emissive = new THREE.Color(0x444444);
                    highlightMaterial.emissiveIntensity = 0.3;
                    target.material = highlightMaterial;
                    document.body.style.cursor = 'pointer';
                }
                break;
            }
        }
    }
});

window.addEventListener('click', (event) => {
    // Se siamo in modalità fogli e si clicca il cassetto, esci dalla modalità fogli prima
    if (isInPaperMode && event.target !== fogliOverlay && !fogliOverlay.contains(event.target)) {
        // Non fa nulla qui, il cassetto verrà gestito sotto
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Controlla se il click è sul cassetto/valigia - se sì, permettilo anche se isZoomedIn
    let isClickingCassetto = false;
    let isClickingValigia = false;
    if (intersects.length > 0) {
        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.userData.isCassettoClickTarget || 
                (intersects[i].object.parent && intersects[i].object.parent.userData.isCassettoClickTarget)) {
                isClickingCassetto = true;
                break;
            }
            if (intersects[i].object.userData.isValigiaClickTarget || 
                (intersects[i].object.parent && intersects[i].object.parent.userData.isValigiaClickTarget) ||
                intersects[i].object.userData.isValigia ||
                (intersects[i].object.parent && intersects[i].object.parent.userData.isValigia)) {
                isClickingValigia = true;
                break;
            }
        }
    }

    // Blocca altri click se zoomed in, MA permetti cassetto e valigia
    if (isZoomedIn && !isInPaperMode && !isClickingCassetto && !isClickingValigia) return;
    if (isInPaperMode) return; // Se siamo in paper mode, ignora i click sulla 3D scene

    if (intersects.length > 0) {
        // Cerca nella lista di tutti gli oggetti intersecati
        for (let i = 0; i < intersects.length; i++) {
            const obj = intersects[i].object;
            // Check se è la lettera sul pavimento o la sua area cliccabile
            // CODICE RIMOSSO
            
            // --- CONTROLLO FOGLI PRIMA DI TUTTO (PRIORITÀ MASSIMA) ---
            // Solo se il cassetto è aperto e i fogli sono visibili
            const paperInfo = getPaperInfoFromObject(obj);
            if (paperInfo) {
                const { setKey, paper } = paperInfo;
                
                // Per i fogli del cassetto: devono essere lifted O il cassetto deve essere aperto
                if (setKey === 'cassetto' && !cassettoAperto && !paperSets.cassetto.lifted) {
                    continue;
                }
                
                // Per i fogli della valigia: devono essere lifted O la valigia deve essere aperta
                if (setKey === 'delirio' && !valigiaAperta && !paperSets.delirio.lifted) {
                    continue;
                }

                // Se i fogli non sono ancora sollevati, sollevali e basta
                // (NON per cassetto/valigia - si aprono con toggle)
                if (setKey !== 'cassetto' && setKey !== 'delirio' && !paperSets[setKey].lifted) {
                    console.log(`📤 Sollevando i fogli di ${setKey}...`);
                    liftPaperSet(setKey);
                    return;
                }

                // Se sono già sollevati e non siamo in paper mode, entra in paper mode
                if (paperSets[setKey].lifted && !isInPaperMode) {
                    console.log(`🎯 Foglio cliccato (${setKey}) - Entrando in paper mode`);
                    setActivePaperSet(setKey);
                    zoomToPaper(paper, setKey);
                    return;
                }

                // Se siamo già in paper mode, cambia foglio
                if (isInPaperMode) {
                    console.log('🎯 Cambiando foglio...');
                    scrollToPaperNext();
                    return;
                }
                
                return;
            }
            
            // --- CONTROLLO CASSETTO ---
            if (obj.userData.isCassettoClickTarget || (obj.parent && obj.parent.userData.isCassettoClickTarget)) {
                const cassetto = obj.userData.isCassettoClickTarget ? obj : obj.parent;
                console.log('🗄️ Cassetto cliccato');
                toggleCassetto(cassetto);
                return;
            }
            
            // --- CONTROLLO VALIGIA ---
            if (obj.userData.isValigiaClickTarget || (obj.parent && obj.parent.userData.isValigiaClickTarget) ||
                obj.userData.isValigia || (obj.parent && obj.parent.userData.isValigia)) {
                const valigia = obj.userData.isValigia ? obj : (obj.userData.isValigiaClickTarget ? obj : obj.parent);
                console.log('💼 Valigia cliccata');
                toggleValigia(valigia);
                return;
            }
            
            // --- CONTROLLO NOME OGGETTO ---
            if (obj.name.includes("Lettera") || obj.name.includes("Foglio")) {
                zoomToItem(obj);
                return;
            }
        }
    }
});

function zoomToItem(targetObj) {
    isZoomedIn = true;
    const targetPos = new THREE.Vector3();
    targetObj.getWorldPosition(targetPos);

    gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y + 0.8,
        z: targetPos.z + 0.5,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(targetPos),
        onComplete: () => overlay.classList.remove('hidden')
    });
}

function savePaperPositions(setKey = activePaperSetKey) {
    const set = paperSets[setKey];
    if (!set) return;

    // Salva le posizioni e rotazioni world dei fogli
    set.objects.forEach((paper, index) => {
        if (paper) {
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            const worldScale = new THREE.Vector3();
            paper.matrixWorld.decompose(worldPos, worldQuat, worldScale);
            
            const euler = new THREE.Euler();
            euler.setFromQuaternion(worldQuat);
            
            set.originalPositions[index] = worldPos.clone();
            set.originalRotations[index] = euler.clone();
        }
    });
    set.positionsSaved = true;
}

function restorePaperTransforms(setKey = activePaperSetKey) {
    const set = paperSets[setKey];
    if (!set) return;

    // Nascondi il prompt
    hideFogliPrompt();

    // Ferma tutte le animazioni per questo set
    if (set.animations && set.animations.length > 0) {
        set.animations.forEach(action => {
            action.stop();
        });
    }

    if (setKey === 'cassetto' || setKey === 'delirio') {
        set.objects.forEach((paper, index) => {
            if (!paper) return;
            const localPos = set.closedPositions[index];
            const localRot = set.closedRotations[index];
            if (!localPos || !localRot) return;

            paper.position.copy(localPos);
            paper.rotation.copy(localRot);
            paper.visible = true;
        });
    } else {
        set.objects.forEach((paper, index) => {
            if (!paper) return;
            const localPos = set.restPositions[index];
            const localRot = set.restRotations[index];
            if (!localPos || !localRot) return;

            paper.position.copy(localPos);
            paper.rotation.copy(localRot);
            paper.visible = true;
        });
        set.lifted = false;
    }

    set.stack = [0, 1, 2, 3];
    currentPaperIndex = 0;
    currentPaperObject = set.objects[0] || null;
}

function zoomToPaper(targetObj, setKey = activePaperSetKey) {
    const set = paperSets[setKey];
    if (!set) return;

    setActivePaperSet(setKey);

    if (!set.positionsSaved) {
        savePaperPositions(setKey);
    }
    
    // Nascondi il prompt quando entri in paper mode
    hideFogliPrompt();
    
    isZoomedIn = true;
    isInPaperMode = true;
    currentPaperObject = targetObj;
    
    // Salva le 4 posizioni base la prima volta che entra in paper mode
    if (set.basePositions.length === 0) {
        set.objects.forEach((paper, index) => {
            if (paper) {
                const pos = new THREE.Vector3();
                paper.getWorldPosition(pos);
                set.basePositions[index] = pos.clone();
            }
        });
        console.log('✅ Posizioni base dei fogli salvate');
    }
    
    // Mostra il fogli-overlay subito (non aspettare la fine dell'animazione)
    fogliOverlay.classList.remove('hidden');
    
    // Nascondi i bottoni di navigazione per i fogli singoli (specimen, letteraincompleta)
    if (setKey === 'specimen' || setKey === 'letteraincompleta') {
        if (fogliPrevBtn) fogliPrevBtn.style.display = 'none';
        if (fogliNextBtn) fogliNextBtn.style.display = 'none';
    } else {
        if (fogliPrevBtn) fogliPrevBtn.style.display = '';
        if (fogliNextBtn) fogliNextBtn.style.display = '';
    }
    
    // Assicurati che TUTTI i fogli siano visibili
    set.objects.forEach((paper) => {
        if (paper) {
            paper.visible = true;
        }
    });
    
    // Trova l'indice del paper cliccato
    if (targetObj.userData.paperIndex !== undefined) {
        currentPaperIndex = targetObj.userData.paperIndex;
    } else {
        currentPaperIndex = 0;
    }
    
    const targetPos = new THREE.Vector3();
    targetObj.getWorldPosition(targetPos);

    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    const baseDistance = -0.85;
    const distance = (setKey === 'delirio' || setKey === 'megalomania' || setKey === 'isteria')
        ? baseDistance * 0.75
        : baseDistance;
    const cameraTargetPos = targetPos.clone().add(cameraDir.multiplyScalar(distance));
    
    // Abbassa leggermente la camera per isteria
    if (setKey === 'isteria') {
        cameraTargetPos.y -= 0.15;
    }

    gsap.to(camera.position, {
        x: cameraTargetPos.x,
        y: cameraTargetPos.y,
        z: cameraTargetPos.z,
        duration: 0.6,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(targetPos),
        onComplete: () => {
            if (setKey === 'isteria') {
                // Inclina leggermente in avanti la camera (effetto altalena)
                const quaternion = new THREE.Quaternion();
                quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(8));
                camera.quaternion.multiply(quaternion);
            }
        }
    });
}

function toggleCassetto(cassetto) {
    if (!cassettoAnimation || allAnimations.length === 0) {
        return;
    }
    
    cassettoAperto = !cassettoAperto;
    
    if (cassettoAperto) {
        setActivePaperSet('cassetto');
        const openSpeed = 3.5;
        const animationDuration = cassettoAnimation.getClip().duration / openSpeed;
        
        // Riproduci solo le animazioni associate al cassetto
        if (paperSets.cassetto.animations && paperSets.cassetto.animations.length > 0) {
            paperSets.cassetto.animations.forEach(action => {
                action.timeScale = openSpeed;
                action.reset();
                action.play();
            });
        }
        
        // Salva le posizioni dei fogli dopo che l'animazione è completata
        setTimeout(() => {
            if (!paperSets.cassetto.positionsSaved) {
                savePaperPositions('cassetto');
            }
            // Imposta lifted = true e mostra il prompt
            paperSets.cassetto.lifted = true;
            showFogliPrompt('cassetto');
        }, 500);
    } else {
        // Se siamo in modalità fogli, chiudi il popup e riporta il foglio indietro
        if (isInPaperMode) {
            fogliOverlay.classList.add('hidden');
            restorePaperTransforms('cassetto');
            const curvePos = cameraPath.getPointAt(scrollProgress);
            const lookAtPos = cameraPath.getPointAt(Math.min(1, scrollProgress + 0.01));

            gsap.to(camera.position, {
                x: curvePos.x, y: curvePos.y, z: curvePos.z,
                duration: 0.8,
                ease: "power2.inOut",
                onUpdate: () => camera.lookAt(lookAtPos)
            });

            isZoomedIn = false;
            isInPaperMode = false;
            currentPaperObject = null;
        } else {
            // Se il cassetto si chiude ma non siamo in modalità fogli, ritorna alla posizione precedente sul percorso
            const curvePos = cameraPath.getPointAt(scrollProgress);
            const lookAtPos = cameraPath.getPointAt(Math.min(1, scrollProgress + 0.01));

            gsap.to(camera.position, {
                x: curvePos.x, y: curvePos.y, z: curvePos.z,
                duration: 0.7,
                ease: "power2.inOut",
                onUpdate: () => camera.lookAt(lookAtPos)
            });
            
            // Nascondi il prompt
            hideFogliPrompt();
        }
        
        // Chiudi il cassetto + rientra i fogli (play backward animazioni cassetto) - veloce
        if (paperSets.cassetto.animations && paperSets.cassetto.animations.length > 0) {
            paperSets.cassetto.animations.forEach(action => {
                action.timeScale = -3.5;
                action.paused = false;
                action.play();
            });
        }
        
        // Imposta lifted = false quando il cassetto si chiude
        paperSets.cassetto.lifted = false;
    }
}

function toggleValigia(valigia) {
    if (allAnimations.length === 0) {
        return;
    }
    
    valigiaAperta = !valigiaAperta;
    
    if (valigiaAperta) {
        setActivePaperSet('delirio');
        const openSpeed = 3.5;
        
        // Riproduci solo le animazioni associate alla valigia
        if (paperSets.delirio.animations && paperSets.delirio.animations.length > 0) {
            paperSets.delirio.animations.forEach(action => {
                action.timeScale = openSpeed;
                action.reset();
                action.play();
            });
        }
        
        // Salva le posizioni dei fogli dopo che l'animazione è completata
        setTimeout(() => {
            if (!paperSets.delirio.positionsSaved) {
                savePaperPositions('delirio');
            }
            // Imposta lifted = true e mostra il prompt
            paperSets.delirio.lifted = true;
            showFogliPrompt('delirio');
        }, 500);
    } else {
        // Se siamo in modalità fogli, chiudi il popup e riporta il foglio indietro
        if (isInPaperMode) {
            fogliOverlay.classList.add('hidden');
            restorePaperTransforms('delirio');
            const curvePos = cameraPath.getPointAt(scrollProgress);
            const lookAtPos = cameraPath.getPointAt(Math.min(1, scrollProgress + 0.01));

            gsap.to(camera.position, {
                x: curvePos.x, y: curvePos.y, z: curvePos.z,
                duration: 0.8,
                ease: "power2.inOut",
                onUpdate: () => camera.lookAt(lookAtPos)
            });

            isZoomedIn = false;
            isInPaperMode = false;
            currentPaperObject = null;
        } else {
            // Se la valigia si chiude ma non siamo in modalità fogli, ritorna alla posizione precedente sul percorso
            const curvePos = cameraPath.getPointAt(scrollProgress);
            const lookAtPos = cameraPath.getPointAt(Math.min(1, scrollProgress + 0.01));

            gsap.to(camera.position, {
                x: curvePos.x, y: curvePos.y, z: curvePos.z,
                duration: 0.7,
                ease: "power2.inOut",
                onUpdate: () => camera.lookAt(lookAtPos)
            });
            
            // Nascondi il prompt
            hideFogliPrompt();
        }
        
        // Chiudi la valigia + rientra i fogli (play backward animazioni) - veloce
        if (paperSets.delirio.animations && paperSets.delirio.animations.length > 0) {
            paperSets.delirio.animations.forEach(action => {
                action.timeScale = -3.5;
                action.paused = false;
                action.play();
            });
        }
        
        // Imposta lifted = false quando la valigia si chiude
        paperSets.delirio.lifted = false;
    }
}

closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    
    const curvePos = cameraPath.getPointAt(scrollProgress);
    const lookAtPos = cameraPath.getPointAt(Math.min(1, scrollProgress + 0.01));

    gsap.to(camera.position, {
        x: curvePos.x, y: curvePos.y, z: curvePos.z,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(lookAtPos),
        onComplete: () => isZoomedIn = false
    });
});

// Funzione per scorrere al foglio successivo - cambia visibilità
function scrollToPaperNext() {
    const set = activePaperSet;
    if (!set) return;
    // Ruota lo stack avanti: [0, 1, 2, 3] → [1, 2, 3, 0]
    set.stack.push(set.stack.shift());
    
    // Mostra SOLO il foglio davanti, nascondi gli altri
    set.objects.forEach((paper, paperIndex) => {
        if (paper) {
            // Il primo dello stack è davanti (visibile), gli altri dietro (nascosti)
            paper.visible = (paperIndex === set.stack[0]);
        }
    });
    
    currentPaperIndex = set.stack[0];
    currentPaperObject = set.objects[currentPaperIndex];
    
}

// Funzione per scorrere al foglio precedente - cambia visibilità
function scrollToPaperPrev() {
    const set = activePaperSet;
    if (!set) return;
    // Ruota lo stack indietro: [0, 1, 2, 3] → [3, 0, 1, 2]
    set.stack.unshift(set.stack.pop());
    
    // Mostra SOLO il foglio davanti, nascondi gli altri
    set.objects.forEach((paper, paperIndex) => {
        if (paper) {
            // Il primo dello stack è davanti (visibile), gli altri dietro (nascosti)
            paper.visible = (paperIndex === set.stack[0]);
        }
    });
    
    currentPaperIndex = set.stack[0];
    currentPaperObject = set.objects[currentPaperIndex];
    
}

// Event listeners per pulsanti di navigazione
fogliPrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    scrollToPaperPrev();
});

fogliNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    scrollToPaperNext();
});

// Click esterno per chiudere fogli popup e rientra i fogli nel cassetto
fogliOverlay.addEventListener('click', (e) => {
    // Se siamo in paper mode, solo i click sulle frecce funzionano
    // I click sul resto dello schermo (nell'aria) chiudono e rientrano fogli
    if (isInPaperMode) {
        // Se il click è su una freccia, non fare nulla (i pulsanti hanno i loro listener)
        if (e.target.id === 'fogli-prev-btn' || e.target.id === 'fogli-next-btn') {
            return;
        }
        
        // Altrimenti, se clicchi nell'aria, chiudi e rientra fogli
        fogliOverlay.classList.add('hidden');
        isInPaperMode = false;
        restorePaperTransforms(activePaperSetKey);
        currentPaperObject = null;
        
        // Se è il cassetto, rientra i fogli nel cassetto
        if (activePaperSetKey === 'cassetto') {
            cassettoAperto = false;
            allAnimations.forEach(action => {
                action.timeScale = -2;
                action.paused = false;
                action.play();
            });
        }
        
        // Riporta la camera al percorso
        const curvePos = cameraPath.getPointAt(scrollProgress);
        const lookAtPos = cameraPath.getPointAt(Math.min(1, scrollProgress + 0.01));

        gsap.to(camera.position, {
            x: curvePos.x, y: curvePos.y, z: curvePos.z,
            duration: 1.2,
            ease: "power2.inOut",
            onUpdate: () => camera.lookAt(lookAtPos),
            onComplete: () => {
                isZoomedIn = false;
            }
        });
        
        console.log(activePaperSetKey === 'cassetto' ? '🗄️ Fogli riposti nel cassetto' : '📄 Fogli riposizionati');
    }
});

// ==========================================
// 6B. POP-UP LETTERA AL PUNTO 3 - RIMOSSO
// ==========================================

// ==========================================
// 6B2. POP-UP LETTERA DUE (CENTRO SCHERMO) - RIMOSSO
// ==========================================

// ==========================================
// 6C. LETTERA SUL PAVIMENTO AL PUNTO 4 - RIMOSSO
// ==========================================

// Caricamento texture letteradue rimosso

// ==========================================
// 7. CONTROLLO FRECCETTE E WASD (GUARDARSI ATTORNO)
// ==========================================
const keys = {
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
    w: false,
    a: false,
    s: false,
    d: false
};

// Velocità di rotazione media (non veloce)
const rotationSpeed = 0.064;
let cameraQuaternion = new THREE.Quaternion(); // Mantieni le rotazioni applicate

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
        e.preventDefault();
    }
});

// ==========================================
// 7. LOOP RENDER
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    if (!isZoomedIn && !manualControl) {
        // Movimento automatico sul percorso
        scrollProgress += (scrollTarget - scrollProgress) * 0.1;
        
        const pos = cameraPath.getPointAt(scrollProgress);
        const look = cameraPath.getPointAt(Math.min(1, scrollProgress + 0.01));
        
        // Controlla se la camera è ferma (scrollProgress ≈ scrollTarget)
        const isMoving = Math.abs(scrollProgress - scrollTarget) > 0.001;
        
        // Applica le rotazioni SOLO se la camera è ferma
        if (!isMoving) {
            if (keys.arrowleft || keys.a) {
                const qY = new THREE.Quaternion();
                qY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed);
                cameraQuaternion.multiplyQuaternions(qY, cameraQuaternion);
            }
            if (keys.arrowright || keys.d) {
                const qY = new THREE.Quaternion();
                qY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -rotationSpeed);
                cameraQuaternion.multiplyQuaternions(qY, cameraQuaternion);
            }
            if (keys.arrowup || keys.w) {
                const qX = new THREE.Quaternion();
                qX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotationSpeed);
                cameraQuaternion.multiplyQuaternions(cameraQuaternion, qX);
            }
            if (keys.arrowdown || keys.s) {
                const qX = new THREE.Quaternion();
                qX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -rotationSpeed);
                cameraQuaternion.multiplyQuaternions(cameraQuaternion, qX);
            }
        }
        
        camera.position.copy(pos);
        camera.lookAt(look);
        
        // Applica le rotazioni salvate
        const currentQuat = camera.quaternion.clone();
        camera.quaternion.multiplyQuaternions(currentQuat, cameraQuaternion);
    }
    
    // Codice removed
    
    // Aggiorna l'animation mixer
    if (mixer) {
        const delta = Math.min(clock.getDelta(), 0.05);
        mixer.update(delta);
    }
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});