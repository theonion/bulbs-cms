'use strict';

describe('Service: PromotedContentService', function () {

  var _;
  var $;
  var $httpBackend;
  var $q;
  var $rootScope;
  var data;
  var Restangular;
  var mockApiData;
  var moment;
  var ContentListService;
  var PromotedContentService;

  beforeEach(function () {
    module('bulbsCmsApp');
    module('bulbsCmsApp.mockApi');

    inject(function (___, _$_, _$httpBackend_, _$q_, _$rootScope_, _Restangular_, _moment_,
        _mockApiData_, _PromotedContentService_, _ContentListService_) {

      $ = _$_;
      _ = ___;
      $httpBackend = _$httpBackend_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      Restangular = _Restangular_;
      mockApiData = _mockApiData_;
      moment = _moment_;
      ContentListService = _ContentListService_;
      PromotedContentService = _PromotedContentService_;

      data = PromotedContentService.getData();

      // expect requests and flush the setup
      $httpBackend.expectGET('/cms/api/v1/pzone/').respond(mockApiData['pzones.list']);
      $httpBackend.expectGET('/cms/api/v1/content/').respond(mockApiData['content.list']);
      $httpBackend.expectGET('/cms/api/v1/pzone/1/').respond(mockApiData['pzones.list']['results'][0]);
      $httpBackend.flush();
    });
  });

  it('should have a function to refresh all pzones', function () {
    // expected requests
    $httpBackend.expectGET('/cms/api/v1/pzone/').respond(mockApiData['pzones.list']);

    var pzones = [];
    PromotedContentService.$refreshPZones()
      .then(function (pzoneData) {
        pzones = pzoneData;
      });

    // fire pending operations
    $httpBackend.flush();

    // ensure data is in order
    expect(pzones).toEqual(data.pzones);
  });

  it('should have a flag to check if a refresh is pending', function () {
    PromotedContentService.$refreshSelectedPZone();

    expect(PromotedContentService.isPZoneRefreshPending()).toBe(true);

    $httpBackend.expectGET('/cms/api/v1/pzone/1/').respond(mockApiData['pzones.list']['results'][0]);
    $httpBackend.flush();

    expect(PromotedContentService.isPZoneRefreshPending()).toBe(false);
  });

  it('should prevent multiple pzone refresh requests', function () {
    spyOn(PromotedContentService, '$refreshOperations').andCallThrough();

    PromotedContentService.$refreshSelectedPZone();
    PromotedContentService.$refreshSelectedPZone();

    $httpBackend.expectGET('/cms/api/v1/pzone/1/').respond(mockApiData['pzones.list']['results'][0]);
    $httpBackend.flush();

    expect(PromotedContentService.isPZoneRefreshPending()).toBe(false);
  });

  it('should be able to mark the selected pzone as saved/dirty', function () {
    // should have been set to true by setup
    expect(data.selectedPZone.saved).toBe(true);
    // mark it dirty
    PromotedContentService.markDirtySelectedPZone();
    // ensure that it's now marked dirty
    expect(data.selectedPZone.saved).toBeUndefined();
    // mark it saved
    PromotedContentService.markSavedSelectedPZone();
    // ensure that it's now marked saved
    expect(data.selectedPZone.saved).toBe(true);
  });

  it('should be able to save the selected pzone in the future', function () {
    var operation = {
      client_id: 1,
      type_name: 'promotion_insertoperation',
      pzone: 1,
      applied: false,
      content: 1,
      index: 1
    };

    spyOn(PromotedContentService, 'makeOperationsStale').andCallThrough();

    // add this operation to service data manually
    data.unsavedOperations.push(operation);

    // set preview time so that saving uses this date
    var previewTime = moment().add(1, 'hours');
    data.previewTime = previewTime;

    // call save
    var saveResp;
    PromotedContentService.$saveSelectedPZone()
      .then(function (selectedPZone) {
        saveResp = selectedPZone;
      });

    // expect requests then flush
    $httpBackend.expectPOST('/cms/api/v1/pzone/1/operations/').respond(operation);
    $httpBackend.flush();

    // check everything is in order
    expect(PromotedContentService.makeOperationsStale).toHaveBeenCalled();
    expect(data.unsavedOperations).toEqual([]);
    expect(operation.client_id).toBeUndefined();
    expect(operation.when).toEqual(previewTime.toISOString());
    expect(saveResp).toEqual(data.selectedPZone);
  });

  it('should be able to save multiple operations in the future', function () {
    var operations = [
      {
        client_id: 1,
        type_name: 'promotion_insertoperation',
        pzone: 1,
        applied: false,
        content: 1,
        index: 1
      },
      {
        client_id: 1,
        type_name: 'promotion_insertoperation',
        pzone: 1,
        applied: false,
        content: 2,
        index: 2
      }];

    spyOn(PromotedContentService, 'makeOperationsStale').andCallThrough();

    // add the operations to service data manually
    data.unsavedOperations = operations;

    // set preview time so that saving uses this date
    var previewTime = moment().add(1, 'hours');
    data.previewTime = previewTime;

    // call save
    var saveResp;
    PromotedContentService.$saveSelectedPZone()
      .then(function (selectedPZone) {
        saveResp = selectedPZone;
      });

    // expect requests then flush
    $httpBackend.expectPOST('/cms/api/v1/pzone/1/operations/').respond(operations);
    $httpBackend.flush();

    // check everything is in order
    expect(PromotedContentService.makeOperationsStale).toHaveBeenCalled();
    expect(data.unsavedOperations).toEqual([]);
    expect(operations[0].client_id).toBeUndefined();
    expect(operations[0].when).toEqual(previewTime.toISOString());
    expect(saveResp).toEqual(data.selectedPZone);
  });

  it('should be able to save the selected pzone immediately', function () {
    // set preview time to immediate
    data.previewTime = null;

    spyOn(PromotedContentService, 'makeOperationsStale').andCallThrough();

    var saveResp;
    PromotedContentService.$saveSelectedPZone().
      then(function (selectedPZone) {
        saveResp = selectedPZone;
      });

    // exepct requests then flush
    $httpBackend
      .expectPUT('/cms/api/v1/pzone/' + data.selectedPZone.id + '/')
      .respond(mockApiData['pzones.list'].results[0]);
    $httpBackend.flush();

    // check everything is in order
    expect(PromotedContentService.makeOperationsStale).toHaveBeenCalled();
    expect(data.unsavedOperations).toEqual([]);
    expect(saveResp).toEqual(data.selectedPZone);
    expect(data.selectedPZone.saved).toBe(true);
  });

  it('should be able to update content list', function () {
    spyOn(ContentListService, '$updateContent');
    PromotedContentService.$refreshAllContent();
    expect(ContentListService.$updateContent).toHaveBeenCalled();
  });

  it('should be able to add an operation', function () {
    data.previewTime = moment().add(1, 'hour');

    var operation = {
      client_id: 1,
      type_name: 'promotion_insertoperation',
      pzone: 1,
      applied: false,
      content: 1,
      index: 1
    };

    var addedOp = null;
    PromotedContentService.$addOperation(operation)
      .then(function (newOp) {
        addedOp = newOp;
      });

    $rootScope.$digest();

    expect(addedOp.post).toBeDefined();
    expect(data.unsavedOperations.length).toBe(1);
  });

  it('should not be able to add an operation when preview time is in the past', function () {
    // set up data for this scenario
    data.previewTime = moment().subtract(1, 'hours');
    data.unsavedOperations = [];

    // attempt to add an operation
    var error = '';
    PromotedContentService.$addOperation({})
      .catch(function (err) {
        error = err;
      });

    $rootScope.$digest();

    // check that data is the correct state
    expect(error).not.toEqual('');
    expect(data.unsavedOperations).toEqual([]);
  });

  it('should be able to remove existing operations', function () {
    PromotedContentService.$refreshOperations();

    $httpBackend.expectGET('/cms/api/v1/pzone/1/operations/').respond(mockApiData['pzones.operations']);
    $httpBackend.flush();

    var opLength = data.operations.length;

    // ensure our operation is in the future
    var op = data.operations[0];
    op.whenAsMoment = moment().add(1, 'hours');

    var resolved = false;
    PromotedContentService.$removeOperation(op.id)
      .then(function () {
        resolved = true;
      });

    // expect requests then flush
    $httpBackend.expectDELETE('/cms/api/v1/pzone/1/operations/' + op.id + '/').respond(203);
    $httpBackend.flush();

    // check that our operation was removed from operations list
    expect(data.operations.length).toBe(opLength - 1);
    expect(resolved).toBe(true);
  });

  it('should not be able to delete an operation in the past', function () {
    PromotedContentService.$refreshOperations();

    $httpBackend.expectGET('/cms/api/v1/pzone/1/operations/').respond(mockApiData['pzones.operations']);
    $httpBackend.flush();

    var opLength = data.operations.length;

    // ensure our operation is in the past
    var op = data.operations[0];
    op.whenAsMoment = moment().subtract(1, 'hours');

    var error;
    PromotedContentService.$removeOperation(op.id)
      .catch(function (err) {
        error = err;
      });

    // digest scope, so promises resolve
    $rootScope.$digest();

    // check that the operation failed
    expect(data.operations.length).toBe(opLength);
    expect(error).not.toBeUndefined();
  });

  it('should not delete successfully if operation is not found', function () {
    var opLength = data.operations.length;

    var error;
    PromotedContentService.$removeOperation(10000)
      .catch(function (err) {
        error = err;
      });

    // digest scope so promises resolve
    $rootScope.$digest();

    // check that operation failed
    expect(data.operations.length).toBe(opLength);
  });

  it('should be able to clear unsaved operations', function () {
    data.unsavedOperations.push(1, 2, 3);
    data.selectedPZone.saved = false;

    PromotedContentService.clearUnsavedOperations();

    expect(data.unsavedOperations).toEqual([]);
    expect(data.selectedPZone.saved).toBe(true);
  });

  it('should be able to refresh the operations list', function () {
    var operations = [];
    PromotedContentService.$refreshOperations()
      .then(function (opsData) {
        operations = opsData;
      });

    // expect and flush requests
    $httpBackend.expectGET('/cms/api/v1/pzone/1/operations/').respond(mockApiData['pzones.operations']);
    $httpBackend.flush();

    expect(PromotedContentService.isPZoneOperationsStale()).toEqual(false);
    expect(operations.length > 0).toBe(true);
    expect(operations).toEqual(data.operations);
    _.each(data.operations, function (operation) {
      expect(operation.cleanType).toBeDefined();
      expect(moment.isMoment(operation.whenAsMoment)).toBe(true);
    });
  });

  it('should allow operation list to be filtered by to and from dates', function () {

    var dateFrom = moment().toISOString();
    var dateTo = moment().toISOString();

    PromotedContentService.$refreshOperations({from: dateFrom, to: dateTo});

    var hasFrom;
    var hasTo;
    $httpBackend.expectGET(/\/cms\/api\/v1\/pzone\/1\/operations\/\?.*/)
      .respond(function (method, url) {
        hasFrom = url.match('from=' + dateFrom).length > 0;
        hasTo = url.match('to=' + dateTo).length > 0;

        return [200, []];
      });
    $httpBackend.flush();

    expect(hasFrom).toEqual(true);
    expect(hasTo).toEqual(true);
  });

  it('should be able to select a pzone', function () {
    var pzone = data.pzones[0];

    spyOn(PromotedContentService, 'makeOperationsStale').andCallThrough();

    PromotedContentService.$selectPZone(pzone.name);

    // expect and flush requests
    $httpBackend.expectGET('/cms/api/v1/pzone/' + pzone.id + '/').respond(pzone);
    $httpBackend.flush();

    expect(PromotedContentService.makeOperationsStale).toHaveBeenCalled();
    expect(data.unsavedOperations).toEqual([]);
    expect(data.selectedPZone.id).toBe(pzone.id);
  });

  it('should be able to remove content from a pzone', function () {
    var id = 1;

    data.previewTime = moment().add(1, 'hours');
    data.selectedPZone.content = [{id: id}];

    PromotedContentService.$removeContentFromPZone(id);

    $rootScope.$digest();

    expect(data.selectedPZone.content.length === 0).toBe(true);
    expect(data.selectedPZone.saved).toBeUndefined();
    expect(data.unsavedOperations[0].cleanType).toBe(PromotedContentService.readableOperationTypes.DELETE);
    expect(data.unsavedOperations[0].content).toBe(id);
  });

  it('should be able to set the preview time', function () {
    spyOn(PromotedContentService, '$refreshSelectedPZone').andReturn({then: function (a) { a(); }});
    spyOn(PromotedContentService, 'clearUnsavedOperations');

    var time = moment();

    PromotedContentService.setPreviewTime(time);

    $rootScope.$digest();

    expect(data.previewTime).toEqual(time);
    expect(PromotedContentService.$refreshSelectedPZone).toHaveBeenCalled();
    expect(PromotedContentService.clearUnsavedOperations).toHaveBeenCalled();
  });

  it('should be able to set the preview time to immediate', function () {
    PromotedContentService.setPreviewTimeToImmediate();

    expect(data.previewTime).toBe(null);
  });

  it('should be able to check if the preview time is in the past', function () {
    data.previewTime = moment().subtract(1, 'hours');
    expect(PromotedContentService.isPreviewTimePast()).toBe(true);
  });

  describe('moving content', function () {

    beforeEach(function () {
      data.selectedPZone.content.push(mockApiData['content.list'].results[1]);
    });

    it('should be able to move content up', function () {
      var old_0 = data.selectedPZone.content[0];
      var old_1 = data.selectedPZone.content[1];

      var moved = PromotedContentService.moveContentUp(1);

      expect(moved).toBe(true);
      expect(data.selectedPZone.content[0]).toEqual(old_1);
      expect(data.selectedPZone.content[1]).toEqual(old_0);
      expect(data.selectedPZone.saved).toBeUndefined();
    });

    it('should be able to move content down', function () {
      var old_0 = data.selectedPZone.content[0];
      var old_1 = data.selectedPZone.content[1];

      var moved = PromotedContentService.moveContentDn(0);

      expect(moved).toBe(true);
      expect(data.selectedPZone.content[0]).toEqual(old_1);
      expect(data.selectedPZone.content[1]).toEqual(old_0);
      expect(data.selectedPZone.saved).toBeUndefined();
    });

    it('should not be able to move top content up', function () {
      var moved = PromotedContentService.moveContentUp(0);
      expect(moved).toBe(false);
    });

    it('should not be able to move bottom content down', function () {
      var moved = PromotedContentService.moveContentDn(data.selectedPZone.content.length - 1);
      expect(moved).toBe(false);
    });

  });

  describe('insert and replace operations', function () {
    var content;

    beforeEach(function () {
      content = mockApiData['content.list'].results[1];
    });

    it('should be able to begin an insert operation', function () {
      PromotedContentService.beginContentInsert(content);

      expect(data.actionContent).toEqual(content);
      expect(data.action).toEqual(PromotedContentService.readableOperationTypes.INSERT);
    });

    it('should be able to begin a replace operation', function () {
      PromotedContentService.beginContentReplace(content);

      expect(data.actionContent).toEqual(content);
      expect(data.action).toEqual(PromotedContentService.readableOperationTypes.REPLACE);
    });

    it('should allow an article to be inserted', function () {
      var index = 1;
      var oldContentLength = data.selectedPZone.content.length;

      data.previewTime = moment().add(1, 'hours');
      data.actionContent = content;
      data.action = PromotedContentService.readableOperationTypes.INSERT;

      PromotedContentService.$completeContentAction(index);

      $rootScope.$digest();

      expect(data.selectedPZone.content[index].id).toEqual(content.id);
      expect(data.unsavedOperations[0].cleanType).toBe(PromotedContentService.readableOperationTypes.INSERT);
      expect(data.unsavedOperations[0].content).toBe(content.id);
      expect(data.unsavedOperations[0].index).toBe(index);
      expect(data.actionContent).toBeNull();
      expect(data.action).toBeNull();
      expect(data.selectedPZone.content.length).toBe(oldContentLength + 1);
      expect(data.selectedPZone.saved).toBeUndefined();
    });

    it('should allow an article to be replaced', function () {
      var index = 1;
      var oldContentLength = data.selectedPZone.content.length;

      data.previewTime = moment().add(1, 'hours');
      data.actionContent = content;
      data.action = PromotedContentService.readableOperationTypes.REPLACE;

      PromotedContentService.$completeContentAction(index);

      $rootScope.$digest();

      expect(data.selectedPZone.content[index].id).toEqual(content.id);
      expect(data.unsavedOperations[0].cleanType).toBe(PromotedContentService.readableOperationTypes.REPLACE);
      expect(data.unsavedOperations[0].content).toBe(content.id);
      expect(data.unsavedOperations[0].index).toBe(index);
      expect(data.actionContent).toBeNull();
      expect(data.action).toBeNull();
      expect(data.selectedPZone.content.length).toBe(oldContentLength);
      expect(data.selectedPZone.saved).toBeUndefined();
    });

    it('should be able to stop an insert operation', function () {
      PromotedContentService.beginContentInsert(content);
      PromotedContentService.stopContentAction();

      expect(data.actionContent).toBeNull();
      expect(data.action).toBeNull();
    });

    it('should be able to stop a replace operation', function () {
      PromotedContentService.beginContentReplace(content);
      PromotedContentService.stopContentAction();

      expect(data.actionContent).toBeNull();
      expect(data.action).toBeNull();
    });
  });
});
