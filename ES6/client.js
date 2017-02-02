import * as utils from './utils.js'

let bSourceLoaded = false;
let bCreateMosaic = false;
let totalRows,currentRow=0; // variables to keep record of total rows and computed rows
let svg;                    // variable to compile svgs recieved from server
let worker;                 // variable for web worker 

//Event handler for Input type file
const uploadFile = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    
    fileReader.onload = loadFile;
    fileReader.readAsDataURL(file);
    
    const dest = document.querySelector('#mosaicCanvas');
    dest.style.display = 'none';
}

//Event handler for FileReader
const loadFile = (e) => {
    const img = new Image();
    img.onload = e => drawSrcImage(e.target);
    img.src = e.target.result;
    bSourceLoaded = true;
    bCreateMosaic = false;
    initWorker();
}

//Function to display loaded source image
const drawSrcImage = (image) => {
    const canvas = document.querySelector('#srcCanvas')
    const ctx = canvas.getContext('2d');

    canvas.style.display = 'block'
    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage(image, 0, 0)
}
// Function to initialize worker
const initWorker = () => {
    if (window.Worker){ //check if window support workers.
        worker = new Worker('js/worker.js');
        
        worker.addEventListener('message', e => drawComputedRow(e) ,false);
    }
}
// Function to generate mosiac
const createMosaic = () =>{
    if (!bSourceLoaded)
        alert("Source image is not loaded");
    if (bCreateMosaic)
        alert("Mosaic is being generated. Please wait!!!");
    bCreateMosaic = true;
    
    const src = document.querySelector('#srcCanvas');
    const dest = document.querySelector('#mosaicCanvas');
    dest.style.display = 'block';
    
    //Set the size of destination canvas
    dest.width = src.width;
    dest.height = src.height;
    
    const ctx = dest.getContext('2d');
    // Calculate the no of rows to draw.
    totalRows = Math.floor(src.height / TILE_HEIGHT) - 1;
    currentRow = 0;
    svg = utils.getSVG(src.width, src.height);
      
    computeNextRow(worker);
}

//function to compute next row with a worker
const computeNextRow = (worker) =>{
    const src = document.querySelector('#srcCanvas');
    const colors = utils.getRowColors(src, currentRow);
    worker.postMessage({'cmd': 'getRowSVGs', 'colors': colors, 'row': currentRow});
    currentRow++;
}

// function to draw computed row from the worker thread
const drawComputedRow = (e) => {
    const dest = document.querySelector('#mosaicCanvas');
    const ctx = dest.getContext('2d');
    utils.buildElements( e.data.svgs).map(element => svg.appendChild(element));
            
    ctx.drawImage(utils.buildImage(svg), 0, e.data.row * TILE_HEIGHT);
    if (currentRow < totalRows)
        computeNextRow(worker);
}

// initialize the event listeners on page load
const init = () => {
    document.querySelector('#inputFile').onchange = uploadFile;
    document.querySelector('#createMosaic').onclick = createMosaic;
}

init();
