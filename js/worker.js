// event listener to recieve a message from the main window of post message api
self.addEventListener('message', function(e){
    if (e.data.cmd === 'getRowSVGs'){
        buildRowSVG(e.data.colors, e.data.row);
    }
}, false);

// function to send message to the main thread once the SVGs are compiled from server
const postRowSVGs = data =>{
    self.postMessage(data);
}

// function for building the object to send to the main thread
const buildRowSVG = (colors, row) => {
    getServerSVGs(colors).then(svgs => {
        postRowSVGs({'svgs': svgs, 'colors': colors, 'row': row})
    })
}
// function to get svg data from server and return promises.
const getServerSVGs = (colors) => {
    const options = {method: 'GET', 
                     headers: new Headers({'Content-Type': 'image/svg+xml'}), 
                     mode: 'cors', 
                     cache: 'default'}
    
    return Promise.all(getUrlArray(colors, colors.length-1)
                       .map(url => fetch(url, options)
                                        .then(response => response.text())
                                        .then(data => data)
        )
    )
}
// function to get url array of all the colors in a row.
const getUrlArray = (colors, len) => {
    const color = colors[len]

    if(len > 0) {
        return  [ getColorURL(color)
                , ...getUrlArray(colors, len - 1)
                ]
    }
    else {
        return [ getColorURL(color) ];
    }
}
// function to get a color url for the color code provided
const getColorURL = (color) => {
    const colorCode = color.split('#')[1];
    const url = 'http://localhost:8765/color/' + (colorCode.length === 6 ? colorCode : '000000');
    return url;
}