'use strict';

angular.module('bulbsCmsApp')
  .value('ARTICLE_TEMPORARY_URL_DAYS_VALID', 7)
  .controller('TemporaryUrlModalCtrl', function ($scope, $routeParams,
      CmsConfig, ContentFactory, ARTICLE_TEMPORARY_URL_DAYS_VALID, _, moment) {

    var content = ContentFactory.one('content', $routeParams.id);

    $scope.TEMP_LINK_DAYS_VALID = ARTICLE_TEMPORARY_URL_DAYS_VALID;
    $scope.TEMP_URL_BASE = CmsConfig.buildUnpublishedUrl();

    $scope.tokens = [];
    content.getList('list_tokens').then(function (tokenList) {
      $scope.tokens = tokenList;

      // make dates moments
      var expiredIndicies = [];
      _.each($scope.tokens, function (token, i) {
        token.create_date = moment(token.create_date);
        token.expire_date = moment(token.expire_date);

        if (moment().isAfter(token.expire_date)) {
          // keep track of expired tokens for later removal
          expiredIndicies.push(i);
        } else {
          // this is not expired, keep track of day diff
          token.daysTillExpire = token.expire_date.diff(moment(), 'days') + 1;
        }
      });

      // remove expired tokens from list, done this way so objects remain restangularized
      for (var i = expiredIndicies.length - 1; i >= 0; i--) {
        $scope.tokens.splice(expiredIndicies[i], 1);
      }
    });

    $scope.createToken = function () {

      var now = moment();
      ContentFactory.one('content', $routeParams.id).post('create_token', {
        'create_date': now,
        'expire_date': now.clone().add({days: ARTICLE_TEMPORARY_URL_DAYS_VALID})
      }).then(function (token) {
        // make dates moments
        token.create_date = moment(token.create_date);
        token.expire_date = moment(token.expire_date);
        token.daysTillExpire = token.expire_date.diff(moment(), 'days') + 1;

        $scope.tokens.push(token);
        $scope.newestToken = token;
      });

    };

  });
