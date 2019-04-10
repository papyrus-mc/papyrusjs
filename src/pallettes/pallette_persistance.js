function Pallette_Persistance()
{
    keys = [ ];
};

Pallette_Persistance.put = function put ( key, name, val )
{
    keys[ key ] = {
        name: name,
        key : key
    }
};

module.exports = Pallette_Persistance;