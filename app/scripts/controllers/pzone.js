'use strict';

angular.module('bulbsCmsApp')
  .controller('PzoneCtrl', function ($scope, $http, $window, $, ContentApi, PromotionApi, routes) {
    //set title
    $window.document.title = routes.CMS_NAMESPACE + ' | Pzone Editor';

    function getPzone() {
      PromotionApi.one('pzone/' + $scope.pzoneName).get()
        .then(function (data) {
          $scope.pzone = data;
        })
        .catch(function (data) {
          console.log('Zone does not exist.');
        });
    }

    $scope.pzoneName = 'homepage-one';
    $scope.newContentId = null;
    $scope.$watch('pzoneName', function () {
      getPzone();
    });

    $scope.typeChanged = function () {
      console.log('Type changed!');
      if ($scope.pzone !== undefined) {
        $scope.pzone.data = {};
      }
    };

    var getContentCallback = function (data) {
      $scope.articles = data;
      $scope.totalItems = data.metadata.count;
    };
    $scope.getContent = function () {
      ContentApi.getList('content').then(getContentCallback);
    };
    $scope.getContent();

    $scope.getPZoneTemplate = function () {
      return routes.PARTIALS_URL + 'pzones/' + $scope.pzone.zone_type + '.html';
    };

    $scope.remove = function (contentId) {
      var index = $scope.pzone.data.content_ids.indexOf(contentId);
      if (index !== -1) {
        $scope.pzone.data.content_ids.splice(index, 1);
      }
    };

    $scope.add = function (prepend) {
      if ($scope.pzone.data.content_ids === undefined) {
        $scope.pzone.data.content_ids = [];
      }
      if (prepend && $scope.newContentIdPrepend) {
        $scope.pzone.data.content_ids.unshift($scope.newContentIdPrepend);
      } else if ($scope.newContentId) {
        $scope.pzone.data.content_ids.push($scope.newContentId);
      }
      $scope.newContentId = null;
      $scope.newContentIdPrepend = null;
    };

    $scope.save = function () {
      $('#save-pzone-btn').html('<i class="fa fa-refresh fa-spin"></i> Saving');
      var pzone = ContentApi.restangularizeElement(null, $scope.pzone, 'pzone/' + $scope.pzoneName);
      pzone.put()
        .then(function (data) {
          $('#save-pzone-btn').html('<i class="fa fa-check" style="color:green"></i> Saved!');
          window.setTimeout(function () {
            $('#save-pzone-btn').html('Save');
          }, 2000);
        })
        .catch(function (data) {
          $('#save-pzone-btn').html('<i class="fa fa-frown" style="color:red"></i> Saved!');
          window.setTimeout(function () {
            $('#save-pzone-btn').html('Save');
          }, 2000);
        });
    };
  });
