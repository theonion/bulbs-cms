'use strict';

describe('Service: CustomSearchService', function () {
  var
    _,
    $httpBackend,
    $rootScope,
    data,
    moment,
    CUSTOM_SEARCH_TIME_PERIODS,
    customSearchService;

  beforeEach(function () {
    module('customSearch.settings', function ($provide) {
      // to force debounce time to 0
      $provide.constant('CUSTOM_SEARCH_REQUEST_CAP_MS', 0);
    });

    module('bulbsCmsApp');
    module('bulbsCmsApp.mockApi');
    module('customSearch.service');

    inject(function (___, _$httpBackend_, _$rootScope_, _moment_, _CUSTOM_SEARCH_TIME_PERIODS_,
        CustomSearchService) {
      _ = ___;
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;
      CUSTOM_SEARCH_TIME_PERIODS = _CUSTOM_SEARCH_TIME_PERIODS_;
      moment = _moment_;

      data = {};

      customSearchService = new CustomSearchService(data);
    });
  });

  describe('group functionality', function () {
    it('should be able to add a new group', function () {
      var data = {abc: 123};
      var newGroup = customSearchService.groupsAdd(data);

      var groups = customSearchService.groupsList();
      expect(groups.length).toBe(1);
      expect(groups[0]).toBe(data);
      expect(newGroup.$result_count).toBe(0);
      expect(newGroup).toEqual(data);
    });

    it('should be able to remove a group', function () {
      var objToRemove = {'something': 123};

      customSearchService.groupsAdd(objToRemove);
      customSearchService.groupsAdd({});

      var removed = customSearchService.groupsRemove(0);

      var dataGroups = customSearchService._data.groups;
      expect(dataGroups.length).toBe(1);
      expect(dataGroups[0]).not.toEqual(objToRemove);
      expect(removed).toBe(true);
    });

    it('should return false from remove group function if group was not removed successfully', function () {
      customSearchService.groups = [];

      var removed = customSearchService.groupsRemove(10);

      expect(removed).toBe(false);
      expect(customSearchService.groupsList().length).toBe(0);
    });

    it('should be able to clear all groups', function () {
      var item1 = {'something': 123};
      var item2 = {'another thing': 456};

      customSearchService.groupsAdd(item1);
      customSearchService.groupsAdd(item2);

      customSearchService.groupsClear();

      expect(customSearchService.groupsList().length).toBe(0);
    });

    it('should be able to retrieve the content count for a group', function () {
      var count = 5;
      var index = 0;
      var group = {something: 123};

      customSearchService.groupsAdd(group);

      customSearchService.$groupsUpdateResultCountFor(index);

      $httpBackend.expectPOST('/cms/api/v1/custom-search-content/group_count/').respond(200, {count: count});
      $httpBackend.flush();

      expect(customSearchService.groupsResultCountGet(index)).toBe(count);
    });

    describe('condition functionality', function () {
      beforeEach(function () {
        customSearchService.groupsAdd({});
      });

      it('should be able to add a condition to a group', function () {
        var data = {abc:123};
        var index = 0;

        var newCondition = customSearchService.groupsConditionsAdd(index, data);

        var conditions = customSearchService.groupsConditionsList(index);
        expect(conditions.length).toBe(1);
        expect(conditions[index]).toBe(newCondition);
      });

      it('should be able to remove a condition from a group', function () {
        var data = {name: 'some condiiton'};
        var index = 0;
        var conditionIndex = 0;

        customSearchService.groupsConditionsAdd(index, data);

        var removed = customSearchService.groupsConditionsRemove(index, conditionIndex);

        var conditions = customSearchService.groupsConditionsList(index);
        expect(conditions.length).toBe(0);
        expect(removed).toBe(true);
      });

      it('should allow the addition of one time period condition to a group', function () {
        var groupIndex = 0;

        customSearchService.groupsTimePeriodSet(groupIndex);

        expect(customSearchService.groupsTimePeriodGet(groupIndex)).toEqual(CUSTOM_SEARCH_TIME_PERIODS[0].value);
      });

      it('should allow the removal of the time period condition from a group', function () {
        var groupIndex = 0;

        customSearchService.groupsTimePeriodSet(groupIndex);
        customSearchService.groupsTimePeriodRemove(groupIndex);

        expect(customSearchService.groupsTimePeriodGet(groupIndex)).toEqual(null);
      });

      describe('value functionality', function () {
        var groupIndex = 0;
        var conditionIndex = 0;

        beforeEach(function () {
          customSearchService.groupsConditionsAdd(groupIndex, {});
        });

        it('should be able to add values', function () {
          var value = {name: 'some value'};

          customSearchService.groupsConditionsValuesAdd(groupIndex, conditionIndex, value);

          expect(customSearchService.groupsConditionsValuesList(groupIndex, conditionIndex)[0]).toEqual(value);
        });

        it('should not allow the same value to be added twice', function () {
          var value = {name: 'a new value', value: 123, stupidHash: '123'};

          customSearchService.groupsConditionsValuesAdd(groupIndex, conditionIndex, value);
          customSearchService.groupsConditionsValuesAdd(groupIndex, conditionIndex, {name: 'a new value', value: 123, stupidHas: 'abc'});

          var values = customSearchService.groupsConditionsValuesList(groupIndex, conditionIndex);
          expect(values.length).toBe(1);
          expect(values[0]).toEqual(value);
        });

        it('should be able to remove values', function () {
          var value1 = {value: 'value 1'};
          var value2 = {value: 'value 2'};

          customSearchService._data.groups[groupIndex].conditions[conditionIndex].values.push(value1, {}, value2);

          customSearchService.groupsConditionsValuesRemove(groupIndex, conditionIndex, 1);

          var values = customSearchService.groupsConditionsValuesList(groupIndex, conditionIndex);
          expect(values.length).toBe(2);
          expect(values[0]).toEqual(value1);
          expect(values[1]).toEqual(value2);
        });

        it('should provide a way to clear all values', function () {
          customSearchService._data.groups[groupIndex].conditions[conditionIndex].values.push({}, {});

          customSearchService.groupsConditionsValuesClear(groupIndex, conditionIndex);

          expect(customSearchService.groupsConditionsValuesList(groupIndex, conditionIndex).length).toBe(0);
        });
      });
    });
  });

  describe('content list functionality', function () {
    var id = 1;

    it('should provide functionality to execute a search', function () {
      var responseData = {results: []};
      var addProps = {
        preview: true,
        page: customSearchService.$page,
        query: customSearchService.$query
      };

      data.includedIds = [1,2,3];

      spyOn(customSearchService, '_$getContent').andCallThrough();

      // clock mock for debounce
      jasmine.Clock.useMock();

      customSearchService.$retrieveContent();

      // force tick to fire debounce
      jasmine.Clock.tick(1);

      $httpBackend.expectPOST(/\/cms\/api\/v1\/custom-search-content\/(\?page=\d+)?$/).respond(responseData);
      $httpBackend.flush();

      expect(customSearchService._$getContent).toHaveBeenCalledWith(_.assign(addProps, data));
      expect(customSearchService.content.something).toBe(responseData.something);
    });

    it('should provide a function to filter content by excluded', function () {
      customSearchService._data.excludedIds = [1,2,3];
      customSearchService._data.includedIds = [5,6,7];

      spyOn(customSearchService, '_$getContent');

      customSearchService.$filterContentByExcluded();

      expect(customSearchService._$getContent).toHaveBeenCalledWith({
        includedIds: customSearchService._data.excludedIds,
        page: 1,
        query: ''
      });
    });

    it('should provide a function to filter content by included', function () {
      customSearchService._data.excludedIds = [1,2,3];
      customSearchService._data.includedIds = [5,6,7];

      spyOn(customSearchService, '_$getContent');

      customSearchService.$filterContentByIncluded();

      expect(customSearchService._$getContent).toHaveBeenCalledWith({
        includedIds: customSearchService._data.includedIds,
        page: 1,
        query: ''
      });
    });

    describe('included id functions', function () {
      it('should provide a way to manually include content', function () {
        customSearchService.includesAdd(id);

        expect(customSearchService.includesList()).toContain(id);
      });

      it('should provide a way to uninclude content', function () {
        customSearchService._data.includedIds.push(id);

        customSearchService.includesRemove(id);

        expect(customSearchService.includesList()).not.toContain(id);
      });

      it('should provide a way to check if content is included', function () {
        customSearchService._data.includedIds.push(id);

        expect(customSearchService.includesHas(id)).toBe(true);
      });

      it('should ensure included content is not excluded', function () {
        customSearchService._data.excludedIds.push(id);

        customSearchService.includesAdd(id);

        expect(customSearchService.excludesList()).not.toContain(id);
      });

      it('should not allow the same id to be included more than once', function () {
        customSearchService.includesAdd(id);
        customSearchService.includesAdd(id);

        expect(customSearchService.includesList().length).toBe(1);
      });
    });

    describe('excluded id functions', function () {
      it('should provide a way to exclude content', function () {
        customSearchService.excludesAdd(id);

        expect(customSearchService.excludesList()).toContain(id);
      });

      it('should provide a way to unexclude content', function () {
        customSearchService._data.excludedIds.push(id);

        customSearchService.excludesRemove(id);

        expect(customSearchService.excludesList()).not.toContain(id);
      });

      it('should provide a way to check if content is excluded', function () {
        customSearchService._data.excludedIds.push(id);

        expect(customSearchService.excludesHas(id)).toBe(true);
      });

      it('should ensure excluded content is not pinned or included', function () {
        customSearchService._data.pinnedIds.push(id);
        customSearchService._data.includedIds.push(id);

        customSearchService.excludesAdd(id);

        expect(customSearchService.pinsList()).not.toContain(id);
        expect(customSearchService.includesList()).not.toContain(id);
      });

      it('should not allow the same id to be excluded more than once', function () {
        customSearchService.excludesAdd(id);
        customSearchService.excludesAdd(id);

        expect(customSearchService.excludesList().length).toBe(1);
      });
    });

    describe('pinned id functions', function () {
      it('should provide a way to pin content by id', function () {
        customSearchService.pinsAdd(id);

        expect(customSearchService.pinsList()).toContain(id);
      });

      it('should provide a way to unpin content', function () {
        customSearchService._data.pinnedIds.push(id);

        customSearchService.pinsRemove(id);

        expect(customSearchService.pinsList()).not.toContain(id);
      });

      it('should provide a way to check if content is pinned', function () {
        customSearchService._data.pinnedIds.push(id);

        expect(customSearchService.pinsHas(id)).toBe(true);
      });

      it('should ensure pinned content is not excluded', function () {
        customSearchService._data.excludedIds.push(id);

        customSearchService.pinsAdd(id);

        expect(customSearchService.excludesList()).not.toContain(id);
      });

      it('should not allow the same id to be pinned more than once', function () {
        customSearchService.pinsAdd(id);
        customSearchService.pinsAdd(id);

        expect(customSearchService.pinsList().length).toBe(1);
      });
    });
  });
});
