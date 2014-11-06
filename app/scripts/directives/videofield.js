'use strict';

angular.module('bulbsCmsApp')
  .directive('videoField', function (Zencoder, routes) {
    return {
      templateUrl: routes.PARTIALS_URL + 'video-field.html',
      restrict: 'E',
      scope: {
        article: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.removeVideo = function () {
          scope.article.video = null;
        };

        scope.uploadVideo = function () {
          Zencoder.onVideoFileUpload().then(
            function (success) {
              console.log(success);
              scope.article.video = success.attrs.id;
            },
            angular.noop,
            function (progress) {
              console.log(progress);
              scope.uploadProgress = progress;
            }
          );
        };

        scope.thumbnailModal = function () {
          Zencoder.openVideoThumbnailModal(scope.article.video).result.then(
            function (resolve) {
              console.log('thumbnail modal resolve');
              console.log(resolve);
              //article.poster_url = resolve;
            },
            function (reject) {
              console.log('thumbnail modal rejected');
            }
          );
        };
      }
    };
  });
