'use strict';

angular.module('bulbsCmsApp')
  .controller('ContentlistCtrl', function (
    $scope, $http, $timeout, $location,
    $window, $q, $, ContentApi,
    LOADING_IMG_SRC, routes)
  {
    $scope.LOADING_IMG_SRC = LOADING_IMG_SRC;
    //set title
    $window.document.title = routes.CMS_NAMESPACE + ' | Content';

    $scope.pageNumber = $location.search().page || '1';
    $scope.myStuff = false;
    $scope.search = $location.search().search;
    $scope.collapse = {};

    var getContentCallback = function (data) {
        $scope.articles = data;
        $scope.totalItems = data.metadata.count;
      };

    $scope.getContent = function (params, merge) {
        params = params || {};
        if (merge) {
          var curParams = $location.search();
          params = $.extend(true, curParams, params);
        }

        $location.search(params);
        $scope.pageNumber = $location.search().page || '1';

        ContentApi.all('content').getList(params)
          .then(getContentCallback);
      };

    $scope.getContent();

    $scope.goToPage = function () {
        $scope.getContent({'page': $scope.pageNumber}, true);
      };

    $scope.publishSuccessCbk = function (data) {
        var i;
        for (i = 0; i < $scope.articles.length; i++) {
          if ($scope.articles[i].id === data.article.id) {
            break;
          }
        }

        for (var field in data.response) {
          $scope.articles[i][field] = data.response[field];
        }

        return $q.when();
      };

    $scope.trashSuccessCbk = function () {
        $timeout(function () {
            $scope.getContent();
            $('#confirm-trash-modal').modal('hide');
          }, 1500);
      };

    $('body').on('shown.bs.collapse', '.panel-collapse', function (e) {
      $scope.$digest();
    });

  })
  .directive('ngConfirmClick', [ // Used on the unpublish button
    function () {
      return {
        link: function (scope, element, attr) {
          var msg = attr.ngConfirmClick || 'Are you sure?';
          var clickAction = attr.confirmedClick;
          element.bind('click', function () {
            if (window.confirm(msg)) {
              scope.$eval(clickAction);
            }
          });
        }
      };
    }
  ]);
