'use strict';

angular.module('bulbsCmsApp')
  .controller('ContentlistCtrl', function (
    $scope, $http, $timeout, $location,
    $window, $q, $, ContentListService,
    LOADING_IMG_SRC, routes)
  {
    $scope.contentData = [];
    ContentListService.$updateContent({page: 1})
      .then(function (data) {
        $scope.contentData = data;
      });

    $scope.LOADING_IMG_SRC = LOADING_IMG_SRC;
    //set title
    $window.document.title = routes.CMS_NAMESPACE + ' | Content';

    $scope.pageNumber = $location.search().page || '1';
    $scope.myStuff = false;
    $scope.search = $location.search().search;
    $scope.collapse = {};

    $scope.goToPage = function () {
      ContentListService.$updateContent({page: $scope.pageNumber}, true);
    };

    $scope.publishSuccessCbk = function (data) {
      var i;
      for (i = 0; i < $scope.contentData.content.length; i++) {
        if ($scope.contentData.content[i].id === data.article.id) {
          break;
        }
      }

      for (var field in data.response) {
        $scope.contentData.content[i][field] = data.response[field];
      }

      return $q.when();
    };

    $scope.trashSuccessCbk = function () {
      $timeout(function () {
        ContentListService.$updateContent();
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
