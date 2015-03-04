'use strict';

describe('Factory: CustomSearchServiceQuery', function () {
  var
    _,
    $httpBackend,
    CustomSearchServiceCondition,
    customSearchServiceQuery,
    CUSTOM_SEARCH_TIME_PERIODS;

  beforeEach(function () {
    module('bulbsCmsApp');
    module('bulbsCmsApp.mockApi');
    module('customSearch.service.query.factory');

    inject(function (___, _$httpBackend_, _CustomSearchServiceCondition_,
        _CUSTOM_SEARCH_TIME_PERIODS_, CustomSearchServiceQuery) {
      _ = ___;
      $httpBackend = _$httpBackend_;
      CustomSearchServiceCondition = _CustomSearchServiceCondition_;
      customSearchServiceQuery = new CustomSearchServiceQuery();
      CUSTOM_SEARCH_TIME_PERIODS = _CUSTOM_SEARCH_TIME_PERIODS_;
    });
  });

  it('should be able to summarize itself as a plain object', function () {
    var condition = new CustomSearchServiceCondition();

    spyOn(condition, 'asQueryData');

    customSearchServiceQuery.conditions.push(condition);
    customSearchServiceQuery.time = CUSTOM_SEARCH_TIME_PERIODS[0].value;

    var data = customSearchServiceQuery.asQueryData();

    expect(condition.asQueryData).toHaveBeenCalled();
    expect(_.isArray(data.conditions)).toBe(true);
    expect(data.time).toBe(CUSTOM_SEARCH_TIME_PERIODS[0].value);
  });

  it('should be able to retrieve the content count for a query', function () {
    var count = 5;

    customSearchServiceQuery.$updateResultCount();

    $httpBackend.expectPOST('/cms/api/v1/custom-search-content/count/').respond(200, {count: count});
    $httpBackend.flush();

    expect(customSearchServiceQuery.result_count).toBe(count);
  });

  it('should be able to add a condition', function () {
    var newCondition = customSearchServiceQuery.newCondition();

    expect(customSearchServiceQuery.conditions.length).toBe(1);
    expect(customSearchServiceQuery.conditions[0]).toBe(newCondition);
    expect(newCondition instanceof CustomSearchServiceCondition).toBe(true);
  });

  it('should be able to remove a condition', function () {
    var newCondition = {name: 'some condiiton'};
    customSearchServiceQuery.conditions.push(newCondition);

    var removed = customSearchServiceQuery.removeCondition(0);

    expect(customSearchServiceQuery.conditions.length).toBe(0);
    expect(removed).toBe(true);
  });

  it('should allow the addition of one time period condition', function () {
    customSearchServiceQuery.addTimePeriod();

    expect(customSearchServiceQuery.time).toEqual(CUSTOM_SEARCH_TIME_PERIODS[0].value);
  });

  it('should allow the removal of the time period condition', function () {
    customSearchServiceQuery.removeTimePeriod();

    expect(customSearchServiceQuery.time).toEqual(null);
  });
});
