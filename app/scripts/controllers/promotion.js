'use strict';

angular.module('bulbsCmsApp')
  .controller('PromotionCtrl', function ($scope, $window, $location, $, _, ContentApi, PromotionApi, promo_options, routes) {
    $window.document.title = routes.CMS_NAMESPACE + ' | Promotion Tool'; // set title

    $scope.$watch('pzone', function (pzone) {
      if (pzone && pzone.content && pzone.content.length) {
        $scope.lastSavedPromotedArticles = _.clone(pzone.content.slice(0));
        $scope.promotedArticles = pzone.content.slice(0);
      } else {
        $scope.promotedArticles = [{
          hey_checkthis: true,
          title: 'Nothing Promoted!',
          feature_type: 'Click an article on the right and use \'Insert\''
        }];
      }
    });

    $scope.$watch('promotedArticles', function(){
      if(_.isEqual($scope.promotedArticles, $scope.lastSavedPromotedArticles)){
        $scope.promotedArticlesDirty = false;
      }else{
        $scope.promotedArticlesDirty = true;
      }
    }, true);

    $scope.getPzones = function () {
      ContentApi.all('contentlist').getList()
        .then(function (data) {
          $scope.pzones = data;
          $scope.pzone = data[0];
        })
        .catch(function (data) {
          alert('Content list does not exist.');
        });
    };

    var getContentCallback = function (data) {
      $scope.articles = data;
      $scope.totalItems = data.metadata.count;
    };

    $scope.getContent = function () {
      var params = {published: true};
      var search = $location.search();
      for (var prop in search) {
        if (!search.hasOwnProperty(prop)) {
          continue;
        }
        var val = search[prop];
        if (!val || val === 'false') {
          continue;
        }
        params[prop] = val;
      }
      ContentApi.all('content').getList(params)
        .then(getContentCallback);
    };

    $scope.$on('$viewContentLoaded', function () {
      $scope.getPzones();
      $scope.getContent();
    });

    $scope.articleIsInPromotedArticles = function (id) {
      if ($scope.promotedArticles) {
        for (var i in $scope.promotedArticles) {
          if ($scope.promotedArticles[i].id === id) {
            return true;
          }
        }
      }
      return false;
    };

    var pA = $('.promotion-area'),
      pC = $('.promotion-container');

    $scope.insertArticleMode = function (article) {
      $scope.selectedArticle = article;

      pA.addClass('select-mode');
      pC.off('click');
      pC.on('click', '.promotion-area.select-mode .article-container', function (e) {
        var index = $(this).parents('[data-index]').data('index') - 0;
        $scope.insertArticle(index);
        pA.removeClass('select-mode');
        $scope.$apply();
      });
    };

    $scope.insertArticle = function (index) {
      var limit = promo_options.upper_limits[$scope.pzone.name];
      if (!$scope.promotedArticles[index] || !$scope.promotedArticles[index].id) {
        $scope.promotedArticles.splice(index, 1, $scope.selectedArticle);
      }
      else { $scope.promotedArticles.splice(index, 0, $scope.selectedArticle); }
      if (limit && $scope.promotedArticles.length > limit) {
        $scope.promotedArticles.pop($scope.promotedArticles.length);
      }
    };

    $scope.replaceArticleMode = function (article) {
      $scope.selectedArticle = article;

      pA.addClass('select-mode');
      pC.off('click');
      pC.on('click', '.promotion-area.select-mode .article-container', function (e) {
        var index = $(this).parents('[data-index]').data('index');
        $scope.replaceArticle(index);
        pA.removeClass('select-mode');
        $scope.$apply();
      });
    };

    $scope.replaceArticle = function (index) {
      $scope.promotedArticles.splice(index, 1, $scope.selectedArticle);
    };

    $scope.save = function () {
      var items = $scope.promotedArticles.slice(0); //copy
      if (!items[0].id) {
        items.shift();
      }

      var oldSaveHtml = $('.save-button').html();
      $('.save-button').html('<i class="fa fa-refresh fa-spin"></i> Saving');

      var payload = $scope.pzone;
      if ($scope.promotedArticles[0].hey_checkthis) {
        payload.content = [];
      } else {
        payload.content = $scope.promotedArticles;
      }
      var pzone = ContentApi.restangularizeElement(null, payload, 'contentlist');
      return pzone.put().then(function(data){
        $scope.lastSavedPromotedArticles = _.clone(data.content);
        $scope.promotedArticles = data.content;
        $('.save-button').html(oldSaveHtml);
      });
    };

    $scope.moveUp = function (index) {
      if (index === 0) { return; }
      var toMove = $scope.promotedArticles[index];
      $scope.promotedArticles[index] = $scope.promotedArticles[index - 1];
      $scope.promotedArticles[index - 1] = toMove;
    };

    $scope.moveDown = function (index) {
      if (index === $scope.promotedArticles.length - 1) { return; }
      var toMove = $scope.promotedArticles[index];
      $scope.promotedArticles[index] = $scope.promotedArticles[index + 1];
      $scope.promotedArticles[index + 1] = toMove;
    };

    $scope.remove = function (index) {
      $scope.promotedArticles.splice(index, 1);
    };


  });
