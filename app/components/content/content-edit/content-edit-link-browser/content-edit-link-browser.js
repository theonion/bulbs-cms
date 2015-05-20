'use strict';

/**
 * When adding links in the editor, allows searching through content to link.
 */
angular.module('content.edit.linkBrowser', [
  'cms.config',
  'jquery'
])
  .service('LinkBrowser', function ($, CmsConfig) {
     window.avLinkBrowser = function(term, resultsElement) {
       resultsElement.html('<div class="items"></div><hr><span class="type">Articles</span><ul class="content"></ul>');

       $.ajax(CmsConfig.buildBackendUrl('/search/autocomplete?q=' + term))
         .success(function(resp) {
           $('.items', resultsElement).html(resp);
         });

       $.ajax(CmsConfig.buildBackendUrl('/cms/api/v1/content/?search=' + term))
         .success(function(resp) {
           for (var i=0; i < Math.min(resp.count, 20); i ++) {
             var link = $('<A>')
               .attr('href',resp.results[i].absolute_url)
               .html('<span class="feature_type">' + resp.results[i].feature_type + '</span>' + resp.results[i].title);
             $('.content', resultsElement).append($('<li>').append(link));
           }
         });
     };
  });
