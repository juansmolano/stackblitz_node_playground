'use strict';

module.exports = {
    accessObjectPropertyByString: (obj, propertyStringPath) => {
        propertyStringPath = propertyStringPath.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        propertyStringPath = propertyStringPath.replace(/^\./, '');           // strip a leading dot
        var fieldPath = propertyStringPath.split('.');
        for (var i = 0, n = fieldPath.length; i < n; ++i) {
            var k = fieldPath[i];
            if (k in obj) {
                obj = obj[k];
            } else {
                return;
            }
        }
        return obj;
    },
    setObjectPropertyByString: (obj, propertyStringPath, valueToSet) => {
        propertyStringPath = propertyStringPath.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        propertyStringPath = propertyStringPath.replace(/^\./, '');           // strip a leading dot
        var fieldPath = propertyStringPath.split('.');
        for (var i = 0, n = fieldPath.length; i < n; ++i) {
            var k = fieldPath[i];
            if (k in obj) {
                if (i === fieldPath.length - 1) {
                    obj[k] = valueToSet;
                    return true;
                }
                obj = obj[k];
            } else {
                return false;
            }
        }
    }
};