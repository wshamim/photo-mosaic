'use strict';

System.register([], function (_export, _context) {
    "use strict";

    var getAvgRGB, rgbToHex, getRowColors, getSVG, buildElements, buildElement, buildImage;
    return {
        setters: [],
        execute: function () {
            getAvgRGB = function getAvgRGB(imgData) {
                var len = imgData.data.length,
                    blockSize = 5,
                    //only visit 5 x 4 pixels 
                rgb = { r: 0, g: 0, b: 0 };
                var i = -4,
                    count = 0;
                while ((i += blockSize * 4) < len) {
                    ++count;
                    rgb.r += imgData.data[i];
                    rgb.g += imgData.data[i + 1];
                    rgb.b += imgData.data[i + 2];
                }

                rgb.r = Math.floor(rgb.r / count);
                rgb.g = Math.floor(rgb.g / count);
                rgb.b = Math.floor(rgb.b / count);

                return rgb;
            };

            rgbToHex = function rgbToHex(rgb) {
                return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
            };

            _export('getRowColors', getRowColors = function getRowColors(canvas, row) {
                var ctx = canvas.getContext('2d');
                var columns = Math.floor(canvas.width / TILE_WIDTH);

                return Array.from(Array(columns).keys()).map(function (column) {
                    return rgbToHex(getAvgRGB(ctx.getImageData(column * TILE_WIDTH, row * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT)));
                }).reverse();
            });

            _export('getSVG', getSVG = function getSVG(width, height) {
                var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("width", width);
                svg.setAttribute("height", height);
                return svg;
            });

            _export('buildElements', buildElements = function buildElements(svgs) {
                return svgs.map(function (element) {
                    return new DOMParser().parseFromString(element, "text/xml").querySelector('ellipse');
                }).map(function (ellipse, index) {
                    return buildElement(ellipse, index);
                });
            });

            buildElement = function buildElement(element, dx) {
                var newElement = element.cloneNode(true);
                newElement.setAttribute('cx', TILE_WIDTH / 2 + TILE_WIDTH * dx);
                newElement.setAttribute('cy', TILE_HEIGHT / 2);
                newElement.setAttribute('rx', TILE_WIDTH / 2);
                newElement.setAttribute('ry', TILE_HEIGHT / 2);

                return newElement;
            };

            _export('buildImage', buildImage = function buildImage(svg) {
                var xml = new XMLSerializer().serializeToString(svg);
                var svg64 = btoa(xml);
                var b64Start = 'data:image/svg+xml;base64,';
                var image64 = b64Start + svg64;
                var img = new Image();
                img.src = image64;
                return img;
            });

            _export('getRowColors', getRowColors);

            _export('getSVG', getSVG);

            _export('buildElements', buildElements);

            _export('buildImage', buildImage);
        }
    };
});