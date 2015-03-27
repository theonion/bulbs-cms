'use strict';

describe('Directive: genericAjaxButton', function () {
  var
    $,
    $button,
    $directiveScope,
    $q,
    $scope;

  beforeEach(function () {
    module('jquery');
    module('genericAjaxButton.directive');
    module('jsTemplates');

    inject(function (_$_, _$q_, _$rootScope_, $compile) {
      $ = _$_;
      $q = _$q_;

      $scope = _$rootScope_.$new();

      $scope.disabler = false;
      $scope.clicker = null;

      var element = $compile(
          '<generic-ajax-button ' +
              'disable-when="disabler" ' +
              'click-function="clicker" ' +
            '></generic-ajax-button>')($scope.$new());
      _$rootScope_.$digest();
      $directiveScope = element.isolateScope();

      $button = $(element).children('button');
    });
  });

  describe('disabling', function () {

    it('should have a disabled state', function () {
      $scope.disabler = true;

      $scope.$digest();

      expect($button.is(' :disabled')).toBe(true);
    });

    it('should have a non-disabled state', function () {
      $scope.disabler = null;

      $scope.$digest();

      expect($button.is(':disabled')).toBe(false);
    });
  });

  describe('click functionality', function () {

    it('should have an progress state', function () {
      $scope.clicker = function () {
        return $q.defer().promise;
      };

      $scope.$digest();

      $button.click();

      $scope.$digest();

      expect($button.is(':disabled')).toBe(true);
      expect($directiveScope.state).toBe($directiveScope.STATES.PROGRESS);
      expect($.trim($button.text())).toBe('In Progress...');
    });

    it('should have a done state', function () {
      $scope.clicker = function () {
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
      };

      $scope.$digest();

      $button.click();

      $scope.$digest();

      expect($directiveScope.state).toBe($directiveScope.STATES.DONE);
      expect($.trim($button.text())).toBe('Complete');
    });

    it('should have an error state', function () {
      $scope.clicker = function () {
        var deferred = $q.defer();
        deferred.reject();
        return deferred.promise;
      };

      $scope.$digest();

      $button.click();

      $scope.$digest();

      expect($directiveScope.state).toBe($directiveScope.STATES.ERROR);
      expect($.trim($button.text())).toBe('Error');
    });
  });
});
