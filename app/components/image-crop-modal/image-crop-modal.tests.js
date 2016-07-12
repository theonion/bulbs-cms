'use strict';

describe('ImageCropModalCtrl', function () {

  var $controller;
  var $httpBackend
  var $modal;
  var $rootScope;
  var BettyCropper;
  var BettyImage;
  var mockData;
  var modalInstance;

  beforeEach(function () {
    module('bulbsCmsApp.mockApi');
    module('bulbs.cms.imageCropModal');
    module('BettyCropper.mockApi');
    module('jsTemplates');
    module('ui.bootstrap');

    inject(function ($injector, CmsConfig, mockApiData) {
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
      $modal = $injector.get('$modal');
      $controller = $injector.get('$controller');
      BettyCropper = $injector.get('BettyCropper');
      BettyImage = $injector.get('BettyImage');
      mockData = mockApiData['bettycropper.detail'];
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
    var ImageCropModalCtrl = $controller(
      'ImageCropModalCtrl',
      {
        $scope: $scope,
        $modalInstance: modalInstance,
        imageData: {
          id: 1,
          caption: null,
          alt: null
        },
        ratios: null
      }
    );

    $httpBackend.expectGET('http://localimages.avclub.com/api/1')
      .respond(200, mockData);
    $httpBackend.flush();

    angular.element('.crop-image-container img').trigger('load');  // The jcrop api can only get set up when the image loads.

    expect($scope.ratios).to.eql(['1x1', '2x1', '3x1', '3x4', '4x3', '16x9']);
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

    var ImageCropModalCtrl = $controller(
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

    $httpBackend.expectGET('http://localimages.avclub.com/api/1')
      .respond(200, mockData);
    $httpBackend.flush();

    expect($scope.ratios).to.eql(['1x1']);
  });
});
