'use strict';

describe('Factory: CustomSearchServiceCondition', function () {
  var
    customSearchServiceCondition;

  beforeEach(function () {
    module('bulbsCmsApp');
    module('bulbsCmsApp.mockApi');
    module('customSearch.service.condition.factory');

    inject(function (CustomSearchServiceCondition) {
      customSearchServiceCondition = new CustomSearchServiceCondition();
    });
  });

  it('should be able to add values', function () {
    var value = {name: 'some value'};

    customSearchServiceCondition.addValue(value);

    expect(customSearchServiceCondition.values[0]).toEqual(value);
  });

  it('should not allow the same value to be added twice', function () {
    var value = {name: 'a new value', value: 123, stupidHash: '123'};

    customSearchServiceCondition.addValue(value);
    customSearchServiceCondition.addValue({name: 'a new value', value: 123, stupidHas: 'abc'});

    expect(customSearchServiceCondition.values.length).toBe(1);
    expect(customSearchServiceCondition.values[0]).toEqual(value);
  });

  it('should be able to remove values', function () {
    var value1 = {value: 'value 1'};
    var value2 = {value: 'value 2'};

    customSearchServiceCondition.values.push(value1, {}, value2);

    customSearchServiceCondition.removeValue(1);

    expect(customSearchServiceCondition.values.length).toBe(2);
    expect(customSearchServiceCondition.values[0]).toEqual(value1);
    expect(customSearchServiceCondition.values[1]).toEqual(value2);
  });

  it('should provide a way to clear all values', function () {
    customSearchServiceCondition.values.push({}, {});

    customSearchServiceCondition.clearAllValues();

    expect(customSearchServiceCondition.values.length).toBe(0);
  });
});
