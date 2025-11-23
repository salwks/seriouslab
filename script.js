import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
});

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Prevent default drag behaviour (e.g., on hero interactions)
window.addEventListener('dragstart', event => {
    event.preventDefault();
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const langToggle = document.getElementById('langToggle');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const isActive = navLinks.classList.contains('active');
    mobileMenuBtn.textContent = isActive ? '✕' : '☰';
    mobileMenuBtn.setAttribute('aria-label', isActive ? '메뉴 닫기' : '메뉴 열기');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.textContent = '☰';
        mobileMenuBtn.setAttribute('aria-label', '메뉴 열기');
    });
});

// Hero Three.js scene
const heroSection = document.getElementById('hero');
const heroVisual = document.getElementById('heroWebGL');
let heroRenderer;
let heroScene;
let heroCamera;
let heroModel;
const heroClock = new THREE.Clock();
const staticCameraPosition = new THREE.Vector3();
const heroLoading = document.getElementById('heroLoading');

function initHeroScene() {
    if (!heroVisual) return;

    heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroRenderer.setClearColor(0x000000, 0);
    heroVisual.appendChild(heroRenderer.domElement);

    heroScene = new THREE.Scene();

    heroCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    heroCamera.position.set(0.4, 0.55, 4.2);
    staticCameraPosition.copy(heroCamera.position);
    heroScene.add(heroCamera);

    const ambient = new THREE.AmbientLight(0x7fcfff, 0.5);
    heroScene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xaaffcc, 1.1);
    dirLight.position.set(2, 3, 4);
    heroScene.add(dirLight);

    const rimLight = new THREE.PointLight(0x39ff14, 0.65, 12, 2.4);
    rimLight.position.set(-2.5, 1.2, -1.8);
    heroScene.add(rimLight);

    loadHeroModel();
    resizeHeroRenderer();
    renderHero();
}

function loadHeroModel() {
    const textureLoader = new THREE.TextureLoader();
    const onTextureLoad = () => hideHeroLoading();
    const onTextureError = () => showHeroLoadingError();

    const diffuse = textureLoader.load('obj/textures/Rodin_Thinker_diffuse.jpg', onTextureLoad, undefined, onTextureError);
    diffuse.colorSpace = THREE.SRGBColorSpace;

    const normalMap = textureLoader.load('obj/textures/Rodin_Thinker_normal.png', undefined, undefined, onTextureError);
    const glossMap = textureLoader.load('obj/textures/Rodin_Thinker_gloss.jpg', undefined, undefined, onTextureError);
    glossMap.colorSpace = THREE.LinearSRGBColorSpace;

    const material = new THREE.MeshStandardMaterial({
        map: diffuse,
        normalMap,
        roughnessMap: glossMap,
        roughness: 0.85,
        metalness: 0.2,
        emissive: new THREE.Color(0x0c0f1d),
        emissiveIntensity: 0.15
    });

    const loader = new OBJLoader();
    loader.load(
        'obj/source/Rodin_Thinker.obj',
        obj => {
            obj.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material = material;
                }
            });

            const box = new THREE.Box3().setFromObject(obj);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxAxis = Math.max(size.x, size.y, size.z);
            const scale = 2.5 / maxAxis;
            obj.scale.setScalar(scale);

            const center = new THREE.Vector3();
            box.getCenter(center);
            obj.position.sub(center);
            obj.position.y -= 0.95;

            heroModel = obj;
            heroScene.add(heroModel);
            hideHeroLoading();
        },
        undefined,
        error => {
            console.error('Failed to load OBJ:', error);
            showHeroLoadingError();
        }
    );
}

function resizeHeroRenderer() {
    if (!heroRenderer || !heroCamera) return;
    const width = heroVisual.clientWidth || heroSection.clientWidth || window.innerWidth;
    const height = heroVisual.clientHeight || heroSection.clientHeight || window.innerHeight;
    heroRenderer.setSize(width, height, false);
    heroCamera.aspect = width / height;
    heroCamera.updateProjectionMatrix();
}

function renderHero() {
    requestAnimationFrame(renderHero);
    const delta = heroClock.getDelta();

    heroCamera.position.copy(staticCameraPosition);
    heroCamera.lookAt(0, 0.1, 0);

    if (heroModel) {
        heroModel.rotation.y += delta * 0.175;
    }

    heroRenderer.render(heroScene, heroCamera);
}

