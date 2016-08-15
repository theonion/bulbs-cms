'use strict';

describe('Controller: DatetimeSelectionModalCtrl', function () {

  var $modalInstanceMock;
  var $scope;
  var buildControllerInstance;
  var CmsConfigProviderHook;
  var moment;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.dateTimeModal.controller',
      function (CmsConfigProvider) {
        CmsConfigProviderHook = CmsConfigProvider;
      }
    );

    inject(function (_moment_, $controller, $rootScope, CmsConfig) {

      $modalInstanceMock = {};
      $scope = $rootScope.$new();
      moment = _moment_;

      var controllerBuilder = function (configs) {
        return function () {
          return $controller('DatetimeSelectionModalCtrl', configs);
        };
      };

      buildControllerInstance = function () {
        return $controller(
          'DatetimeSelectionModalCtrl',
          {
            $scope: $scope,
            $modalInstance: $modalInstanceMock,
            CmsConfig: CmsConfig,
            moment: moment
          }
        );
      };
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should set a timezone label on scope', function () {
    CmsConfigProviderHook.setTimezoneName('America/Chicago');

    buildControllerInstance();

    expect($scope.TIMEZONE_LABEL).to.equal('CDT');
  });

  it('should copy given date time on scope', function () {
    $scope.modDatetime = moment();
    var givenYear = $scope.modDatetime.year();
    var newYear = givenYear + 1;

    buildControllerInstance();
    $scope.tempDatetime.year(newYear);
    $scope.$digest();

    expect($scope.modDatetime.year()).to.equal(givenYear);
    expect($scope.tempDatetime.year()).to.equal(newYear);
  });

  it('should set date time to now if no time given on scope', function () {
    var then = moment();

    buildControllerInstance();
    var now = moment();

    expect($scope.tempDatetime.isBetween(then, now, null, '[]')).to.equal(true);
  });

  it('should set a temporary time variable on scope for use with timepicker', function () {
    $scope.modDatetime = moment();
    var givenHour = $scope.modDatetime.hour();
    var newHour = givenHour + 1;

    buildControllerInstance();
    $scope.tempDatetime.hour(newHour);
    $scope.tempTime.hour(newHour);
    $scope.$digest();

    expect($scope.modDatetime.hour()).to.equal(givenHour);
    expect($scope.tempDatetime.hour()).to.equal(newHour);
    expect($scope.tempTime.hour()).to.equal(newHour);
  });

  it('should report an invalid date if chosen date time is not valid', function () {
    buildControllerInstance();

    $scope.dateValid = true;
    $scope.tempDatetime = moment(null);
    $scope.$digest();

    expect($scope.dateValid).to.equal(false);
  });

  it('should report a valid date if chosen date time is valid', function () {
    buildControllerInstance();

    $scope.dateValid = false;
    $scope.tempDatetime = moment();
    $scope.$digest();

    expect($scope.dateValid).to.equal(true);
  });

  it('should update selected date time when temporary time variable is set', function () {
    buildControllerInstance();
    var currHour = $scope.tempDatetime.hour();
    var newHour = currHour + 1;

    $scope.tempTime = moment().hour(newHour);
    $scope.$digest();

    expect($scope.tempDatetime.hour()).to.equal($scope.tempTime.hour());
  });

  it('should not update selected date time if temporary time variable is invalid', function () {
    buildControllerInstance();
    var tempTimeStr = $scope.tempDatetime.format();

    $scope.tempTime = moment(null);
    $scope.$digest();

    expect($scope.tempDatetime.format()).to.equal(tempTimeStr);
  });

  it('should have a setDate function for use with date picker', function () {
    buildControllerInstance();
    var newDate = moment().add(1, 'year');

    $scope.setDate(newDate);

    expect($scope.tempDatetime.isSame(newDate)).to.equal(true);
  });

  it('should have a function to set the selected date to today while preserving selected time', function () {
    var hour = 5;
    buildControllerInstance();

    $scope.tempDatetime.hour(hour);
    $scope.setDateToday();

    var now = moment();
    expect($scope.tempDatetime.year()).to.equal(now.year());
    expect($scope.tempDatetime.month()).to.equal(now.month());
    expect($scope.tempDatetime.date()).to.equal(now.date());
    expect($scope.tempDatetime.hour()).to.equal(hour);
  });

  it('should have a function to set the selected date to tomorrow while preserving selected time', function () {
    var hour = 5;
    buildControllerInstance();

    $scope.tempDatetime.hour(hour);
    $scope.setDateToday();

    var tomorrow = moment().add(1, 'date');
    expect($scope.tempDatetime.year()).to.equal(tomorrow.year());
    expect($scope.tempDatetime.month()).to.equal(tomorrow.month());
    expect($scope.tempDatetime.date()).to.equal(tomorrow.date());
    expect($scope.tempDatetime.hour()).to.equal(hour);
  });

  it('should have a function to set the selected time to now', function () {
    buildControllerInstance();
    var then = moment();

    $scope.setTimeNow();
    var now = moment();

    expect($scope.tempDatetime.isBetween(then, now, null, '[]')).to.equal(true);
  });

  it('should have a function to set the selected time to midnight', function () {
    buildControllerInstance();
    var now = moment();

    $scope.setTimeMidnight();

    expect($scope.tempDatetime.date()).to.equal(now.date() + 1);
    expect($scope.tempDatetime.hour()).to.equal(0);
    expect($scope.tempDatetime.minute()).to.equal(0);
    expect($scope.tempDatetime.second()).to.equal(0);
  });

  it('should have a function to finalize date time selection and close modal instance', function () {
    buildControllerInstance();
    $modalInstanceMock.close = sinon.stub();

    $scope.chooseDatetime()

    expect($scope.tempDatetime.isSame($modalInstanceMock.close.args[0][0])).to.equal(true);
  });

  it('should not allow an invalid date to be finalized and chosen', function () {
    buildControllerInstance();
    $modalInstanceMock.close = sinon.stub();
    sinon.stub(console, 'error');

    $scope.tempDatetime = moment(null);
    $scope.$digest();
    $scope.chooseDatetime()

    expect($modalInstanceMock.close.callCount).to.equal(0);
  });
});
