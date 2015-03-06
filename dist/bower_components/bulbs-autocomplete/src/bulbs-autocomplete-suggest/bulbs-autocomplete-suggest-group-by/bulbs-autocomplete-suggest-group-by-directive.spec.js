'use strict';

describe('Directive: bulbsAutocompleteSuggestGroupBy', function () {
  var
    $scope,
    $directiveScope,
    BULBS_AUTOCOMPLETE_EVENT_KEYPRESS,
    element,
    item1,
    item2,
    item3,
    item4;

  beforeEach(function () {
    module('BulbsAutocomplete');
    module('BulbsAutocomplete.suggest.groupBy');
    module('jsTemplates');

    inject(function (_$rootScope_, $compile, _BULBS_AUTOCOMPLETE_EVENT_KEYPRESS_) {
      $scope = _$rootScope_.$new();
      BULBS_AUTOCOMPLETE_EVENT_KEYPRESS = _BULBS_AUTOCOMPLETE_EVENT_KEYPRESS_;

      item1 = {
        name: 'item 1',
        value: 10
      };
      item2 = {
        name: 'item 2',
        value: 20
      };
      item3 = {
        name: 'item 3',
        value: 30
      };
      item4 = {
        name: 'item 4',
        value: 40
      };

      $scope.formatter = function (item) {
        return item;
      };
      $scope.grouper = function () {
        return {
          'group 1': [item1, item2],
          'group 2': [item3, item4]
        };
      };
      $scope.items = [item1, item2, item3, item4];
      $scope.onSelect = function () {};

      spyOn($scope, 'grouper').and.callThrough();
      spyOn($scope, 'onSelect').and.callThrough();

      element = $compile('<bulbs-autocomplete-suggest-group-by formatter="formatter(item)" grouper="grouper" items="items" on-select="onSelect(selection)"></bulbs-autocomplete-suggest-group-by>')($scope.$new());
      _$rootScope_.$digest();
      $directiveScope = element.isolateScope();

      spyOn($directiveScope, 'formatter').and.callThrough();
    });
  });

  it('should add grouped items to the scope when items changes', function () {
    $scope.items = [item1];
    $scope.$digest();

    expect($directiveScope.formatter).toHaveBeenCalled();
    expect($scope.grouper).toHaveBeenCalled();
    expect($directiveScope.groupedItems).toBeDefined();
  });

  it('should call onSelect when a group is selected and enter is pressed', function () {
    $directiveScope.selectedGroupIndex = 0;
    $directiveScope.selectedIndex = 0;

    $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, {
      keyCode: 13
    });

    expect($scope.onSelect).toHaveBeenCalledWith(item1);
  });


  it('#keyPress should should reset indexes to -1 when selectedGroupIndex is out of bounds', function () {
    $directiveScope.selectedGroupIndex = 10;
    $directiveScope.selectedIndex = 0;

    $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, {
      keyCode: 38
    });
    $scope.$digest(function () {
      expect($directiveScope.selectedGroupIndex).toBe(-1);
      expect($directiveScope.selectedIndex).toBe(-1);
    });

  });

  describe('up key', function () {

    it('should move up a group, bottom item when at the top of a group', function () {
      $directiveScope.selectedGroupIndex = 1;
      $directiveScope.selectedIndex = 0;

      $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, {
        keyCode: 38
      });
      $scope.$digest();

      expect(element
          .find('ul.bulbs-autocomplete-group-items:eq(0) > li:nth-child(2)')
          .hasClass('active'))
        .toBe(true);
    });

    it('should move up an item when not at the top of a group', function () {
      $directiveScope.selectedGroupIndex = 1;
      $directiveScope.selectedIndex = 1;

      $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, {
        keyCode: 38
      });
      $scope.$digest();

      expect(element
          .find('ul.bulbs-autocomplete-group-items:eq(1) > li:nth-child(1)')
          .hasClass('active'))
        .toBe(true);
    });

    it('should loop back around to the bottom group, bottom item when at the top of the top group', function () {
      $directiveScope.selectedGroupIndex = 0;
      $directiveScope.selectedIndex = 0;

      $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, {
        keyCode: 38
      });
      $scope.$digest();

      expect(element
          .find('ul.bulbs-autocomplete-group-items:eq(1) > li:nth-child(2)')
          .hasClass('active'))
        .toBe(true);
    });
  });

  describe('down key', function () {
    it('should move down a group, top item when at the bottom of a group', function () {
      $directiveScope.selectedGroupIndex = 0;
      $directiveScope.selectedIndex = 1;

      $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, {
        keyCode: 40
      });
      $scope.$digest();

      expect(element
          .find('ul.bulbs-autocomplete-group-items:eq(1) > li:nth-child(1)')
          .hasClass('active'))
        .toBe(true);
    });

    it('should move down an item when not at the bottom of a group', function () {
      $directiveScope.selectedGroupIndex = 0;
      $directiveScope.selectedIndex = 0;

      $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, {
        keyCode: 40
      });
      $scope.$digest();

      expect(element
          .find('ul.bulbs-autocomplete-group-items:eq(0) > li:nth-child(2)')
          .hasClass('active'))
        .toBe(true);
    });

    it('should loop back around to the top group, top item when at the bottom of the bottom group', function () {
      $directiveScope.selectedGroupIndex = 1;
      $directiveScope.selectedIndex = 1;

      $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, {
        keyCode: 40
      });
      $scope.$digest();

      expect(element
          .find('ul.bulbs-autocomplete-group-items:eq(0) > li:nth-child(1)')
          .hasClass('active'))
        .toBe(true);
    });
  });
});
