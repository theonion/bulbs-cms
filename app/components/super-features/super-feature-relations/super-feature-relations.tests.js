'use strict';

describe('Directive: superFeatureRelations', function () {
  var $;
  var $parentScope;
  var createSuperFeatureDeferred;
  var deleteSuperFeatureDeferred;
  var digest;
  var getSuperFeatureRelationsDeferred;
  var html;
  var Raven;
  var sandbox;
  var SuperFeaturesApi;
  var updateAllRelationPublishDatesDeferred;
  var updateSuperFeatureDeferred;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.superFeatures.relations');
    module('jquery');
    module('jsTemplates');

    html = angular.element(
      '<super-feature-relations article="article"></super-feature-relations>'
    );

    inject(function (_$_, _Raven_, _SuperFeaturesApi_, $q, $compile, $rootScope) {
      $ = _$_;
      $parentScope = $rootScope.$new();
      SuperFeaturesApi = _SuperFeaturesApi_;
      Raven = _Raven_;

      sandbox.stub(Raven, 'captureMessage');

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );

      $parentScope.article = { id: 1 };

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

      updateAllRelationPublishDatesDeferred = $q.defer();
      sandbox.stub(SuperFeaturesApi, 'updateAllRelationPublishDates')
        .returns(updateAllRelationPublishDatesDeferred.promise);
    });
  });

  afterEach(function () {
    sandbox.restore();

    $(document).find('#titleModal').each(function () {
      $(this).remove();
    });
  });

  context('initialization', function () {

    it('should do an initial request for relations', function () {
      var relations = [{ id: 2 }, { id: 3 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });

      var element = digest(html);

      expect(SuperFeaturesApi.getSuperFeatureRelations.calledOnce).to.equal(true);
      expect(element.find('li').length).to.eql(2);
    });

    it('should show an error message if unable to retrieve relations', function () {
      getSuperFeatureRelationsDeferred.reject();

      var element = digest(html);

      expect(element.find('.super-feature-relations-list-error').html())
        .to.have.string('An error occurred retrieving relations!');
      expect(Raven.captureMessage.calledOnce).to.equal(true);
    });
  });

  context('relation interactions', function () {

    it('should allow adding a new one', function () {
      getSuperFeatureRelationsDeferred.resolve({ results: [] });
      var element = digest(html);
      var addButton = element.find('button[modal-on-ok="addRelation(title)"]').eq(0);
      var relation = {
        id: 1,
        ordering: 0
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

    it('should show an error message if adding fails', function () {
      getSuperFeatureRelationsDeferred.resolve({ results: [] });
      var element = digest(html);
      var addButton = element.find('button[modal-on-ok="addRelation(title)"]').eq(0);
      var scope = element.scope();

      addButton.trigger('click');
      scope.$digest();
      addButton.isolateScope().modalOnOk();
      createSuperFeatureDeferred.reject();
      scope.$digest();

      expect(element.find('.super-feature-relations-list-error').html())
        .to.have.string('An error occurred attempting to add a child page!');
      expect(Raven.captureMessage.calledOnce).to.equal(true);
    });

    it('should allow setting all relation publish dates', function () {
      $parentScope.article = {
        id: 1,
        published: '2020-06-20T12:00:00Z'
      };
      var relations = [{ id: 2 }, { id: 3 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      updateAllRelationPublishDatesDeferred.resolve();
      var element = digest(html);
      var updateButton = element.find('button[ng-click="updateRelationsPublishDates()"]');

      updateButton.trigger('click');

      expect(SuperFeaturesApi.updateAllRelationPublishDates.calledOnce)
        .to.equal(true);
      expect(relations[0].published.isSame($parentScope.article.published))
        .to.equal(true);
      expect(relations[1].published.isSame($parentScope.article.published))
        .to.equal(true);
    });

    it('should disable publish date set button if parent has no publish date', function () {
      $parentScope.article = { id: 1 };
      var element = digest(html);

      var updateButton = element.find('button[ng-click="updateRelationsPublishDates()"]');

      expect(updateButton.attr('disabled')).to.equal('disabled');
    });

    it('should disable publish date set button if some relation is not saved', function () {
      $parentScope.article = {
        id: 1,
        published: '2020-06-20T12:00:00Z'
      };
      var relations = [{ id: 2 }, { id: 3 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var updateButton = element.find('button[ng-click="updateRelationsPublishDates()"]');

      element.find('li input[ng-model="relation.title"]').val('garbage').trigger('change');

      expect(updateButton.attr('disabled')).to.equal('disabled');
    });

    it('should disable publish date set button if there are no relations', function () {
      $parentScope.article = {
        id: 1,
        published: '2020-06-20T12:00:00Z'
      };
      getSuperFeatureRelationsDeferred.resolve({ results: [] });
      var element = digest(html);

      var updateButton = element.find('button[ng-click="updateRelationsPublishDates()"]');

      expect(updateButton.attr('disabled')).to.equal('disabled');
    });

    it('should show an error message if relation publish date update fails', function () {
      $parentScope.article = {
        id: 1,
        published: '2020-06-20T12:00:00Z'
      };
      getSuperFeatureRelationsDeferred.resolve({ results: [] });
      var element = digest(html);
      var updateButton = element.find('button[ng-click="updateRelationsPublishDates()"]');

      updateButton.trigger('click');
      updateAllRelationPublishDatesDeferred.reject();
      element.scope().$digest();

      expect(element.find('.super-feature-relations-list-error').html())
        .to.have.string('An error occurred attempting to update child publish dates!');
      expect(Raven.captureMessage.calledOnce).to.equal(true);
    });

    it('should prevent multiple calls to publish date update', function () {
      $parentScope.article = {
        id: 1,
        published: '2020-06-20T12:00:00Z'
      };
      getSuperFeatureRelationsDeferred.resolve({ results: [] });
      var element = digest(html);
      var updateButton = element.find('button[ng-click="updateRelationsPublishDates()"]');

      updateButton.trigger('click');
      updateButton.trigger('click');

      expect(SuperFeaturesApi.updateAllRelationPublishDates.calledOnce)
        .to.equal(true);
    });

    it('should prevent mutliple add relation calls', function () {
      getSuperFeatureRelationsDeferred.resolve({ results: [] });
      var element = digest(html);
      var addButton = element.find('button[modal-on-ok="addRelation(title)"]').eq(0);
      var scope = element.scope();

      addButton.trigger('click');
      scope.$digest();
      addButton.isolateScope().modalOnOk();
      scope.$digest();

      expect(addButton.attr('disabled')).to.equal('disabled');
    });

    it('should allow updating', function () {
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var saveButton = element.find('button[ng-click="saveRelation(relation)"]');

      saveButton.trigger('click');

      expect(SuperFeaturesApi.updateSuperFeature.calledOnce).to.equal(true);
    });

    it('should include parent id when updating', function () {
      $parentScope.article = { id: 1 };
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var saveButton = element.find('button[ng-click="saveRelation(relation)"]');

      saveButton.trigger('click');

      expect(SuperFeaturesApi.updateSuperFeature.args[0][0].parent)
        .to.equal($parentScope.article.id);
    });

    it('should show an error message if update fails', function () {
      var relations = [{
        id: 2,
        title: 'Some Garbage Title'
      }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var saveButton = element.find('button[ng-click="saveRelation(relation)"]');

      saveButton.trigger('click');
      updateSuperFeatureDeferred.reject();
      element.scope().$digest();

      expect(element.find('.super-feature-relations-list-error').html())
        .to.have.string('An error occurred attempting to update "' + relations[0].title + '"!');
      expect(Raven.captureMessage.calledOnce).to.equal(true);
    });

    it('should prevent multiple updates at the same time for same relation', function () {
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var saveButton = element.find('button[ng-click="saveRelation(relation)"]');

      saveButton.trigger('click');
      saveButton.trigger('click');

      expect(SuperFeaturesApi.updateSuperFeature.calledOnce).to.equal(true);
    });

    it('should 0-index ordering before updating', function () {
      var relation = {
        id: 2,
        ordering: 1
      };
      getSuperFeatureRelationsDeferred.resolve({ results: [relation] });
      var element = digest(html);
      var saveButton = element.find('button[ng-click="saveRelation(relation)"]');

      saveButton.trigger('click');
      updateSuperFeatureDeferred.resolve({ results: relation });

      expect(SuperFeaturesApi.updateSuperFeature.args[0][0].ordering).to.equal(0);
      expect(relation.ordering).to.equal(1);
    });

    it('should allow deleting', function () {
      var relation = { id: 2 };
      getSuperFeatureRelationsDeferred.resolve({ results: [relation] });
      var element = digest(html);
      var deleteButton = element.find('button[modal-on-ok="deleteRelation(relation)"]');
      var scope = element.scope();

      deleteButton.trigger('click');
      scope.$digest();
      deleteButton.isolateScope().modalOnOk();
      deleteSuperFeatureDeferred.resolve();
      scope.$digest();

      expect(SuperFeaturesApi.deleteSuperFeature.calledOnce).to.equal(true);
      expect(element.find('li').length).to.equal(0);
    });

    it('should prevent multiple deletes at the same time for same relation', function () {
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var deleteButton = element.find('button[modal-on-ok="deleteRelation(relation)"]');
      var scope = element.scope();

      deleteButton.trigger('click');
      scope.$digest();
      deleteButton.isolateScope().modalOnOk();
      scope.$digest();

      expect(deleteButton.attr('disabled')).to.equal('disabled');
    });

    it('should show an error message if delete fails', function () {
      var relation = {
        id: 2,
        title: 'Guide to Ratz'
      };
      getSuperFeatureRelationsDeferred.resolve({ results: [relation] });
      var element = digest(html);
      var deleteButton = element.find('button[modal-on-ok="deleteRelation(relation)"]');
      var scope = element.scope();

      deleteButton.trigger('click');
      scope.$digest();
      deleteButton.isolateScope().modalOnOk();
      deleteSuperFeatureDeferred.reject();
      scope.$digest();

      expect(element.find('.super-feature-relations-list-error').html())
        .to.have.string('An error occurred attempting to delete "' + relation.title + '"!');
      expect(Raven.captureMessage.calledOnce).to.equal(true);
    });

    it('should prevent a delete from occurring if an update is happening on same relation', function () {
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var deleteButton = element.find('button[modal-on-ok="deleteRelation(relation)"]');
      var saveButton = element.find('button[ng-click="saveRelation(relation)"]');

      deleteButton.trigger('click');
      element.scope().$digest();
      deleteButton.isolateScope().modalOnOk();
      saveButton.trigger('click');

      expect(SuperFeaturesApi.deleteSuperFeature.called).to.equal(true);
      expect(SuperFeaturesApi.updateSuperFeature.called).to.equal(false);
    });

    it('should prevent an update from occurring if a delete is happening on same relation', function () {
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var deleteButton = element.find('button[modal-on-ok="deleteRelation(relation)"]');
      var saveButton = element.find('button[ng-click="saveRelation(relation)"]');

      saveButton.trigger('click');

      expect(deleteButton.attr('disabled')).to.equal('disabled');
      expect(SuperFeaturesApi.updateSuperFeature.called).to.equal(true);
    });

    it('should prevent publish date set button if another relation transaction is occuring', function () {
      $parentScope.article = {
        id: 1,
        published: '2020-06-20T12:00:00Z'
      };
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var updateButton = element.find('button[ng-click="updateRelationsPublishDates()"]');
      var saveButton = element.find('button[ng-click="saveRelation(relation)"]');

      element.find('li input[ng-model="relation.title"]').val('garbage').trigger('change');
      saveButton.trigger('click');
      updateButton.trigger('click');

      expect(SuperFeaturesApi.updateAllRelationPublishDates.calledOnce)
        .to.equal(false);
    });

    it('should prevent saving when updating publish dates', function () {
      $parentScope.article = {
        id: 1,
        published: '2020-06-20T12:00:00Z'
      };
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var updateButton = element.find('button[ng-click="updateRelationsPublishDates()"]');
      var saveButton = element.find('button[ng-click="saveRelation(relation)"]');

      updateButton.trigger('click');
      saveButton.trigger('click');

      expect(SuperFeaturesApi.updateSuperFeature.called).to.equal(false);
    });

    it('should prevent deleting when updating publish dates', function () {
      $parentScope.article = {
        id: 1,
        published: '2020-06-20T12:00:00Z'
      };
      var relations = [{ id: 2 }];
      getSuperFeatureRelationsDeferred.resolve({ results: relations });
      var element = digest(html);
      var updateButton = element.find('button[ng-click="updateRelationsPublishDates()"]');
      var deleteButton = element.find('button[modal-on-ok="deleteRelation(relation)"]');

      updateButton.trigger('click');
      deleteButton.trigger('click');
      element.scope().$digest();
      deleteButton.isolateScope().modalOnOk();

      expect(SuperFeaturesApi.deleteSuperFeature.called).to.equal(false);
    });

    it('should show a message if there are no relation pages', function () {
      getSuperFeatureRelationsDeferred.resolve({ results: [] });

      var element = digest(html);

      expect(element.html()).to.have.string('No child pages yet!');
    });
  });

  context('relation list ordering', function () {
    var relation1 = { id: 666 };
    var relation2 = { id: 420 };

    beforeEach(function () {
      getSuperFeatureRelationsDeferred.resolve({ results: [relation1, relation2] });
    });

    it('should be based on ordering property of relations', function () {
      relation1.ordering = 1;
      relation2.ordering = 0;

      var element = digest(html);

      var items = element.find('li');
      expect(items.eq(0).scope().relation).to.equal(relation2);
      expect(items.eq(1).scope().relation).to.equal(relation1);
    });

    it('should allow moving a relation up via an up button', function () {
      relation1.ordering = 0;
      relation2.ordering = 1;
      var element = digest(html);
      var up = element.find('button[ng-click="moveItem($index, $index - 1)"]').eq(1);

      up.trigger('click');

      var items = element.find('li');
      expect(items.eq(0).scope().relation).to.equal(relation2);
      expect(items.eq(1).scope().relation).to.equal(relation1);
    });

    it('should disable the up ordering button if first item in list', function () {
      relation1.ordering = 0;
      relation2.ordering = 1;

      var element = digest(html);
      var up = element.find('button[ng-click="moveItem($index, $index - 1)"]').eq(0);

      expect(up.attr('disabled')).to.equal('disabled');
    });

    it('should allow moving a relation down via a down button', function () {
      relation1.ordering = 0;
      relation2.ordering = 1;
      var element = digest(html);
      var down = element.find('button[ng-click="moveItem($index, $index + 1)"]').eq(0);

      down.trigger('click');

      var items = element.find('li');
      expect(items.eq(0).scope().relation).to.equal(relation2);
      expect(items.eq(1).scope().relation).to.equal(relation1);
    });

    it('should disable the down ordering button if last item in list', function () {
      relation1.ordering = 0;
      relation2.ordering = 1;

      var element = digest(html);
      var down = element.find('button[ng-click="moveItem($index, $index + 1)"]').eq(1);

      expect(down.attr('disabled')).to.equal('disabled');
    });

    it('should allow ordering via number input', function () {
      relation1.ordering = 0;
      relation2.ordering = 1;
      var element = digest(html);
      var orderingForm = element.find('form[name="orderingInputForm_' + relation1.id + '"]');
      var ordering = orderingForm.find('input[name="ordering"]');

      ordering.val(2).trigger('change');
      orderingForm.trigger('submit');

      var items = element.find('li');
      expect(items.eq(0).scope().relation).to.equal(relation2);
      expect(items.eq(1).scope().relation).to.equal(relation1);
    });

    it('should allow ordering via number input submission', function () {
      relation1.ordering = 0;
      relation2.ordering = 1;
      var element = digest(html);
      var ordering = element.find('input[name="ordering"]').eq(1);

      ordering.val(1).trigger('change');
      ordering.siblings('button').trigger('click');

      var items = element.find('li');
      expect(items.eq(0).scope().relation).to.equal(relation2);
      expect(items.eq(1).scope().relation).to.equal(relation1);
    });
  });
});
