'use strict';

/**
 * Restmod mixin that looks for fieldDisplays in $configs, objects with a title and
 *  optionally a value and sorts property.
 *
 *  title is used to label a given field, should be unique.
 *
 *  value is an optional field transformed into a new property function called
 *    evalute; when invoked with a record, value string will evaluate with $parse,
 *    where 'record' is the given record.
 *
 *  sorts is an optional field that can be a string or a function. As a string it
 *    should be the name of a property to order by. As a function, it should take
 *    a direction--'asc'/undefined for the default direction, 'desc' for the opposite
 *    direction--and return an ordering string.
 *
 * Field display objects are available at the model level as the $fieldDisplays function.
 *  Returns a list of field displays to be used in templates.
 */
angular.module('apiServices.mixins.fieldDisplay', [
  'restmod'
])
  .factory('FieldDisplay', function($parse, restmod) {

    /**
     * Generates a function that can be passed a record and evalutes given value
     *  string agaist that record to return the string to be displayed to the user.
     *
     *  @param {string} value - string that will be evaluted with record as an instance
     *    of model, e.g. the value string 'record.name' would print out the instance's
     *    name property.
     *  @returns {function} takes a record and is evaluates the given value with given
     *    record.
     */
    var parserWrap = function (value) {
      // return a function that can be called with given string to generate parser
      return (function (value) {
        // return a function that will be called in template
        var parsed = $parse(value);
        return function (record) {
          // use angular's $parse to create a function that will eval in the correct scope
          return parsed({record: record});
        };
      })(value);
    };

    /**
     * Default sorting string builder. If field display object sorts property is a
     *  function, that will override the functionality provided by this function. Use
     *  this for more complex sorting strings, such as those that have multiple paramters.
     *
     * @param {String} sorts - sorts property provided by field display object. Should be
     *  the non-negated property name to sort on.
     * @returns {function} evaluated with a direction string, either 'asc'/undefined for the
     *  default sorting direction, or 'desc' for opposite sorting direction.
     */
    var getOrdering = function (sorts) {
      return (function (sorts) {
        return function (direction) {
          var ordering = '';
          if (direction === 'desc') {
            // do opposite of default sort
            ordering = '-' + sorts;
          } else {
            // do default sort, only supports 1 parameter
            ordering = sorts;
          }
          return ordering;
        };
      })(sorts);
   };

    return restmod.mixin(function () {

      this.define('Scope.$fieldDisplays', function () {
        var fieldDisplays = this.getProperty('fieldDisplays');
        if (fieldDisplays) {
          var i;
          for (i = 0; i < fieldDisplays.length; i++) {
            var fieldDisplay = fieldDisplays[i];

            // set up evaluation function if a value was provided
            if (fieldDisplay.value) {
              fieldDisplay.evaluate = parserWrap(fieldDisplay.value);
            }

            // set up storting function if sorts was provided
            fieldDisplay.getOrdering = function () {};
            if (fieldDisplay.sorts) {
              if (typeof fieldDisplay.sorts === 'function') {
                // sort function was provided, use that
                fieldDisplay.getOrdering = fieldDisplay.sorts;
              } else {
                // function not provided, use default one
                fieldDisplay.getOrdering = getOrdering(fieldDisplay.sorts);
              }
            }
          }
        }
        return fieldDisplays;
      });

    });
  });
