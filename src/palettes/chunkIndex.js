module.exports = function() {

    this.put = function( xz, chunk ) {
        xz: chunk;
    };

    this.get = function( ID ) {
        /*
        if ( keys[ ID ] === undefined ) {
            console.log( '[WARNING] Palette ID out of bounds!\t' + ID + '\t:\t' + keys.length );
            return keys[ 0 ];
        } else {
            return keys[ ID ];
        };
        */
        
        return keys[ ID ];
    };
};