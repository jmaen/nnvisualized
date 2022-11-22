function remToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function pixelsToViewportWidth(px) {
    return px * (100 / window.innerWidth);
}