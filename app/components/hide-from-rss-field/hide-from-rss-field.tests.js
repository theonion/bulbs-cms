'use strict';

describe('Directive: superFeaturesEdit', function () {
  var $parentScope;
  var digest;

  beforeEach(function () {
    module('jsTemplates');
    module(
      'hideFromRssField.directive',
      function (CmsConfigProvider) {
        CmsConfigProvider.setExternalUrl('onion.local');
      }
    );

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();
      digest = window.testHelper.directiveBuilderWithDynamicHtml($compile, $parentScope);
    });
  });

  it('should change the value of hide_from_rss when clicked on', function () {
    $parentScope.article = { hide_from_rss: true };

    var element = digest('<hide-from-rss-field article="article"></hide-from-rss-field>');
    element.find('input').trigger('click');

    expect($parentScope.article.hide_from_rss).to.equal(false);
  });
});
