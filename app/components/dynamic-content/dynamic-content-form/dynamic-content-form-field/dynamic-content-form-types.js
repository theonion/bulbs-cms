'use strict';

angular.module('bulbs.cms.dynamicContent.form.types', [])
  .constant('FIELD_TYPES_META', {
    array: {
      tagName: 'dynamic-content-form-field-list',
      initialValue: []
    },
    datetime: {
      tagName: 'dynamic-content-form-field-date-time',
      initialValue: null
    },
    object: {
      tagName: 'dynamic-content-form-field-object',
      initialValue: {}
    },
    richtext: {
      tagName: 'dynamic-content-form-field-text',
      initialValue: ''
    },
    'boolean': {
      tagName: 'dynamic-content-form-field-boolean',
      initialValue: false
    },
  });
