'use strict';

describe('Service: CustomSearchService', function () {
  var
    _,
    $httpBackend,
    $rootScope,
    moment,
    CustomSearchServiceQuery,
    customSearchService;

  beforeEach(function () {
    module('customSearch.settings', function ($provide) {
      // to force debounce time to 0
      $provide.constant('CUSTOM_SEARCH_REQUEST_CAP_MS', 0);
    });

    module('bulbsCmsApp');
    module('bulbsCmsApp.mockApi');
    module('customSearch.service');

    inject(function (___, _$httpBackend_, _$rootScope_, _CustomSearchServiceQuery_,
          _moment_, CustomSearchService) {
      _ = ___;
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;
      CustomSearchServiceQuery = _CustomSearchServiceQuery_;
      moment = _moment_;
      customSearchService = new CustomSearchService();
    });
  });

  it('should be able to summarize itself as query data', function () {
    var query = {
      asQueryData: function () {}
    };

    spyOn(query, 'asQueryData');

    customSearchService.groups.push(query);

    var data = customSearchService.asQueryData();

    expect(query.asQueryData).toHaveBeenCalled();
    expect(_.isArray(data.groups)).toBe(true);
  });

  describe('query functionality', function () {

    it('should be able to add a new query', function () {
      var newQuery = customSearchService.newQuery();

      expect(customSearchService.groups.length).toBe(1);
      expect(customSearchService.groups[0]).toBe(newQuery);
      expect(newQuery instanceof CustomSearchServiceQuery).toBe(true);
    });

    it('should be able to remove a query', function () {
      var objToRemove = {'something': 123};

      customSearchService.groups.push(objToRemove, {});

      var removed = customSearchService.removeQuery(0);

      expect(customSearchService.groups.length).toBe(1);
      expect(customSearchService.groups[0]).not.toEqual(objToRemove);
      expect(removed).toBe(true);
    });

    it('should return false from remove query function if query was not removed successfully', function () {
      customSearchService.groups = [];

      var removed = customSearchService.removeQuery(10);

      expect(removed).toBe(false);
      expect(customSearchService.groups.length).toBe(0);
    });

    it('should be able to clear all queries', function () {
      var item1 = {'something': 123};
      var item2 = {'another thing': 456};

      customSearchService.groups.push(item1, item2);

      customSearchService.clearAllQueries();

      expect(customSearchService.groups.length).toBe(0);
    });
  });

  describe('content list functionality', function () {
    var id = 1;

    it('should provide functionality to execute a search', function () {
      var data = {results: []};

      spyOn(customSearchService, 'asQueryData').andCallThrough();
      spyOn(customSearchService, '_$getContent').andCallThrough();

      // clock mock for debounce
      jasmine.Clock.useMock();

      customSearchService.$retrieveContent();

      // force tick to fire debounce
      jasmine.Clock.tick(1);

      $httpBackend.expectPOST('/cms/api/v1/custom-search-content/').respond(data);
      $httpBackend.flush();

      expect(customSearchService.asQueryData).toHaveBeenCalled();
      expect(customSearchService._$getContent).toHaveBeenCalled();
      expect(customSearchService.content.something).toBe(data.something);
    });

    it('should provide a function to filter content by excluded', function () {
      customSearchService.excluded_ids = [1,2,3];
      customSearchService.included_ids = [5,6,7];

      spyOn(customSearchService, '_$getContent');

      customSearchService.$filterContentByExcluded();

      expect(customSearchService._$getContent).toHaveBeenCalledWith({
        groups: [],
        excluded_ids: customSearchService.excluded_ids,
        page: 1,
        query: ''
      });
    });

    it('should provide a function to filter content by included', function () {
      customSearchService.excluded_ids = [1,2,3];
      customSearchService.included_ids = [5,6,7];

      spyOn(customSearchService, '_$getContent');

      customSearchService.$filterContentByIncluded();

      expect(customSearchService._$getContent).toHaveBeenCalledWith({
        groups: [],
        included_ids: customSearchService.included_ids,
        page: 1,
        query: ''
      });
    });

    it('should provide a way to pin content by id', function () {
      customSearchService.pin(id);

      expect(customSearchService.pinned_ids).toContain(id);
    });

    it('should provide a way to unpin content', function () {
      customSearchService.pinned_ids.push(id);

      customSearchService.unpin(id);

      expect(customSearchService.pinned_ids).not.toContain(id);
    });

    it('should provide a way to check if content is pinned', function () {
      customSearchService.pinned_ids.push(id);

      expect(customSearchService.isPinned(id)).toBe(true);
    });

    it('should ensure pinned content is not excluded', function () {
      customSearchService.excluded_ids.push(id);

      customSearchService.pin(id);

      expect(customSearchService.excluded_ids).not.toContain(id);
    });

    it('should not allow the same id to be pinned more than once', function () {
      customSearchService.pin(id);
      customSearchService.pin(id);

      expect(customSearchService.pinned_ids.length).toBe(1);
    });

    it('should provide a way to exclude content', function () {
      customSearchService.exclude(id);

      expect(customSearchService.excluded_ids).toContain(id);
    });

    it('should provide a way to unexclude content', function () {
      customSearchService.excluded_ids.push(id);

      customSearchService.unexclude(id);

      expect(customSearchService.excluded_ids).not.toContain(id);
    });

    it('should provide a way to check if content is excluded', function () {
      customSearchService.excluded_ids.push(id);

      expect(customSearchService.isExcluded(id)).toBe(true);
    });

    it('should ensure excluded content is not pinned or included', function () {
      customSearchService.pinned_ids.push(id);
      customSearchService.included_ids.push(id);

      customSearchService.exclude(id);

      expect(customSearchService.pinned_ids).not.toContain(id);
      expect(customSearchService.included_ids).not.toContain(id);
    });

    it('should not allow the same id to be excluded more than once', function () {
      customSearchService.exclude(id);
      customSearchService.exclude(id);

      expect(customSearchService.excluded_ids.length).toBe(1);
    });

    it('should provide a way to manually include content', function () {
      customSearchService.include(id);

      expect(customSearchService.included_ids).toContain(id);
    });

    it('should provide a way to uninclude content', function () {
      customSearchService.included_ids.push(id);

      customSearchService.uninclude(id);

      expect(customSearchService.included_ids).not.toContain(id);
    });

    it('should provide a way to check if content is included', function () {
      customSearchService.included_ids.push(id);

      expect(customSearchService.isIncluded(id)).toBe(true);
    });

    it('should ensure included content is not excluded', function () {
      customSearchService.excluded_ids.push(id);

      customSearchService.include(id);

      expect(customSearchService.excluded_ids).not.toContain(id);
    });

    it('should not allow the same id to be included more than once', function () {
      customSearchService.include(id);
      customSearchService.include(id);

      expect(customSearchService.included_ids.length).toBe(1);
    });
  });
});
