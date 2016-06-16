'use strict';

angular.module('sections.list', [
  'apiServices.section.factory',
  'bulbs.cms.config',
  'bulbsCmsApp.settings',
  'listPage',
  'sections.settings'
])
  .config(function ($injector, $routeProvider, CmsConfigProvider) {
    var CmsConfig = $injector.invoke(CmsConfigProvider.$get);

    $routeProvider
      .when('/cms/app/section/', {
        controller: function ($scope, $window, SECTIONS_LIST_REL_PATH, Section) {
          $window.document.title = CmsConfig.getCmsName() + ' | Section';
          $scope.modelFactory = Section;
          $scope.LIST_URL = CmsConfig.buildExternalUrl(SECTIONS_LIST_REL_PATH);
        },
        templateUrl: CmsConfig.buildComponentPath('sections/sections-list/sections-list-page.html')
      });
  });
