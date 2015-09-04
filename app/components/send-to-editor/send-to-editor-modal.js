'use strict';

angular.module('sendToEditor.modal', [
  'cms.config',
  'sendToEditor.config',
  'ui.bootstrap.modal'
])
  .controller('SendToEditorModal',
    ['$scope', '$http', '$modalInstance', 'CmsConfig', 'SendToEditorConfig', 'moment', 'TIMEZONE_NAME',
    function ($scope, $http, $modalInstance, CmsConfig, SendToEditorConfig, moment, TIMEZONE_NAME) {

      $scope.TIMEZONE_LABEL = moment.tz(TIMEZONE_NAME).format('z');
      $scope.getStatus = function (article) {
        if(!article || !article.published){
          return 'unpublished';
        }else if(moment(article.published) > moment()){
          return 'scheduled'
        }else{
          return 'published';
        }
      };

      $scope.confirm = function () {
        $scope.$close();
        $scope.modalOnOk();
      };

      $scope.cancel = function () {
        $scope.$dismiss();
        $scope.modalOnCancel();
      };

      $scope.buttonConfig = {
        idle: 'Send',
        busy: 'Sending',
        finished: 'Sent!',
        error: 'Error!'
      };

      $scope.articleStatuses = SendToEditorConfig.getArticleStatuses();;
      $scope.status = $scope.articleStatuses[0];

      $scope.sendToEditor = function (article) {
        var statusText = null;
        if ($scope.status !== $scope.articleStatuses[0]) {
          statusText = $scope.status;
        }
        return $http({
          url: CmsConfig.buildBackendApiUrl('content/' + article.id + '/send/'),
          method: 'POST',
          data: {
            notes: $scope.noteToEditor,
            status: statusText
          }
        }).success(function (data) {
          $scope.publishSuccessCbk({article: article, response: data});
          $modalInstance.close();
        }).error(function (error, status) {
          $modalInstance.dismiss();
        });
      };
    }
  ])
  .factory('SendToEditorModal', [
    '$modal', 'COMPONENTS_URL',
    function ($modal, COMPONENTS_URL) {

      var SponsoredContentModal = function (scope) {
        return (function (scope) {
          $modal
            .open({
              controller: 'SendToEditorModal',
              scope: scope,
              templateUrl: COMPONENTS_URL + 'send-to-editor/send-to-editor-modal.html'
            });
        })(scope);
      };

      return SponsoredContentModal;
    }
  ]);
