'use strict';

angular.module('templateTypeField', [
  'templateTypeField.directive'
])
  .value('TEMPLATE_TYPES', [{
      name: 'Small Width',
      slug: 'small-width',
      content_type: 'content_content'
    }, {
      name: 'Large Width',
      slug: 'large-width',
      content_type: 'content_content'
    }]);