function hideHeroLoading() {
    if (heroLoading) {
        heroLoading.classList.add('hidden');
    }
}

function showHeroLoadingError() {
    if (heroLoading) {
        heroLoading.textContent = 'Failed to initialize scene';
        heroLoading.classList.remove('hidden');
    }
}

window.addEventListener('resize', () => {
    resizeHeroRenderer();
});

initHeroScene();

// Fade in animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    observer.observe(section);
});

// Language toggle
const translatableElements = document.querySelectorAll('[data-i18n]');
translatableElements.forEach(element => {
    element.dataset.i18nKo = element.innerHTML;
});

const translations = {
    en: {
        'nav.about': `About`,
        'nav.philosophy': `Philosophy`,
        'nav.labNotes': `Lab Notes`,
        'nav.experiments': `Experiments`,
        'nav.studio': `Labs`,
        'nav.indexGuard': `Index Guard`,
        'hero.title': `A slightly contrarian <span class="highlight">lab</span><br>that patches life bugs with data + LLMs`,
        'hero.subtitle': `We prefer better numbers over prettier pixels.`,
        'hero.description': `We don't just watch friction. We instrument, clean messy life data, and run LLM/AI to prove "life sucks less" with numbers. Sentiment doesn't decide; deltas do.`,
        'hero.ctaPrimary': `Read Our Philosophy`,
        'hero.ctaSecondary': `Browse the Lab Notes`,
        'indexGuard.eyebrow': `Fear & Greed powered investing guard`,
        'indexGuard.title': `Index Guard — a calm investing routine`,
        'indexGuard.lead': `We've chased spikes on dopamine, scalped gains then lost twice as fast, averaged down into a cliff and watched accounts fade. Index Guard uses live F&G, event alerts, and rule checklists to cut that moment.`,
        'indexGuard.story1': `1) Trigger: volume spikes, headlines flood, your thumb moves first`,
        'indexGuard.story2': `2) Pause: F&G and event calendar show if we're in fear/greed territory`,
        'indexGuard.story3': `3) Act: Daily Guard checklist and your rules force a breath before buy/sell`,
        'indexGuard.ctaPrimary': `Start free`,
        'indexGuard.ctaSecondary': `See Pro features`,
        'indexGuard.card1.title': `1-minute daily check`,
        'indexGuard.card1.desc': `A 60-second timer + checklist that cuts the inner "buy now, 2x soon" whisper.`,
        'indexGuard.card2.title': `Live sentiment + events`,
        'indexGuard.card2.desc': `F&G and events pop up before volume alerts, so your brain moves before your thumb.`,
        'indexGuard.card3.title': `Monthly reports`,
        'indexGuard.card3.desc': `Streaks/completion charts that say, "my mood dipped, but my routine climbed."`,
        'indexGuard.card4.title': `Your rules`,
        'indexGuard.card4.desc': `Save "volume/news hype → wait 24h" anti-averaging rules. Pro unlocks unlimited + restore.`,
        'indexGuard.layout.title': `One-page layout guide`,
        'indexGuard.layout.item1': `Sticky header with two CTAs (Primary/Outline) on the right.`,
        'indexGuard.layout.item2': `Hero with message, subtext, app mock, and repeated CTA.`,
        'indexGuard.layout.item3': `3–4 feature cards → trust (data source/local storage) → plan cards (Monthly/Yearly).`,
        'indexGuard.layout.item4': `Place FAQ/contact button right above the footer to reduce drop-off.`,
        'indexGuard.ui.title': `Tone & UI`,
        'indexGuard.ui.item1': `Deep navy/charcoal base with lime accent; gradient CTA.`,
        'indexGuard.ui.item2': `1200px container, 100px section padding, 12-grid 4-4-4 cards.`,
        'indexGuard.ui.item3': `Mobile: pin CTA on top, single-column cards, generous spacing.`,
        'indexGuard.ui.item4': `Use monospace for numbers/indexes, line icons for contrast.`,
        'about.title': `About Serious Lab`,
        'about.subtitle': `A labs-minded team making life less crappy with data and models`,
        'about.p1': `When someone says "that's just how we use it," we start instrumenting where time and energy leak. Staring at discomfort is boring; logging and quantifying it isn't.`,
        'about.p2': `We don't think LLMs magically fix everything. Models are cheap, fast interns; the real work is data hygiene and feedback loops.`,
        'about.p3': `Serious Lab quantifies tiny life bugs, throws LLM/AI at them, and shares the improvement rates. Goal: less-crappy living. Mood: cynical. Output: practical.`,
        'about.keyword1.title': `Quantified Life`,
        'about.keyword1.desc': `We fix things only after we see where time, money, and focus leak in numbers.`,
        'about.keyword2.title': `LLM Ops, Not Magic`,
        'about.keyword2.desc': `We care more about data integrity, failure logs, and reproducibility than prompt wizardry.`,
        'about.keyword3.title': `Human-in-the-loop`,
        'about.keyword3.desc': `We love automation, but humans stay as the final ruler. If it's weird, we cut it instantly.`,
        'philosophy.title': `Philosophy`,
        'philosophy.subtitle': `Measure, Mock, Iterate`,
        'philosophy.intro': `We avoid gut-only takes. We loop through instrument → hypothesis → model → experiment → recovery/improvement checks. We trust numbers, not vibes.`,
        'philosophy.card1.title': `Instrument First`,
        'philosophy.card1.desc': `If we don't know how bad it is now, we won't know it got better. Baselines and logs first.`,
        'philosophy.card2.title': `LLM = Intern`,
        'philosophy.card2.desc': `LLMs are cheap interns for drafts, classification, and summaries. They don't get decision rights.`,
        'philosophy.card3.title': `Humans are the Brake`,
        'philosophy.card3.desc': `Human-in-the-loop is mandatory. When the model derails, we cut it and feed the mistake back.`,
        'philosophy.card4.title': `Choose by Numbers`,
        'philosophy.card4.desc': `We pick by uplift/recovery/reproducibility, not by how pleasant it feels. Ideas that don't move numbers are dropped.`,
        'lab.title': `Lab Notes`,
        'lab.subtitle': `Logs from poking at life with data`,
        'lab.intro': `We prefer mid-stage logs from colliding with data and grinding LLMs over polished case studies. Ugly failures stay visible.`,
        'lab.note1.label': `Note #01`,
        'lab.note1.title': `Budgets forget future-me`,
        'lab.note1.desc': `We thought LLM summaries of card spend would help. Instead it scolded our caffeine. Reclassifying spend by "future impact" finally nudged behavior.`,
        'lab.note1.status': `Reviewing next month's data; nagging intensity down 30%.`,
        'lab.note2.label': `Note #02`,
        'lab.note2.title': `Meeting notes are too polite`,
        'lab.note2.desc': `LLM-written notes deleted every conflict, and the critical tensions vanished. We now extract only "unresolved items" to Slack; meetings got shorter.`,
        'lab.note2.status': `Conflict extraction precision 0.78. Still tuning for a snarkier tone.`,
        'lab.note3.label': `Note #03`,
        'lab.note3.title': `Routine recs outran our stamina`,
        'lab.note3.desc': `LLM-built morning routines without wearable data treated humans like robots. After adding heart-rate/sleep and a "can you actually?" score, adherence climbed.`,
        'lab.note3.status': `Adherence +19%. The scoring is still flimsy.`,
        'lab.note4.label': `Note #04`,
        'lab.note4.title': `Fewer notifications killed our data`,
        'lab.note4.desc': `Filters that send only necessary alerts also shrank user logs. We're attaching frictionless "why not" micro-surveys and retraining.`,
        'lab.note4.status': `Response rate 14% → 31%. Behavior shift still unknown.`,
        'experiments.title': `Experiments`,
        'experiments.subtitle': `Problem, Hypothesis, Model, Test`,
        'experiments.intro': `We repeat problem–hypothesis–model–experiment–result. LLMs and data are just opinions until proven.`,
        'experiments.labels.problem': `Problem`,
        'experiments.labels.hypothesis': `Hypothesis`,
        'experiments.labels.experiment': `Experiment`,
        'experiments.labels.result': `Result`,
        'experiments.exp1.problem': `LLM mislabels customer tickets; 37% bounce back for rework.`,
        'experiments.exp1.hypothesis': `If we hook RAG to product schemas and allow "unknown," misfires should drop.`,
        'experiments.exp1.experiment': `A: zero-shot tagging. B: product schema + FAQ vector search with abstention. Measured 2 weeks for accuracy, rework rate, avg handling time.`,
        'experiments.exp1.result': `Accuracy +19pts, rework 37%→11%, handling time +6s. A bit slower, but the team trusts it again.`,
        'experiments.exp2.problem': `72% ignore personalized routine push notifications.`,
        'experiments.exp2.hypothesis': `Showing predicted time/fatigue costs from wearable + calendar data will feel less pushy.`,
        'experiments.exp2.experiment': `A: plain "start your routine now" push. B: send with "15 min, fatigue -8%, no schedule conflict." Four-week AB.`,
        'experiments.exp2.result': `Start rate 2.4×, mid-drop -22%. Data-link failures increased; retry logic coming.`,
        'experiments.exp3.problem': `The team ignores dashboards and monthly reports.`,
        'experiments.exp3.hypothesis': `A one-page Slack drop with week-over-week deltas/causes/next tests beats a number-only LLM digest.`,
        'experiments.exp3.experiment': `Every Friday, LLM writes metric diffs with evidence links and posts. Watched open rates and meeting time for 6 weeks.`,
        'experiments.exp3.result': `Opens 3×, weekly meetings -18 minutes. Two misinterpretations triggered a new "uncertainty" section.`,
        'studio.title': `Labs`,
        'studio.subtitle': `How we operate`,
        'studio.intro': `We're not an agency. We're a labs-minded team running data/model experiments, logging everything, and aiming for slightly less annoying living.`,
        'studio.value1.title': `Instrumentation Obsessed`,
        'studio.value1.subtitle': `Instrument Everything`,
        'studio.value1.desc': `We log even tiny habits. If it can't be measured, it can't improve.`,
        'studio.value2.title': `Models Are Tools`,
        'studio.value2.subtitle': `Model, Not Oracle`,
        'studio.value2.desc': `LLMs are for drafts and classification. Decisions come from numbers and humans.`,
        'studio.value3.title': `Experiment Obsession`,
        'studio.value3.subtitle': `Hypothesis to Log`,
        'studio.value3.desc': `Every change starts and ends with a hypothesis and a log. Failures get archived.`,
        'studio.value4.title': `Life Impact`,
        'studio.value4.subtitle': `Life Impact`,
        'studio.value4.desc': `The goal is better living, not shinier UI. We watch the metrics that move.`,
        'studio.notice': `No client gigs. We do welcome data/life-bug tips.<br>(We move only if we're intrigued.)`,
        'footer.copyright': `© 2025 Serious Lab. All rights reserved.`,
        'footer.link1': `Instagram (research mode)`,
        'footer.link2': `Newsletter (someday)`,
        'footer.link3': `GitHub (maybe)`,
        'footer.link4': `Lab Report (thinking)`
    }
};

