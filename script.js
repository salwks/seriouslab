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
        'nav.studio': `Studio`,
        'hero.title': `People who can't walk past discomfort<br>have their own <span class="highlight">lab</span>`,
        'hero.subtitle': `We overthink what everyone else ignores.`,
        'hero.description': `When someone says "that's just how it works,"<br>we get suspicious.<br>We doubt discomfort disguised as normal and run experiments on purpose.`,
        'hero.ctaPrimary': `Read Our Philosophy`,
        'hero.ctaSecondary': `Browse the Lab Notes`,
        'about.title': `About Serious Lab`,
        'about.subtitle': `A picky studio that willingly stares discomfort in the eye`,
        'about.p1': `People adapt to recurring discomfort at frightening speed. Slow loading, misplaced buttons, sloppy explanations—everyone shrugs and says "that's how it is."`,
        'about.p2': `Organizations are worse. Awkward processes get called "policy," inefficiencies get relabeled as "tradition," and no one feels responsible for the actual experience.`,
        'about.p3': `Serious Lab digs up those "obvious but untouched" pains on purpose. We know it's annoying, but someone has to do it.`,
        'about.keyword1.title': `Everyday Friction`,
        'about.keyword1.desc': `Tiny but persistent annoyances—the moments everyone else simply tolerates.`,
        'about.keyword2.title': `Broken Flows`,
        'about.keyword2.desc': `UX flows everyone hates but keeps using because "that's the standard answer."`,
        'about.keyword3.title': `Unquestioned Rules`,
        'about.keyword3.desc': `Rules that no one revisits. Momentum becomes policy, tradition becomes truth.`,
        'philosophy.title': `Philosophy`,
        'philosophy.subtitle': `Think Twice, Act Opposite`,
        'philosophy.intro': `We routinely check how often our instincts are wrong and how subjective "intuitive" can be. So we intentionally try the opposite—only after seeing the other extreme do we decide.`,
        'philosophy.card1.title': `Audit Intuition`,
        'philosophy.card1.desc': `Does the flow that feels natural to me genuinely feel natural to the user? Designers and users hold different mental models. Anything that feels "obvious" to us gets re-examined.`,
        'philosophy.card2.title': `Dismantle Momentum`,
        'philosophy.card2.desc': `"We've always done it this way" is a weak argument. Was success caused by the method or just a good market? Momentum must always be questioned.`,
        'philosophy.card3.title': `Reverse Experiments`,
        'philosophy.card3.desc': `Add friction instead of removing it. State things plainly instead of sugarcoating. Only by testing the opposite extreme can we find the best middle ground.`,
        'philosophy.card4.title': `Verify, Then Choose`,
        'philosophy.card4.desc': `We speak with data and experiment results—not gut feelings. If numbers are convincing, "the usual way" can be discarded without hesitation.`,
        'lab.title': `Lab Notes`,
        'lab.subtitle': `Things we obsess over`,
        'lab.intro': `We prefer logs of process, mistakes, and failed attempts over polished case studies. Plenty of portfolios brag about outcomes; we leave traces of our questions.`,
        'lab.note1.label': `Note #01`,
        'lab.note1.title': `Why do people freeze in front of a sign-up button?`,
        'lab.note1.desc': `Teams recolor buttons, rewrite copy, or add incentives when conversion drops, yet rarely explain why the account matters. We tripled the pre-sign-up steps instead.`,
        'lab.note1.status': `Still experimenting. Honestly, we don't know the answer yet.`,
        'lab.note2.label': `Note #02`,
        'lab.note2.title': `Saying "intuitive" ends the argument`,
        'lab.note2.desc': `The most common meeting phrase is "isn't this more intuitive?" But intuition differs person to person. We banned the word and forced ourselves to speak in scenarios and behaviors.`,
        'lab.note2.status': `It worked. Meetings got twice as fast.`,
        'lab.note3.label': `Note #03`,
        'lab.note3.title': `Everyone makes settings menus no one opens`,
        'lab.note3.desc': `Every app has a settings page that almost no one visits, yet we keep building them. We tried hiding settings entirely so only truly needed options surface.`,
        'lab.note3.status': `It flopped—users first asked where the settings went.`,
        'lab.note4.label': `Note #04`,
        'lab.note4.title': `Longer guidance, fewer readers`,
        'lab.note4.desc': `Trying to be helpful results in long sentences that no one reads. We restricted every instruction to one sentence, max 15 words.`,
        'lab.note4.status': `Complaints dropped. Turns out people read short things.`,
        'experiments.title': `Experiments`,
        'experiments.subtitle': `Problem, Hypothesis, Test`,
        'experiments.intro': `We value the chain of problem–hypothesis–experiment–result more than polished success stories. If we don't know how we got there, we can't reproduce it.`,
        'experiments.labels.problem': `Problem`,
        'experiments.labels.hypothesis': `Hypothesis`,
        'experiments.labels.experiment': `Experiment`,
        'experiments.labels.result': `Result`,
        'experiments.exp1.problem': `95% of users skipped the onboarding tutorial. We built it, but no one watched it.`,
        'experiments.exp1.hypothesis': `Maybe people learn faster by bumping into real context. Removing the tutorial might help.`,
        'experiments.exp1.experiment': `We split new users. Group A saw the tutorial, Group B got contextual hints only. We tracked week-one retention and key action completion.`,
        'experiments.exp1.result': `Group B's week-one retention rose by 12%. People preferred learning by doing. We removed the tutorial.`,
        'experiments.exp2.problem': `Only 3% used "read later." They saved items but never returned.`,
        'experiments.exp2.hypothesis': `Infinite queues feel burdensome. A 24-hour vault might push people to revisit.`,
        'experiments.exp2.experiment': `We renamed it "24-hour locker," clearly stating items auto-delete after a day, then tracked opens and saves for four weeks.`,
        'experiments.exp2.result': `View rate jumped to 18% (6×). Deadlines nudged people, though many asked for permanent saves, so a choice is coming.`,
        'experiments.exp3.problem': `Our feedback button collected fewer than three submissions a month.`,
        'experiments.exp3.hypothesis': `The word "feedback" feels heavy. "Report discomfort" might feel lighter.`,
        'experiments.exp3.experiment': `We changed the label to "Report Discomfort" and added "It only takes a minute."`,
        'experiments.exp3.result': `Reports climbed to 47 per month. Words change behavior, so we're reusing "report" elsewhere.`,
        'studio.title': `Studio`,
        'studio.subtitle': `Who we are`,
        'studio.intro': `We're neither an agency nor a startup nor a vendor. We pick the discomforts that intrigue us, run experiments, write logs instead of decks, and craft hypotheses instead of proposals.`,
        'studio.value1.title': `Spot Discomfort`,
        'studio.value1.subtitle': `Discomfort First`,
        'studio.value1.desc': `When people say "it's fine," we double-check. Are they truly fine or merely adapted?`,
        'studio.value2.title': `Act Contrarian`,
        'studio.value2.subtitle': `Contrarian Action`,
        'studio.value2.desc': `We purposely test the opposite of our intuition. Obvious choices aren't always right.`,
        'studio.value3.title': `Verify Relentlessly`,
        'studio.value3.subtitle': `Relentless Experimentation`,
        'studio.value3.desc': `A hypothesis is just a guess until proven. We only speak with data and experiments.`,
        'studio.value4.title': `Stay Human`,
        'studio.value4.subtitle': `Human, Not User Blame`,
        'studio.value4.desc': `Instead of "users didn't get it," we say "we failed to explain it." Discomfort isn't the person's fault.`,
        'studio.notice': `We don't take client requests.<br>We do welcome discomfort tips from the world.<br>(No promises we'll fix them—we're busy too.)`,
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
