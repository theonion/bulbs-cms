'use strict';

angular.module('bulbs.cms.base.config', [
  'bulbs.cms.config',
  'bulbs.cms.customSearch.config',
  'ngClipboard'
])
  .config([
    'CmsConfigProvider', 'CustomSearchConfigProvider', 'ngClipProvider',
    function (CmsConfigProvider, CustomSearchConfigProvider, ngClipProvider) {

      CmsConfigProvider
        .setContentPartialsPath('/content_type_views')
        .setComponentPath('/components')
        .setDirectivePartialsPath('/views')
        .setSharedPath('/shared')
        .setTopBarMapping('nav', '/views/nav.html')
        .setTopBarMapping('reportbar', '/views/reportbar.html')
        .setTopBarMapping('toolbar', '/views/toolbar.html')
        .setUnpublishedPath('unpublished');

      CustomSearchConfigProvider
        .addConditionField('Content Type', 'content-type', 'name', 'doctype')
        .addConditionField('Feature Type', 'feature-type', 'name', 'slug')
        .addConditionField('Tag', 'tag', 'name', 'slug')
        .addConditionType('is any of', 'any')
        .addConditionType('is all of', 'all')
        .addConditionType('is none of', 'none')
        .addTimePeriod('Past Day', 'Past day')
        .addTimePeriod('Past Week', 'Past week')
        .addTimePeriod('Past Month', 'Past month');

      ngClipProvider.setPath('/bower_components/zeroclipboard/dist/ZeroClipboard.swf');
    }
  ]);
