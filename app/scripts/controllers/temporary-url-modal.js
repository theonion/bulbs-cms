'use strict';

angular.module('bulbsCmsApp')
  .value('ARTICLE_TEMPORARY_URL_DAYS_VALID', 7)
  .value('ARTICLE_TEMPORARY_URL_BASE', 'http://0.0.0.0:9069/unpublished/')
  .controller('TemporaryUrlModalCtrl', function ($scope, $routeParams, ContentApi, ARTICLE_TEMPORARY_URL_DAYS_VALID,
                                                 ARTICLE_TEMPORARY_URL_BASE) {

    var content = ContentApi.one('content', $routeParams.id);

    $scope.TEMP_LINK_DAYS_VALID = ARTICLE_TEMPORARY_URL_DAYS_VALID;
    $scope.TEMP_URL_BASE = ARTICLE_TEMPORARY_URL_BASE;

    $scope.tokens = [];
    content.getList('list_tokens').then(function (tokenList) {
      $scope.tokens = tokenList;

      // make dates moments
      _.each($scope.tokens, function (token) {
        token.create_date = moment(token.create_date);
        token.expire_date = moment(token.expire_date);
      });
    });

    $scope.createToken = function () {

      var now = moment();
      ContentApi.one('content', $routeParams.id).post('create_token', {
        'create_date': now,
        'expire_date': now.clone().add({days: ARTICLE_TEMPORARY_URL_DAYS_VALID})
      }).then(function (token) {
        // make dates moments
        token.create_date = moment(token.create_date);
        token.expire_date = moment(token.expire_date);

        $scope.tokens.unshift(token);
        $scope.newestToken = token;
      });

    };

  });