'use strict';

describe('Controller: ImageCropModalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var $httpBackend, $rootScope, ImageCropModalCtrl,
  modalInstance, scope, BettyCropper, BettyImage;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector) {

    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');
    BettyCropper = $injector.get('BettyCropper');
    BettyImage = $injector.get('BettyImage');

    $httpBackend.when('OPTIONS', /^http:\/\/localimages\.avclub\.com.*/).respond('');
    $httpBackend.when('GET', /^http:\/\/localimages\.avclub\.com\/api\/\d+/).respond(function (method, url, data, headers) {
      var id = url.substring(url.lastIndexOf('/') + 1, url.length);
      return [200, {
        'id': parseInt(id, 10),
        'name': 'Lenna.png',
        'width': 512,
        'height': 512,
        'selections': {
          '1x1': {'y1': 512, 'y0': 0, 'x0': 0, 'x1': 512, 'source': 'auto'},
          '16x9': {'y1': 400, 'y0': 112, 'x0': 0, 'x1': 512, 'source': 'auto'}
        }
      }, {}];
    });
    $httpBackend.when('POST', /^http:\/\/localimages\.avclub\.com\/api\/\d+\/.*$/).respond(function (method, url, data, headers) {
      var splitUrl = url.split('/');

      var ratio = splitUrl[splitUrl.length];
      var id = splitUrl[splitUrl.length - 1];
      var imageData = {
        'id': parseInt(id, 10),
        'name': 'Lenna.png',
        'width': 512,
        'height': 512,
        'selections': {
          '1x1': {'y1': 512, 'y0': 0, 'x0': 0, 'x1': 512, 'source': 'auto'},
          '16x9': {'y1': 400, 'y0': 112, 'x0': 0, 'x1': 512, 'source': 'auto'}
        }
      };
      imageData.selections[ratio] = data;
      return [200, imageData, {}];
    });



    // see https://github.com/angular-ui/bootstrap/blob/master/src/modal/modal.js#L313
    var
    $modalStack = $injector.get('$modalStack'),
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

    scope = $rootScope.$new();

    ImageCropModalCtrl = $controller(
      'ImageCropModalCtrl',
      {
        $scope: scope,
        $modalInstance: modalInstance,
        img_ref: {
          id: 1,
          caption: 'Taboola: The Uncut',
          alt: 'CMS, RMS, FreeMS'
        },
        cropsToEdit: false
      }
    );

    scope.image = new BettyImage({
      'id': 1,
      'name': 'Lenna.png',
      'width': 512,
      'height': 512,
      'selections': {
        '1x1': {'y1': 512, 'y0': 0, 'x0': 0, 'x1': 512, 'source': 'auto'},
        '16x9': {'y1': 400, 'y0': 112, 'x0': 0, 'x1': 512, 'source': 'auto'}
      }
    });
    scope.setThumbStyles(scope.image, scope.image.selections);
    scope.ratioOrder = Object.keys(scope.image.selections);
    scope.currentCrop = 0;
    scope.jcrop_api = {
      setOptions: function () {},
      setSelect: function () {},
      tellSelect: function () {}
    };
    scope.selectedCrop = ['1x1', scope.image.selections['1x1']];
  }));

  describe('Crop thumb styles', function() {

    // it('should have a proper syle for 1x1', function () {
    //   // console.log(ImageCropModalCtrl);
    //   var styles = ImageCropModalCtrl.$scope.computeThumbStyle(scope.image, {height: 170, width: 170}, scope.image.selections['1x1']);
    //   console.log(styles);
    // });


  });

  describe('processJcropSelection', function () {

    it('should do nothing if the selection contains bad data', function () {
      scope.preview_style = 'BLAM! IN THE FACE';
      scope.processJcropSelection({x:NaN, y:'punkd mofo'});
      expect(scope.preview_style).toBe('BLAM! IN THE FACE');
    });

    it('should compute various style attributes', function () {
      scope.image.selections['1x1'] = 'haaaaaallleluhaa';
      scope.thumb_styles['1x1'] = 'you wanna piece o me?';
      spyOn(scope, 'computeThumbStyle');

      scope.processJcropSelection({
        x: 0, x2: 0, y: 0, y2: 0,
      });

      expect(scope.image.selections['1x1']).not.toBe('haaaaaallleluhaa');
      expect(scope.thumb_styles['1x1']).not.toBe('you wanna piece o me?');
    });

    it('should round selections to be within image bounds', function () {

      scope.processJcropSelection({
        x: -1, x2: scope.image.width + 1, y: -1, y2: scope.image.height + 1
      });

      expect(scope.image.selections['1x1'].x0).toBe(0);
      expect(scope.image.selections['1x1'].x1).toBe(scope.image.width);
      expect(scope.image.selections['1x1'].y0).toBe(0);
      expect(scope.image.selections['1x1'].y1).toBe(scope.image.height);

    });

  });


  describe('watch: selectedCrop', function () {

    it('should setup JCrop (brittle)', function () {
      spyOn(scope.jcrop_api, 'setOptions');
      spyOn(scope.jcrop_api, 'setSelect');
      scope.selectedCrop = [
        '1x1', scope.image.selections['1x1']
      ];
      scope.$apply();

      expect(scope.jcrop_api.setOptions).toHaveBeenCalled();
      expect(scope.jcrop_api.setSelect).toHaveBeenCalled();
    });

    it('should do nothing if the new value is undefined', function () {
      spyOn(scope.jcrop_api, 'setOptions');
      spyOn(scope.jcrop_api, 'setSelect');
      scope.selectedCrop = undefined;
      scope.$apply();

      expect(scope.jcrop_api.setOptions).not.toHaveBeenCalled();
      expect(scope.jcrop_api.setSelect).not.toHaveBeenCalled();

    });

  });


  describe('setThumbStyles', function () {

    // Shouldn't test CSS

  });


  describe('computeThumbStyle', function () {

    // Shouldn't test CSS

  });


  describe('scaleNumber', function () {

    it('should apply a floor function to a scaled number', function () {
      expect(scope.scaleNumber(1, 2.5)).toBe(2);
    });

  });

  describe('saveAndQuit', function () {

    it('should process the JCrop selection', function () {
      spyOn(scope, 'processJcropSelection');
      scope.saveAndQuit();
      expect(scope.processJcropSelection).toHaveBeenCalled();
    });

    // it('should update the selection and close the modal', function () {
    //   spyOn(scope, 'processJcropSelection');
    //   spyOn(BettyCropper, 'updateSelection').andCallThrough();
    //   spyOn(modalInstance, 'close');

    //   scope.$apply(function () {
    //     scope.saveAndQuit();
    //   });
    //   expect(BettyCropper.updateSelection).toHaveBeenCalled();

    //   $httpBackend.flush();
    //   expect(modalInstance.close).toHaveBeenCalled();
    // });

  });


  describe('saveAndNext', function () {

    it('should process the JCrop selection', function () {
      spyOn(scope, 'processJcropSelection');
      scope.saveAndNext();
      expect(scope.processJcropSelection).toHaveBeenCalled();
    });

  });


  describe('isCurrentCropOrDone', function () {

    it('returns a style if the ratio is the current crop', function () {
      scope.ratioOrder = ['1x1', '16x9', '3x1'];
      scope.currentCrop = '1x1';
      expect(scope.isCurrentCropOrDone('1x1')).toEqual(jasmine.any(Object));
    });

  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});
