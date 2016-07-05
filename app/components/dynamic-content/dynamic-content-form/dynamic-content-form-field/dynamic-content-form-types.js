'use strict';

angular.module('bulbs.cms.dynamicContent.form.types', [])
  .constant('FIELD_TYPES_META', {
    array: {
      tagName: 'dynamic-content-form-field-list',
      initialValue: []
    },
    object: {
      tagName: 'dynamic-content-form-field-object',
      initialValue: {}
    },
    string: {
      tagName: 'dynamic-content-form-field-text',
      initialValue: ''
    }
  });
