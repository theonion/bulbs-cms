'use strict';

/**
 * Main service for promoted content page. Handles all data, all data modifications
 *  for this page should be done through this service.
 */
angular.module('promotedContent.service', [
  'contentServices',
  'moment',
  'restangular'
])
  .service('PromotedContentService', function ($, _, moment, $q, Restangular,
      ContentFactory, ContentListService) {

    var PromotedContentService = this;
    PromotedContentService._serviceData = {
      allContent: ContentListService.getData(),
      actionContent: null,
      action: null,
      pzones: [],
      unsavedOperations: [],
      operations: [],
      selectedPZone: null,
      previewTime: null
    };
    var _data = PromotedContentService._serviceData;

    // promise that resolves once this service is done setting up
    var setupDefer = $q.defer();

    var readableOperationTypes = {
      INSERT: 'INSERT',
      DELETE: 'DELETE',
      REPLACE: 'REPLACE'
    };
    PromotedContentService.readableOperationTypes = readableOperationTypes;

    var operationTypeToReadable = {
      'promotion_insertoperation': readableOperationTypes.INSERT,
      'promotion_deleteoperation': readableOperationTypes.DELETE,
      'promotion_replaceoperation': readableOperationTypes.REPLACE
    };
    var readableToOperationType =
      _.reduce(operationTypeToReadable, function (result, val, key) {
        result[val] = key;
        return result;
      }, {});

    // flag to check if there's a pzone data refresh pending
    var pzoneRefreshPending = false;
    // flag to check if operations data is stale
    var pzoneOperationsStale = true;

    /**
     * Getter for refresh pending flag. Use this to check if a pzone is in the
     *  process of loading its data, to prevent editing.
     *
     * @returns {Boolean} true if pzone data is refreshing, false otherwise.
     */
    PromotedContentService.isPZoneRefreshPending = function () {
      return pzoneRefreshPending;
    };

    /**
     * Getter for pzone operations stale flag. Use this to check if operations list
     *  is out of sync and needs to be refreshed before data is accurate.
     *
     * @returns {Boolean} ture if pzone operations are stale, false otherwise.
     */
    PromotedContentService.isPZoneOperationsStale = function () {
      return pzoneOperationsStale;
    };

    /**
     * Refresh pzone data, given the following parameters:
     *
     * @param {Object} filters - filter zones with these parameters.
     * @returns {Promise} resolves with pzone data, or rejects with an error message.
     */
    PromotedContentService.$refreshPZones = function (filters) {
      var deferred = $q.defer();

      // start a new request if one isn't already pending
      if (!pzoneRefreshPending) {
        pzoneRefreshPending = true;

        return ContentFactory.all('pzone').getList(filters)
          .then(function (data) {
            _data.pzones = data;
            // mark everything as saved
            _.each(_data.pzones, function (pzone) {
              pzone.saved = true;
            });

            deferred.resolve();

            // resolve with pzones
            return _data.pzones;
          })
          .catch(function (err) {
            deferred.reject();
            return err;
          })
          .finally(function () {
            pzoneRefreshPending = false;
          });
      } else {
        deferred.reject();
      }

      return deferred.promise;
    };

    /**
     * Mark selected pzone as dirty.
     */
    PromotedContentService.markDirtySelectedPZone = function () {
      delete _data.selectedPZone.saved;
    };

    /**
     * Mark selected pzone as saved (not dirty).
     */
    PromotedContentService.markSavedSelectedPZone = function () {
      _data.selectedPZone.saved = true;
    };

    /**
     * Make the list of operations stale, meaning the user will have to manually
     *  refresh it.
     */
    PromotedContentService.makeOperationsStale = function () {
      _data.operations = [];
      pzoneOperationsStale = true;
    };

    /**
     * Save the currently selected pzone by posting all operations at currently
     *  selected time. If no time is selected, pzone will be immediately updated.
     *
     * @returns {Promise} resolves with selected pzone once saving is done.
     */
    PromotedContentService.$saveSelectedPZone = function () {
      var defer = $q.defer();

      if (_data.previewTime && _data.previewTime.isAfter(moment())) {
        PromotedContentService.makeOperationsStale();

        // grab operations out of unsaved operations and post them into operations list
        _.each(_data.unsavedOperations, function (operation) {
          // use preview time, or send null if immediate
          operation.when = _data.previewTime ? _data.previewTime.toISOString() : null;
          // remove client side client_id
          delete operation.client_id;
        });

        // post all operations as an array
        _data.selectedPZone.all('operations').post(_data.unsavedOperations)
          .then(function () {
            defer.resolve(_data.selectedPZone);
          });

        // clear whatever unsaved operations we have, shouldn't be any in this case
        PromotedContentService.clearUnsavedOperations();

      } else if (!_data.previewTime){
        // clear whatever unsaved operations we have, shouldn't be an in this case
        PromotedContentService.clearUnsavedOperations();

        PromotedContentService.makeOperationsStale();

        // no preview time is set, post pzone immediately
        _data.selectedPZone.put()
          .then(function () {
            defer.resolve(_data.selectedPZone);
          })
          .catch(function (err) {
            defer.reject(err);
          });
      } else {
        // preview time is in the past, error out
        defer.reject('Cannot save operations in the past.');
      }

      return defer.promise;
    };

    /**
     * Refresh content data using ContentListService.
     *
     * @param {...object} var_args - arguments taken by [ContentListService.$updateContent]{@link ContentListService#$updateContent}.
     * @returns {Promise} resolves based on [ContentListService.$updateContent]{@link ContentListService#$updateContent}.
     */
    PromotedContentService.$refreshAllContent = function () {
      return ContentListService.$updateContent.apply(ContentListService, arguments);
    };

    /**
     * Create a new operation. Note, this will not be saved until user clicks
     *  save, at which point the new item should be posted to the operations list.
     *  If preview time is set to immediate, no operation will be created, and this
     *  function will resolve with nothing.
     *
     * @param {Object} props - properties of new operation.
     * @returns {Promise} resolves with new operation or nothing, or rejects with an error message.
     */
    PromotedContentService.$addOperation = function (props) {
      var defer = $q.defer();

      if (!PromotedContentService.isPreviewTimeImmediate()) {
        if (!PromotedContentService.isPreviewTimePast()) {
          var lastId = _.max(_data.unsavedOperations, 'client_id').client_id;
          var nextId = lastId ? lastId + 1 : 0;
          var allProps = _.assign({
            client_id: nextId,
            type_name: readableToOperationType[props.cleanType] || '',
            pzone: _data.selectedPZone.id,
            applied: false,
            content: null,
            content_title: '',
            index: null
          }, props);

          var operation = Restangular.restangularizeElement(
            _data.selectedPZone.all('operations'), allProps
          );
          _data.unsavedOperations.push(operation);

          defer.resolve(operation);
        } else {
          // we are looking at the past, we cannot add new operations
          defer.reject('Cannot add operations in the past.');
        }
      } else {
        // preview time is immediate, don't add an operation
        defer.resolve();
      }

      return defer.promise;
    };

    /**
     * Remove an operation from operation list. Only saved, future operations are removable.
     *
     * @param {Number} id - id of operation to remove.
     * @returns {Promise} promise that resolves with nothing, or rejects with an
     *  error message.
     */
    PromotedContentService.$removeOperation = function (id) {
      var defer = $q.defer();

      // delete this from the saved operations list
      var index = _.findIndex(_data.operations, {id: id});
      var operation = _data.operations[index];
      if (operation) {
        if (operation.whenAsMoment.isAfter(moment())) {
          operation.remove()
            .then(function () {
              // remove operation and resolve
              _data.operations.splice(index, 1);
              defer.resolve();
            })
            .catch(function (err) {
              if (err.status === 404) {
                defer.reject('Cannot find operation to delete.');
              } else {
                defer.reject(err);
              }
            });
        } else {
          defer.reject('Cannot delete an operation in the past.');
        }
      } else {
        defer.reject('Could not find saved operation with id ' + id + ' to delete.');
      }

      return defer.promise;
    };

    /**
     * Clear unsaved operations list.
     */
    PromotedContentService.clearUnsavedOperations = function () {
      _data.unsavedOperations = [];
      PromotedContentService.markSavedSelectedPZone();
    };

    /**
     * Refresh operations data for selected pzone. Each operation returned will
     *  contain an additional property called cleanType that is the clean,
     *  displayable representation of the operation type.
     *
     * GOD DAMN IT RACE CONDITIONS NOTE: To avoid race conditions, only call
     *  this function as a result of user interaction.
     *
     * @param {object} params - query parameters to append to request.
     * @returns {Promise} resolves with operation data, or rejects with an error message.
     */
    PromotedContentService.$refreshOperations = function (params) {
      return _data.selectedPZone.getList('operations', params)
        .then(function (data) {

          _data.operations = data;

          _.each(_data.operations, function (operation) {
            operation.cleanType = operationTypeToReadable[operation.type_name];
            operation.whenAsMoment = moment(operation.when);
          });

          pzoneOperationsStale = false;

          return _data.operations;
        })
        .catch(function (err) {
          return err;
        });
    };

    /**
     * Select a pzone with the given name. Will refresh operations list.
     *
     * @param {string} [name] - name of pzone to select, selects first pzone if
     *  name not provided.
     * @returns {Promise} resolves based on $refreshSelectedPZone Promise.
     */
    PromotedContentService.$selectPZone = function (name) {
      // select pzone to edit
      _data.selectedPZone = _.find(_data.pzones, {name: name}) || _data.pzones[0];

      // immediately clear any unsaved operations
      PromotedContentService.clearUnsavedOperations();

      // begin refreshing interface with new pzone data
      return PromotedContentService.$refreshSelectedPZone(_data.previewTime);
    };

    /**
     * Remove content from currently selected pzone.
     *
     * @param {Number} contentId - id of content to delete.
     * @returns {Promise} resolves if content removed, or rejects with an error message.
     */
    PromotedContentService.$removeContentFromPZone = function (contentId) {
      var defer = $q.defer();
      var i = _.findIndex(_data.selectedPZone.content, {id: contentId});
      if (i >= 0) {
        // found it, splice away
        PromotedContentService.$addOperation({
          cleanType: readableOperationTypes.DELETE,
          content: contentId,
          content_title: _data.selectedPZone.content[i].title
        }).then(function () {
          PromotedContentService.markDirtySelectedPZone();
          _data.selectedPZone.content.splice(i, 1);
          defer.resolve();
        }).catch(function (err) {
          defer.reject(err);
        });
      } else {
        defer.reject('Could not find content with given id to delete.');
      }
      return defer.promise;
    };

    /**
     * Content moving function.
     *
     * @param {Number} indexFrom - Index to move content from.
     * @param {Number} indexTo - Index to move content to.
     * @returns {Boolean} true if content moved, false otherwise.
     */
    var moveTo = function (indexFrom, indexTo) {
      var ret = false;
      var content = _data.selectedPZone.content;
      if (indexFrom >= 0 && indexFrom < content.length &&
          indexTo >= 0 && indexTo < content.length) {
        var splicer = content.splice(indexFrom, 1, content[indexTo]);
        if (splicer.length > 0) {
          content[indexTo] = splicer[0];
          ret = true;
          PromotedContentService.markDirtySelectedPZone();
        }
      }
      return ret;
    };

    /**
     * Move content up in the currently selected pzone.
     *
     * @param {Number} index - index of content to move up.
     * @returns {Boolean} true if moved up, false otherwise.
     */
    PromotedContentService.moveContentUp = function (index) {
      return moveTo(index, index - 1);
    };

    /**
    * Move content down in the currently selected pzone.
    *
    * @param {Number} index - index of content to move down.
    * @return {Boolean} true if moved down, false otherwise.
    */
    PromotedContentService.moveContentDn = function (index) {
      return moveTo(index, index + 1);
    };

    /**
     * Begin content insert action.
     *
     * @param {Object} article - article to be inserted.
     */
    PromotedContentService.beginContentInsert = function (article) {
      _data.actionContent = article;
      _data.action = readableOperationTypes.INSERT;
    };

    /**
     * Begin content replace operation.
     *
     * @param {Object} article - article to be replaced.
     */
    PromotedContentService.beginContentReplace = function (article) {
      _data.actionContent = article;
      _data.action = readableOperationTypes.REPLACE;
    };

    /**
     * Stop doing current action.
     */
    PromotedContentService.stopContentAction = function () {
      _data.actionContent = null;
      _data.action = null;
    };

    /**
     * Complete insert or replace operation.
     *
     * @param {Number} index - index where operation will occur.
     * @returns {Promise} resolves with nothing or rejects with an error message.
     */
    PromotedContentService.$completeContentAction = function (index) {
      var deferred = $q.defer();

      if (_data.action) {
        PromotedContentService.$addOperation({
          cleanType: _data.action,
          content: _data.actionContent.id,
          content_title: _data.actionContent.title,
          index: index
        })
          .then(function () {
            // find index of duplicate if there is one
            var duplicateIndex = _.findIndex(_data.selectedPZone.content, {id: _data.actionContent.id});

            // ensure that duplicate is deleted
            if (index !== duplicateIndex && duplicateIndex >= 0) {
              _data.selectedPZone.content.splice(duplicateIndex, 1);
            }

            // add item to pzone
            var replace = _data.action === readableOperationTypes.REPLACE;
            _data.selectedPZone.content.splice(index, (replace ? 1 : 0), _data.actionContent);

            // stop action
            PromotedContentService.stopContentAction();

            // ensure pzone is marked dirty
            PromotedContentService.markDirtySelectedPZone();

            deferred.resolve();
          })
          .catch(deferred.reject);
      } else {
        deferred.reject('No action to complete in progress.');
      }

      return deferred.promise;
    };

    /**
     * Set preview time to some moment. Applying this operation will cause the
     *  unsaved operations list to clear out.
     *
     * @param {moment} time - moment to set _data.preview time as.
     */
    PromotedContentService.setPreviewTime = function (time) {
      // set time to edit
      _data.previewTime = time;

      // clear all unsaved operations
      PromotedContentService.clearUnsavedOperations();

      // begin requesting pzone to edit
      return PromotedContentService.$refreshSelectedPZone(_data.previewTime);
    };

    /**
     * Set preview time to now, effectively causing all operations to be
     *  immediately applied when saved.
     */
    PromotedContentService.setPreviewTimeToImmediate = function () {
      PromotedContentService.setPreviewTime(null);
    };

    /**
     * Check if preview time is set to immediate.
     *
     * @returns true if preview time is immediate, false otherwise.
     */
    PromotedContentService.isPreviewTimeImmediate = function () {
      return _data.previewTime === null;
    };

    /**
     * Check if set preview time is in the past.
     *
     * @returns true if preview time is in the past, false otherwise.
     */
    PromotedContentService.isPreviewTimePast = function () {
      return !PromotedContentService.isPreviewTimeImmediate() &&
        _data.previewTime.isBefore(moment());
    };

    /**
     * Refresh the currently selected pzone. Prevents new requests until the
     *  current one has resolved.
     *
     * @param {moment} [time] - optional time parameter to pass to get a preview.
     * @returns {Promise} resolves with selected pzone data or reject with an error.
     */
    PromotedContentService.$refreshSelectedPZone = function (time) {
      var params = {};
      if (time) {
        params.preview = time.toISOString();
      }

      PromotedContentService.makeOperationsStale();

      var deferred = $q.defer();

      // start a new request if one isn't already pending
      if (!pzoneRefreshPending) {
        pzoneRefreshPending = true;
        _data.selectedPZone.get(params)
          .then(function (data) {
            deferred.resolve();
            _data.selectedPZone = data;
            return _data.selectedPZone;
          })
          .catch(function (err) {
            deferred.reject();
            return err;
          })
          .finally(function () {
            PromotedContentService.markSavedSelectedPZone();
            pzoneRefreshPending = false;
          });
      } else {
        deferred.reject();
      }

      return deferred.promise;
    };

    /**
     * Get the service's data. This function MUST be used to retrieve service
     *  data, accessing service data via the _serviceData variable could
     *  potentially destroy some two-way databinding magic.
     *
     * @returns {Object} service data.
     */
    PromotedContentService.getData = function () {
      return _data;
    };

    /**
     * @returns {Promise} resolves when service is ready.
     */
    PromotedContentService.$ready = function () {
      return setupDefer.promise;
    };

    // setup initial datas
    PromotedContentService.$refreshPZones()
      .then(function () {
        return PromotedContentService.$refreshAllContent();
      })
      .then(function () {
        return PromotedContentService.$selectPZone();
      })
      .then(function () {
        // service is ready to go
        setupDefer.resolve();
      });

  });
