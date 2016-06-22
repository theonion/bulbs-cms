'use strict';

angular.module('bulbs.cms.editorial.sendToEditorButton', [
  'bulbs.cms.editorial.sendToEditorModal',
  'bulbs.cms.site.config'
])
  .controller('SendToEditorButtonCtrl', [
    '$scope', '$modal', 'moment', 'CmsConfig',
    function ($scope, $modal, moment, CmsConfig) {
      $scope.TIMEZONE_LABEL = moment.tz(CmsConfig.getTimezoneName()).format('z');

      $scope.sendToEditorModal = function (article) {
        return $modal.open({
          templateUrl: CmsConfig.buildComponentPath('editorial/send-to-editor-modal.html'),
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
