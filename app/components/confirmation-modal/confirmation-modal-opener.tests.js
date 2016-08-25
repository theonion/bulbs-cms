'use strict';
/*jshint -W030 */

describe('Directive: confirmationModalOpener', function () {
  var
    $,
    $compile,
    $scope;

  beforeEach(function () {
    module('confirmationModal');
    module('jsTemplates');
    module('jquery');

    inject(function (_$_, _$compile_, _$rootScope_) {
      $ = _$_;
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
    });
  });

  it('should add a class to element it is applied to', function () {
    var element = $compile('<div confirmation-modal-opener></div>')($scope.$new());
    $scope.$digest();

    expect($(element).hasClass('confirmation-modal-opener')).to.equal(true);
  });

  it('should call cancel callback on cancel', function () {
    $scope.cancel = function () {};

    sinon.stub($scope, 'cancel');

    var element = $compile('<div confirmation-modal-opener modal-on-cancel="cancel()"></div>')($scope.$new());

    $scope.$digest();
    var $element = $(element);

    $element.click();
    $scope.$apply();

    $('.modal-content').find('button[ng-click="cancel()"]').click();
    $scope.$digest();

    expect($scope.cancel).to.have.been.called;
  });

  it('should call confirm callback on confirm', function () {
    $scope.confirm = function () {};

    sinon.stub($scope, 'confirm');

    var element = $compile('<div confirmation-modal-opener modal-on-ok="confirm()"></div>')($scope.$new());

    $scope.$digest();
    var $element = $(element);

    $element.click();
    $scope.$apply();

    $('.modal-content').find('button[ng-click="confirm()"]').click();
    $scope.$digest();

    expect($scope.confirm).to.have.been.called;
  });
});
