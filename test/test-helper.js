!(function (global) {

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
