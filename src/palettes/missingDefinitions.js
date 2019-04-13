// FOR DEBUGGING

module.exports = function() {

    var cache = { }

    this.save = function( name ) {
        cache[ JSON.stringify( { name: name } ) ] = name;
    };

    this.list = function() {
        return cache;
    };

    // return chunkLayer;
};