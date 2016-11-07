'use strict';

describe('Controller: DatetimeSelectionModalCtrl', function () {

  var $modalInstanceMock;
  var $scope;
  var buildControllerInstance;
  var CmsConfigProviderHook;
  var moment;
  var sandbox;
  var today;
  var tomorrow;
  var dateFormat;
  var timeFormat;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.dateTimeModal.controller',
      function (CmsConfigProvider) {
        CmsConfigProviderHook = CmsConfigProvider;
        CmsConfigProviderHook.setTimezoneName('America/Chicago');
      }
    );

    inject(function (_moment_, $controller, $rootScope, CmsConfig) {
      $modalInstanceMock = {};
      $scope = $rootScope.$new();
      moment = _moment_;

      buildControllerInstance = function () {
        return $controller(
          'DatetimeSelectionModalCtrl',
          {
            $scope: $scope,
            $modalInstance: $modalInstanceMock,
            CmsConfig: CmsConfig,
            moment: moment,
          }
        );
      };
    });

    today = moment().tz('America/Chicago');
    tomorrow = moment().tz('America/Chicago').add(1, 'day');
    dateFormat = 'YYYY-MM-DD';
    timeFormat = 'HH:mm';
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('has a TIMEZONE_LABEL', function () {
    CmsConfigProviderHook.setTimezoneName('America/Chicago');
    buildControllerInstance();
    expect($scope.TIMEZONE_LABEL).to.equal(moment.tz('America/Chicago').format('z'));
  });

  it('has a dateTime', function () {
    buildControllerInstance();
    expect(moment.isMoment($scope.dateTime)).to.equal(true);
  });

  it('has a date', function () {
    buildControllerInstance();
    expect(moment.isMoment($scope.date)).to.equal(true);
  });

  it('has a time', function () {
    buildControllerInstance();
    expect($scope.time).to.be.an.instanceof(Date);
  });

  it('has a configurable dateTime', function () {
    $scope.modDatetime = moment();
    buildControllerInstance();
    expect($scope.dateTime.isSame($scope.modDatetime)).to.equal(true);
  });

  describe('nowInTimezone', function () {
    it('returns a moment object', function () {
      buildControllerInstance();
      expect(moment.isMoment($scope.nowInTimezone())).to.equal(true);
    });

    it('returns the current date and time in the configured timezone', function () {
      buildControllerInstance();
      expect($scope.nowInTimezone().toString()).to.have.string(moment().tz('America/Chicago').format('ZZ'));
    });
  });

  describe('dateInTimezone', function () {
    it('returns a moment object', function () {
      buildControllerInstance();
      expect(moment.isMoment($scope.dateInTimezone(moment()))).to.equal(true);
    });

    it('returns the given date in the configured timezone', function () {
      buildControllerInstance();
      expect($scope.nowInTimezone().toString()).to.have.string(moment().tz('America/Chicago').format('ZZ'));
    });
  });

  describe('setDateToday', function () {
    it('sets the date to the selected date', function () {
      $scope.modDatetime = moment('2016-09-25 09:30');
      buildControllerInstance();
      $scope.setDateToday();
      expect($scope.date.format(dateFormat)).to.equal(today.format(dateFormat));
    });
  });

  describe('setDateTomorrow', function () {
    it('sets the date to tomorrow', function () {
      $scope.modDatetime = moment('2016-09-25 09:30');
      buildControllerInstance();
      $scope.setDateTomorrow();
      expect($scope.date.format(dateFormat)).to.equal(tomorrow.format(dateFormat));
    });
  });

  describe('setTimeNow', function () {
    it('sets the date to now', function () {
      var now = moment();
      $scope.modDatetime = moment('2016-09-25 09:30');
      buildControllerInstance();
      sandbox.stub($scope, 'nowInTimezone').returns(now);
      $scope.setTimeNow();
      expect($scope.date.isSame(now)).to.equal(true);
    });

    it('sets the time to now', function () {
      var now = moment();
      $scope.modDatetime = moment('2016-09-25 09:30');
      buildControllerInstance();
      sandbox.stub($scope, 'nowInTimezone').returns(now);
      $scope.setTimeNow();
      expect($scope.time.toString()).to.equal(now.toDate().toString());
    });
  });

  describe('setTimeMidnight', function () {
    it('sets the time to midnight', function () {
      $scope.modDatetime = moment('2016-09-25 09:30').tz('America/Chicago');
      buildControllerInstance();
      today.startOf('day');
      $scope.setTimeMidnight();
      expect($scope.time.toString()).to.equal(today.toDate().toString());
    });

    it('sets the date to midnight', function () {
      $scope.modDatetime = moment('2016-09-25 09:30').tz('America/Chicago');
      buildControllerInstance();
      today.startOf('day');
      $scope.setTimeMidnight();
      expect($scope.date.isSame(today)).to.equal(true);
    });
  });

  describe('clearDateTime', function () {
    it('closes the modal instance', function () {
      $modalInstanceMock.close = sandbox.stub();
      buildControllerInstance();
      $scope.clearDatetime();
      expect($modalInstanceMock.close).to.have.been.called; // jshint ignore:line
    });
  });

  describe('chooseDatetime', function () {
    context('when the date is valid', () => {
      it('closes the modal, passing the dateTime', function () {
        $modalInstanceMock.close = sandbox.stub();
        buildControllerInstance();
        $scope.chooseDatetime();
        expect($modalInstanceMock.close).to.have.been.calledWith($scope.dateTime);
      });
    });
  });

  describe('setDate', function () {
    it('sets the date with the given date', function () {
      $scope.modDatetime = moment('2016-09-25 12:37');
      buildControllerInstance();
      var givenDate = moment('2016-09-25 09:30');
      $scope.setDate(givenDate.toDate());
      expect($scope.date.format(dateFormat)).to.equal(givenDate.format(dateFormat));
    });
  });

  describe('time watcher', function () {
    it('sets the dateTime with the new time', function () {
      $scope.modDatetime = moment('2016-09-25 11:23');
      buildControllerInstance();
      var updatedTime = $scope.dateInTimezone(moment('2016-09-27 09:30'));
      $scope.$apply(function () {
        $scope.time = updatedTime.toDate();
      });
      expect($scope.dateTime.format(timeFormat)).to.equal(updatedTime.format(timeFormat));
    });

    it('preserves the date', function () {
      $scope.modDatetime = moment('2016-09-25 09:30');
      buildControllerInstance();
      var updatedTime = $scope.dateInTimezone(moment('2016-09-27 12:37'));
      $scope.time = updatedTime.clone().toDate();
      $scope.$digest();
      expect($scope.dateTime.format(dateFormat)).to.not.equal(updatedTime.format(dateFormat));
    });
  });

  describe('date watcher', function () {
    it('sets the dateTime with the new date', function () {
      $scope.modDatetime = moment('2016-09-27 11:30');
      buildControllerInstance();
      var updatedDate = $scope.dateInTimezone(moment('2016-09-25 09:30'));
      $scope.date = updatedDate.clone();
      $scope.$digest();
      expect($scope.dateTime.format(dateFormat)).to.equal(updatedDate.format(dateFormat));
    });

    it('preserves the time', function () {
      $scope.modDatetime = moment('2016-09-27 11:30');
      buildControllerInstance();
      var updatedDate = $scope.dateInTimezone(moment('2016-09-25 09:30'));
      $scope.date = updatedDate.clone();
      $scope.$digest();
      expect($scope.dateTime.format(timeFormat)).to.not.equal(updatedDate.format(timeFormat));
    });
  });
});
