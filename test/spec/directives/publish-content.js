'use strict';

describe('Directive: publishContent', function () {

  // load the directive's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var element,
    scope;

  beforeEach(inject(['$rootScope', 'mockApiData', function ($rootScope, mockApiData) {
    scope = $rootScope.$new();
    scope.pubTimeArticle = mockApiData['content.list'].results[0];
  }]));

  /*it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<articlecontainer></articlecontainer>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the articlecontainer directive');
  }));*/

  it('should make the modal on there', inject(function ($compile) {
    element = angular.element('<publish-content></publish-content>');
    element = $compile(element)(scope);

  }));

});
