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
        'hero.title': `A personal lab experimenting for less tiring days`,
        'hero.subtitle': `We blend tech and theory to test ways to make days less exhausting.`,
        'hero.description': `When we spot what makes a day unnecessarily tiring, we log it instead of tolerating it. We add data and run small experiments to decide what to cut and what to automate. Tools are means; humans set the priorities and criteria. We choose the path where numbers prove "it’s a bit less tiring."`,
        'hero.ctaPrimary': `Read Our Philosophy`,
        'hero.ctaSecondary': `Browse the Lab Notes`,
        'indexGuard.eyebrow': `Fear & Greed + event based investing guard`,
        'indexGuard.title': `Index Guard — an app that steadies your mind before your thumb`,
        'indexGuard.lead': `We’ve all chased spikes, doubled losses on quick trades, and averaged down until the account blurred. Index Guard is an iOS app that uses sentiment and event data to cut the "one more time" impulse.`,
        'indexGuard.story1': `1) Alert: when volume spikes, headlines flood, and your thumb moves first`,
        'indexGuard.story2': `2) Pause: F&G and the event calendar show whether we’re in fear/greed territory`,
        'indexGuard.story3': `3) Act: the Daily Guard checklist and your pinned rules force a breath before buy/sell`,
        'indexGuard.ctaPrimary': `Open App Store`,
        'indexGuard.ctaSecondary': `View Pro options`,
        'indexGuard.card1.title': `1-minute daily check`,
        'indexGuard.card1.desc': `A 60-second timer + checklist to filter the “only a fool wouldn’t buy now” voice.`,
        'indexGuard.card2.title': `Sentiment + events together`,
        'indexGuard.card2.desc': `F&G and schedules (options expiry, FOMC, etc.) show up before volume alerts so your brain moves before your thumb.`,
        'indexGuard.card3.title': `Monthly reports`,
        'indexGuard.card3.desc': `Streaks and completion graphs show whether routine holds even if the account swings.`,
        'indexGuard.card4.title': `Your rules`,
        'indexGuard.card4.desc': `Save rules like “wait 24h on news/volume spikes.” Pro stores multiple rules so you can revisit them without regret.`,
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
        'about.subtitle': `We research ways to make life and work a bit less tiring`,
        'about.p1': `When we spot something that makes the day tiring, we log it instead of adapting. When someone says “everyone uses it this way,” we record where time and energy leak. That discomfort becomes fuel for the next experiment.`,
        'about.p2': `We like tools and automation, but priorities and accountability stay human. If the graph doesn’t move, a new tool is just a toy.`,
        'about.p3': `We aim for “a slightly less tiring day” over grand innovation. We stack experiments and records to leave proof that things actually improved.`,
        'about.keyword1.title': `Instrument Daily Life`,
        'about.keyword1.desc': `We first record where time, energy, and money leak—by logs, not hunches.`,
        'about.keyword2.title': `Tools as Means`,
        'about.keyword2.desc': `Automation and models are helping hands, not decision-makers.`,
        'about.keyword3.title': `Humans as Brake`,
        'about.keyword3.desc': `If automation skids, we halt. Humans hit the final brake.`,
        'philosophy.title': `Philosophy`,
        'philosophy.subtitle': `Measure, Mess With It, Decide`,
        'philosophy.intro': `We don't look at problems by gut alone. We loop instrument → hypothesis → experiment → recovery/improvement checks. We doubt tools and second-guess our own ideas in front of numbers.`,
        'philosophy.card1.title': `Instrument First`,
        'philosophy.card1.desc': `If we don't know how bad it is now, we won't know it got better. Baselines and logs first.`,
        'philosophy.card2.title': `Tools Are Interns`,
        'philosophy.card2.desc': `Automation and models are great for drafts and repetition. Final conclusions stay human.`,
        'philosophy.card3.title': `Humans Are the Brake`,
        'philosophy.card3.desc': `Human-in-the-loop is a safety feature, not an option. When automation goes off, we cut and feed the miss back.`,
        'philosophy.card4.title': `Choose by Numbers`,
        'philosophy.card4.desc': `We pick by uplift, recovery, and reproducibility. Ideas that don’t move numbers get dropped, even if we like them.`,
        'lab.title': `Lab Notes`,
        'lab.subtitle': `We value messy logs over polished results`,
        'lab.intro': `We trust logs of where we got stuck more than finished showcases. Reflection on the mess fuels the next version.`,
        'lab.note1.label': `Note #01`,
        'lab.note1.title': `Budgets ignore tomorrow`,
        'lab.note1.desc': `Even organized spend summaries didn’t show “future me.” Grouping spend by future impact finally nudged behavior.`,
        'lab.note1.status': `Collecting next month's data. Nagging intensity lowered by 30%.`,
        'lab.note2.label': `Note #02`,
        'lab.note2.title': `Meeting notes erase conflict`,
        'lab.note2.desc': `Auto-summarized notes sanded off every conflict and pending item. Posting only "unresolved items" to Slack stopped meetings from dragging.`,
        'lab.note2.status': `Conflict extraction precision 0.78. Tone still too robotic, tuning now.`,
        'lab.note3.label': `Note #03`,
        'lab.note3.title': `Routine recs outran stamina`,
        'lab.note3.desc': `Routines built without data treated humans like robots. Adding heart-rate/sleep and a “can you actually?” score raised adherence a bit more realistically.`,
        'lab.note3.status': `Adherence +19%. The scoring formula is still rough.`,
        'lab.note4.label': `Note #04`,
        'lab.note4.title': `Fewer notifications, fewer logs`,
        'lab.note4.desc': `Cutting to only necessary alerts also wiped user logs. We added short “why not” surveys and are rebuilding data first.`,
        'lab.note4.status': `Response rate 14% → 31%. Watching for behavior change.`,
        'experiments.title': `Experiments`,
        'experiments.subtitle': `Problem, Hypothesis, Experiment, and Evidence`,
        'experiments.intro': `Problem–hypothesis–experiment–result. If any box is empty, it’s still just an opinion. Tools and data stay hypotheses until evidence stacks.`,
        'experiments.labels.problem': `Problem`,
        'experiments.labels.hypothesis': `Hypothesis`,
        'experiments.labels.experiment': `Experiment`,
        'experiments.labels.result': `Result`,
        'experiments.exp1.problem': `Auto-tagging clusters customer tickets wrong; 37% bounce back for rework.`,
        'experiments.exp1.hypothesis': `Citing product schemas/FAQs and allowing “unknown” will cut misfires.`,
        'experiments.exp1.experiment': `A: zero-shot tagging. B: product schema + FAQ vector search with abstention. Compared accuracy, rework, and handling time over two weeks each.`,
        'experiments.exp1.result': `Accuracy +19pts, rework 37% → 11%, handling time +6s. Slightly slower, but trust returned.`,
        'experiments.exp2.problem': `72% ignore personalized routine push notifications.`,
        'experiments.exp2.hypothesis': `Showing time/fatigue costs from wearables + calendar will feel less pushy.`,
        'experiments.exp2.experiment': `A: plain “start your routine now” push. B: “15 min, fatigue -8%, no schedule conflict” push. Four-week AB.`,
        'experiments.exp2.result': `Start rate 2.4×, mid-drop -22%. Data-link failures climbed; redesigning retry logic.`,
        'experiments.exp3.problem': `No one checks dashboards; monthly reports are optional reading.`,
        'experiments.exp3.hypothesis': `A one-page Slack drop with week-over-week deltas, causes, and next tests will get read.`,
        'experiments.exp3.experiment': `Every Friday, auto-summarized metric diffs with evidence links were posted. Observed opens and meeting time for six weeks.`,
        'experiments.exp3.result': `Opens 3×, weekly meetings -18 minutes. Two misreads led to adding an “uncertainty” section.`,
        'studio.title': `Labs`,
        'studio.subtitle': `We experiment in small, interest-based labs`,
        'studio.intro': `We’re closer to a bundle of small labs than a monolith. We measure, tinker with tools, and archive failures because they’re the most useful later. The goal isn’t a pretty screen; it’s a slightly less tiring day. We watch whether fatigue/time/effort metrics move, not just UI shine.`,
        'studio.value1.title': `Instrumentation Obsessed`,
        'studio.value1.subtitle': `Instrument Everything`,
        'studio.value1.desc': `We log even tiny habits. If it can't be measured, it can't improve.`,
        'studio.value2.title': `Models Are Tools`,
        'studio.value2.subtitle': `Model, Not Oracle`,
        'studio.value2.desc': `Automation and models are for organizing and sorting. They’re not trusted to decide for us.`,
        'studio.value3.title': `Experiment Obsession`,
        'studio.value3.subtitle': `Hypothesis to Log`,
        'studio.value3.desc': `Every change starts and ends with a hypothesis and a log. Failures stay archived as-is.`,
        'studio.value4.title': `Life Impact`,
        'studio.value4.subtitle': `Life Impact`,
        'studio.value4.desc': `The goal is a less tiring life, not shinier UI. We watch the metrics that move.`,
        'footer.copyright': `© 2025 Serious Lab. All rights reserved.`,
        'footer.link1': `Instagram (research mode)`,
        'footer.link2': `Newsletter (someday)`,
        'footer.link3': `GitHub (maybe)`,
        'footer.link4': `Lab Report (just thinking)`
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