const LANGUAGE_STORAGE_KEY = 'seriouslab-language';
let currentLanguage = 'ko';

function setLanguage(language) {
    currentLanguage = language;
    translatableElements.forEach(element => {
        const key = element.dataset.i18n;
        if (!key) return;

        if (language === 'ko') {
            if (element.dataset.i18nKo !== undefined) {
                element.innerHTML = element.dataset.i18nKo;
            }
        } else {
            const translated = translations[language]?.[key];
            if (translated) {
                element.innerHTML = translated;
            } else if (element.dataset.i18nKo !== undefined) {
                element.innerHTML = element.dataset.i18nKo;
            }
        }
    });

    if (langToggle) {
        langToggle.textContent = language.toUpperCase();
        langToggle.setAttribute(
            'aria-label',
            language === 'ko' ? 'Switch to English' : '한국어로 보기'
        );
    }

    document.documentElement.lang = language;
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
        console.warn('Unable to persist language preference:', error);
    }
}

function detectInitialLanguage() {
    const saved = (() => {
        try {
            return localStorage.getItem(LANGUAGE_STORAGE_KEY);
        } catch {
            return null;
        }
    })();

    if (saved) {
        if (saved === 'ko' || translations[saved]) {
            return saved;
        }
    }

    const browserPreference = (navigator.language || 'ko').toLowerCase();
    return browserPreference.startsWith('ko') ? 'ko' : 'en';
}

const initialLanguage = detectInitialLanguage();
setLanguage(initialLanguage);

if (langToggle) {
    langToggle.addEventListener('click', () => {
        const nextLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
        setLanguage(nextLanguage);
    });
}
