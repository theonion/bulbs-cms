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
    color: {
      tagName: 'dynamic-content-form-field-color',
      initialValue: '#000000' // Paint It Black -- Rolling Stones
    }
  });
