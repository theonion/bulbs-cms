'use strict';

describe('Directive: liveBlogEntriesAuthorBridge', function () {
  var $;
  var $parentScope;
  var CmsConfigProviderHook;
  var digest;
  var html;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.liveBlog.entries.authorBridge',
      function (CmsConfigProvider) {
        CmsConfigProviderHook = CmsConfigProvider;
      }
    );
    module('jquery');

    inject(function (_$_, $compile, $rootScope) {
      $ = _$_;
      $parentScope = $rootScope.$new();
      $parentScope.authors = [];

      html = angular.element('<live-blog-entries-author-bridge></live-blog-entries-author-bridge>');

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should append configured author selection directive to itself', function () {
    var directiveName = 'my-author-selector';
    CmsConfigProviderHook.setLiveBlogAuthorSelectorDirectiveName(directiveName);
    html.attr('ng-model', 'authors');

    var element = digest(html);

    var authorSelector = element.find(directiveName);
    expect(authorSelector.length).to.equal(1);
    expect(authorSelector.attr('ng-model')).to.equal('authors');
  });

  it('should fail gracefully if no name is set in configuration', function () {

    var element = digest(html);

    expect(element.html()).to.have.string('No live blog author selector has been configured!');
  });

  it('should have a on update handler', function () {
    $parentScope.onUpdate = sandbox.stub();
    $parentScope.authors = [];
    html.attr('ng-model', 'authors');
    html.attr('on-update', 'onUpdate(newValue)');
    var newValue = [{ id: 1 }, { id: 2 }];

    var element = digest(html);
    element.isolateScope().authors = newValue;
    $parentScope.$digest();

    expect($parentScope.onUpdate.withArgs(sinon.match(newValue)).calledOnce)
      .to.equal(true);
  });
});
