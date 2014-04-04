'use strict';

describe('Directive: publishContent', function () {

  // load the directive's module
  beforeEach(module('bulbsCmsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.pubTimeArticle = MOCK_content.results[0];
  }));

  /*it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<articlecontainer></articlecontainer>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the articlecontainer directive');
  }));*/

  it('should make the modal on there', inject(function ($compile) {
    console.log("hi")
    console.log(scope.article)
    console.log(scope.openPubTimeModal)
    element = angular.element('<publish-content></publish-content>');
    element = $compile(element)(scope);
    console.log(element.scope().openPubTimeModal)

  }));

});
