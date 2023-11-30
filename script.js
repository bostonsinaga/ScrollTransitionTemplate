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

    const maxScrollY = document.body.scrollHeight - window.innerHeight;
    const scrollYPercentage = window.scrollY / maxScrollY;

    /* BACKGROUND */

    const opacityValue = (1 - scrollYPercentage * 2) / 2;

    if (window.scrollY < maxScrollY / 2) {
        headerBackground_DOM.style.visibility = 'visible';
        footerBackground_DOM.style.visibility = 'hidden';
        headerBackground_DOM.style.opacity = `${opacityValue}`;
    }
    else {
        headerBackground_DOM.style.visibility = 'hidden';
        footerBackground_DOM.style.visibility = 'visible';
        footerBackground_DOM.style.opacity = `${Math.abs(opacityValue)}`;
    }

    /** TITLE */

    scrollY_proPicWd = (
        scrollYPercentage * (window.innerWidth - profilePicture_DOM.clientWidth)
    );

    textA_DOM.style.width = (scrollY_proPicWd) + 'px';
    textB_DOM.style.width = get_textB_width();

    textA_content_DOM.style.transform = `scale(${scrollYPercentage})`;
    textB_content_DOM.style.transform = `scale(${1 - scrollYPercentage})`;
});

