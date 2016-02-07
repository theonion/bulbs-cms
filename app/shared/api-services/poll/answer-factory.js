'use strict';

angular.module('apiServices.answer.factory', [
  'apiServices',
  'ngResource'
])
  .factory('Answer', function ($resource) {
    return $resource('/cms/api/v1/answer/');
  });
