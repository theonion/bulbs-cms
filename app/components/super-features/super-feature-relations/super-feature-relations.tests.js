'use strict';

describe('Directive: superFeatureRelations', function () {
  var $parentScope;
  var article;
  var digest;
  var html;
  var sandbox;
  var SuperFeaturesApi;
  var createSuperFeatureDeferred;
  var deleteSuperFeatureDeferred;
  var getSuperFeatureRelationsDeferred;
  var updateSuperFeatureDeferred;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.superFeatures.relations');
    module('jquery');
    module('jsTemplates');

    article = { id: 1 };
    html = angular.element(
      '<super-feature-relations article="article"></super-feature-relations>'
    );

    inject(function (_SuperFeaturesApi_, $q, $compile, $rootScope) {
      $parentScope = $rootScope.$new();
      SuperFeaturesApi = _SuperFeaturesApi_;

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );

      $parentScope.article = article;

      createSuperFeatureDeferred = $q.defer();
      sandbox.stub(SuperFeaturesApi, 'createSuperFeature')
        .returns(createSuperFeatureDeferred.promise);

      getSuperFeatureRelationsDeferred = $q.defer();
      sandbox.stub(SuperFeaturesApi, 'getSuperFeatureRelations')
        .returns(getSuperFeatureRelationsDeferred.promise);

      updateSuperFeatureDeferred = $q.defer();
      sandbox.stub(SuperFeaturesApi, 'updateSuperFeature')
        .returns(updateSuperFeatureDeferred.promise);

      deleteSuperFeatureDeferred = $q.defer();
      sandbox.stub(SuperFeaturesApi, 'deleteSuperFeature')
        .returns(deleteSuperFeatureDeferred.promise);
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('initialization', function () {

    it('should do an initial request for relations', function () {
      var relations = [{ id: 2 }, { id: 3 }];
      getSuperFeatureRelationsDeferred.resolve({ data: relations });

      var element = digest(html);

      expect(SuperFeaturesApi.getSuperFeatureRelations.calledOnce).to.equal(true);
      expect(element.find('li').length).to.eql(2);
    });
  });

  context('child page interactions', function () {

    it('should allow adding a new one', function () {
      getSuperFeatureRelationsDeferred.resolve({ data: [] });
      var element = digest(html);
      var addButton = element.find('button[modal-on-ok="addChildPage(title)"]').eq(0);
      var relation = {
        id: 1,
        order: 0
      };
      var scope = element.scope();

      addButton.trigger('click');
      scope.$digest();
      addButton.isolateScope().modalOnOk();
      createSuperFeatureDeferred.resolve(relation);
      scope.$digest();

      expect(SuperFeaturesApi.createSuperFeature.calledOnce).to.equal(true);
      expect(element.find('li').scope().relation).to.equal(relation);
    });

    it('should prevent mutliple add child calls', function () {
      getSuperFeatureRelationsDeferred.resolve({ data: [] });
      var element = digest(html);
      var addButton = element.find('button[modal-on-ok="addChildPage(title)"]').eq(0);
      var scope = element.scope();

      addButton.trigger('click');
      scope.$digest();
      addButton.isolateScope().modalOnOk();
      scope.$digest();

      expect(addButton.attr('disabled')).to.equal('disabled');
    });

    it('should allow updating', function () {
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ data: relations });
      var element = digest(html);
      var saveButton = element.find('button[ng-click="saveChildPage(relation)"]');

      saveButton.trigger('click');

      expect(SuperFeaturesApi.updateSuperFeature.calledOnce).to.equal(true);
    });

    it('should prevent multiple updates at the same time for same child', function () {
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ data: relations });
      var element = digest(html);
      var saveButton = element.find('button[ng-click="saveChildPage(relation)"]');

      saveButton.trigger('click');
      saveButton.trigger('click');

      expect(SuperFeaturesApi.updateSuperFeature.calledOnce).to.equal(true);
    });

    it('should 0-index ordering before updating', function () {
      var relation = {
        id: 2,
        order: 1
      };
      getSuperFeatureRelationsDeferred.resolve({ data: [relation] });
      var element = digest(html);
      var saveButton = element.find('button[ng-click="saveChildPage(relation)"]');

      saveButton.trigger('click');
      updateSuperFeatureDeferred.resolve({ data: relation });

      expect(SuperFeaturesApi.updateSuperFeature.args[0][0].order).to.equal(0);
      expect(relation.order).to.equal(1);
    });

    it('should allow deleting', function () {
      var relation = { id: 2 };
      getSuperFeatureRelationsDeferred.resolve({ data: [relation] });
      var element = digest(html);
      var deleteButton = element.find('button[modal-on-ok="deleteChildPage(relation)"]');
      var scope = element.scope();

      deleteButton.trigger('click');
      scope.$digest();
      deleteButton.isolateScope().modalOnOk();
      deleteSuperFeatureDeferred.resolve();
      scope.$digest();

      expect(SuperFeaturesApi.deleteSuperFeature.calledOnce).to.equal(true);
      expect(element.find('li').length).to.equal(0);
    });

    it('should prevent multiple deletes at the same time for same child', function () {
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ data: relations });
      var element = digest(html);
      var deleteButton = element.find('button[modal-on-ok="deleteChildPage(relation)"]');
      var scope = element.scope();

      deleteButton.trigger('click');
      scope.$digest();
      deleteButton.isolateScope().modalOnOk();
      scope.$digest();

      expect(deleteButton.attr('disabled')).to.equal('disabled');
    });

    it('should prevent a delete from occurring if an update is happening on same child', function () {
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ data: relations });
      var element = digest(html);
      var deleteButton = element.find('button[modal-on-ok="deleteChildPage(relation)"]');
      var saveButton = element.find('button[ng-click="saveChildPage(relation)"]');

      deleteButton.trigger('click');
      element.scope().$digest();
      deleteButton.isolateScope().modalOnOk();
      saveButton.trigger('click');

      expect(SuperFeaturesApi.deleteSuperFeature.called).to.equal(true);
      expect(SuperFeaturesApi.updateSuperFeature.called).to.equal(false);
    });

    it('should prevent an update from occurring if a delete is happening on same child', function () {
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ data: relations });
      var element = digest(html);
      var deleteButton = element.find('button[modal-on-ok="deleteChildPage(relation)"]');
      var saveButton = element.find('button[ng-click="saveChildPage(relation)"]');

      saveButton.trigger('click');

      expect(deleteButton.attr('disabled')).to.equal('disabled');
      expect(SuperFeaturesApi.updateSuperFeature.called).to.equal(true);
    });

    it('should show a message if there are no child pages', function () {
      getSuperFeatureRelationsDeferred.resolve({ data: [] });

      var element = digest(html);

      expect(element.find('div').html()).to.have.string('No child pages yet!');
    });
  });

  context('child page list ordering', function () {
    var relation1 = { id: 666 };
    var relation2 = { id: 420 };

    beforeEach(function () {
      getSuperFeatureRelationsDeferred.resolve({ data: [relation1, relation2] });
    });

    it('should be based on order property of children', function () {
      relation1.order = 1;
      relation2.order = 0;

      var element = digest(html);

      var items = element.find('li');
      expect(items.eq(0).scope().relation).to.equal(relation2);
      expect(items.eq(1).scope().relation).to.equal(relation1);
    });

    it('should allow moving a child up via an up button', function () {
      relation1.order = 0;
      relation2.order = 1;
      var element = digest(html);
      var up = element.find('button[ng-click="moveItem($index, $index - 1)"]').eq(1);

      up.trigger('click');

      var items = element.find('li');
      expect(items.eq(0).scope().relation).to.equal(relation2);
      expect(items.eq(1).scope().relation).to.equal(relation1);
    });

    it('should disable the up ordering button if first item in list', function () {
      relation1.order = 0;
      relation2.order = 1;

      var element = digest(html);
      var up = element.find('button[ng-click="moveItem($index, $index - 1)"]').eq(0);

      expect(up.attr('disabled')).to.equal('disabled');
    });

    it('should allow moving a child down via a down button', function () {
      relation1.order = 0;
      relation2.order = 1;
      var element = digest(html);
      var down = element.find('button[ng-click="moveItem($index, $index + 1)"]').eq(0);

      down.trigger('click');

      var items = element.find('li');
      expect(items.eq(0).scope().relation).to.equal(relation2);
      expect(items.eq(1).scope().relation).to.equal(relation1);
    });

    it('should disable the down ordering button if last item in list', function () {
      relation1.order = 0;
      relation2.order = 1;

      var element = digest(html);
      var down = element.find('button[ng-click="moveItem($index, $index + 1)"]').eq(1);

      expect(down.attr('disabled')).to.equal('disabled');
    });

    it('should allow ordering via number input', function () {
      relation1.order = 0;
      relation2.order = 1;
      var element = digest(html);
      var orderingForm = element.find('form[name="orderingInputForm"]').eq(1);
      var ordering = orderingForm.find('input[name="order"]');

      ordering.val(1).trigger('change');
      orderingForm.trigger('submit');

      var items = element.find('li');
      expect(items.eq(0).scope().relation).to.equal(relation2);
      expect(items.eq(1).scope().relation).to.equal(relation1);
    });

    it('should allow ordering via number input submission', function () {
      relation1.order = 0;
      relation2.order = 1;
      var element = digest(html);
      var ordering = element.find('input[name="order"]').eq(1);

      ordering.val(1).trigger('change');
      ordering.siblings('button').trigger('click');

      var items = element.find('li');
      expect(items.eq(0).scope().relation).to.equal(relation2);
      expect(items.eq(1).scope().relation).to.equal(relation1);
    });
  });
});
