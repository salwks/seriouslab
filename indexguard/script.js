const translations = {
    en: {
        nav: {
            features: "Features",
            reviews: "Reviews",
            download: "Download App"
        },
        hero: {
            title: "The biggest enemy in trading is not the market—it’s your emotions",
            subtitle: "Have you ever jumped into a skyrocketing stock hoping for a quick 2–3% profit, only to watch it plummet the second you bought in? We provide a system to override your trading instincts.",
            cta: "Download on the App Store"
        },
        feature1: {
            tag: "Psychological Barrier",
            title: "20-Second Pause Timer",
            desc: "Before you hit that buy or sell button, take a forced 20-second cooldown to regain your composure. A brief pause can save you from the most expensive mistakes of your life."
        },
        feature2: {
            tag: "Daily Discipline",
            title: "Daily Guard Routine",
            desc: "Check your investment principles daily with 3 essential self-reflection questions. Build a solid trading routine."
        },
        feature3: {
            tag: "Rational Analysis",
            title: "Giants-Based Analysis",
            desc: "Analyze stocks using the standards of masters like Warren Buffett (ROE, Debt Ratio). Stop guessing."
        },
        feature4: {
            tag: "Behavioral Insights",
            title: "14-Day Psychological Insights (Pro)",
            desc: "Identify the specific days, times, and risk patterns where you are most likely to lose money. Decode your hidden habits and correct them through data-driven analysis."
        },
        feature5: {
            tag: "Shared Reflection",
            title: "The Wailing Wall",
            desc: "Share the pain of your losses and the regret of impulsive trades anonymously. You are not alone. Heal your trading psychology and vow never to repeat the same mistakes."
        },
        closing: {
            quote: "\"Be fearful when others are greedy,<br>and greedy when others are fearful.\"",
            author: "- Warren Buffett",
            title: "Patience Wins the Game",
            desc: "Check your emotional index, wait for the right opportunity in times of fear, and enter the market with a calm mind. The final result will be far greater than any impulsive trade."
        },
        footer: {
            copyright: "Serious Lab. All rights reserved."
        }
    },
    ko: {
        nav: {
            features: "기능",
            reviews: "리뷰",
            download: "앱 다운로드"
        },
        hero: {
            title: "트레이딩의 가장 큰 적은<br>시장이 아니라 당신의 감정입니다",
            subtitle: "급등주에 올라타 2-3% 수익을 기대했다가 순식간에 물려본 적이 있나요? 당신의 트레이딩 본능을 제어할 시스템을 제공합니다.",
            cta: "App Store에서 다운로드"
        },
        feature1: {
            tag: "심리적 장벽",
            title: "20초 일시정지 타이머",
            desc: "매수/매도 버튼을 누르기 전, 20초간 강제로 멈추어 평정심을 되찾으세요. 짧은 멈춤이 인생에서 가장 비싼 실수를 막아줍니다."
        },
        feature2: {
            tag: "매일의 규율",
            title: "데일리 가드 루틴",
            desc: "3가지 핵심 질문으로 투자 원칙을 매일 점검하세요. 견고한 트레이딩 루틴을 만드세요."
        },
        feature3: {
            tag: "이성적 분석",
            title: "거인들의 어깨 위에서",
            desc: "워런 버핏과 같은 대가들의 기준(ROE, 부채비율 등)으로 종목을 분석하세요. 감이 아닌 데이터로 투자하세요."
        },
        feature4: {
            tag: "행동 인사이트",
            title: "14일 심리 인사이트 (Pro)",
            desc: "당신이 돈을 잃는 특정 요일, 시간대, 리스크 패턴을 파악하세요. 데이터 분석을 통해 숨겨진 습관을 찾아 교정하세요."
        },
        feature5: {
            tag: "공유와 성찰",
            title: "통곡의 벽",
            desc: "뇌동매매의 후회와 손실의 아픔을 익명으로 털어놓으세요. 당신은 혼자가 아닙니다. 트레이딩 심리를 치유하고 실수를 반복하지 않겠다고 다짐하세요."
        },
        closing: {
            quote: "\"남들이 욕심을 부릴 때 두려워하고,<br>남들이 두려워할 때 욕심을 부려라.\"",
            author: "- 워런 버핏",
            title: "인내심이 승리합니다",
            desc: "공포 탐욕 지수를 확인하고, 공포 구간에서 기회를 기다리며, 평온한 마음으로 시장에 진입하세요. 충동적인 매매보다 훨씬 더 큰 결과를 얻게 될 것입니다."
        },
        footer: {
            copyright: "Serious Lab. All rights reserved."
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Reveal Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Dynamic Copyright Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Language Switching
    const langToggleBtn = document.getElementById('lang-toggle');
    let currentLang = 'en';

    // Check browser language or stored preference could go here
    // For now, default to English as per request logic implied

    function setLanguage(lang) {
        currentLang = lang;
        langToggleBtn.textContent = lang === 'en' ? 'KR' : 'EN';
        
        // Update Text
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const keys = key.split('.');
            let value = translations[lang];
            keys.forEach(k => {
                if (value) value = value[k];
            });
            
            if (value) {
                el.innerHTML = value;
            }
        });

        // Update Images
        document.querySelectorAll('.lang-img').forEach(img => {
            const baseName = img.getAttribute('data-img');
            if (baseName) {
                const suffix = lang === 'ko' ? 'kr' : lang;
                img.src = `assets/images/${baseName}_${suffix}.png`;
            }
        });
    }

    langToggleBtn.addEventListener('click', () => {
        const newLang = currentLang === 'en' ? 'ko' : 'en';
        setLanguage(newLang);
    });
});
