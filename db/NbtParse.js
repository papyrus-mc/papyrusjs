/**
 * Simple NBT Parser
 * @author clarkx86
 */

const typeIds = {
    TAG_End: 0,
    TAG_Byte: 1,
    TAG_Short: 2,
    TAG_Int: 3,
    TAG_Long: 4,
    TAG_Float: 5,
    TAG_Double: 6,
    TAG_Byte_Array: 7,
    TAG_String: 8,
    TAG_List: 9,
    TAG_Compound: 10,
    TAG_Int_Array: 11,
    TAG_Long_Array: 12
}


function parse(data, callback) {
    var _serialized = {},
        _refStack = [],
        _o = 0,
        _valid = true;

    while (_valid) {
        let _tagId = data.readInt8(_o); _o += 1;
        let _nameLength = 0;
        let _name = "";

        if (_tagId != typeIds.TAG_End) {
            _nameLength = data.readInt16LE(_o); _o += 2;
            _name = data.slice(_o, _o + _nameLength); _o += _nameLength;
        }

        let _value;

        switch (_tagId) {
            case typeIds.TAG_End:
                _refStack.pop();
                _valid = (_refStack.length > 0) ? true : false;
                break;

            case typeIds.TAG_Byte:
                _value = data.readInt8(_o); _o += 1;
                break;

            case typeIds.TAG_Short:
                _value = data.readInt16LE(_o); _o += 2;
                break;

            case typeIds.TAG_Int:
                _value = data.readInt32LE(_o); _o += 4;
                break;

            case typeIds.TAG_Long:
                break;

            case typeIds.TAG_Float:
                break;

            case typeIds.TAG_Double:
                break;

            case typeIds.TAG_Byte_Array:
                break;

            case typeIds.TAG_String:
                let _length = data.readInt16LE(_o); _o += 2;
                _value = data.slice(_o, _o + _length).toString(); _o += _length;
                break;

            case typeIds.TAG_List:
                break;

            case typeIds.TAG_Compound:
                if (_refStack.length == 0) {
                    _serialized[_name] = {};
                    _refStack.push(_serialized[_name]);
                } else {
                    _refStack[_refStack.length-1][_name] = {};
                    _refStack.push(_refStack[_refStack.length-1][_name]);
                }
                break;

            case typeIds.TAG_Int_Array:
                break;

            case typeIds.TAG_Long_Array:
                break;
        }

        // Serialize Tag
        if ((_tagId != typeIds.TAG_End) && (_tagId != typeIds.TAG_Compound)) {
            // console.log(_value);
            _refStack[_refStack.length-1][_name] = _value;
        }
    }

    _serialized["bufferSize"] = _o;
    callback(_serialized);
}

module.exports = { parse };
