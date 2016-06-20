'use strict';

angular.module('bulbs.cms.editorial.sendToEditorButton', [
  'bulbs.cms.editorial.sendToEditorModal'
])
  .controller('SendToEditorButtonCtrl', [
    '$scope', '$modal', 'moment', 'routes', 'TIMEZONE_NAME',
    function ($scope, $modal, moment, routes, TIMEZONE_NAME) {
      $scope.TIMEZONE_LABEL = moment.tz(TIMEZONE_NAME).format('z');

      $scope.sendToEditorModal = function (article) {
        return $modal.open({
          templateUrl: routes.COMPONENTS_URL + 'editorial/send-to-editor-modal.html',
          controller: 'SendtoeditormodalCtrl',
          scope: $scope,
          resolve: {
            article: function(){ return article; }
          }
        });
      };

      $scope.getStatus = function (article) {
        if(!article || !article.published){
          return 'unpublished';
        }else if(moment(article.published) > moment()){
          return 'scheduled';
        }else{
          return 'published';
        }
      };
    }
  ]);
