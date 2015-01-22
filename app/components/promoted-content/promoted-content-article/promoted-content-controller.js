'use strict';

angular.module('promotedContentArticle.controller', [
  'promotedContent.service'
])
  .controller('PromotedContentArticle', function ($scope, PromotedContentService) {

    $scope.pzoneData = PromotedContentService.getData();

    $scope.removeContentFromPromotedList = function (article) {
      PromotedContentService.$removeContentFromPZone(article.id);
    };

  });
