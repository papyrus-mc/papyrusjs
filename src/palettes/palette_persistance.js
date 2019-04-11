module.exports = function() {
    var keys = [ ];

    this.put = function( ID, name, val) {
        keys[ ID ] = {
            name: name,
            val : val
        };
    };

    this.get = function( ID ) {
        /*
        if ( keys[ ID ] === undefined ) {
            console.log( '[ERROR] Requested Palette ID\t' + ID + '\tbut only has\t' + keys.length + '\tentries.' );
            return keys[ 0 ];
        } else {
            return keys[ ID ];
        };
        */
        return keys[ ID ];
    };
};