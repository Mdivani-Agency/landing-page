// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";

function getQueryVariable(variable) {
    let query = window.location.search.substring(1);
    let vars = query.split("&");
    for (const element of vars) {
        let pair = element.split("=");
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

let analytics;

let lastScrollTop = 0;
const header = document.getElementById("header");

function initFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyBSQKqj-maC_IanNHWgjNEIRI-K6iHK18E",
        authDomain: "mdio-4a7c7.firebaseapp.com",
        projectId: "mdio-4a7c7",
        storageBucket: "mdio-4a7c7.firebasestorage.app",
        messagingSenderId: "539399538701",
        appId: "1:539399538701:web:3d9f5013a2a16853b1ed44",
        measurementId: "G-PJ84DYZ4WS"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    if (window.location.hostname !== "localhost") {
        analytics = getAnalytics(app);

        logEvent(analytics, 'page_view', {
            page_path: window.location.pathname,
            source: getQueryVariable('utm_source'),
        });
    }
}

window.addEventListener("scroll", function() {
    const mobileNav = document.getElementById("mobile-nav");
    let st = window.scrollY || document.documentElement.scrollTop;

    if (!mobileNav.classList.contains("hidden")) return;

    // Check scroll direction
    if (st > lastScrollTop) {
        // Scroll down, hide the header
        header.classList.add("hide-header"); // Change this value according to your header height
    } else {
        // Scroll up, show the header
        header.classList.remove("hide-header");
    }
    lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
});

document.addEventListener("DOMContentLoaded", function() {
    const cookieConsent = document.getElementById('cookie-consent');
    const burger = document.getElementById("burger");
    const close = document.getElementById("burger-close");
    const mobileNav = document.getElementById("mobile-nav");
    const menuLinks = document.querySelectorAll(".mobile-nav a");

    console.log("local storage", localStorage.getItem('cookies-accepted'));
    if (localStorage.getItem('cookies-accepted') !== "true") {
        cookieConsent.classList.remove('hidden');
    } else {
        initFirebase();
    }

    burger.addEventListener("click", function() {
        document.body.style.overflow = 'hidden';
        mobileNav.classList.remove("hidden");
    });

    close.addEventListener("click", function() {
        document.body.style.overflow = '';
        mobileNav.classList.add("hidden");
    });

    menuLinks.forEach(link => {
        link.addEventListener("click", function() {
            document.body.style.overflow = '';
            mobileNav.classList.add("hidden"); // Hide the mobile nav
        });
    });
});

window.closeCalendar = function () {
    const modalOverlay = document.getElementById('my-modal');
    const dialog = document.getElementById('modal-dialog');

    dialog.classList.add('translate-y-[100%]', 'md:scale-[.55]', 'md:opacity-0');

    setTimeout(() => {
        modalOverlay.classList.remove('show');
        modalOverlay.setAttribute('aria-hidden', 'true');

        document.body.style.overflow = '';
    }, 100);
};

window.openCalendar = function () {
    const modalOverlay = document.getElementById('my-modal');
    const dialog = document.getElementById('modal-dialog');

    modalOverlay.classList.add('show');
    modalOverlay.focus();
    modalOverlay.setAttribute('aria-hidden', 'false');

    dialog.classList.remove('translate-y-[100%]', 'md:scale-[.55]', 'md:opacity-0');

    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('show')) {
            closeCalendar();
        }
    });

    if (window.location.hostname !== "localhost" && localStorage.getItem('cookies-accepted')) {
        setTimeout(function () {
            logEvent(analytics, 'schedule_call_click', {
                method: 'Google Calendar',
                source: getQueryVariable('utm_source'),
            });
        }, 100);
    }
}

window.closePrivacy = function () {
    const modalOverlay = document.getElementById('privacy-modal');
    const dialog = document.getElementById('privacy-modal-dialog');

    dialog.classList.add('translate-y-[100%]', 'md:scale-[.55]', 'md:opacity-0');

    setTimeout(() => {
        modalOverlay.classList.remove('show');
        modalOverlay.setAttribute('aria-hidden', 'true');

        document.body.style.overflow = '';
    }, 100);
};

window.openPrivacyModal = function () {
    const modalOverlay = document.getElementById('privacy-modal');
    const dialog = document.getElementById('privacy-modal-dialog');

    modalOverlay.classList.add('show');
    modalOverlay.focus();
    modalOverlay.setAttribute('aria-hidden', 'false');

    dialog.classList.remove('translate-y-[100%]', 'md:scale-[.55]', 'md:opacity-0');

    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('show')) {
            closePrivacy();
        }
    });
}

window.acceptCookies = function() {
    const cookieConsent = document.getElementById('cookie-consent');
    localStorage.setItem('cookies-accepted', true);
    cookieConsent.classList.add('hidden');
    initFirebase();
}

window.rejectCookies = function() {
    const cookieConsent = document.getElementById('cookie-consent');
    localStorage.setItem('cookies-accepted', false);
    cookieConsent.classList.add('hidden');
    // Handle rejection logic (e.g., avoid initializing tracking scripts)
}
