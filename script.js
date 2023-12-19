import {Division, ScrollTransition} from './modules/scroll-transition.js';
const scrollTransition = new ScrollTransition();

//______|
// DOMS |
//______|

const CONTAINER_DOM = document.querySelector('.CONTAINER');

/** BACKGROUNDS */

const background_DOMs = [];

for (let i = 0; i < 2; i++) {
    const newBg = document.createElement('div');

    newBg.style.width = '100vw';
    newBg.style.height = '100vh';
    newBg.style.backgroundSize = 'cover';
    newBg.style.position = 'fixed';
    newBg.style.top = '0';

    if (i === 0) {
        newBg.style.backgroundImage = "url('./img/office.jpg')";
        newBg.style.opacity = '0.5';
    }
    else {
        newBg.style.backgroundImage = "url('./img/city.jpg')";
        newBg.style.opacity = '0';
    }

    background_DOMs.push(newBg);
    CONTAINER_DOM.appendChild(newBg);
}

/** TEXTS */

const text_DOMs = [],
      content_DOMs = [];

const content_p_strings = [
    [
        'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorem, architecto. Eius, quae nulla! Tenetur, reprehenderit molestiae! Quasi molestiae ab maiores sit aliquam dolores numquam repudiandae temporibus culpa? Adipisci, nulla quisquam?',
        'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ad iste eligendi tempore asperiores architecto reiciendis assumenda vero atque earum enim dolores quas, ex, natus, ab magnam veritatis modi harum. Accusantium.',
        'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Et fugiat sit minima ipsum sapiente repudiandae consectetur libero nulla dolorem assumenda praesentium numquam, quae ex. Culpa odit cupiditate dolores facere voluptas!'
    ],
    [
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore quod deserunt doloremque quis magni aut consequuntur porro, ut, temporibus debitis recusandae ex velit blanditiis obcaecati iste delectus aliquam praesentium veniam.',
        'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae nam delectus doloribus cupiditate? Ipsum impedit omnis, molestiae hic vel maiores, architecto aliquid commodi itaque, consequatur asperiores quia illo magnam ut.',
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima ab ipsam, laboriosam inventore nostrum natus autem non modi soluta vitae alias excepturi explicabo ducimus eaque neque error. Corrupti, non perferendis?'
    ]
];

for (let i = 0; i < 2; i++) {
    const newText = document.createElement('div');

    newText.style.width = '100vw';
    newText.style.height = '100vh';
    newText.style.display = 'flex';
    newText.style.position = 'fixed';
    newText.style.flexDirection = 'column';
    newText.style.alignItems = 'center';
    newText.style.justifyContent = 'center';
    newText.style.color = 'white';

    CONTAINER_DOM.appendChild(newText);
    text_DOMs.push(newText);
    content_DOMs.push([]);

    for (let j = 0; j < 3; j++) {
        const newContent = document.createElement('div');

        newContent.style.padding = '100px';
        newContent.style.position = 'fixed';
        newContent.style.display = 'flex';
        newContent.style.flexDirection = 'column';
        newContent.style.fontSize = '32px';

        if (i === 0 && j === 0) {
            newContent.style.opacity = '1';
            newContent.style.scale = '1';
        }
        else {
            newContent.style.opacity = '0';
            newContent.style.scale = '0';
        }

        /** The Contents */

        const h5 = document.createElement('h5');
        h5.innerHTML = `TEXT ${i} CONTENT ${j}`;
        h5.style.fontSize = 'calc(100% * 2)';

        const p = document.createElement('p');
        p.innerHTML = content_p_strings[i][j];
        p.style.marginTop = '20px';
        p.style.fontSize = 'inherit';

        // append elements
        newContent.appendChild(h5);
        newContent.appendChild(p);
        newText.appendChild(newContent);
        content_DOMs[i].push(newContent);
    }
}

//_______|
// EVENT |
//_______|

// backgrounds
scrollTransition.add({
    doms: background_DOMs,
    globalFragment: 1,
    localFragments: [0.5, 0.5],
    maxValue: 0.5,
    stylesToChange: [Division.OPACITY],
    fadeInOut: [false, true]
});

// texts and contents
for (let i = 0; i < text_DOMs.length; i++) {
    scrollTransition.add({
        doms: content_DOMs[i],
        globalFragment: 0.5,
        localFragments: [0.3, 0.4, 0.3],
        startFragment: i === 0 ? 0 : 0.5,
        maxValue: 1,
        stylesToChange: [Division.OPACITY, Division.SCALE],
        fadeInOut: i === 0 ? [false, false] : [true, true]
    });
}

// play the magic
scrollTransition.startEvent();

