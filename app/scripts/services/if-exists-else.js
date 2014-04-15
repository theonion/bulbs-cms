'use strict';

angular.module('bulbsCmsApp')
  .service('IfExistsElse', function IfExistsElse($window, $http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.ifExistsElse = function (restQ, propertiesToValues, existsCbk, elseCbk, errorCbk) {
      //another place where I need to figure out promises and make this way better
      restQ.then(function (data) {
        var resList = data.results || data;
        for (var j = 0; j < resList.length; j++) {
          var allFieldsMatch = true;
          var datum = resList[j];
          for (var property in propertiesToValues) {
            if (!datum.hasOwnProperty(property)) {
              allFieldsMatch = false;
              break;
            }
            //console.log("property: " + property)
            if (datum[property] !== propertiesToValues[property]) {
              //console.log(resList[j][property] + " != " + propertiesToValues[property])
              allFieldsMatch = false;
              break;
            }
          }
          if (allFieldsMatch) {
            existsCbk(datum);
            return;
          }
        }
        elseCbk(propertiesToValues);
      }).catch(errorCbk);
    };
  });
