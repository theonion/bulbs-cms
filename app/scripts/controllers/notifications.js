'use strict';

angular.module('bulbsCmsApp')
  .controller('NotificationsCtrl', function ($window, routes) {

    // set title
    $window.document.title = routes.CMS_NAMESPACE + ' | Notifications';


  });