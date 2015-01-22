'use strict';

angular.module('bulbsCmsApp')
  .factory('CmsNotificationsApi', function ($q, ContentFactory) {
    return ContentFactory.service('notifications');
  });
