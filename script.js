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
        'nav.domains': `Domains`,
        'nav.labNotes': `Lab Notes`,
        'nav.experiments': `Experiments`,
        'nav.indexGuard': `Index Guard`,
        'hero.title': `A digital product team<br>designing better decisions`,
        'hero.subtitle': `We blend tech and theory to experiment with ways to improve work and life.`,
        'hero.description': `We look at the flow of work and life first, not screens.<br>We find friction, form hypotheses, and improve through data validation.`,
        'hero.ctaPrimary': `Read Our Philosophy`,
        'hero.ctaSecondary': `Browse the Lab Notes`,
        'identity.text': `Serious Lab is a digital product team that forms and tests hypotheses about work and life.`,
        'domains.title': `Domains — Areas we study deeply`,
        'domains.subtitle': `The heavier the regulation and risk, the more people need "a slightly more comfortable structure."`,
        'domains.healthcare.title': `Healthcare · Medical Imaging`,
        'domains.healthcare.desc': `Screens used in diagnosis and treatment prioritize "not confusing" over "pretty." We design DICOM viewers, workflow tools, and clinician/patient interfaces with safety, readability, and decision support as criteria.`,
        'domains.fintech.title': `Fintech · Investment Behavior / Personal Finance`,
        'domains.fintech.desc': `Numbers are cold, but decisions are emotional. We build tools that nudge behavior toward "less regret later" using fear/greed indicators, event calendars, and routine-based alerts.`,
        'domains.productivity.title': `Work Productivity · Operations Automation`,
        'domains.productivity.desc': `Meetings, reports, and repetitive tasks grind people down when poorly designed. We clarify where human judgment is needed and what can be automated, aiming for tools that change actual behavior—not dashboards for show.`,
        'indexGuard.eyebrow': `Case 01`,
        'indexGuard.title': `Index Guard`,
        'indexGuard.tagline': `An app that steadies your mind before your thumb`,
        'indexGuard.lead': `Index Guard is an investment behavior guard app to reduce investors' "just one more time..." impulse. It combines Fear & Greed index, major event calendars, personal rules and checklists to help you make trading decisions by routine instead of mood.`,
        'indexGuard.story1': `① Situation Detection: Detects signals of market overheating like volume, news, and volatility.`,
        'indexGuard.story2': `② Context Display: Shows current market sentiment (Fear & Greed), options expiry, and major indicator releases—"what zone are we in now"—at a glance.`,
        'indexGuard.story3': `③ Behavior Guard: Daily Guard checklist and your saved rules create at least 60 seconds of thinking time before buying or selling.`,
        'indexGuard.card1.title': `1-minute daily Guard check`,
        'indexGuard.card1.desc': `Summarizes market state and today's possible actions in under 1 minute.`,
        'indexGuard.card2.title': `Sentiment + Events combined`,
        'indexGuard.card2.desc': `F&G index, economic calendar, and volatility events on one screen to reduce "judging by news alone."`,
        'indexGuard.card3.title': `Routine · Success rate report`,
        'indexGuard.card3.desc': `Track consecutive success days and check completion rate to see if "your mind stays steady even when your account swings."`,
        'indexGuard.card4.title': `Save your own investment rules`,
        'indexGuard.card4.desc': `Save and repeatedly apply rules like "wait 24h on news/volume spikes." Pro lets you create multiple rules to be less angry at your past self.`,
        'about.title': `About Serious Lab`,
        'about.subtitle': `A digital product team that explores work and life through hypotheses`,
        'about.p1': `Serious Lab doesn't separate UX, data, automation, and development. We first look at how people actually think, how they move their hands, and where they feel friction.`,
        'about.p2': `When we hear "everyone uses the system this way," we start measuring who finds it draining and how. We log time, energy, errors, and attention drain points, then organize them into domain-appropriate metrics.`,
        'about.p3': `Only then do we change screens and flows. We figure out what to remove, what to automate, and where to keep human judgment and brakes.`,
        'about.p4': `The name Serious Lab is less "research lab" and more a promise to follow hypotheses about work and life to the end. The goal isn't flashy services but structures where people in healthcare, fintech, and operations can say <strong>"this work is less uncomfortable than before."</strong>`,
        'about.keyword1.title': `Instrument Daily Life`,
        'about.keyword1.desc': `We first record where time, energy, and attention leak—by logs, not hunches.`,
        'about.keyword2.title': `Tools as Assistants`,
        'about.keyword2.desc': `Automation and models lighten the load but don't replace responsibility and standards.`,
        'about.keyword3.title': `Humans as Final Brake`,
        'about.keyword3.desc': `Especially in high-trust domains, we believe humans must always hold the final stop button.`,
        'philosophy.title': `Philosophy`,
        'philosophy.subtitle': `Daily life, Hypotheses, Evidence`,
        'philosophy.intro': `We don't leave "does it have to be this way?" as a complaint. We form hypotheses about work and life, then seek answers through instrument → experiment → validation.`,
        'philosophy.card1.title': `Instrument the Flow First`,
        'philosophy.card1.desc': `Daily friction is remembered as feelings, but improvement is confirmed only by numbers. We start by measuring clicks, wait times, context switches, errors and undos.`,
        'philosophy.card2.title': `Tools Are Means`,
        'philosophy.card2.desc': `Automation, models, and frameworks are just means to make daily life less uncomfortable. What to automate and what humans must handle is decided by domain and responsibility structure.`,
        'philosophy.card3.title': `Hypotheses About Daily Life`,
        'philosophy.card3.desc': `We ask "will this change make things less uncomfortable?" before "will this feature be cool?" The unit of hypothesis is how we work, not features.`,
        'philosophy.card4.title': `Evidence in Changed Daily Life`,
        'philosophy.card4.desc': `Good design makes people less tired and reduces mistakes. We check metrics like time spent, error/undo rates to see if daily life really became less draining.`,
        'lab.title': `Lab Notes`,
        'lab.subtitle': `We record process and mistakes as much as results`,
        'lab.intro': `Serious Lab doesn't only keep "finished work." We record how we defined problems, which hypotheses and experiments worked, and what didn't. So we don't repeat the same mistakes in the next domain.`,
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
        'experiments.subtitle': `Problem · Hypothesis · Experiment · Result`,
        'experiments.intro': `We believe any feature or product journey should be summarizable in four boxes: problem–hypothesis–experiment–result. If any box is empty, it's still closer to opinion.`,
        'experiments.labels.problem': `Problem`,
        'experiments.labels.hypothesis': `Hypothesis`,
        'experiments.labels.experiment': `Experiment`,
        'experiments.labels.result': `Result`,
        'experiments.exp1.problem': `Auto-tagging clusters customer tickets wrong; 37% bounce back for rework.`,
        'experiments.exp1.hypothesis': `Citing product schemas/FAQs and allowing “unknown” will cut misfires.`,
        'experiments.exp1.experiment': `A: zero-shot tagging. B: product schema + FAQ vector search with abstention. Compared accuracy, rework, and handling time over two weeks each.`,
        'experiments.exp1.result': `Accuracy +19pts, rework 37% → 11%, handling time +6s. Slightly slower, but trust returned.`,
        'experiments.exp2.problem': `72% ignore personalized routine push notifications.`,
        'experiments.exp2.hypothesis': `Showing time required and effort from wearables + calendar will feel less pushy.`,
        'experiments.exp2.experiment': `A: plain "start your routine now" push. B: "15 min required, no schedule conflict" push. Four-week AB test.`,
        'experiments.exp2.result': `Start rate 2.4×, mid-drop -22%. Data-link failures climbed; redesigning retry logic.`,
        'experiments.exp3.problem': `No one checks dashboards; monthly reports are optional reading.`,
        'experiments.exp3.hypothesis': `A one-page Slack drop with week-over-week deltas, causes, and next tests will get read.`,
        'experiments.exp3.experiment': `Every Friday, auto-summarized metric diffs with evidence links were posted. Observed opens and meeting time for six weeks.`,
        'experiments.exp3.result': `Opens 3×, weekly meetings -18 minutes. Two misreads led to adding an “uncertainty” section.`,
        'workPrinciples.title': `Work Principles`,
        'workPrinciples.subtitle': `A few standards we keep when building complex products`,
        'workPrinciples.intro': `Serious Lab tries to maintain these four standards regardless of domain.`,
        'workPrinciples.value1.title': `Instrument Everything`,
        'workPrinciples.value1.desc': `Even trivial flows get logged as events. Without measurement, improvement and accountability become vague.`,
        'workPrinciples.value2.title': `Model, Not Boss`,
        'workPrinciples.value2.desc': `Models suggest and organize. Especially in sensitive domains, we only put them front and center to the extent humans can understand and explain.`,
        'workPrinciples.value3.title': `Hypothesis to Log`,
        'workPrinciples.value3.desc': `"It'd be nice to reduce this work" is just a hypothesis. Hypotheses are logged with experiment design and results, then accepted or discarded. Failed experiments are archived as data for future design.`,
        'workPrinciples.value4.title': `Life & Work Impact`,
        'workPrinciples.value4.desc': `We look at whether workers are less tired, less confused, and less regretful—not whether the product got prettier. If time and risk don't decrease, we rework it no matter how good the feature looks.`,
        'footer.copyright': `© 2025 Serious Lab. All rights reserved.`,
        'footer.tagline': `Healthcare · Fintech · Decision Support & Work Products`
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
