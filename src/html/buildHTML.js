const fs = require( 'fs' );
const path = require( 'path' );

module.exports = function( outPath, zoomLevelDefault, zoomLevelMax, posX, posZ ) {

    
    fs.writeFileSync( path.normalize( outPath + '/index.html' ), { encoding: 'utf8' },
    `<html>
    <head>
        <title>papyrus.js Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.4.0/dist/leaflet.css"
        integrity="sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA=="
        crossorigin=""/>
        <style>
            #mapid { width: 100%; height: 100%; }
        </style>
    </head>
    <body>
        <script src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"
        integrity="sha512-QVftwZFqvtRNi0ZyCtsznlKSWOStnDORoefr1enyq5mVL4tmKB3S/EnC3rRJcxCPavG10IcrVGSmPh6Qw5lwrg=="
        crossorigin=""></script>
        <div id="mapid"></div>
        <script>
            var papyrusMap = L.map('mapid').setView([` + posX + `, ` + posZ + `], ` + zoomLevelDefault + `);
            L.tileLayer('./map/{z}/{x}/{y}.png', {
                attribution: 'Map created with <a href="http://papyrus.clarkx86.com">papyrus.js</a>',
                maxZoom: ` + zoomLevelMax + `,
            }).addTo(mymap);
        </script>
    </body>
    </html>` )
}