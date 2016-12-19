
angular.module('bulbs.cms.liveBlog.responses', [
  'OnionEditor',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'confirmationModal'
])
  .directive('liveBlogResponses', [
    'CmsConfig', 'Utils',
    function (CmsConfig, Utils) {

      return {
        link: function (scope, element) {

          scope.clearError = function () {
            scope.errorMessage = '';
          };

          var panelOpen = {};
          scope.isPanelOpen = function (response) {
            if (angular.isUndefined(panelOpen[response.id])) {
              panelOpen[response.id] = true;
            }
            return panelOpen[response.id];
          };
          scope.togglePanel = function (response) {
            panelOpen[response.id] = !panelOpen[response.id];
          };
          scope.collapseAll = function () {
            scope.entry.responses.forEach(function (response) {
              panelOpen[response.id] = false;
            });
          };
          scope.expandAll = function () {
            scope.entry.responses.forEach(function (response) {
              panelOpen[response.id] = true;
            });
          };

          var responseForm = 'responseForm_';

          scope.wrapperForm = {};
          scope.makeResponseFormName = function (response) {
            return responseForm + response.id;
          };
          scope.getResponseForm = function (response) {
            var name = scope.makeResponseFormName(response);

            if (scope.wrapperForm[name]) {
              return scope.wrapperForm[name];
            }
            scope.wrapperForm[name] = {};
            return scope.wrapperForm[name];
          };
          scope.isEntryFormSaveDisabled = function (response) {
            return scope.transactionsLocked() || scope.getResponseForm(response).$pristine;
          };

          var lock = Utils.buildLock();
          scope.transactionsLocked = lock.isLocked;

        },
        restrict: 'E',
        scope: {
          entry: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'live-blog',
          'live-blog-responses',
          'live-blog-responses.html'
        )
      };
    }
  ]);

