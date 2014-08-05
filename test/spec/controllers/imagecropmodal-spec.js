'use strict';

describe('ImageCropModalCtrl', function () {

  var $httpBackend, $rootScope, $controller,
  modalInstance, BettyCropper, BettyImage;

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('BettyCropper.mockApi'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector) {

    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');
    $controller = $injector.get('$controller');
    BettyCropper = $injector.get('BettyCropper');
    BettyImage = $injector.get('BettyImage');

    // see https://github.com/angular-ui/bootstrap/blob/master/src/modal/modal.js#L313
    var $modalStack = $injector.get('$modalStack'),
        $q = $injector.get('$q'),
        modalResultDeferred = $q.defer(),
        modalOpenedDeffered = $q.defer();

    modalInstance = {
      result: modalResultDeferred.promise,
      opened: modalOpenedDeffered.promise,
      close: function (result) {
        $modalStack.close(modalInstance, result);
      },
      dismiss: function (reason) {
        $modalStack.dismiss(modalInstance, reason);
      }
    };

  }));

  it('should initialize properly', function() {
    var $scope = $rootScope.$new();

    var ImageCropModalCtrl = $controller(
      'ImageCropModalCtrl',
      {
        $scope: $scope,
        $modalInstance: modalInstance,
        img_ref: {
          id: 9,
          caption: 'Taboola: The Uncut',
          alt: 'CMS, RMS, FreeMS'
        },
        cropsToEdit: false
      }
    );
    $scope.onInit();
    expect($scope.image.id).toBe(9);

    // ImageCropModalCtrl.scope.onInit();
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
