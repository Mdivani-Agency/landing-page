let lastScrollTop = 0;
const header = document.getElementById("header");

window.addEventListener("scroll", function() {
    let st = window.scrollY || document.documentElement.scrollTop;

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
    const burger = document.getElementById("burger");
    const close = document.getElementById("burger-close");
    const mobileNav = document.getElementById("mobile-nav");
    const menuLinks = document.querySelectorAll(".mobile-nav a");

    burger.addEventListener("click", function() {
        mobileNav.classList.remove("hidden");
    });

    close.addEventListener("click", function() {
        mobileNav.classList.add("hidden");
    });

    menuLinks.forEach(link => {
        link.addEventListener("click", function() {
            mobileNav.classList.add("hidden"); // Hide the mobile nav
        });
    });
});
