'use strict';

describe('ImageCropModalCtrl', function () {

  var $httpBackend, $rootScope, $controller,
  modalInstance, BettyCropper, BettyImage, PARTIALS_URL, $modal;

  beforeEach(function () {
    module('bulbsCmsApp');
    module('BettyCropper');
    module('BettyCropper.mockApi');
    module('cms.templates');

    inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
      $modal = $injector.get('$modal');
      $controller = $injector.get('$controller');
      BettyCropper = $injector.get('BettyCropper');
      BettyImage = $injector.get('BettyImage');
      PARTIALS_URL = $injector.get('PARTIALS_URL');

      modalInstance = $modal.open({
        templateUrl: PARTIALS_URL + 'image-crop-modal.html'
      });

    });
  });

  it('should initialize properly', function() {
    var $scope = $rootScope.$new();

    $controller(
      'ImageCropModalCtrl',
      {
        $scope: $scope,
        $modalInstance: modalInstance,
        imageData: {
          id: 67,
          caption: null,
          alt: null
        },
        ratios: null
      }
    );
    $httpBackend.flush();
    $scope.$digest();
    angular.element('.crop-image-container img').trigger('load');  // The jcrop api can only get set up when the image loads.

    expect($scope.ratios).toEqual(['1x1', '16x9']);
    expect($scope.cropMode).toBe(false);
    expect($scope.selectedCrop).toBe(null);

    $scope.selectCrop('16x9');

    expect($scope.selectedCrop).toBe('16x9');
    expect($scope.cropMode).toBe(true);

    $scope.selectCrop();

    expect($scope.selectedCrop).toBe('1x1');
    expect($scope.cropMode).toBe(true);
  });

  it('should be able to select ratios', function () {
    var $scope = $rootScope.$new();

    $controller(
      'ImageCropModalCtrl',
      {
        $scope: $scope,
        $modalInstance: modalInstance,
        imageData: {
          id: 68,
          caption: null,
          alt: null
        },
        ratios: ['1x1']
      }
    );
    $httpBackend.flush();
    $scope.$digest();

    expect($scope.ratios).toEqual(['1x1']);
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});
