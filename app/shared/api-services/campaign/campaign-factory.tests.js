'use strict';

describe('Factory: Campaign', function () {

  var _;
  var Campaign;
  var $httpBackend;
  var moment;

  // load the directive's module
  beforeEach(function () {

    module('bulbsCmsApp');
    module('apiServices.campaign.factory');

    inject(function (___, _$httpBackend_, _Campaign_, _moment_) {
      _ = ___;
      $httpBackend = _$httpBackend_;
      Campaign = _Campaign_;
      moment = _moment_;
    });

  });

  it('campaign should translate iso date strings into moments', function () {
    var date = moment();
    $httpBackend.expectGET(/^\/cms\/api\/v1\/campaign\/(\d+)\/$/).respond({
       start_date: date.format()
    });

    var campaign = Campaign.$find(1);
    $httpBackend.flush();

    expect(campaign.startDate.format()).toEqual(date.format());
  });

  it('campaign should convert invalid/blank iso date strings into current moment', function () {
   _.each(['', 'invalid date'], function (dateStr) {
     $httpBackend.expectGET(/^\/cms\/api\/v1\/campaign\/(\d+)\/$/).respond({
         start_date: dateStr
     });

     var campaign = Campaign.$find(1);
     $httpBackend.flush();

     expect(campaign.startDate).toBeNull();
   });
  });

  it('campaign should translate invalid moments to empty strings', function () {

   var campaignToSave = Campaign.$build({
     start_date: moment('')  // Invalid date
   });
   spyOn(campaignToSave.start_date, 'format');
   campaignToSave.$save();

   // capture posted value
   var postedStartDate;
   $httpBackend.expectPOST(/^\/cms\/api\/v1\/campaign\/$/).respond(function(method, url, data) {
     postedStartDate = JSON.parse(data).start_date;
     return [200, {}];
   });

   $httpBackend.flush();
   expect(postedStartDate).toBe('');
   expect(campaignToSave.start_date.format).not.toHaveBeenCalled();
  });

  it('campaign should translate moments to iso date strings', function () {

   var date = moment();
   var campaignToSave = Campaign.$build({
     start_date: date
   });
   campaignToSave.$save();

   // capture posted value
   var postedStartDate;
   $httpBackend.expectPOST(/^\/cms\/api\/v1\/campaign\/$/).respond(function(method, url, data) {
     postedStartDate = JSON.parse(data).start_date;
     return [200, {}];
   });

   $httpBackend.flush();
   expect(postedStartDate).toEqual(date.format());
  });
});
