'use strict';

describe('Directive: liveBlogEntries', function () {
  var $parentScope;
  var digest;
  var getLiveBlogEntriesDeferred;
  var html;
  var LiveBlogApi;
  var Raven;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.liveBlog.entries');
    module('jsTemplates');

    html = angular.element('<live-blog-entries article="article"></live-blog-entries>');

    inject(function (_LiveBlogApi_, _Raven_, $compile, $q, $rootScope) {
      $parentScope = $rootScope.$new();
      LiveBlogApi = _LiveBlogApi_;
      Raven = _Raven_;

      sandbox.stub(Raven, 'captureMessage');

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );

      $parentScope.article = { id: 1 };

      getLiveBlogEntriesDeferred = $q.defer();
      sandbox.stub(LiveBlogApi, 'getLiveBlogEntries')
        .returns(getLiveBlogEntriesDeferred.promise);
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('initialization', function () {

    it('should do an initial request for entries', function () {
      var entries = [{ id: 1 }, { id: 2 }];
      getLiveBlogEntriesDeferred.resolve({ results: entries });

      var element = digest(html);

      expect(LiveBlogApi.getLiveBlogEntries.calledOnce).to.equal(true);
      expect(element.find('li').length).to.eql(2);
    });

    it('should show an error message if unable to retrieve entries', function () {
      getLiveBlogEntriesDeferred.reject();

      var element = digest(html);

      expect(element.find('.live-blog-entries-list-error').html())
        .to.have.string('An error occurred retrieving entries!');
      expect(Raven.captureMessage.calledOnce).to.equal(true);
    });
  });
});
