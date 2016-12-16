
describe('Directive: liveBlogResponse', function () {
  var response;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.liveBlog.response');
    module('jsTemplates');

    html = angular.element('<live-blog-response response="response"></live-blog-response>');
    $parentScope.response = response = {};

    inject(function ($compile, $rootScope) {

      $parentScope = $rootScope.$new();

      digest = window.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );

    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  // TODO : fill this in
});

