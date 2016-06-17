angular.module('bulbs.cms.customSearch.config', [
  'lodash'
])
  .provider('CustomSearchConfig', [
    '_',
    function (_) {

      var error = BulbsCmsConfigError.build('CustomSearchConfig');
      var checkOrError = function (value, test, errorMsg) {
        if (test(value)) {
          return value;
        }
        throw new error(errorMsg);
      };

      // condition fields to display
      var conditionFieldMappings = [];
      // condition types to display
      var conditionTypes = []
      // time periods to display
      var timePeriodMappings = [];
      // maximum number of milliseconds to wait for a request to complete
      var requestCapMs = 150;

      this.addConditionField = function (name, endpoint,
          valueStructureName, valueStructureValue) {

        conditionFieldMappings.push({
          name: checkOrError(
            name, _.isString,
            'condition field name must be a string!'
          ),
          endpoint: checkOrError(
            endpoint, _.isString,
            'condition field endpoint must be a string!'
          ),
          value_structure: {
            name: checkOrError(
              valueStructureName, _.isString,
              'condition field value structure name must be a string!'
            ),
            value: checkOrError(
              valueStructureValue, _.isString,
              'condition field value structure value must be a string!'
            )
          }
        });
        return this;
      };

      this.addConditionType =  function (name, value) {
        conditionTypes.push({
          name: checkOrError(
            name, _.isString,
            'condition type name must be a string!'
          ),
          value: checkOrError(
            value, _.isString,
            'condition type value must be a string!'
          )
        });
        return this;
      };

      this.addTimePeriod = function (name, value) {
        timePeriodMappings.push({
          name: checkOrError(
            name, _.isString,
            'time period name must be a string!'
          ),
          value: checkOrError(
            value, _.isString,
            'time period value must be a string!'
          )
        });
        return this;
      };

      this.setRequestCapMs = function (value) {
        requestCapMs = checkOrError(
          value, _.isNumber,
          'request cap milliseconds must be a number!'
        );
        return this;
      };

      this.$get = [
        function () {
          return {
            getConditionFields: _.constant(conditionFieldMappings),
            getConditionTypes: _.constant(conditionTypes),
            getRequestCapMs: _.constant(requestCapMs),
            getTimePeriods: _.constant(timePeriodMappings)
          };
        }
      ];
    }
  ]);
