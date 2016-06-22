!(function (global) {

  /**
   * Allows tests to control when a directive is built.
   *
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
      return element.scope();
    };
  };

  var prepareTestEnvironment = function () {

    global.testHelper = {
      directiveBuilder: directiveBuilder
    };
  };

  prepareTestEnvironment();

}(window));
