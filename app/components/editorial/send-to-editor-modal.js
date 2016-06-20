'use strict';

angular.module('bulbs.cms.editorial.sendToEditorModal', [])
  .controller('SendtoeditormodalCtrl', [
    '$scope', '$http', '$modalInstance', 'EditorItems', 'Login', 'article',
    function ($scope, $http, $modalInstance, EditorItems, Login, article) {
      // see http://stackoverflow.com/questions/18716113/scope-issue-in-angularjs-using-angularui-bootstrap-modal
      $scope.articleStatus = {};

      $scope.buttonConfig = {
        idle: 'Send',
        busy: 'Sending',
        finished: 'Sent!',
        error: 'Error!'
      };

      $scope.articleStatuses = [
        '- Article Status -',
        'Needs First Pass',
        'Needs Final Edit',
        'Needs Copy Edit',
        'Ready to Publish'
      ];

      $scope.sendToEditor = function (article) {
        var status, note, noteToEditor;

        noteToEditor = $scope.noteToEditor || 'No note attached';

        // Leaving most of the hacks here in the temporary code
        // until we figure out a more permanent solution
        if ($scope.articleStatus.s !== $scope.articleStatuses[0]) {
          status = $scope.articleStatus.s;
          note = 'Status: ' + $scope.articleStatus.s + '\n\n' + noteToEditor;
        } else {
          status = '';
          note = 'Status: N/A' + '\n\n' + noteToEditor;
        }

        return $http({
          url: '/cms/api/v1/content/' + article.id + '/send/',
          method: 'POST',
          data: {
            notes: note,
            status: status
          }
        }).success(function (data) {
          EditorItems.getItems(article.id);
          $scope.publishSuccessCbk({article: article, response: data});
          $modalInstance.close();
        }).error(function (error, status, data) {
          if(status === 403) {
            Login.showLoginModal();
          }
          $modalInstance.dismiss();
        });
      };
    }
  ]);
