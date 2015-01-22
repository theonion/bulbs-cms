'use strict';

angular.module('bulbsCmsApp')
  .controller('ContributionsCtrl', function (
    $scope, $routeParams, $http, $window,
    $location, $timeout, $compile, $q, $modal,
    _, routes, ContributionRoleService, ContentService)
  {

    $scope.NAV_LOGO = routes.NAV_LOGO;
    $scope.contentId = parseInt($routeParams.id, 10);
    $scope.contributions = [];
    $scope.contributionLabels = [];
    $scope.roles = [];
    $scope.collapsed = [];
    $scope.page = 'contributions';

    $scope.clean = true;

    $scope.save = save;
    $scope.add = add;
    $scope.remove = remove;
    $scope.updateLabel = updateLabel;

    function save() {
      // I know, I'm not supposed to do DOM manipulation in controllers. TOO BAD.
      angular.element('#save-btn').html('<i class="glyphicon glyphicon-refresh fa-spin"></i> Saving');
      $scope.contributions.save($scope.contributions).then(function (contributions) {
        angular.element('#save-btn').addClass('btn-success').removeClass('btn-danger');
        angular.element('#save-btn').html('<i class="glyphicon glyphicon-floppy-disk"></i> Save</button>');
        $scope.clean = true;
      }, function(res) {
        angular.element('#save-btn').addClass('btn-danger').removeClass('btn-success');
        angular.element('#save-btn').html('<i class="glyphicon glyphicon-remove"></i> Error</button>');
      });
    }

    function add() {
      $scope.contributions.push({
        contributor: null,
        content: $scope.contentId,
        role: null
      });
      $scope.collapsed.push(false);
    }

      $scope.$watch('contributions', function(newContributions, oldContributions) {
        if (oldContributions.length > 0) {
          $scope.clean = false;
        }
      }, true);

    function getRoles() {
      return ContributionRoleService.getList().then(function (roles) {
        $scope.roles = roles;
        getContributions();
      });
    }

    function getContributions() {
      return ContentService.one($scope.contentId).all('contributions').getList().then(function (contributions) {
        for (var i in contributions) {
          if (contributions[i] === null || contributions[i].role === undefined) {
            continue;
          }
        }
        $scope.contributions = contributions;
        $scope.collapsed = new Array(contributions.length);
        $scope.contributions.forEach(function (item, index) {
          $scope.contributionLabels[index] = _.find($scope.roles, function (role) {
            return role.id === item.role;
          }).name;
          $scope.collapsed[index] = true;
        });
      });
    }

    function getContent() {
      ContentService.one($scope.contentId).get().then(function (content) {
        $scope.content = content;
        $scope.article = {
          id: content.id
        };
      });
    }

    function remove(index) {
      $scope.contributions.splice(index, 1);
      $scope.collapsed.splice(index, 1);
    }

    function updateLabel(index) {
      $scope.contributionLabels[index] = _.find($scope.roles, function (role) {
        return role.id === $scope.contributions[index].role;
      }).name;
    }

    getRoles();
    getContent();

  });
