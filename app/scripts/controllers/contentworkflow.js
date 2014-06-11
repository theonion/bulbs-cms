'use strict';

angular.module('bulbsCmsApp')
  .controller('ContentworkflowCtrl', function ($scope, $http, $modal, $window, moment, routes, TIMEZONE_LABEL) {
    $scope.TIMEZONE_LABEL = TIMEZONE_LABEL;

    $scope.trashContentModal = function (articleId) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/confirm-trash-modal.html',
        controller: 'TrashcontentmodalCtrl',
        scope: $scope,
        resolve: {
          articleId: function(){ return articleId; }
        }
      });
    };

    $scope.pubTimeModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/choose-date-modal.html',
        controller: 'PubtimemodalCtrl',
        scope: $scope,
        resolve: {
          article: function(){ return article; }
        }
      });
    };

    $scope.sendToEditorModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/send-to-editor-modal.html',
        controller: 'SendtoeditormodalCtrl',
        scope: $scope,
        resolve: {
          article: function(){ return article; }
        }
      });
    };

    $scope.changelogModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/changelog-modal.html',
        controller: 'ChangelogmodalCtrl',
        scope: $scope,
        resolve: {
          article: function(){ return article; }
        }
      });
    };

    $scope.thumbnailModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/thumbnail-modal.html',
        scope: $scope,
        resolve: {
          article: function(){ return article; }
        }
      });
    };

    //deprecated
    $scope.sponsoredContentModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/sponsored-content-modal.html',
        scope: $scope,
        resolve: {
          article: function(){ return article; }
        }
      });
    };

    $scope.sponsorModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/sponsor-modal.html',
        scope: $scope,
        controller: 'SponsormodalCtrl',
        resolve: {
          article: function(){ return article; }
        }
      });
    }

    $scope.versionBrowserModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/version-browser-modal.html',
        controller: 'VersionbrowsermodalCtrl',
        scope: $scope,
        size: 'lg',
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

  });
