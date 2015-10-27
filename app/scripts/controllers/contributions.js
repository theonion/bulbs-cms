'use strict';

angular.module('bulbsCmsApp')
  .controller('ContributionsCtrl', function ($scope, $routeParams, $http, $window,
    $location, $timeout, $compile, $q, $modal, _, ContributionRoleService, ContentService,
    CmsConfig)
  {

    $scope.NAV_LOGO = CmsConfig.getLogoUrl();
    $scope.contentId = parseInt($routeParams.id, 10);
    $scope.paymentType = '';
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

    $scope.isFlatRate = function(contribution) {
      if (contribution.hasOwnProperty('roleObject')) {
        if (contribution.roleObject.payment_type === 'Flat Rate'){
          return true;
        }
      }

      return false;
    };

    $scope.isFeatureType = function(contribution) {
      if (contribution.hasOwnProperty('roleObject')) {
        if (contribution.roleObject.payment_type === 'FeatureType'){
          $scope.setFeatureRate(contribution);
          return true;
        }
      }

      return false;
    };

    $scope.setFeatureRate = function(contribution) {
      for (var i in contribution.roleObject.rates.feature_type) {
        var featureTypeRate = contribution.roleObject.rates.feature_type[i];
        if ($scope.content.feature_type === featureTypeRate.feature_type) {
          contribution.featureTypeRate = featureTypeRate.rate;
        }
      }
    };

    $scope.isHourly = function(contribution) {
      if (contribution.hasOwnProperty('roleObject')) {
        if (contribution.roleObject.payment_type === 'Hourly') {
          return true;
        }
      }

      return false;
    };

    $scope.isManual = function(contribution) {
      if (contribution.hasOwnProperty('roleObject')) {
        if (contribution.roleObject.payment_type === 'Manual') {
          return true;
        }
      }

      return false;
    };

    $scope.getHourlyPay = function (contribution) {
      if (contribution.roleObject) {
        if (!contribution.roleObject.rate) {
          return 0;
        }
        return ((contribution.roleObject.rate/60) * (contribution.minutes_worked || 0));
      }
    };

    function save() {
      // I know, I'm not supposed to do DOM manipulation in controllers. TOO BAD.
      angular.element('#save-btn').html('<i class="fa fa-refresh fa-spin"></i> Saving');
      $scope.contributions.save($scope.contributions).then(function (contributions) {
        angular.element('#save-btn').addClass('btn-success').removeClass('btn-danger');
        angular.element('#save-btn').html('<i class="fa fa-floppy-o"></i> Save</button>');
        $scope.clean = true;
      }, function(res) {
        angular.element('#save-btn').addClass('btn-danger').removeClass('btn-success');
        angular.element('#save-btn').html('<i class="fa fa-times"></i> Error</button>');
      });
    }

    function add() {
      $scope.contributions.push({
        contributor: null,
        content: $scope.contentId,
        rate: {
          rate: 0
        },
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
          } else {

            if ((contributions[i].hasOwnProperty('rate')) &&
                (typeof(contributions[i].rate) === 'object') &&
                (contributions[i].rate !== null)) {
              contributions[i].rate = contributions[i].rate.rate;
            }

            if (typeof(contributions[i].role) === 'object') {
              contributions[i].paymentType = contributions[i].role.payment_type;
              contributions[i].roleObject = contributions[i].role;
              contributions[i].role = contributions[i].role.id;
            }
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

        $scope.contributions[index].roleObject = role;
        $scope.contributions[index].paymentType = role.payment_type;
        return role.id === $scope.contributions[index].role;
      }).name;
    }

    getRoles();
    getContent();

  });
