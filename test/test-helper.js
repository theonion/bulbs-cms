!(function (global) {

  /**
   * Allows tests to control when a directive is built.
   *
   * @param {$compile} $compile - contextualized compile to render directive.
   * @param {Scope} $scope - parent scope of new directive.
   * @param {String} html - html to use to build new directive.
   * @returns {function} when executed, will digest the directive and its html
   *    and bind it to a new scope that is a child of given $scope.
   */
  var directiveBuilder = function ($compile, $scope, html) {
    return function () {
      var $directiveScope = $scope.$new();
      var element = $compile(html)($directiveScope);
      $directiveScope.$digest();
      return element;
    };
  };

  /**
   * Allows tests to control when a directive is built, curried function allows
   *  customized html to be passed in just before compile time.
   *
   * @param {$compile} $compile - contextualized compile to render directive.
   * @param {Scope} $scope - parent scope of new directive.
   * @returns {function} when executed, will digest the given html and bind it
   *    to a new scope that is a child of given $scope.
   */
  var directiveBuilderWithDynamicHtml = function ($compile, $scope) {
    return function (html) {
      var $directiveScope = $scope.$new();
      var element = $compile(html)($directiveScope);
      $directiveScope.$digest();
      return element;
    };
  };

  /**
   * Mock out a directive.
   *
   * @param {$compileProvider} $compileProvider - used to redefine directive.
   * @param {String} name - name of directive to mock.
   * @returns {undefined}
   */
  var directiveMock = function ($compileProvider, name) {
    $compileProvider.directive(name, function () {
      return {
        priority: 9999999, // keep higher than any other priorty
        terminal: true,
        template: 'mock directive'
      };
    });
  };

  var prepareTestEnvironment = function () {

    global.testHelper = {
      directiveBuilder: directiveBuilder,
      directiveBuilderWithDynamicHtml: directiveBuilderWithDynamicHtml,
      directiveMock: directiveMock
    };
  };

  prepareTestEnvironment();

}(window));
