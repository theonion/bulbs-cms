'use strict';

describe('ImageCropModalCtrl', function () {

  var $controller;
  var $httpBackend;
  var $modal;
  var $rootScope;
  var mockApiData;
  var modalInstance;

  beforeEach(function () {
    module('bulbsCmsApp.mockApi.data');
    module('bulbs.cms.imageCropModal.controller');
    module('jsTemplates');
    module('ui.bootstrap');

    inject(function ($injector, CmsConfig, _mockApiData_) {
      mockApiData = _mockApiData_;
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
      $modal = $injector.get('$modal');
      $controller = $injector.get('$controller');
      modalInstance = $modal.open({
        templateUrl: CmsConfig.buildComponentPath(
          'image-crop-modal',
          'image-crop-modal.html'
        )
      });
    });
  });

  it('should initialize properly', function() {
    var $scope = $rootScope.$new();
    var ratios = ['1x1', '16x9'];

    $httpBackend.expectGET(/^http:\/\/localimages\.avclub\.com\/api\/\d+$/)
      .respond(200, mockApiData['bettycropper.detail']);

    $controller(
      'ImageCropModalCtrl',
      {
        $scope: $scope,
        $modalInstance: modalInstance,
        imageData: {
          id: 1,
          caption: null,
          alt: null
        },
        ratios: ratios
      }
    );

    $httpBackend.flush();
    angular.element('.crop-image-container img').trigger('load');  // The jcrop api can only get set up when the image loads.

    expect($scope.ratios).to.eql(ratios);
    expect($scope.cropMode).to.equal(false);
    expect($scope.selectedCrop).to.equal(null);

    $scope.selectCrop('16x9');

    expect($scope.selectedCrop).to.equal('16x9');
    expect($scope.cropMode).to.equal(true);

    $scope.selectCrop();

    expect($scope.selectedCrop).to.equal('1x1');
    expect($scope.cropMode).to.equal(true);
  });

  it('should be able to select ratios', function () {
    var $scope = $rootScope.$new();

    $httpBackend.expectGET(/^http:\/\/localimages\.avclub\.com\/api\/\d+$/)
      .respond(200, mockApiData['bettycropper.detail']);

    $controller(
      'ImageCropModalCtrl',
      {
        $scope: $scope,
        $modalInstance: modalInstance,
        imageData: {
          id: 1,
          caption: null,
          alt: null
        },
        ratios: ['1x1']
      }
    );
    $httpBackend.flush();

    expect($scope.ratios).to.eql(['1x1']);
  });
});
