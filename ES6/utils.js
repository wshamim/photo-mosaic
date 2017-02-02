//function to get the average RGB color from an image data.
const getAvgRGB = (imgData) => {
    const len = imgData.data.length,
        blockSize = 5,  //only visit 5 x 4 pixels 
        rgb = {r:0, g:0, b:0};
    let i = -4, count = 0;
    while ((i += blockSize * 4) < len){
        ++count;
        rgb.r += imgData.data[i];
        rgb.g += imgData.data[i+1];
        rgb.b += imgData.data[i+2];
    }
       
    rgb.r = Math.floor(rgb.r/count);
    rgb.g = Math.floor(rgb.g/count);
    rgb.b = Math.floor(rgb.b/count);

    return rgb;
}
// function to convert rgb object to hex string
const rgbToHex = (rgb) =>{
    return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

// function to get colors for the entire row of tiles.
const getRowColors = (canvas, row) => {
    const ctx = canvas.getContext('2d');
    const columns = Math.floor(canvas.width / TILE_WIDTH);

    return  Array.from(Array(columns).keys())
                .map(column => rgbToHex(getAvgRGB(ctx.getImageData(column * TILE_WIDTH, row * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT)))).reverse();
}

// function to get the base of the svg which will contain all the svgs returned from the server
const getSVG = (width, height) =>{
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    return svg;
}

// function to build elements
const buildElements = (svgs) => svgs
        .map(element => (new DOMParser()).parseFromString(element, "text/xml").querySelector('ellipse'))
        .map((ellipse, index) => buildElement(ellipse, index))

// function to build indivisual element of the svg with its displacement
const buildElement = (element, dx) => {
    const newElement = element.cloneNode(true);
    newElement.setAttribute('cx', (TILE_WIDTH / 2) + (TILE_WIDTH * dx));
    newElement.setAttribute('cy', TILE_HEIGHT / 2);
    newElement.setAttribute('rx', TILE_WIDTH / 2);
    newElement.setAttribute('ry', TILE_HEIGHT / 2);

    return newElement;
}
// function to build image from the svg xml
const buildImage = (svg) => {
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(xml);
    const b64Start = 'data:image/svg+xml;base64,';
    const image64 = b64Start + svg64;
    const img = new Image();
    img.src = image64;
    return img;
}

export { getRowColors, getSVG, buildElements, buildImage }