'use strict';

angular.module('bulbsCmsApp')
  .factory('CmsNotificationsApi', function (ContentApi) {
    return ContentApi.service('notifications');
  });