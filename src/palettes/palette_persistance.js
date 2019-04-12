module.exports = function( s ) {
    var keys = [ ];

    var paletteSize = s;

    this.put = function( ID, name, val) {
        keys[ ID ] = {
            name: name,
            val : val
        };
    };

    this.get = function( ID ) {
        return keys[ ID ];
    };

    this.size = function() {
        return paletteSize;
    };
};