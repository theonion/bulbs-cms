'use strict';

angular.module('sections.edit.directive', [
  'apiServices.section.factory',
  'BettyCropper',
  'bulbsCmsApp.settings',
  'copyButton',
  'customSearch',
  'saveButton.directive',
  'sections.settings',
  'topBar'
])
  .directive('sectionsEdit', function (routes) {
    return {
      controller: function ($location, $q, $scope, EXTERNAL_URL,
          SECTIONS_LIST_REL_PATH, Section) {

        $scope.LIST_URL = EXTERNAL_URL + SECTIONS_LIST_REL_PATH;

        $scope.needsSave = false;

        var modelId = $scope.getModelId();
        if (modelId === 'new') {
          // this is a new section, build it
          $scope.model = Section.$build();
          $scope.isNew = true;
        } else {
          // this is an existing special coverage, find it
          $scope.model = Section.$find($scope.getModelId());
        }

        $scope.saveModel = function () {
          var promise;

          if ($scope.model) {
            // have model, use save promise as deferred
            promise = $scope.model.$save().$asPromise().then(function (data) {
              if (modelId === 'new') {
                $location.path('/cms/app/section/edit/' + data.id + '/');
              }
              $scope.isNew = false;
              $scope.needsSave = false;
            });
          } else {
            // no model, this is an error, defer and reject
            var deferred = $q.defer();
            deferred.reject();
            promise = deferred.promise;
          }

          return promise;
        };
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: routes.COMPONENTS_URL + 'sections/sections-edit/sections-edit.html'
    };
  });
