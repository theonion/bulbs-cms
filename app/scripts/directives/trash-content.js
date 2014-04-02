'use strict';

angular.module('bulbsCmsApp')
  .directive('trashContent', function ($http, $, PARTIALS_URL) {
    return {
      restrict: 'E',
      templateUrl:  PARTIALS_URL + 'trash-content.html',
      link: function (scope, elem, attrs) {
        //note: define trashSuccessCbk() in whatever controller this directive gets used in.
        scope.trashContent = function (idOrConfirmed) {
          if (idOrConfirmed === true) {
            $('#trash-confirm-button').html('<i class="fa fa-refresh fa-spin"></i> Trashing');
            $http({
              'method': 'POST',
              'url': '/cms/api/v1/content/' + scope.articleIdToTrash + '/trash/'
            }).success(function (data) {
              scope.trashSuccessCbk();
            }).error(function (data, status, headers, config) {
              if (status === 404) {
                scope.trashSuccessCbk();
              } else if (status === 403) {
                scope.showLoginModal();
              } else {
                $('#trash-confirm-button').html('<i class="fa fa-frown-o" style="color:red"></i> Error!');
              }
            });
          } else {
            scope.articleIdToTrash = idOrConfirmed;
            $('#confirm-trash-modal').modal('show');
          }
        };
      }
    };
  });
