'use strict';
/*jshint -W030 */

describe('ContentListService', function () {

  var ContentListService,
      _,
      $httpBackend,
      $location,
      $q,
      $rootScope;

  beforeEach(function() {
    module('bulbsCmsApp');
    module('bulbsCmsApp.mockApi');
    module('contentServices.listService');

    inject(function (_$location_){
      $location = _$location_;
      // mock some location stuff
      $location.search({hello: 123, bye: 'abc'});
    });

    inject(function(___, _$httpBackend_, _$location_, _$q_, _$rootScope_, _ContentListService_) {
      _ = ___; // nice
      $httpBackend = _$httpBackend_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      ContentListService = _ContentListService_;
    });
  });

  it('Should make the data object available through getData()', function () {
    var data = ContentListService.getData();
    expect(data).not.to.be.undefined;
  });

  it('Should use $location.search() to initially populate filters', function () {
    var data = ContentListService.getData();
    expect(data.filters.hello).to.equal(123);
    expect(data.filters.bye).to.equal('abc');
  });

  it('Should update data.filters on updateFilters()', function () {
    // copy filters before performing update, then update
    var filtersBefore = _.cloneDeep(ContentListService.getData().filters);
    var newFilters = {page: 1, something: 'abc'};
    ContentListService.updateFilters(newFilters);
    // check that everything has been updated
    var data = ContentListService.getData();
    expect(data).not.to.equal(filtersBefore);
    expect(data.filters.page).to.equal(newFilters.page);
    expect(data.filters.something).to.equal(newFilters.something);
  });

  it('Should overwrite filters when updateFilters with merge=false is called', function () {
    var newFilters = {new: 'yes!', ones: 123};
    ContentListService.updateFilters(newFilters, false);
    expect(ContentListService.getData().filters).to.equal(newFilters);
  });

  it('Should update data.content and data.totalItems on $updateContent()', function () {
    var response = {
      count: 2,
      results: [{
        title: 'Mom Gathers Rolls Of Wrapping Paper Around Her To Stroke Softly'
      },
      {
        title: '10 People Who Made No Difference In 2014'
      }]
    };
    $httpBackend.expectGET(/\/cms\/api\/v1\/content/).respond(response);
    var update = ContentListService.$updateContent({abc: 123, something: 'something'});
    $httpBackend.flush();

    // set up promise callback
    update.then(function (data) {
      expect(data.content[0].title).to.equal(response.results[0].title);
      expect(data.content[1].title).to.equal(response.results[1].title);
      expect(data.totalItems).to.equal(2);
    });
    $rootScope.$apply();

    // expect that the data object has updated
    var data = ContentListService.getData();
    expect(data.filters.abc).to.equal(123);
    expect(data.filters.something).to.equal('something');
    expect(data.content[0].title).to.equal(response.results[0].title);
    expect(data.content[1].title).to.equal(response.results[1].title);
    expect(data.totalItems).to.equal(2);

  });

});
