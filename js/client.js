'use strict';

System.register(['./utils.js'], function (_export, _context) {
    "use strict";

    var utils, bSourceLoaded, bCreateMosaic, totalRows, currentRow, svg, worker, uploadFile, loadFile, drawSrcImage, initWorker, createMosaic, computeNextRow, drawComputedRow, init;
    return {
        setters: [function (_utilsJs) {
            utils = _utilsJs;
        }],
        execute: function () {
            bSourceLoaded = false;
            bCreateMosaic = false;
            totalRows = void 0;
            currentRow = 0;
            svg = void 0;
            worker = void 0;

            uploadFile = function uploadFile(e) {
                var fileReader = new FileReader();
                var file = e.target.files[0];

                fileReader.onload = loadFile;
                fileReader.readAsDataURL(file);

                var dest = document.querySelector('#mosaicCanvas');
                dest.style.display = 'none';
            };

            loadFile = function loadFile(e) {
                var img = new Image();
                img.onload = function (e) {
                    return drawSrcImage(e.target);
                };
                img.src = e.target.result;
                bSourceLoaded = true;
                bCreateMosaic = false;
                initWorker();
            };

            drawSrcImage = function drawSrcImage(image) {
                var canvas = document.querySelector('#srcCanvas');
                var ctx = canvas.getContext('2d');

                canvas.style.display = 'block';
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
            };

            initWorker = function initWorker() {
                if (window.Worker) {
                    //check if window support workers.
                    worker = new Worker('js/worker.js');

                    worker.addEventListener('message', function (e) {
                        return drawComputedRow(e);
                    }, false);
                }
            };

            createMosaic = function createMosaic() {
                if (!bSourceLoaded) alert("Source image is not loaded");
                if (bCreateMosaic) alert("Mosaic is being generated. Please wait!!!");
                bCreateMosaic = true;

                var src = document.querySelector('#srcCanvas');
                var dest = document.querySelector('#mosaicCanvas');
                dest.style.display = 'block';

                //Set the size of destination canvas
                dest.width = src.width;
                dest.height = src.height;

                var ctx = dest.getContext('2d');
                // Calculate the no of rows to draw.
                totalRows = Math.floor(src.height / TILE_HEIGHT) - 1;
                currentRow = 0;
                svg = utils.getSVG(src.width, src.height);

                computeNextRow(worker);
            };

            computeNextRow = function computeNextRow(worker) {
                var src = document.querySelector('#srcCanvas');
                var colors = utils.getRowColors(src, currentRow);
                worker.postMessage({ 'cmd': 'getRowSVGs', 'colors': colors, 'row': currentRow });
                currentRow++;
            };

            drawComputedRow = function drawComputedRow(e) {
                var dest = document.querySelector('#mosaicCanvas');
                var ctx = dest.getContext('2d');
                utils.buildElements(e.data.svgs).map(function (element) {
                    return svg.appendChild(element);
                });

                ctx.drawImage(utils.buildImage(svg), 0, e.data.row * TILE_HEIGHT);
                if (currentRow < totalRows) computeNextRow(worker);
            };

            init = function init() {
                document.querySelector('#inputFile').onchange = uploadFile;
                document.querySelector('#createMosaic').onclick = createMosaic;
            };

            init();
        }
    };
});