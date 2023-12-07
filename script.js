/** PICTURES */
const headerBackground_DOM = document.querySelector('.header-background');
const footerBackground_DOM = document.querySelector('.footer-background');
const profilePicture_DOM = document.querySelector('.profile-picture');

/** TEXT */
const textA_DOM = document.querySelector('.text-a');
const textB_DOM = document.querySelector('.text-b');
const textA_content_DOM = document.querySelector('.text-a .content');
const textB_content_DOM = document.querySelector('.text-b .content');

/**
 *  0 -- up to -> window width - profile picture width
 *  (this affected by 'scrollYPercentage')
 */
let scrollY_proPicWd = 0;

function get_textB_width() {
    return (window.innerWidth - scrollY_proPicWd - profilePicture_DOM.clientWidth) + 'px';
}

// init 'text-b' width
const init_textB_width_intervalId = setInterval(() => {
    if (profilePicture_DOM && profilePicture_DOM.clientWidth) {
        textB_DOM.style.width = get_textB_width();
        clearInterval(init_textB_width_intervalId);
    }
}, 0);

// fix text container size when screen size changed
window.addEventListener('resize', () => {
    textB_DOM.style.width = get_textB_width();
});

/** EVENTS */

window.addEventListener('scroll', () => {

    /** SCROLL Y */

    const maxScrollY = document.body.scrollHeight - window.innerHeight,
          scrollYPercentage = window.scrollY / maxScrollY;

    /**
     * Referring to 'scrollYPercentage'.
     * Create the 0.8 as minimum and 0.9 as maximum (the rate speeding up).
     */
    let middleScrollYPercentage;

    if (scrollYPercentage < 0.8) {
        middleScrollYPercentage = 0;
    }
    else if (scrollYPercentage >= 0.8 && scrollYPercentage < 0.9) {
        middleScrollYPercentage = (scrollYPercentage - 0.8) * 10;
    }
    else middleScrollYPercentage = 1;

    /** BACKGROUND */

    const getUnevenBgOpc = (fragment, fragment_prev) =>
        (scrollYPercentage - fragment_prev) * 100 / (fragment * 100 * 2);

    if (window.scrollY < maxScrollY * 0.85) {
        headerBackground_DOM.style.visibility = 'visible';
        footerBackground_DOM.style.visibility = 'hidden';
        headerBackground_DOM.style.opacity = `${0.5 - getUnevenBgOpc(0.85, 0)}`;
    }
    else {
        headerBackground_DOM.style.visibility = 'hidden';
        footerBackground_DOM.style.visibility = 'visible';
        footerBackground_DOM.style.opacity = `${getUnevenBgOpc(0.15, 0.85)}`;
    }

    /** TEXT */

    scrollY_proPicWd = (
        middleScrollYPercentage *
        (window.innerWidth - profilePicture_DOM.clientWidth)
    );

    textA_DOM.style.width = scrollY_proPicWd + 'px';
    textB_DOM.style.width = get_textB_width();

    textA_content_DOM.style.transform = `scale(${middleScrollYPercentage})`;
    textB_content_DOM.style.transform = `scale(${1 - middleScrollYPercentage})`;

    // Text A
    if (textA_DOM.clientWidth >= 300) {
        textA_content_DOM.style.opacity = middleScrollYPercentage;
    }
    else if (textA_DOM.clientWidth <= 200) {
        textA_content_DOM.style.opacity = 0;
    }
    else textA_content_DOM.style.opacity = middleScrollYPercentage / 2;

    // Text B
    if (textB_DOM.clientWidth >= 300) {
        textB_content_DOM.style.opacity = 1 - middleScrollYPercentage;
    }
    else if (textB_DOM.clientWidth <= 200) {
        textB_content_DOM.style.opacity = 0;
    }
    else textB_content_DOM.style.opacity = (1 - middleScrollYPercentage) / 2;
});

