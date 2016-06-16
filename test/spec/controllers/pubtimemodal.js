'use strict';

describe('Controller: PubtimemodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));
  beforeEach(module('jsTemplates'));

  var PubtimemodalCtrl,
    scope,
    modal,
    modalService,
    httpBackend,
    mockmoment,
    timezoneName;

  var articleWithNoFeatureType = {
    id: 1,
    feature_type: null,
    published: null,
    title: "No feature type"
  }

  var publishUrl = '/cms/api/v1/content/1/publish/';

  var articleWithFeatureType = {
    id: 1,
    feature_type: "Feature Type",
    published: null,
    title: "Hi"
  }

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, $modal, moment, routes, TIMEZONE_NAME) {
    httpBackend = $httpBackend;
    timezoneName = TIMEZONE_NAME;
    var modalUrl = '/views/modals/publish-date-modal.html';
    modal = $modal.open({
      templateUrl: modalUrl
    })

    modal.dismiss = function () { return true; }
    modalService = $modal
    modalService.open = function () { return true; }

    mockmoment = function(param) {
      if(param){
        return moment(param);
      }else{
        return moment('2014-04-25T14:22:00');
      }
    }
    mockmoment.tz = function () {
      if (arguments.length == 1) {
        return moment.tz('2014-04-25T14:22:00', timezoneName);
      }
      return moment.tz.apply(this, arguments);
    }

    scope = $rootScope.$new();
    PubtimemodalCtrl = $controller('PubtimemodalCtrl', {
      $scope: scope,
      $modal: modalService,
      $modalInstance: modal,
      moment: mockmoment,
      article: articleWithFeatureType
    });

  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('function: setPubTime', function () {
    it('should exist', function () {
      expect(angular.isFunction(scope.setPubTime)).to.equal(true);
    });

    it('should close pubTime modal and open validation modal when you try to publish with no feature type', function () {
      sinon.stub(modal, 'dismiss');
      sinon.stub(modalService, 'open');

      scope.article = articleWithNoFeatureType;
      scope.setPubTime();

      expect(modal.dismiss).to.have.been.called;
      expect(modalService.open).to.have.been.called;
    });

    it('should make an http request to the publis endpoint', function () {
      httpBackend.expectPOST(publishUrl).respond({status: "Published"});

      scope.dateTimePickerValue = "aha";
      scope.setPubTime(articleWithFeatureType);

      httpBackend.flush();
    });

  });

  describe('function: setTimeShortcut', function () {
    it('should exist', function () {
      expect(angular.isFunction(scope.setTimeShortcut)).to.equal(true);
    });

    describe('with param "now"', function () {
      it('should set the timePickerValue to the mocked value', function () {
        scope.setTimeShortcut('now');
        scope.$apply();

        expect(scope.timePickerValue.hour()).to.equal(14);
        expect(scope.timePickerValue.minute()).to.equal(22);
      });

      it('should make setPubTime post the mocked date', function () {
        scope.setTimeShortcut('now');
        scope.$apply();

        httpBackend.expectPOST(publishUrl, {published: "2014-04-25T14:22-05:00"}).respond({status: "Published"});

        scope.setPubTime();

        httpBackend.flush();
      });


    });

    describe('with param "midnight"', function () {
      it('should set the timePickerValue to midnight', function () {
        scope.setTimeShortcut('midnight');
        scope.$apply();

        expect(scope.timePickerValue.hour()).to.equal(0);
        expect(scope.timePickerValue.minute()).to.equal(0);
      });

      it('should make setPubTime post the mocked date', function () {
        scope.setTimeShortcut('midnight');
        scope.$apply();

        httpBackend.expectPOST(publishUrl, {published: "2014-04-26T00:00-05:00"}).respond({status: "Published"});

        scope.setPubTime();

        httpBackend.flush();
      });
    });

    describe('in a different timezone', function () {
      //mock a different timezone
      beforeEach(inject(function ($controller, moment) {
        var otherTz = 'America/Los_Angeles';

        mockmoment = function(param) {
          if(param){
            return moment(param);
          }else{
            return moment('2014-04-25T12:22:10');
          }
        }
        mockmoment.tz = function () {
          if (arguments.length == 1) {
            return moment.tz('2014-04-25T12:22:00', otherTz);
          }
            return moment.tz.apply(this, arguments);
        }

        PubtimemodalCtrl = $controller('PubtimemodalCtrl', {
          $scope: scope,
          $modal: modalService,
          $modalInstance: modal,
          moment: mockmoment,
          article: articleWithFeatureType
        });
      }));

      describe('with param "now"', function () {
        it('should set the timePickerValue to the mocked value', function () {
          scope.setTimeShortcut('now');
          scope.$apply();

          expect(scope.timePickerValue.hour()).to.equal(12);
          expect(scope.timePickerValue.minute()).to.equal(22);
        });

      });

      describe('with param "midnight"', function () {
        it('should set the timePickerValue to midnight', function () {
          scope.setTimeShortcut('midnight');
          scope.$apply();

          expect(scope.timePickerValue.hour()).to.equal(0);
          expect(scope.timePickerValue.minute()).to.equal(0);
        });
      });

    });
  });

});
