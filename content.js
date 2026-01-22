
async function fixPositionsTableWidth() {
    if (globalThis.location.href.startsWith('https://app.alpaca.markets/account/positions')) {

        const wrapper = document.getElementById('page-wrapper');
        console.log(wrapper);
        const secondChild = wrapper.children[1];

        secondChild.classList.remove('max-w-6xl')

        secondChild.style.maxWidth = '1500px !important';
        console.log(secondChild);
    } else {
        console.log('not positions page');
    }
    setTimeout(fixPositionsTableWidth, 3000);
}


setTimeout(fixPositionsTableWidth, 3000);