'use strict';

angular.module('bulbsCmsApp')
  .factory('CmsNotificationsApi', function ($q, ContentApi) {
    return ContentApi.service('notifications');
  });