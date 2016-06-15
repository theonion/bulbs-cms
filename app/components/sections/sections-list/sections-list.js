'use strict';

angular.module('sections.list', [
  'apiServices.section.factory',
  'bulbs.cms.config',
  'bulbsCmsApp.settings',
  'listPage',
  'sections.settings'
])
  .config(function ($routeProvider, routes) {

    $routeProvider
      .when('/cms/app/section/', {
        controller: function ($scope, $window, CmsConfig, EXTERNAL_URL,
            SECTIONS_LIST_REL_PATH, Section) {
          $window.document.title = CmsConfig.getCmsName() + ' | Section';
          $scope.modelFactory = Section;
          $scope.LIST_URL = EXTERNAL_URL + SECTIONS_LIST_REL_PATH;
        },
        templateUrl: routes.COMPONENTS_URL + 'sections/sections-list/sections-list-page.html'
      });
  });
