'use strict';

describe('ImageCropModalCtrl', function () {

  var $httpBackend, $rootScope, $controller,
  modalInstance, BettyCropper, BettyImage, routes, $modal;

  beforeEach(function () {
    module('bulbsCmsApp');
    module('BettyCropper');
    module('BettyCropper.mockApi');
    module('jsTemplates');

    inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
      $modal = $injector.get('$modal');
      $controller = $injector.get('$controller');
      BettyCropper = $injector.get('BettyCropper');
      BettyImage = $injector.get('BettyImage');
      routes = $injector.get('routes');

      modalInstance = $modal.open({
        templateUrl: '/views/image-crop-modal.html'
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

    expect($scope.ratios).to.eql(['1x1', '16x9']);
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
          id: 68,
          caption: null,
          alt: null
        },
        ratios: ['1x1']
      }
    );
    $httpBackend.flush();
    $scope.$digest();

    expect($scope.ratios).to.eql(['1x1']);
  });

    // it('should have a proper syle for 1x1', function () {
    //   // console.log(ImageCropModalCtrl);
    //   var styles = ImageCropModalCtrl.$scope.computeThumbStyle(scope.image, {height: 170, width: 170}, scope.image.selections['1x1']);
    //   console.log(styles);
    // });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});
