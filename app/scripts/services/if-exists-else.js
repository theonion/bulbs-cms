'use strict';

angular.module('bulbsCmsApp')
  .service('IfExistsElse', function IfExistsElse($window, $http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.ifExistsElse = function (resourceUrl, propertiesToValues, existsCbk, elseCbk, errorCbk) {
      //another place where I need to figure out promises and make this way better
      $http({
        url: resourceUrl,
        method: 'GET'
      }).success(function (data) {
        var resList = data.results || data;
        var allFieldsMatch;
        for (var j in resList) {
          allFieldsMatch = true;
          for (var property in propertiesToValues) {
            //console.log("property: " + property)
            if (resList[j][property] !== propertiesToValues[property]) {
              //console.log(resList[j][property] + " != " + propertiesToValues[property])
              allFieldsMatch = false;
              break;
            }
          }
          if (allFieldsMatch) {
            existsCbk(resList[j]);
            return;
          }
        }
        elseCbk(propertiesToValues);
      }).error(errorCbk);
    };
  });
