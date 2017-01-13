/**
 * one-components
 * @version v1.12.0-rc.2 - 2017-01-05
 * @link https://stash.ops.aol.com/projects/ONECENTRAL/repos/one-components/browse
 */
(function(window, document, undefined) {
'use strict';
// Source: modules.js
//===== sub-modules definition ===== //
angular.module('one.components.common', []);

angular.module('one.components.breadcrumbs', [
  'one.components.common',
  'one.components.onScrolledDown',
  'one.components.clickOutside'
]);

angular.module('one.components.inputs', []);

angular.module('one.components.smartsearch', ['keyboard']);

angular.module('one.components.uiSelect', [
  'ui.select',
  'ngSanitize',
  'one.components.common'
]);

angular.module('one.components.uiGrid', [
  'ngTouch',
  'ui.grid',
  'ui.grid.resizeColumns',
  'ui.grid.pagination',
  'ui.grid.edit',
  'ui.grid.validate',
  'ui.grid.pinning',
  'ui.grid.selection',
  'as.sortable',
  'one.components.clickOutside'
]);

// ===== main module definition ===== //
angular.module('one.components', [
  'one.components.toggles',
  'one.components.checkbox',
  'one.components.smartsearch',
  'one.components.multiselectdropdown',
  'one.components.pageslide',
  'one.components.feedback',
  'one.components.breadcrumbs',
  'one.components.onScrolledDown',
  'one.components.clickOutside',
  'one.components.uiGrid',
  'one.components.lineGraph',
  'one.components.tabs',
  'one.components.bulkModal',
  'one.components.container',
  'one.components.styleCore',
  'one.components.errors',
  'one.components.errors.modal',
  'one.components.graph',
  'one.components.graph.axis',
  'one.components.graph.bar',
  'one.components.graph.gauge',
  'one.components.graph.legend',
  'one.components.graph.line',
  'one.components.graph.pie',
  'one.components.graph.scatterplot',
  'one.components.graph.tooltip',
  'one.components.icons',
  'one.components.autocompleteSelect',
  'one.components.shoppingCart',
  'one.components.uiSelect',
  'one.components.actionIconsBar',
  'one.components.inputs'
  /* components end */
]);

// Source: actionIconsBar.js
angular.module('one.components.actionIconsBar', [])
  .directive('oneActionIconsBar', [function () {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="one-action-icons-bar"><ng-transclude></ng-transclude></div>'
    };
  }])
  .directive('oneActionIcon', [function () {
return {
      restrict: 'E',
      controllerAs: 'ctrl',
      controller: function () {},
      transclude: true,
      compile: function compile() {
        return {
          pre: function postLink(scope, iElement, iAttrs, controller) {
            controller.title = iAttrs.title;
          }
        };
      },
      templateUrl: 'actionIconsBar/actionIconsBar.tpl.html',
      scope: true
    };
  }]);

// Source: autocompleteSelect.js
(function () {
angular
    .module('one.components.autocompleteSelect', ['one.components.common'])
    .controller('OneAutocompleteSelectController', OneAutocompleteSelectController)
    .directive('oneAutocompleteSelect', oneAutocompleteSelectDirective);

  oneAutocompleteSelectDirective.$inject = [];
  function oneAutocompleteSelectDirective() {
    return {
      restrict: 'E',
      templateUrl: 'autocompleteSelect/autocompleteSelect.tpl.html',
      scope: {},
      bindToController: {
        placeholderText: '@',
        noResultsText: '@',
        clearText: '@',
        dropdownWidth: '@',
        dropdownMaxHeight: '@',
        onSelect: '&',
        pageGetter: '&',
        filterFunction: '&?',
        labelFunction: '&?',
        selected: '=',
        debounce: '='
      },
      controller: 'OneAutocompleteSelectController',
      controllerAs: '$ctrl',
      require: 'oneAutocompleteSelect',
      link: function (scope, element, attrs, ctrl) {
        var $input = element.find('input');

        ctrl.blurInput = function () {
          $input.blur();
        };
      }
    };
  }

  OneAutocompleteSelectController.$inject = ['$scope', '$q', 'oneUtils'];
  function OneAutocompleteSelectController($scope, $q, oneUtils) {
    var self = this;

    self.placeholderText = self.placeholderText || 'Search...';
    self.noResultsText = self.noResultsText || 'No results';
    self.clearText = self.clearText || 'Clear';
    self.dropdownWidth = self.dropdownWidth || '100%';
    self.dropdownMaxHeight = self.dropdownMaxHeight || '200px';
    self.debounce = self.debounce || 300;

    self.isLoading = false;
    self.initialized = false;
    self.isDropdownVisible = false;
    self.activeIndex = -1;

    self.getSuggestions = function (query) {
      if (angular.isObject(query)) {
        return $q.resolve([]);
      }

      self.currentPageNumber = 1;
      self.totalCount = 0;
      self.suggestions = [];
      self.currentQuery = query;
      self.isLoading = true;

      return $q.resolve(self.pageGetter({ query: query, pageNumber: self.currentPageNumber }))
        .then(function (response) {
          self.suggestions = response.data;
          self.totalCount = response.total;

          return self.suggestions;
        })
        .finally(function () {
          self.isLoading = false;
        });
    };

    self.handleChange = oneUtils.debounce(self.getSuggestions, self.debounce);

    self.handleFocus = function () {
      self.isDropdownVisible = true;
      self.activeIndex = -1;

      if (!self.initialized || self.currentQuery) {
        self.initialized = self.isLoading = true;

        self.getSuggestions();
      }
    };

    self.handleScrolledDown = function () {
      if (self.isLoading || self.suggestions.length >= self.totalCount) {
        return;
      }

      self.isLoading = true;
      self.currentPageNumber++;

      $q.resolve(self.pageGetter({ query: self.currentQuery, pageNumber: self.currentPageNumber }))
        .then(function (response) {
          self.suggestions = self.suggestions.concat(response.data);
          self.totalCount = response.total;
        })
        .finally(function () {
          self.isLoading = false;
        });
    };

    self.select = function (value) {
      self.onSelect({ item: value });

      self.blurInput();
    };

    self.handleBlur = function () {
      self.isDropdownVisible = false;

      if (self.currentValue === '') {
        self.clear();
      } else {
        self.currentValue = self.selected;
      }
    };

    self.clear = function () {
      self.currentValue = null;
      self.onSelect({ item: null });

      self.blurInput();
    };

    self.filterExpression = function (item) {
      if (self.filterFunction) {
        return self.filterFunction({ item: item });
      }

      return true;
    };

    self.isSelected = function () {
      return self.selected;
    };

    self.getLabel = function (item) {
      if (self.labelFunction) {
        return self.labelFunction({ item: item });
      }

      return item;
    };

    self.handleKeyDown = function (e) {
      if (!/(38|40|13)/.test(e.keyCode)) {
        return;
      }

      e.preventDefault();

      // select with enter
      if (e.keyCode === 13 && self.suggestions.length && self.activeIndex > -1) {
        self.select(self.suggestions[self.activeIndex]);
      }

      // navigation with keyboard
      if (e.keyCode === 38 && self.activeIndex > 0) {
        self.activeIndex--;
      } else if (e.keyCode === 40 && self.activeIndex < self.suggestions.length - 1) {
        self.activeIndex++;
      }
    };

    $scope.$watch(function () {
      return self.selected;
    }, function (newValue) {
      self.currentValue = newValue;
    });
  }

})();

// Source: breadcrumb.ctrl.js
(function() {
angular
    .module('one.components.breadcrumbs')
    .controller('BreadcrumbController', BreadcrumbController);

  BreadcrumbController.$inject = ['$scope', '$filter', '$q', 'oneUtils'];
  function BreadcrumbController($scope, $filter, $q, oneUtils) {
    var self = this;

    // defaults
    self.templateUrl = self.templateUrl || 'breadcrumbs/breadcrumbSuggestions.tpl.html';
    self.width = self.width || 200;
    self.debounce = self.debounce || 300;
    self.noItemsText = self.noItemsText || 'None available';

    self.activeIndex = -1;

    self.suggestions = [];

    var filter = $filter('filter');

    var dataSource = [];
    var lastRequestToken;

    var isInitialized = false;
    var isLoaded = false;
    var pagesLoaded = 0;

    self.initialize = function() {
      if (isInitialized || !self.canInitialize(self.index)) {
        return;
      }

      if (self.items) {
        self.suggestions = dataSource = self.items;
        isInitialized = isLoaded = true;
      } else if (self.itemsGetter) {
        self.isLoading = true;

        $q.resolve(self.itemsGetter())
          .then(function(result) {
            self.suggestions = dataSource = result;
            isInitialized = isLoaded = true;
          })
          .finally(function() {
            self.isLoading = false;
          });
      } else if (self.pageLoader) {
        self.isLoading = true;

        self.loadPage()
          .then(function () {
            isInitialized = true;
          })
          .finally(function () {
            self.isLoading = false;
          });
      } else {
        self.suggestions = dataSource = [];
        isInitialized = isLoaded = true;
      }
    };

    self.deinitialize = function() {
      isInitialized = isLoaded = false;
      pagesLoaded = 0;
    };

    self.loadPage = function() {
      lastRequestToken = Math.random();

      var config = {
        pageNumber: pagesLoaded + 1,
        query: angular.isObject(self.model) ? self.getLabel(self.model) : self.model,
        sortKey: self.sortingPredicate,
        sortDirection: self.reverse,
        token: lastRequestToken
      };

      self.isLoadingMore = true;

      return $q.resolve(self.pageLoader({ config: config }))
        .then(function (result) {
          if (result.token === lastRequestToken) {
            if (result.currentPage === 1) {
              self.suggestions = dataSource = result.items;
            } else {
              self.suggestions = dataSource = self.suggestions.concat(result.items);
            }

            isLoaded = result.currentPage >= result.totalPages;
            pagesLoaded++;
            self.isLoadingMore = false;
          }
        })
        .catch(function () {
          self.isLoadingMore = false;
        });
    };

    self.loadMoreSuggestions = function () {
      if (!(isLoaded || self.isLoadingMore)) {
        self.loadPage();
      }
    };

    var getPaginatedSuggestions = oneUtils.debounce(function () {
      self.suggestions = dataSource = [];
      pagesLoaded = 0;

      self.loadPage();
    }, self.debounce);

    self.getSuggestions = function(input) {
      if (self.pageLoader) {
        getPaginatedSuggestions();
      } else {
        self.suggestions = filter(dataSource, input) || [];
      }
    };

    self.getLabel = function(item) {
      if (self.labelFunction) {
        return self.labelFunction({ item: item });
      }

      return item;
    };

    self.hide = function() {
      self.showSuggestions = false;
      self.activeIndex = -1;
    };

    self.select = function(item) {
      self.model = self.selectedItem = item;
      self.onSelect(item, self.index);
      self.hide();
    };

    self.sort = function(predicate) {
      self.reverse = (self.sortingPredicate === predicate) ? !self.reverse : false;
      self.sortingPredicate = predicate;

      if (self.pageLoader) {
        self.suggestions = dataSource = [];
        pagesLoaded = 0;
        self.loadPage();
      }
    };

    self.clear = function() {
      self.model = self.selectedItem = undefined;
      self.suggestions = dataSource = [];

      self.deinitialize();
    };

    self.restore = function() {
      self.activeIndex = -1;
      self.suggestions = dataSource;

      if (dataSource.indexOf(self.model) < 0 && self.model !== self.selectedItem) {
        self.model = self.selectedItem;

        if (self.pageLoader) {
          self.deinitialize();
        }
      }
    };

    self.handleClickOutside = function () {
      if (self.showSuggestions) {
        self.hide();
      }
    };

    self.handleKeyDown = function(e) {
      if (!/(38|40|13)/.test(e.keyCode)) {
        return;
      }

      e.preventDefault();

      // select with enter
      if (e.keyCode === 13 && self.suggestions.length && self.activeIndex > -1) {
        self.select(self.suggestions[self.activeIndex]);
      }

      // navigation with keyboard
      if (e.keyCode === 38 && self.activeIndex > 0) {
        self.activeIndex--;
      } else if (e.keyCode === 40 && self.activeIndex < self.suggestions.length - 1) {
        self.activeIndex++;
      }
    };

    $scope.$watch(function() {
      return self.selectedItem;
    }, function(newValue) {
      self.model = newValue;
      self.onSelectedValueChange(newValue, self.index);
    });
  }

})();

// Source: breadcrumb.js
(function() {
angular
    .module('one.components.breadcrumbs')
    .directive('oneBreadcrumb', breadcrumb);

  breadcrumb.$inject = [];

  function breadcrumb() {
    function link(scope, element, attr, ctrls) {
      var ctrl = ctrls[0];
      var containerCtrl = ctrls[1];

      if (!containerCtrl) {
        return;
      }

      ctrl.index = containerCtrl.register(element, ctrl.clear);
      ctrl.onSelect = containerCtrl.handleSelect;
      ctrl.onSelectedValueChange = containerCtrl.handleSelectedItemChange;
      ctrl.canInitialize = containerCtrl.canInitialize;
    }

    return {
      restrict: 'E',
      scope: true,
      bindToController: {
        placeholder: '@',
        noItemsText: '@',
        width: '@',
        debounce: '=',
        items: '=',
        itemsGetter: '&?',
        pageLoader: '&?',
        canInitialize: '&?',
        selectedItem: '=',
        templateUrl: '=',
        sortingPredicate: '=',
        labelFunction: '&?'
      },
      controller: 'BreadcrumbController',
      controllerAs: 'breadcrumbCtrl',
      templateUrl: 'breadcrumbs/breadcrumb.tpl.html',
      require: ['oneBreadcrumb', '^?oneBreadcrumbs'],
      link: link
    };
  }

})();

// Source: breadcrumbs.ctrl.js
(function() {
angular
    .module('one.components.breadcrumbs')
    .controller('BreadcrumbsController', BreadcrumbsController);

  BreadcrumbsController.$inject = [];
  function BreadcrumbsController() {
      var self = this;
      var lastIndex = 0;

      self.breadcrumbs = [];

      self.register = function(breadcrumb, clearFn) {
        self.breadcrumbs.push({
          element: breadcrumb,
          clearFn: clearFn
        });
        lastIndex++;

        return lastIndex - 1;
      };

      self.handleSelect = function(item, index) {
        var selectionChanged = self.breadcrumbs[index].selectedItem !== item;
        var isLastBreadcrumb = index === lastIndex - 1;
        var items;

        if (selectionChanged) {
          self.breadcrumbs[index].selectedItem = item;

          for (var i = index + 1; i < lastIndex; i++) {
            self.breadcrumbs[i].clearFn();
          }
        }

        if (!isLastBreadcrumb) {
          self.breadcrumbs[index + 1].element.find('input')[0].focus();
        } else {
          self.breadcrumbs[index].element.find('input')[0].blur();
        }

        if (selectionChanged && isLastBreadcrumb) {
          items = self.breadcrumbs.map(function(item) {
            return item.selectedItem;
          });

          self.onSelect({ items: items });
        }
      };

      self.handleSelectedItemChange = function(item, index) {
        self.breadcrumbs[index].selectedItem = item;
      };

      self.canInitialize = function (config) {
        var index = config.index;

        for (var i = 0; i < index; i++) {
          if (!self.breadcrumbs[i].selectedItem) {
            return false;
          }
        }

        return true;
      };
    }

})();

// Source: breadcrumbs.js
angular
  .module('one.components.breadcrumbs')
  .directive('oneBreadcrumbs', [function() {
return {
      restrict: 'E',
      bindToController: {
        onSelect: '&'
      },
      controllerAs: 'breadcrumbsCtrl',
      controller: 'BreadcrumbsController'
    };

  }]);

// Source: bulkModal.js
(function () {
angular.module('one.components.bulkModal', ['mgcrea.ngStrap.modal'])
    .factory('oneBulkModal', oneBulkModal);

  oneBulkModal.$inject = ['$modal', '$rootScope', '$q', '$interpolate'];
  function oneBulkModal($modal, $rootScope, $q, $interpolate) {
    BulkModal.defaultButtons = {
      apply: {
        text: 'Apply',
        click: 'bulkModal.save()',
        disabled: '!bulkModal.isValid',
        classes: ['pull-right', 'btn-primary']
      },
      back: {
        text: 'Back',
        click: 'bulkModal.gotoSection(\'menu\')',
        classes: ['btn-default']
      },
      cancel: {
        text: 'Cancel',
        click: '$hide()',
        classes: ['btn-default']
      }
    };

    function BulkModal() {
      // Overrideable strings
      this.title = 'Default Title';
      this.messages = {
        success: 'All edits to {{ sectionTitle }} have been successfully added to the following items:',
        mixedSuccess: 'Your edits have been successfully added to <strong>{{ successCount | number }}</strong>' +
        ' items, but there were a few edits we could not update:',
        failure: 'All edits to {{ sectionTitle }} have failed:',
        hardFailure: 'All edits to {{ sectionTitle }} have failed:' +
        ' <h2 class="bulkedit-summary-hard-error-message">{{ error }}</h2>',
        menuDescription: 'You\'ve selected <strong>{{ total | number }}</strong> Items to Bulk Edit.' +
        ' What fields would you like to edit?',
        headerDropdown: '<strong>{{ total | number}}</strong> Items Selected',
        headerDropdownSubtitle: 'Selected Items'
      };

      // Base store for sections, prepopulated with default menu and summary
      this.sections = {
        'menu': {
          title: '',
          subTitle: '',
          template: 'bulkModal/menu.tpl.html',
          name: 'menu',
          showHeader: false,
          buttons: [BulkModal.defaultButtons.cancel]
        },
        'summary': {
          title: '',
          subTitle: '',
          template: 'bulkModal/summary.tpl.html',
          name: 'summary',
          showHeader: false,
          buttons: [
            {
              text: 'More Changes',
              click: 'bulkModal.goHome()',
              classes: ['btn-default']
            },
            {
              text: 'Return to Control Center',
              click: '$hide()',
              classes: ['pull-right', 'btn-primary']
            }
          ]
        }
      };
      // store for user defined sections, used to make the listing on the menu
      this.addedSections = {};

      // store the user changes
      this.changes = {};

      // Overrideable templates for header/footer
      this.header = 'bulkModal/header.tpl.html';
      this.footer = 'bulkModal/footer.tpl.html';
      // Items we're editing
      this.entities = [];

      this.isValid = false;

      // Default to the menu section
      this.activeSection = this.sections.menu;
      this.$modal = {};
      this.summary = {
        results: [],
        success: 0,
        failure: 0
      };
    }

    BulkModal.prototype = {
      constructor: BulkModal,
      show: function (entities) {
        // Create a new scope to expose this object in modal templates
        var self = this,
          deferred = $q.defer();

        this.scope = $rootScope.$new();

        this.scope.bulkModal = this;
        Object.defineProperty(this.scope, 'changes', {
          get: function () {
            return self.changes;
          },
          set: function (changes) {
            self.changes = changes;
          }
        });

        this.summary.results = []; // Reset any summary results from a previous edit
        this.summary.success = 0;
        this.summary.failure = 0;
        this.summary.error = '';

        this.entities = entities;
        this.goHome();
        this.$modal = $modal({
          title: this.title,
          templateUrl: 'bulkModal/bulkModal.tpl.html',
          onBeforeHide: function () {
            deferred.resolve();
          },
          scope: self.scope // pass our new scope with bulkModal exposed
        });

        return deferred.promise;
      },
      addSection: function (section) {
        this.sections[section.name] = section;
        this.addedSections[section.name] = section;
        return this;
      },
      setTitle: function (title) {
        this.title = title;
        return this;
      },
      setMessages: function (customMessages) {
        this.messages = _.defaults(customMessages, this.messages);
        return this;
      },
      getMessage: function (name) {
        var msg = this.messages[name];
        if (msg) {
          return $interpolate(msg)({
            'successCount': this.summary.success,
            'failureCount': this.summary.failure,
            'total': this.entities.length,
            'sectionTitle': _.get(this, 'summary.editedSection.title', ''),
            'error': this.summary.error
          });
        } else {
          return msg;
        }
      },
      setHeader: function (headerTpl) {
        this.header = headerTpl;
        return this;
      },
      setFooter: function (footerTpl) {
        this.footer = footerTpl;
        return this;
      },
      goHome: function () {
        this.changes = {};
        if (_.size(this.addedSections) === 1) {
          this.gotoSection(_.keys(this.addedSections)[0]);
        } else {
          this.gotoSection('menu');
        }
      },
      gotoSection: function (sectionName) {
        var nextSection = this.sections[sectionName];
        if (nextSection) {
          this.activeSection = _.defaults(nextSection, this.sectionDefaults());
        }
      },
      save: function () {
        var self = this,
          saveFn = _.get(this, 'activeSection.save');

        if (saveFn) {

          this.isLoading = true;
          $q.when(saveFn(self.entities, self.changes))
            .then(function (results) {
              self.summary.results = results;
              self.summary.success = _.size(_.filter(results, {'status': 'success'}));
              self.summary.failure = _.size(results) - self.summary.success;
              self.summary.editedSection = _.clone(self.activeSection);

              self.gotoSection('summary');
            })
            .catch(function (err) {
              self.summary.results = [];
              self.summary.success = 0;
              self.summary.failure = 0;
              self.summary.editedSection = _.clone(self.activeSection);
              self.summary.error = _.isString(err) ?
                err
                : _.get(err, 'errorMessage', 'This service is temporarily unavailable.');

              self.gotoSection('summary');
            })
            .finally(function () {
              self.isLoading = false;
            });
        } else {
          throw new Error(
            'SaveError',
            'Section ' + this.activeSection.title + '(' + this.activeSection.name + ') does not have a save method.'
          );
        }
      },
      // By Default, user added sections will contain back (to menu) and save (save + goto summary)
      sectionDefaults: function () {
        var defaults = {
          showHeader: true
        };
        if (_.size(this.addedSections) === 1) {
          defaults.buttons = [
            BulkModal.defaultButtons.cancel,
            BulkModal.defaultButtons.apply
          ];
        } else {
          defaults.buttons = [
            BulkModal.defaultButtons.back,
            BulkModal.defaultButtons.apply
          ];
        }
        return defaults;
      }
    };

    return {
      extend: function () {
        return new BulkModal();
      }
    };

  }
}());

// Source: checkbox.js
angular.module('one.components.checkbox', [])
  .directive('oneCheckbox', [function () {
return {
      restrict: 'A',
      require: ['?ngModel'],
      link: {
        pre: function (scope, element, attr, ctrls) {
          element.addClass('one-checkbox');
          if (ctrls[0]) {
            var ctrl = ctrls[0];
            var listener = function (ev) {
              if (_.isUndefined(attr.disabled) || attr.disabled === false) {
                if ($(element[0]).hasClass('on')) {
                  $(element[0]).removeClass('on');
                  $(element[0]).addClass('off');
                } else {
                  $(element[0]).removeClass('off');
                  $(element[0]).addClass('on');
                }
                ctrl.$setViewValue($(element[0]).hasClass('on'), ev && ev.type);
              }
            };
            element.on('click', listener);
            ctrl.$render = function () {
              if (ctrl.$viewValue) {
                $(element[0]).addClass('on');
                $(element[0]).removeClass('off');
              } else {
                $(element[0]).addClass('off');
                $(element[0]).removeClass('on');
              }
            };
          }
        }
      },
      templateUrl: 'checkbox/checkbox.tpl.html',
      scope: {
        type: '='
      }
    };
  }]);

// Source: clickOutside.js
(function() {
angular
    .module('one.components.clickOutside', [])
    .directive('oneClickOutside', clickOutsideDirective);

  clickOutsideDirective.$inject = ['$window'];
  function clickOutsideDirective($window) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function handleClickEvent(event) {
          if (element[0].contains(event.target)) {
            return;
          }

          scope.$apply(attrs.oneClickOutside, { $event: event });
        }

        angular.element($window).on('click', handleClickEvent);

        scope.$on('$destroy', function() {
          angular.element($window).off('click', handleClickEvent);
        });
      }
    };
  }

})();

// Source: formatter.js
(function() {
angular
    .module('one.components.common')
    .directive('oneFormatter', formatter);

  formatter.$inject = [];
  function formatter() {
    var directive = {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModelCtrl) {
        ngModelCtrl.$formatters.push(function(value) {
          if (value) {
            return scope.$eval(attrs.oneFormatter, {item: value});
          }
        });
      }
    };

    return directive;
  }
})();

// Source: scrollIntoView.js
(function() {
angular
    .module('one.components.common')
    .directive('oneScrollIntoView', function() {
      return {
        link: function(scope, element, attrs) {
          var scrollValue = {
            auto: true,
            scroll: true,
            visible: false,
            hidden: false
          };

          var scrollableParent = element.parents().filter(function() {
            return scrollValue[$(this).css('overflow')] || scrollValue[$(this).css('overflow-y')];
          });

          if (!scrollableParent[0]) {
            return;
          }

          scope.$watch(attrs.oneScrollIntoView, function(value) {
            if (value) {
              scrollIntoView(element, scrollableParent);
            }
          });
        }
      };
    });

  function scrollIntoView($element, $container) {
    var containerTop = $container.scrollTop();
    var containerBottom = containerTop + $container.height();
    var elemTop = $element[0].offsetTop;
    var elemBottom = elemTop + $element.height();

    if (elemTop < containerTop) {
      $container.scrollTop(elemTop);
    } else if (elemBottom > containerBottom) {
      $container.scrollTop(elemBottom - $container.height());
    }
  }

})();

// Source: selectOnFocus.js
(function() {
angular
    .module('one.components.common')
    .directive('oneSelectOnFocus', selectOnFocusDirective);

  selectOnFocusDirective.$inject = [];
  function selectOnFocusDirective() {
    return {
      link: function(scope, element) {
        element.on('focus', function () {
          element[0].setSelectionRange(0, element.val().length);
        });
      }
    };
  }

})();

// Source: utils.service.js
(function() {
angular
    .module('one.components.common')
    .service('oneUtils', UtilsService);

  UtilsService.$inject = ['$timeout', '$q'];
  function UtilsService($timeout, $q) {
    this.debounce = function debounce(func, wait, immediate, invokeApply) {
      var timeout;

      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
        };

        var callNow = immediate && !timeout;
        if (timeout) {
          $timeout.cancel(timeout);
        }
        timeout = $timeout(later, wait, invokeApply);

        if (callNow) {
          func.apply(context, args);
        }
      };
    };

    this.transformPageGetter = function(getter, options) {
      var pageNumber = 1;
      var loading = false;
      var loadedAll = false;
      var currentQuery;

      options = _.merge({
        dataPath: 'data',
        totalPath: 'total'
      }, options);

      return function(query, nextPage, items) {
        if (currentQuery === query && loading) {
          return $q.resolve(items);
        }

        if (nextPage) {
          pageNumber++;
        } else {
          pageNumber = 1;
          loadedAll = false;
        }

        if (loadedAll) {
          return $q.resolve(items);
        }

        loading = true;
        currentQuery = query;

        return $q.resolve(getter(query, pageNumber))
          .then(function(response) {
            var data = _.get(response, options.dataPath);
            var total = _.get(response, options.totalPath);
            var result = nextPage ? _.concat(items, data) : data;

            loadedAll = total <= _.size(result);

            return result;
          })
          .finally(function () {
            loading = false;
          });
      };
    };
  }

})();

// Source: container.js
angular.module('one.components.container', [])
  .directive('oneContainerForWidget', [function () {
return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'container/widgetContainer.tpl.html',
      scope: false
    };
  }])
  .directive('oneContainerForSectionHeader', [function () {
return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'container/sectionHeaderContainer.tpl.html',
      scope: false
    };
  }])
  .directive('oneContainerDark', [function () {
return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'container/darkContainer.tpl.html',
      scope: false
    };
  }])
  .directive('oneContainerBasic', [function () {
return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'container/basicContainer.tpl.html',
      scope: false
    };
  }]);

// Source: errors.js
angular.module('one.components.errors', []);

// Source: feedback.js
angular.module('one.components.feedback', [])
  .directive('oneFeedback', [function () {
return {
      restrict: 'E',
      templateUrl: 'feedback/feedback.tpl.html'
    };
  }]);

// Source: graph.js
(function () {
angular.module('one.components.graph', [])
    .constant('d3', d3)
    .service('oneGraphService', oneGraphService)
    .controller('OneGraphController', OneGraphController)
    .directive('oneGraph', oneGraphDirective)
    .directive('oneGraphShape', oneGraphShapeDirective)
    .factory('oneGraphColors', oneGraphColors)
    .constant('oneGraphConstants', {
      axis: {
        horizontal: {
          tick: {
            interval: 150,
            padding: 16,
            width: 0
          }
        },
        vertical: {
          tick: {
            interval: 75,
            padding: 6,
            width: -10
          }
        },
        hiddenAxisTickPadding: 12
      },
      legend: {
        height: 25,
        padding: {
          left: 25,
          top: 8
        },
        symbol: {
          size: 10
        },
        width: 100
      },
      line: {
      },
      bar: {
        padding: 0.2, // 5% padding
        paddingBetweenGroup: 0.1,
        margin: 0.2 // 20% of height at top
      },
      title: {
        margin: 30
      },
      resize: {
        debounce: 250
      }
    });

  function scaleFor(key, range) {
    return d3.scale.linear()
      .range(key === 'x' ? range : range.reverse());
  }

  function configuredDomainFor(vm, key, data) {
    var dataDomain = domainFor(key, data);
    var configuredDomain = _.get(vm.domain, key);
    return [_.get(configuredDomain, 'min', dataDomain[0]), _.get(configuredDomain, 'max', dataDomain[1])];
  }

  function domainFor(key, data) {
    if (_.isArray(data)) {
      return d3.extent(data, function (d) {
        return d[key];
      });
    } else {
      return d3.extent(_.flatten(_.values(data)), function (d) {
        return d[key];
      });
    }
  }

  function dataKeysFor(data) {
    if (_.isArray(data)) {
      var sample = _.first(data);
      // an array of data, but what kind?
      if (_.isObject(sample)) {
        // in some kind of { x: 123, y: 456 } format
        return _.keys(data[0]);
      }
    } else {
      return _(data)
        .map(function (v) {
          return dataKeysFor(v);
        })
        .flatten()
        .compact()
        .uniq()
        .value();
    }
  }

  oneGraphColors.$inject = [];
  function oneGraphColors() {
    var colors = {
      // From privateVariables.less
      blue:       ['#26325C', '#404F88', '#6279CB', '#8193D7', '#A1AFE0', '#C0C9EB', '#E0E5F5', '#EFF1FA'],
      green:      ['#0F4A3F', '#27806F', '#3DAE99', '#51D1B8', '#7BDDCB', '#A6E8DB', '#CAF1EA', '#EDFAF8'],
      yellow:     ['#4D4300', '#938200', '#EEE04E', '#F2E677', '#F5ED9B', '#F9F3BE', '#FCF9DF', '#FEFCEF'],
      red:        ['#6B3731', '#AE5144', '#FE7766', '#FE9286', '#FEAEA4', '#FEC8C3', '#FFEBE8', '#FFF4F4'],
      orange:     ['#824C02', '#BF7701', '#FE9B00', '#FEB13E', '#FED091', '#FFE0B7', '#FFEFDC', '#FFF7ED'],
      cyan:       ['#023A4E', '#076689', '#0F9ACE', '#15B7F5', '#57CEF8', '#8AE1FF', '#C8F2FF', '#E8FAFF'],
      purple:     ['#3D1861', '#603294', '#9C5EE1', '#B07FE8', '#C49FEF', '#D8C0F4', '#ECDFFA', '#F6EFFD'],
      redOrange:  ['#753300', '#BA4E00', '#FD7600', '#FE9129', '#FEAC66', '#FDBC85', '#FFE2CC', '#FFF7F1'],
      pink:       ['#900855', '#BF0A70', '#FA1395', '#FC52B2', '#FD8ACB', '#FEC0E3', '#FFD7ED', '#FFF0F8']
    };

    var palettes = {};
    // Map colors above to defaults and named colors.
    // Example:
    //  oneGraphColors.blue.default => #6279CB
    //  oneGraphColors.green_1      => #0F4A3F
    _.each(colors, function (palette, code) {
      colors[code].default = palette[2];
      _.each(palette, function (color, index) {
        colors[code + '_' + (index + 1)] = color;
      });

      palettes[code] = [
        palette[2],
        palette[4],
        palette[6]
      ];
    });

    colors.palettes = palettes;

    colors.defaultRange = [
      colors.cyan_3,
      colors.orange_3,
      colors.pink_2,
      colors.green_3,
      colors.purple_3,
      colors.yellow_3,
      colors.pink_4,
      colors.red_3,
      colors.blue_3,
      colors.pink_3
    ];

    colors.axis = {
      text:         '#333333',
      stroke:       '#BCBCBC',
      lightStroke:  '#BCBCBC'
    };

    colors.colorScale = function (palette) {
      return d3.scale.ordinal().range(palette || colors.defaultRange);
    };

    return colors;
  }

  OneGraphController.$inject = ['$scope', 'oneGraphColors', 'oneGraphConstants'];
  function OneGraphController($scope, oneGraphColors, constants) {
    var vm = this;

    vm.additionalMargin = function additionalMargin(side) {
      return _.sumBy(vm.additionalMargins, side);
    };

    vm.addTitle = function addTitle(element, title) {
      if (title) {
        vm.title = title;
        d3.select(element).append('text')
          .attr('class', 'title')
          .attr('x', vm.graphMargin / 2)
          .attr('y', vm.graphMargin / 2)
          .text(vm.title);
      }
    };

    vm.buildScales = function buildScales(keys) {
      var vm = this;
      return _(keys)
        .map(function (k) {
          return [k, scaleFor(k, [0, vm.keyIsHorizontal(k) ? vm.innerWidth() : vm.innerHeight()])];
        })
        .fromPairs()
        .value();
    };

    vm.getGraphWidth = function getGraphWidth(element) {
      if (angular.isDefined(vm.fullWidth)) {
        vm.graphWidth = element[0].parentNode.offsetWidth;
      }
      return vm.graphWidth;
    };

    vm.graphLeftMargin = function () {
      return vm.additionalMargin('left');
    };

    vm.graphTopMargin = function () {
      return vm.additionalMargin('top');
    };

    vm.keyIsHorizontal = function keyIsHorizontal(key) {
      return key === 'x' || key === 'd';
    };

    vm.innerHeight = function innerHeight() {
      return vm.graphHeight - vm.additionalMargin('top') - vm.additionalMargin('bottom');
    };

    vm.innerWidth = function innerWidth() {
      return vm.graphWidth - vm.additionalMargin('left') - vm.additionalMargin('right');
    };

    vm.massageData = function massageData(data) {
      if (_.isArray(data)) {
        var sample = _.first(data);
        if (_.isObject(sample)) {
          return data;
        } else if (_.isNumber(sample)) {
          // an array of single numbers, transform it to x/y
          return _(data)
            .map(function (v, i) {
              return {x: i, y: v};
            })
            .value();
        } else {
          return data;
        }
      } else {
        // ???
        return data;
      }
    };

    vm.registerMargin = function registerMargin(margin) {
      vm.additionalMargins = vm.additionalMargins.concat(margin);
    };

    vm.responsivePadding = function responsivePadding() {
      if (vm.margin) {
        return vm.margin;
      }

      var x = _.min([vm.graphHeight, vm.graphWidth]);
      switch (true) {
        case (x <= 50):
          return 0;

        case (x <= 150):
          return 25;

        default:
          return 55;
      }
    };

    vm.setScaleMax = function setScaleMax(scale, max) {
      var vm = this;
      if (!vm.domain) {
        vm.domain = {};
      }

      if (!vm.domain[scale]) {
        vm.domain[scale] = {};
      }
      vm.domain[scale].max = max;
    };

    vm.setScaleMin = function setScaleMin(scale, min) {
      var vm = this;
      if (!vm.domain) {
        vm.domain = {};
      }

      if (!vm.domain[scale]) {
        vm.domain[scale] = {};
      }
      vm.domain[scale].min = min;
    };

    vm.sizeElement = function sizeElement(element) {
      element.height(vm.graphHeight);
      element.width(vm.getGraphWidth(element));
    };

    vm.updateData = function updateData($scope, data) {
      var vm = this;

      if (!vm.keys) {
        vm.keys = dataKeysFor(data);
      }
      if (!vm.scales) {
        vm.scales = vm.buildScales(vm.keys);
      }

      _.each(vm.scales, function (v, k) {
        v.domain(configuredDomainFor(vm, k, data));
      });

      $scope.$broadcast('updated.scales', vm.scales);
      $scope.$broadcast('updated.data', data);
    };

    vm.graphWidth = vm.width || 500;
    vm.graphHeight = vm.height || 250;
    vm.graphMargin = vm.responsivePadding();

    vm.additionalMargins = [{
      role: 'default',
      top: vm.graphMargin / 4,
      right: vm.graphMargin / 2,
      bottom: vm.graphMargin / 4,
      left: vm.graphMargin / 2
    }];

    if (vm.title) {
      vm.additionalMargins.push({
        role: 'title',
        top: constants.title.margin,
        right: 0,
        bottom: 0,
        left: 0
      });
    }

    this.colors = oneGraphColors;
    this.colorScale = oneGraphColors.colorScale(this.colorPalette);

    // construct a function that takes a single argument: the new data
    //   that function will pass the data *through* the massageData function
    //   and then pass it on to the updateData function with the $scope already attached
    vm.updateMassagedData = _.flow([
      vm.massageData,
      _.partial(_.bind(vm.updateData, vm), $scope)
    ]);

    vm.updateGraph = function updateGraph(element, newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        vm.graphWidth = element[0].parentNode.offsetWidth;

        // resets the data
        delete vm.keys;
        delete vm.scales;
        vm.updateMassagedData(vm.data);

        $scope.$apply(function() {
          element.css('width', vm.graphWidth + 'px');
        });
      }
    };

    vm.onWindowResize = _.debounce(function onWindowResize(newValue, oldValue) {
      vm.updateGraph(vm.element, newValue, oldValue);
    }.bind(this), constants.resize.debounce);

    $scope.$watch(function () {
      return vm.data;
    }, vm.updateMassagedData, true);
  }

  oneGraphDirective.$inject = ['$window'];
  function oneGraphDirective($window) {
    function link(scope, element, attrs, ctrl, transclude) {
      var vm = scope.$ctrl;
      vm.element = element;
      // Dirty trick to make the parent scope accessible
      // Definitely not happy with it, but it was the better of two evils
      scope.$outer = scope.$parent;
      vm.sizeElement(element);
      transclude(scope, function (clone) {
        element.find('g').append(clone);
      });

      if (angular.isDefined(vm.fullWidth)) {
        angular.element($window)
          .resize(vm.onWindowResize);
      }
      vm.addTitle(element[0], vm.title);
    }

    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        data: '=',
        width: '=',
        height: '=',
        margin: '=',
        title: '=',
        colorPalette: '=',
        fullWidth: '@'
      },
      bindToController: true,
      controller: 'OneGraphController',
      link: link,
      controllerAs: '$ctrl',
      template: '<svg>' +
      '<g ng-attr-transform="translate({{ $ctrl.graphLeftMargin() }}, {{ $ctrl.graphTopMargin() }})"></g>' +
      '</svg>'
    };
  }

  oneGraphService.$inject = ['oneGraphConstants'];
  function oneGraphService(constants) {
    this.availableShapes = {
      circle: function drawCircle(options) {
        return options.container.append('circle')
          .attr({
            r: options.size / 2,
            cx: options.size / 2,
            cy: -options.size / 2
          })
          .style('fill', options.color);
      },

      'horizontal-line': function drawHorizontalLine(options) {
        return options.container.append('line')
          .attr({
            x1: 0,
            y1: -options.size / 2,
            x2: options.size,
            y2: -options.size / 2
          })
          .style({
            stroke: options.color,
            'stroke-width': 2
          });
      },

      square: function drawSquare(options) {
        return options.container.append('rect')
          .attr({
            y: -options.size,
            height: options.size,
            width: options.size
          })
          .style('fill', options.color);
      },

      'vertical-line': function drawVerticalLine(options) {
        return options.container.append('line')
          .attr({
            x1: options.size / 2,
            y1: -options.size,
            x2: options.size / 2,
            y2: 0
          })
          .style({
            stroke: options.color,
            'stroke-width': 2
          });
      }
    };

    this.drawShape = function drawShape(options) {
      _.defaults(options, {
        shape: 'circle',
        size: constants.legend.symbol.size
      });
      return this.availableShapes[options.shape](options);
    };
  }

  oneGraphShapeDirective.$inject = ['d3', 'oneGraphConstants', 'oneGraphService'];
  function oneGraphShapeDirective(d3, constants, graphService) {
    function link(scope, $element) {
      var $svg = $element.find('svg'),
        size = constants.legend.symbol.size;

      graphService.drawShape({
        container: d3.select($svg[0]).append('g'),
        shape: scope.shape,
        color: scope.color
      }).attr('transform', 'translate(0,' + size + ')');

      $svg.height(size);
      $svg.width(size);

      $element.addClass('one-graph-shape');
    }

    return {
      restrict: 'E',
      scope: {
        color: '=',
        shape: '@'
      },
      link: link,
      template: '<svg></svg>'
    };
  }

})();

// Source: icons.js
(function () {
angular.module('one.components.icons', [])
    .directive('oneIcon', oneIconDirective)
    .run(lazyLoadIcons);

  lazyLoadIcons.$inject = ['$templateCache', '$timeout'];
  function lazyLoadIcons($templateCache, $timeout) {
    // Have to wait for the template to be available
    $timeout(function () {
      $('#one-icon-catalog').remove();
      $('body').append($templateCache.get('icons/svg-icons.tpl.html'));
    });
  }

  function oneIconDirective() {
    function link(scope, element, attributes) {
      element.addClass('one-icon');
      var size = scope.size ? scope.size + 'px' : element.css('font-size') || '16px';
      element.children().css({height: size, width: size});

      scope.iconHref = function () {
        return '#' + (scope.icon || attributes.oneIcon);
      };
    }

    return {
      restrict: 'AE',
      scope: {
        icon: '=',
        size: '='
      },
      link: link,
      template: '<svg viewBox="0 0 16 16" ><use xlink:href="" ng-href="{{iconHref()}}"></use></svg>'
    };
  }

})();

// Source: lineGraph.js
(function() {
angular.module('one.components.lineGraph', [])
    .directive('oneLineGraph', lineBarDirective);

  lineBarDirective.$inject = ['OneLineGraphService', '$window'];

  function lineBarDirective(OneLineGraphService, $window) {
    var margin = {
      top: 20,
      right: 50,
      bottom: 30,
      left: 50
    },
    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'one-line-graph-tooltip tooltip top');

    return {
      restrict: 'A',
      scope: {
        data: '=',
        dateFormat: '=',
        axisDateFormat: '=',
        label0: '@',
        label1: '@',
        color0: '=',
        color1: '=',
        yAsix0Format: '@',
        yAsix1Format: '@',
        currencySign: '@',
        currencyDecimals: '@'
      },
      link: function(scope, el) {
        var label0 = scope.label0,
            label1 = scope.label1,
            color0 = scope.color0,
            color1 = scope.color1,
            dateFormat = scope.dateFormat,
            axisDateFormat = scope.axisDateFormat,
            yAsix0Format = scope.yAsix0Format ? scope.yAsix0Format : 's',
            yAsix1Format = scope.yAsix1Format ? scope.yAsix1Format : '$s',
            currencySign = scope.currencySign,
            currencyDecimals = scope.currencyDecimals,
            $$window = angular.element($window),
            width,
            height;

        function setWidthHeight() {
          width = el.width() - margin.left - margin.right;
          height = el.height() - margin.top - margin.bottom;
        }

        scope.$on('one.linebar.build', function() {
          OneLineGraphService(el, scope.data, width, height, margin,
                              tooltip, label0, label1, color0, color1, dateFormat, axisDateFormat,
                              yAsix0Format, yAsix1Format, currencySign, currencyDecimals);
        });
        scope.$watch('label0', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            label0 = newVal;
          }
        });
        scope.$watch('label1', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            label1 = newVal;
          }
        });
        scope.$watch('yAsix0Format', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            yAsix0Format = newVal;
          }
        });
        scope.$watch('yAsix1Format', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            yAsix1Format = newVal;
          }
        });
        scope.$watch('currencySign', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            currencySign = newVal;
          }
        });
        scope.$watch('currencyDecimals', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            currencyDecimals = newVal;
          }
        });
        scope.$watch('data', function() {
          buildLineBar();
        }, true);

        scope.$watch(function() {
          return {
            width: el.width(),
            height: el.height()
          };
        }, function(newValue, oldValue) {
          if (newValue && !_.isEqual(oldValue, newValue)) {
            buildLineBar();
          }
        }, true);

        function buildLineBar() {
          setWidthHeight();
          scope.$emit('one.linebar.build');
        }

        $$window.on('load resize', buildLineBar);
      }
    };
  }
})();

// Source: lineGraphService.js
(function() {
angular.module('one.components.lineGraph')
      .factory('OneLineGraphService', OneLineGraphService);

  OneLineGraphService.$inject = ['$filter', 'oneLineGraphUtilities'];

  function OneLineGraphService($filter, oneLineGraphUtilities) {
    function buildGraph(el, data, width, height, margin, tooltip, label0,
                          label1, color0, color1, dateFormat, axisDateFormat, yAsix0Format, yAsix1Format,
                          currencySign, currencyDecimals) {

      function round10(num) {
        var length = Math.round(num).toString().length;
        var roundTo = Math.pow(10, length - 1);

        return Math.ceil(num / roundTo) * roundTo;
      }

      function formatDate(d) {
        return $filter('date')(d, axisDateFormat);
      }

      function formatAxis(axisFormat) {
        return function (value) {
          var formattedValue = d3.format(axisFormat && value < 1 ? axisFormat.replace('s', 'g') : axisFormat)(value);
          if (formattedValue && currencySign) {
            return formattedValue.replace('$', currencySign);
          }
          return formattedValue;
        };
      }

      function buildSvg(el, data, margin) {
        el.empty();

        var length = data.length,
            minDate = data[0].xdata,
            maxDate = data[length - 1].xdata,
            midDate = new Date((minDate.getTime() + maxDate.getTime()) / 2),
            max0 = round10(d3.max(data, function(d) {
              return d.ydata0;
            })),
            max1 = round10(d3.max(data, function(d) {
              return d.ydata1;
            })),
            xScale = d3.time.scale()
              .domain(d3.extent(data, function(d) {
                return d.xdata;
              }))
              .range([0, width]),
            yScale0 = d3.scale.linear()
              .domain([0, max0])
              .range([height, 0]),
            yScale1 = d3.scale.linear()
              .domain([0, max1])
              .range([height, 0]),
            xAxis = d3.svg.axis()
              .scale(xScale)
              //todo: configure tick values
              .tickValues([minDate, midDate, maxDate])
              .tickFormat(formatDate)
              .orient('bottom')
              .innerTickSize(-height)
              .outerTickSize(0)
              .tickPadding(10),
            yAxis0 = d3.svg.axis()
              .scale(yScale0)
              .tickValues([0, max0 / 2, max0])
              .tickFormat(formatAxis(yAsix0Format))
              .tickSize(-10)
              .orient('left'),
            yAxis1 = d3.svg.axis()
              .scale(yScale1)
              .tickValues([0, max1 / 2, max1])
              .tickFormat(formatAxis(yAsix1Format))
              .tickSize(-10)
              .orient('right'),
            line0 = d3.svg.line()
              .x(function(d) {
                return xScale(d.xdata);
              })
              .y(function(d) {
                return yScale0(d.ydata0);
              }),
            line1 = d3.svg.line()
              .x(function(d) {
                return xScale(d.xdata);
              })
              .y(function(d) {
                return yScale1(d.ydata1);
              }),
            svg,
            focus;

        svg = d3.select(el[0]).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        focus = svg.append('g');

        svg.append('g')
            .attr('class', 'y axis yaxis0 text-uppercase')
            .style('fill', color0)
            .call(yAxis0)
            .select('path')
            .style('stroke', color0);

        svg.select('.yaxis0')
            .selectAll('line')
            .style('stroke', color0);

        svg.append('path')
            .datum(data)
            .attr('class', 'line')
            .style('stroke', color0)
            .attr('d', line0);

        svg.append('g')
            .attr('class', 'y axis yaxis1 text-uppercase')
            .attr('transform', 'translate(' + width + ', 0)')
            .style('fill', color1)
            .call(yAxis1)
            .select('path')
            .style('stroke', color1);

        svg.select('.yaxis1')
            .selectAll('line')
            .style('stroke', color1);

        svg.append('path')
            .datum(data)
            .attr('class', 'line')
            .style('stroke', color1)
            .attr('d', line1);

        svg.append('g')
            .attr('class', 'x axis xaxis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('rect')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .style('fill', 'none')
          .style('pointer-events', 'all')
          .on('scroll', mousemove)
          .on('mousemove', mousemove)
          .on('mouseout', mouseout);

        function cleanup() {
          svg.selectAll('circle').remove();
        }

        function mousemove() {
          var x0 = xScale.invert(d3.mouse(this)[0]),
            d = oneLineGraphUtilities.getBisectorAttribute(x0, data),
            defaults = {
              highZIndex: 'circle0',
              lowZIndex: 'circle1',
              highColor:  color0,
              lowColor: color1
            },
            x = xScale(d.xdata),
            y0 = yScale0(d.ydata0),
            y1 = yScale1(d.ydata1),
            selector;

          selector = oneLineGraphUtilities.getHighestSelector(defaults, d, max0, max1);

          buildCircles(defaults, x, y0, y1, 4, 9);

          buildTooltip(tooltip, d, label0, label1, color0, color1, dateFormat, yAsix0Format, yAsix1Format);

          addTooltip(el, selector, tooltip, 4, 9);
        }

        function buildCircles(defaults, x, y0, y1, radius, strokeWidth) {
          cleanup();

          focus.append('circle')
            .attr('r', radius)
            .attr('class', defaults.lowZIndex)
            .style({
              fill: defaults.lowColor,
              stroke: defaults.lowColor,
              'stroke-opacity': 0.3,
              'stroke-width': strokeWidth
            });

          focus.append('circle')
            .attr('r', radius)
            .attr('class', defaults.highZIndex)
            .style({
              fill: defaults.highColor,
              stroke: defaults.highColor,
              'stroke-opacity': 0.3,
              'stroke-width': strokeWidth
            });

          focus.select('circle.circle0')
            .attr('transform', 'translate(' + x + ',' + y0 + ')');

          focus.select('circle.circle1')
            .attr('transform', 'translate(' + x + ',' + y1 + ')');
        }

        function buildTooltip(tooltip, d, label0, label1, color0, color1, dateFormat, yAsix0Format, yAsix1Format) {
          tooltip.html('');

          tooltip
            .append('div')
            .attr('class', 'arrow-wrapper')
            .append('div')
            .attr('class', 'oc-arrow-up');

          var tooltipInner = tooltip
                .append('div')
                .attr({
                  'class': 'tooltip-inner',
                  'id': 'reporting-tooltip-top'
                });

          tooltipInner
            .append('div')
            .attr('class', 'header')
            .text($filter('date')(d.xdata, dateFormat || 'MMM d, yyyy hh:mm a'));

          var tooltipSvg = tooltipInner
                .append('svg');

          tooltipSvg.append('circle')
            .attr({
              'r': 4,
              'cx': 4,
              'cy': 4,
              fill: color0
            });

          tooltipSvg
             .append('circle')
             .attr({
               'r': 4,
               'cx': 4,
               'cy': 19,
               fill: color1
             });

          tooltipSvg
            .append('text')
            .attr({
              'x': 15,
              'y': 8
            })
            .text(label0 +
              $filter('number')(yAsix0Format === '%s' ?
                d.ydata0 * 100 :
                d.ydata0, yAsix0Format === '$s' ? currencyDecimals : 0));

          tooltipSvg
            .append('text')
            .attr({
              'x': 15,
              'y': 23
            })
            .text(label1 +
              $filter('number')(yAsix1Format === '%s' ?
                d.ydata1 * 100 :
                d.ydata1, yAsix1Format === '$s' ? currencyDecimals : 0));
        }

        function addTooltip(el, selector, tooltip, radius, strokeWidth) {
          var pos = d3.select(el[0]).selectAll(selector)[0][0].getBoundingClientRect();
          tooltip
            .transition()
            .duration(100)
            .style('opacity', 100);

          var topCorrection = tooltip.node().scrollHeight + radius;

          var leftCorrection = (tooltip.node().scrollWidth / 2) - strokeWidth + 3;

          tooltip.style('left', (pos.left - leftCorrection) + 'px')
                .style('top', (pos.top - topCorrection) + 'px');

        }

        function mouseout() {
          cleanup();
          tooltip
            .transition()
            .duration(0)
            .style('opacity', 0)
            .style('left', '0px')
            .style('top', '0px');
        }
      }

      buildSvg(el, data, margin);
    }

    return buildGraph;
  }
})();

// Source: lineGraphUtilities.js
(function() {
angular.module('one.components.lineGraph')
    .factory('oneLineGraphUtilities', oneLineGraphUtilities);

  function oneLineGraphUtilities() {
    function getHighestSelector(defaults, d, max0, max1) {
      var color0 = defaults.highColor,
        highZIndex = defaults.highZIndex;

      if (d.ydata0 / max0 < d.ydata1 / max1) {
        defaults.highZIndex = defaults.lowZIndex;
        defaults.lowZIndex = highZIndex;
        defaults.highColor = defaults.lowColor;
        defaults.lowColor = color0;
      }

      return 'circle.' + defaults.highZIndex;
    }

    function getBisectorAttribute(x0, data) {
      var bisectDate = d3.bisector(function(d) { return d.xdata; }).left,
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i] || d0,
        d = x0 - d0.xdata > d1.xdata - x0 ? d1 : d0;

      return d;
    }

    return {
      getHighestSelector: getHighestSelector,
      getBisectorAttribute: getBisectorAttribute
    };
  }
})();

// Source: multiselectdropdown.js
angular.module('one.components.multiselectdropdown', [])
  .directive('oneMultiselectdropdown', ['$document', function ($document) {
return {
      restrict: 'AE',
      require: ['?ngModel'],
      link: {
        pre: function (scope, element, attr) {
          scope.models = {
            searchText: '',
            dropdownVisible: false,
            allSelected: false,
            items: scope.ngModel.items
          };

          scope.ngModel.selected_items = [];

          // if user didn't specify displayAttr, set it to "name"
          scope.models.displayAttr = attr.displayAttr || 'name';
          scope.toggleDropdown = function () {
            scope.models.dropdownVisible = !scope.models.dropdownVisible;
          };

          /* To be called only when the label for an item is clicked (not its checkbox),
             to flip the current value of the item */
          scope.menuItemClicked = function (event, item) {
            item.selected = !item.selected;
          };

          scope.selectAll = function () {
            // only select the filtered items when user clicks All
            angular.forEach(scope.models.items, function(item) {
              if (scope.searchTextFilter(item)) {
                item.selected = true;
              }
            });
          };
          scope.selectNone = function () {
            angular.forEach(scope.models.items, function(item) {
              item.selected = false;
            });
            scope.models.allSelected = false;
          };
          scope.removeSelectedItem = function (event, item) {
            event.stopPropagation();
            item.selected = !item.selected;
          };
          scope.clearSearchText = function () {
            scope.models.searchText = '';
          };

          // custom filter functions
          scope.searchTextFilter = function (item) {
            return String(item[scope.models.displayAttr]).toLowerCase().
                   indexOf(String(scope.models.searchText).toLowerCase()) > -1;
          };

          scope.closeDropDown = function () {
            scope.models.dropdownVisible = false;
            scope.models.searchText = '';
          };

          // if user clicks anywhere outside of the element then close the dropdown and clear searchText
          $document.bind('click', function(event) {
            var isClickedElementChildOfPopup = element.find(event.target).length > 0;
            if (isClickedElementChildOfPopup) {
              return;
            }

            scope.closeDropDown();
            scope.$apply();
          });

          // deep watch for any instance where an item is selected/unselected
          scope.$watch(function () {
            return scope.models.items;
          }, function () {
            updateAllSelected();
            updateSelectedList();
          }, true);

          // business logic
          function updateAllSelected () {
            scope.models.allSelected = true;
            for (var i = 0; i < scope.models.items.length; i++) {
              if (!scope.models.items[i].selected) {
                scope.models.allSelected = false;
                break;
              }
            }
          }
          function updateSelectedList () {
            scope.ngModel.selected_items = [];
            for (var i = 0; i < scope.models.items.length; i++) {
              if (scope.models.items[i].selected) {
                scope.ngModel.selected_items.push(scope.ngModel.items[i]);
              }
            }
            scope.ngChange();
          }
        }
      },
      templateUrl: 'multiselectdropdown/multiselectdropdown.tpl.html',
      scope: {
        ngModel: '=',
        ngChange: '&'
      }
    };
  }]);

// Source: onScrolledDown.js
(function() {
angular
    .module('one.components.onScrolledDown', [])
    .directive('oneOnScrolledDown', onScrolledDownDirective);

  onScrolledDownDirective.$inject = [];
  function onScrolledDownDirective() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var rawElem = element[0];
        var margin = attrs.margin ? parseInt(attrs.margin, 10) : 100;

        function checkScroll(event) {
          if (event.originalEvent && event.originalEvent.deltaY) {
            rawElem.scrollTop += event.originalEvent.deltaY;
            event.preventDefault();
            event.stopPropagation();
          }

          if (rawElem.scrollTop + rawElem.offsetHeight >= rawElem.scrollHeight - margin) {
            scope.$apply(attrs.oneOnScrolledDown);
          }
        }

        element.on('mousewheel DOMMouseScroll scroll', checkScroll);
      }
    };
  }

})();

// Source: pageslide.js
angular.module('one.components.pageslide', [])
  .directive('onePageslide', ['$document', '$timeout',
    function ($document, $timeout) {
      return {
        restrict: 'EAC',
        transclude: false,
        scope: {
          psOpen: '=?',
          psAutoClose: '=?',
          psSide: '@',
          psSpeed: '@',
          psClass: '@',
          psSize: '@',
          psSqueeze: '@',
          psCloak: '@',
          psPush: '@',
          psZIndex: '@',
          psContainer: '@',
          psKeyListener: '@',
          psBodyClass: '@'
        },
        link: function ($scope, el, attrs) {

          /* Inspect */

          //console.log($scope);
          //console.log(el);
          //console.log(attrs);

          var param = {};

          param.side = $scope.psSide || 'right';
          param.speed = $scope.psSpeed || '0.5';
          param.size = $scope.psSize || '300px';
          param.zindex = $scope.psZIndex || 1000; // Override with custom CSS
          param.className = $scope.psClass || 'ng-pageslide';
          param.cloak = $scope.psCloak && $scope.psCloak.toLowerCase() === 'false' ? false : true;
          param.squeeze = Boolean($scope.psSqueeze) || false;
          param.push = Boolean($scope.psPush) || false;
          param.container = $scope.psContainer || false;
          param.keyListener = Boolean($scope.psKeyListener) || false;
          param.bodyClass = $scope.psBodyClass || false;

          el.addClass(param.className);

          /* DOM manipulation */

          var content = null;
          var slider = null;
          var body = param.container ? document.getElementById(param.container) : document.body;

          // TODO verify that we are meaning to use the param.className and not the param.bodyClass

          function setBodyClass(value) {
            if (param.bodyClass) {
              var bodyClass = param.className + '-body';
              var bodyClassRe = new RegExp(' ' + bodyClass + '-closed| ' + bodyClass + '-open');
              body.className = body.className.replace(bodyClassRe, '');
              body.className += ' ' + bodyClass + '-' + value;
            }
          }

          setBodyClass('closed');

          slider = el[0];

          // Check for div tag
          if (slider.tagName.toLowerCase() !== 'div' &&
            slider.tagName.toLowerCase() !== 'pageslide') {
            throw new Error('Pageslide can only be applied to <div> or <pageslide> elements');
          }

          // Check for content
          if (slider.children.length === 0) {
            throw new Error('You have to content inside the <pageslide>');
          }

          content = angular.element(slider.children);

          /* Append */
          body.appendChild(slider);

          /* Style setup */
          slider.style.zIndex = param.zindex;
          slider.style.position = param.container !== false ? 'absolute' : 'fixed';
          slider.style.width = 0;
          slider.style.height = 0;
          slider.style.overflow = 'hidden';
          slider.style.transitionDuration = param.speed + 's';
          slider.style.webkitTransitionDuration = param.speed + 's';
          slider.style.transitionProperty = 'width, height';

          if (param.squeeze) {
            body.style.position = 'absolute';
            body.style.transitionDuration = param.speed + 's';
            body.style.webkitTransitionDuration = param.speed + 's';
            body.style.transitionProperty = 'top, bottom, left, right';
          }

          switch (param.side) {
            case 'right':
              slider.style.height = attrs.psCustomHeight || '100%';
              slider.style.top = attrs.psCustomTop || '0px';
              slider.style.bottom = attrs.psCustomBottom || '0px';
              slider.style.right = attrs.psCustomRight || '0px';
              break;
            case 'left':
              slider.style.height = attrs.psCustomHeight || '100%';
              slider.style.top = attrs.psCustomTop || '0px';
              slider.style.bottom = attrs.psCustomBottom || '0px';
              slider.style.left = attrs.psCustomLeft || '0px';
              break;
            case 'top':
              slider.style.width = attrs.psCustomWidth || '100%';
              slider.style.left = attrs.psCustomLeft || '0px';
              slider.style.top = attrs.psCustomTop || '0px';
              slider.style.right = attrs.psCustomRight || '0px';
              break;
            case 'bottom':
              slider.style.width = attrs.psCustomWidth || '100%';
              slider.style.bottom = attrs.psCustomBottom || '0px';
              slider.style.left = attrs.psCustomLeft || '0px';
              slider.style.right = attrs.psCustomRight || '0px';
              break;
          }

          /* Closed */
          function psClose(slider, param) {
            if (slider && slider.style.width !== 0) {
              if (param.cloak) {
                content.css('display', 'none');
              }
              switch (param.side) {
                case 'right':
                  slider.style.width = '0px';
                  if (param.squeeze) {
                    body.style.right = '0px';
                  }
                  if (param.push) {
                    body.style.right = '0px';
                    body.style.left = '0px';
                  }
                  break;
                case 'left':
                  slider.style.width = '0px';
                  if (param.squeeze) {
                    body.style.left = '0px';
                  }
                  if (param.push) {
                    body.style.left = '0px';
                    body.style.right = '0px';
                  }
                  break;
                case 'top':
                  slider.style.height = '0px';
                  if (param.squeeze) {
                    body.style.top = '0px';
                  }
                  if (param.push) {
                    body.style.top = '0px';
                    body.style.bottom = '0px';
                  }
                  break;
                case 'bottom':
                  slider.style.height = '0px';
                  if (param.squeeze) {
                    body.style.bottom = '0px';
                  }
                  if (param.push) {
                    body.style.bottom = '0px';
                    body.style.top = '0px';
                  }
                  break;
              }
            }
            $scope.psOpen = false;

            if (param.keyListener) {
              $document.off('keydown', keyListener);
            }

            setBodyClass('closed');
          }

          /* Open */
          function psOpen(slider, param) {
            if (slider.style.width !== 0) {
              switch (param.side) {
                case 'right':
                  slider.style.width = param.size;
                  if (param.squeeze) {
                    body.style.right = param.size;
                  }
                  if (param.push) {
                    body.style.right = param.size;
                    body.style.left = '-' + param.size;
                  }
                  break;
                case 'left':
                  slider.style.width = param.size;
                  if (param.squeeze) {
                    body.style.left = param.size;
                  }
                  if (param.push) {
                    body.style.left = param.size;
                    body.style.right = '-' + param.size;
                  }
                  break;
                case 'top':
                  slider.style.height = param.size;
                  if (param.squeeze) {
                    body.style.top = param.size;
                  }
                  if (param.push) {
                    body.style.top = param.size;
                    body.style.bottom = '-' + param.size;
                  }
                  break;
                case 'bottom':
                  slider.style.height = param.size;
                  if (param.squeeze) {
                    body.style.bottom = param.size;
                  }
                  if (param.push) {
                    body.style.bottom = param.size;
                    body.style.top = '-' + param.size;
                  }
                  break;
              }

              $timeout(function() {
                if (param.cloak) {
                  content.css('display', 'block');
                }
              }, (param.speed * 1000));

              $scope.psOpen = true;

              if (param.keyListener) {
                $document.on('keydown', keyListener);
              }

              setBodyClass('open');
            }
          }

          /*
           * Close the sidebar if the 'esc' key is pressed
           * */

          function keyListener(e) {
            var ESC_KEY = 27;
            var key = e.keyCode || e.which;

            if (key === ESC_KEY) {
              psClose(slider, param);
            }
          }

          /*
           * Watchers
           * */

          $scope.$watch('psOpen', function(value) {
            if (!!value) {
              psOpen(slider, param);
            } else {
              psClose(slider, param);
            }
          });

          $scope.$watch('psSize', function(newValue, oldValue) {
            if (oldValue !== newValue) {
              param.size = newValue;
              psOpen(slider, param);
            }
          });

          /*
           * Events
           * */

          $scope.$on('$destroy', function () {
            body.removeChild(slider);
          });

          if ($scope.psAutoClose) {
            $scope.$on('$locationChangeStart', function() {
              psClose(slider, param);
            });
            $scope.$on('$stateChangeStart', function() {
              psClose(slider, param);
            });

          }
        }
      };
    }
  ]);

// Source: shoppingCart.js
(function () {
angular.module('one.components.shoppingCart', [])
    .controller('OneShoppingCartController', OneShoppingCartController)
    .controller('OneShoppingCartItemsController', OneShoppingCartItemsController)
    .directive('oneShoppingCart', oneShoppingCartDirective)
    .directive('oneShoppingCartItems', oneShoppingCartItemsDirective);

  oneShoppingCartDirective.$inject = [];
  function oneShoppingCartDirective() {
    return {
      restrict: 'E',
      transclude: true,
      controller: 'OneShoppingCartController',
      controllerAs: '$shoppingCartCtrl',
      bindToController: true,
      templateUrl: 'shoppingCart/shoppingCart.tpl.html',
      scope: {
        title: '@',
      }
    };
  }

  OneShoppingCartController.$inject = [];
  function OneShoppingCartController() {
    var self = this;
    self.collapsed = false;

    self.toggle = function() {
      self.collapsed = !self.collapsed;
    };
  }

  oneShoppingCartItemsDirective.$inject = [];
  function oneShoppingCartItemsDirective() {
    return {
      restrict: 'E',
      scope: {
        title: '@',
        showBadge: '@',
        data: '=',
        itemLabel: '@',
        actionHandler: '&',
        itemTemplateUrl: '@',
        headerTemplateUrl: '@',
        headerData: '=',
        headerActionHandler: '&'
      },
      bindToController: true,
      controller: 'OneShoppingCartItemsController',
      controllerAs: '$shoppingCartItemsCtrl',
      templateUrl: 'shoppingCart/shoppingCartItems.tpl.html',
    };
  }

  OneShoppingCartItemsController.$inject = ['$scope'];
  function OneShoppingCartItemsController($scope) {
    var self = this;

    self.toggle = function() {
      self.collapsed = !self.collapsed;
    };

    self.size = function() {
      return _.size(self.data);
    };

    self.showSelectedItems = function() {
      return !self.collapsed && self.size() > 0;
    };

    self.collapsed = !!self.title && _.isEqual(self.size(), 0);

    $scope.$watch(self.size, _.after(1, function () {
      if (self.size() > 0) {
        self.collapsed = false;
      }
    }));

  }

})();

// Source: smartsearch.js
/* global $:false */
angular.module('one.components.smartsearch')
  .directive('oneSmartSearch', ['$compile', '$document', '$filter', '$injector',
      '$q', '$rootScope', '$sce', '$timeout',
  function ($compile, $document, $filter, $injector, $q, $rootScope, $sce, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'smartsearch/smartsearch.tpl.html',
    scope: {
      matcher: '=', // A matcher function to generate the list of possible matches for the search term
      onFilterChange: '&', // Fires when filter data changed
      filterOptions: '=',
      filter: '=',
      maxNumFilters: '@',
      maxNumSuggestions: '@',
      maxPopupHeight: '@',
      showCategorySuggestions: '=',
      smartSearchMode: '='
    },
    link: function ($scope, $element) {
      var bindings = [
        { name: 'filter', value: 'filter.$$name'},
        { name: 'name', value: '$$name' },
        { name: 'options', value: 'editingCategoryFilter.options' }];

      var re = /(<[\w\-]+)/g;
      var tmpl = '<smart-search-$$ />';

      // This is temporarily set when stopSearch is called.  This is to allow
      // stopSearch to focus the input without reopening the dropdown.
      $scope.preventDropdownOnFocus = false;

      $scope.focusInput = function(preventDropdownOnFocus) {
        $scope.preventDropdownOnFocus = preventDropdownOnFocus;
        $('input.smart-search__input', $element).focus();

        setTimeout(function() {
          $scope.preventDropdownOnFocus = false;
        }, 0);
      };

      $document.on('keydown', function ($event) {
        // Only handle these key events when the popup is showing ($scope.searching === true)
        if ($scope.searching) {
          if ($event.keyCode === 27) { // Esc
            $scope.$evalAsync(function () {
              if ($scope.editingCategoryFilter) {
                $scope.closeCategoryFilter();
              } else {
                $scope.stopSearch();
                $scope.focusInput(true);
              }
            });
            $scope.$apply();
          } else if ($event.keyCode === 37 && document.activeElement.tagName !== 'INPUT') { // LEFT
            if ($scope.editingCategoryFilter) {
              $scope.closeCategoryFilter();
            }
            $scope.$apply();
          } else if ($event.keyCode === 38) { // Up

            // Is the first element selected?
            var firstKeyboardItem = $scope.editingCategoryFilter ?
                $('#category-details-view [kb-item]', $element).first() :
                $('.categories [kb-item]', $element).first();
            var isFirstKeyboardItemSelected = firstKeyboardItem.hasClass('kb-active');

            if (!firstKeyboardItem.length || isFirstKeyboardItemSelected &&
                firstKeyboardItem[0] === $event.target) {
              if ($scope.editingCategoryFilter) {
                $('.extra__back-btn', $element).focus();
              } else {
                $scope.focusInput();
              }
            }
          } else if ($event.keyCode === 40) { // Down
            if ($scope.editingCategoryFilter) {
              var activeItems = $('#category-details-view [kb-item]:focus', $element);
              if (activeItems.size() === 0) {
                $('.extra--action a', $element).first().focus();
              }
            } else if ($scope.searching) {
              var isActiveKeyboardItem = $('.matches [kb-item]:focus, .categories [kb-item]:focus').size();
              if (isActiveKeyboardItem === 0) {
                if ($scope.matches.length > 0) {
                  $('.match a', $element).first().focus();
                } else {
                  $('.category a', $element).first().focus();
                }
              }
            }
            $event.preventDefault();
          }
        }
      });

      $document.on('click', function ($event) {
        if ($element.has($event.target).length === 0 &&
            document.contains($event.target) &&
            !$($event.target).is('.drop__filter-tooltip *')) {
          $timeout(function () {
            $scope.stopSearch();
          }, 0);
        }
      });

      $('.input input', $element).on('keydown', function ($event) {
        // if a word character is typed, open dropdown.  Filtering on word characters
        // to prevent the popup from opening when, for example, alt-tabbing to another window,
        // or when tabbing out of the search field
        if ($event.key.match(/^\w$/)) {
          $scope.searching = true;
        }

        if ($event.keyCode === 13) { // ENTER
          // Using $scope.$apply bc we are not in an angular event handler
          // this updates the selected search item and closes the popup
          $scope.$apply(function() {
            $scope.selectSearchItem();
          });
        } else if ($event.keyCode === 40) { // UP
          if ($scope.matches.length > 0) {
            $('.match a', $element).first().focus();
          } else if ($scope.searching) {
            $('.category a', $element).first().focus();
          } else {
            $scope.$apply(function() {
              $scope._checkMode($event);
            });
          }
        } else if ($event.keyCode === 9) { // TAB
          $scope.stopSearch();
        }
        $scope.$apply();
      });

      $rootScope.$on('filter.close', function($event) {
        $scope.stopSearch();
        $scope.focusInput(true);
        $event.stopPropagation();
      });

      $scope.loadViewTemplate = function(o) {
        var el = $scope.compileViewTemplate(o);
        $('#category-details-view', $element).html(el);
        // $timeout allows the DOM to render first, then focuses
        // the first input field (if one exists)
        $timeout(function() {
          $('#category-details-view input', $element).first().focus();
        }, 0);
      };

      // Dynamically compile plugin templates ideally so
      // custom plugins can be created without any changes to the main search control
      $scope.compileViewTemplate = function(o) {
        o.options = typeof o.options !== 'object' ? {} : o.options;
        var template = tmpl.replace('$$', o.format);
        // add the property to bind the object to the directive
        template = template.replace(re, '$1 ' + bindings.map(function(binding) {
          return binding.name + '="' + binding.value.replace(/\$\$(\w+)/, function($0, $1) {
            return o[$1];
          }) + '"';
        }).join(' '));

        var newScope = $scope.$root.$new();
        newScope.editingCategoryFilter = angular.copy($scope.editingCategoryFilter);
        newScope.filter = $scope.filter;

        return $compile(template)(newScope);
      };
    },
    controller: ['$element', '$scope', function ($element, $scope) {
      var defaultMaxNumFilters = 3;
      var defaultMaxNumSuggestions = 3;

      $scope.matches = [];
      $scope.categories = $scope.filterOptions || [];
      $scope.smartSearch = $scope.smartSearchMode === false ? false : true;
      $scope.matcherFn = $scope.matcher;

      $scope.searching = false;
      $scope.searchTerm = '';
      $scope.editingCategoryFilter = undefined;
      $scope.maxNumFilters = $scope.maxNumFilters || defaultMaxNumFilters;
      $scope.maxNumSuggestions = $scope.maxNumSuggestions || defaultMaxNumSuggestions;

      $scope._pausedFilters = {};

      function getCategoryFilter(name) {
        for (var i = 0; i < $scope.categories.length; i++) {
          if ($scope.categories[i].name === name) {
            return $scope.categories[i];
          }
        }
        return null;
      }

      $scope.hasFilter = function(name) {
        return typeof $scope.filter[name] !== 'undefined' ? true : false;
      };

      $scope.pauseToggleFilter = function (filter, $event) {
        if ($scope.filter.hasOwnProperty(filter.name)) {
          $scope._pausedFilters[filter.name] = $scope.filter[filter.name];
          delete $scope.filter[filter.name];
        } else if ($scope._pausedFilters.hasOwnProperty(filter.name)) {
          $scope.filter[filter.name] = $scope._pausedFilters[filter.name];
          delete $scope._pausedFilters[filter.name];
        }
        $event.stopPropagation();
      };

      $scope.stopSearch = function() {
        $scope.searchTerm = '';
        $scope.searching = false;
      };

      $scope._checkMode = function ($event) {
        if (!$scope.preventDropdownOnFocus) {
          $scope.searching = true;
          $scope.closeCategoryFilter();
        }
        $event.stopPropagation();
      };

      $scope.closeCategoryFilter = function () {
        var filterEl = $('#category-details-view * *', $element)[0];
        if (filterEl) {
          $(filterEl).scope().$destroy();
        }

        $scope.editingCategoryFilter = undefined;
      };

      $scope.showCategoryFilterForFilterName = function($event, name) {
        $scope.searching = true;
        var filter = getCategoryFilter(name);
        $scope.editCategoryFilter(null, filter);

        if ($event && $event.stopPropagation) {
          $event.stopPropagation();
        }
      };

      $scope.removeFilter = function (name) {
        delete $scope.filter[name];
      };

      $scope.removeAllFilters = function() {
        $scope.filter = {};
      };

      $scope.areFiltersSelected = function() {
        return $scope.filter && Object.keys($scope.filter).length > 0;
      };

      $scope.addFilter = function(name, value) {
        $scope.filter[name] = value;
      };

      $scope.editCategoryFilter = function ($event, category, ignoreSearchTerm) {
        $scope.editingCategoryFilter = category;
        $scope.loadViewTemplate($scope.editingCategoryFilter);

        if ($event && $event.stopPropagation) {
          $event.stopPropagation();
        }

        var searchTerm = ignoreSearchTerm ? '' : $scope.searchTerm;
        $scope.searchTerm = '';

        $timeout(function() {
          var inputs = $('#category-details-view input', $element);
          if (inputs.length === 1 && searchTerm.length > 0) {
            $scope.$apply(function() {
              var input = $('#category-details-view input', $element).first();
              input.val(searchTerm);
              input.trigger('input');
            });
          }
        }, 0);
      };

      $scope.getDisplayName = function(name) {
        var filter = getCategoryFilter(name);
        return filter ? (filter.displayName || name) : name;
      };

      $scope.getModifierDisplayValue = function(name, value) {
        var displayValue = '';

        var filter = getCategoryFilter(name);
        var format = filter ? filter.format : null;

        if (format) {
          var filterName = 'smartSearch' + format[0].toUpperCase() + format.substr(1);
          if ($injector.has(filterName + 'Filter')) {
            displayValue = $filter(filterName)(value.modifier, filter, true);
          }
        }

        return displayValue;
      };

      $scope.isArrayOverMaxWidth = function(name, value) {
        // 200px is the max-width set for the filters
        return _.isArray(value) && $('#filter-' + name, $element).width() >= 200;
      };

      $scope.getDisplayValue = function(name, value) {
        var displayValue = value;

        var filter = getCategoryFilter(name);
        var format = filter ? filter.format : null;

        if (format) {
          var filterName = 'smartSearch' + format[0].toUpperCase() + format.substr(1);
          if ($injector.has(filterName + 'Filter')) {
            displayValue = $filter(filterName)(value, filter);
          }
        }

        return displayValue;
      };

      $scope.selectSearchItem = function (searchItem) {
        // if no searchItem specified, use the first match
        if (searchItem === undefined) {
          searchItem = $scope.matches[0];
        }

        if (searchItem) {
          var key = $scope.keys(searchItem.match)[0];
          var value = searchItem.match[key];

          searchItem.match.selected = true;
          $scope.stopSearch();

          $scope.addFilter(key, value);
          $scope.focusInput(true);
        }
      };

      $scope.keys = function(o) {
        var oo = {};
        for (var p in o) {
          if (typeof o[p] !== 'undefined') {
            oo[p] = o[p];
          }
        }
        return Object.keys(oo);
      };

      $scope.setKeyboardFocusValue = function (type, value) {
        if (type === 'categories') {
          $scope._keyboardFocusCategories = value;
        } else if (type === 'matches') {
          $scope._keyboardFocusMatches = value;
        }
      };

      $scope.filterChangeHandler = function() {
        if ($scope.onFilterChange) {
          $scope.onFilterChange({ filter: $scope.filter });
        }
      };

      $scope.$watch('filter', $scope.filterChangeHandler, true);

      function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
      }

      $scope.categoryMatcherFn = function(category) {
        var name = category.displayName || category.name || '';
        return name.toLowerCase().indexOf($scope.searchTerm.toLowerCase()) >= 0;
      };

      $scope.searchTermHandler = function () {
        if (typeof $scope.searchTerm === 'undefined') {
          $scope.matches = [];
          return;
        }

        // only close category filter if search term is not empty string.  The searchTerm
        // won't become an empty string unless the user clears it (category filters already closed)
        // or user clicks on a filter category (triggering the searchTerm to be cleared).  In the
        // latter case, the filter category doesn't open because the searchTerm is cleared causing
        // the category filter to be closed immediately after opening.
        if ($scope.searchTerm !== '') {
          $scope.closeCategoryFilter();
        }

        if (typeof $scope.matcherFn === 'function') {
          var matches = $scope.matcherFn($scope.searchTerm);
          var match = null;
          var highlighted = [];
          var re = new RegExp('(' + escapeRegExp($scope.searchTerm) + ')', 'gi');

          var onMatch = function(value, key) {
            value = $scope.getDisplayValue(key, value);
            var valueStr = String(value);

            if (valueStr.length === 0 || key.indexOf('_') === 0 || key.indexOf('$') === 0) {
              return;
            }

            if (re.test(valueStr)) {
              valueStr = valueStr.replace(re, '<span class="highlighted">$1</span>');
            }

            highlighted.push({
              category: $scope.getDisplayName(key),
              value: valueStr,
              match: match
            });
          };

          for (var i = 0; i < $scope.maxNumSuggestions; i++) {
            match = matches[i];
            angular.forEach(match, onMatch);
          }

          $scope.matches = highlighted;
        }
      };

      $scope.$watch('searchTerm', $scope.searchTermHandler);

      $scope.$watch('filterOptions', function(options) {
        $scope.categories = options || [];
      });

      $scope.toTrusted = function(html) {
        return $sce.trustAsHtml(html);
      };
    }]
  };
}]);

angular.module('one.components.smartsearch')
  .filter('objectLimitTo', [function() {
    return function(obj, limit, begin) {
      var keys = Object.keys(obj);
      if (keys.length < 1) {
        return [];
      }

      var ret = {},
      count = 0;
      if (begin) {
        keys = keys.splice(begin + 1);
      }
      angular.forEach(keys, function(key) {
        if (count >= limit) {
          return false;
        }
        ret[key] = obj[key];
        count++;
      });
      return ret;
    };
  }]);

angular.module('one.components.smartsearch')
  .filter('objectReverse', [function() {
    return function(obj) {
      var o = {};
      var keys = Object.keys(obj);
      for (var i = keys.length - 1; i >= 0; i--) {
        o[keys[i]] = obj[keys[i]];
      }
      return o;
    };
  }]);

angular.module('one.components.smartsearch')
    .filter('noUndefined', [function() {
      return function(obj) {
        var o = {};
        for (var p in obj) {
          if (typeof obj[p] !== 'undefined') {
            o[p] = obj[p];
          }
        }
        return o;
      };
    }]);

angular.module('one.components.smartsearch')
.directive('filterTooltip', ['$window', '$http', '$compile', '$q', '$templateCache', '$document',
  function ($window, $http, $compile, $q, $templateCache, $document) {
    return {
      restrict: 'A',
      controller: function () {
      },
      link: function ($scope, $element) {
        var _widget;

        // TODO: factorize
        var loadTemplate = function (tplUrl, tplName) {
          var deferred = $q.defer();

          var tpl = $templateCache.get(tplUrl);

          if (!tpl) {
            $http.get(tplUrl)
              .then(function (rsp) {
                $templateCache.put(tplName, rsp.data);
                deferred.resolve(rsp.data);
              });
          } else {
            deferred.resolve(tpl);
          }

          return deferred.promise;
        };

        var openWidget = function () {
          if (_widget && _widget.isOpened()) {
            $scope.closeWidget();
            return;
          }

          loadTemplate('smartsearch/filter-tooltip.tpl.html', 'filter-tooltip.tpl.html').then(function (tpl) {
            var content = $compile(tpl)($scope);

            if (!_widget) {
              _widget = new $window.Drop({
                target: $element[0],
                content: content[0],
                position: 'bottom right',
                classes: 'drop__filter-tooltip'
              });

              _widget.open();
            }
          });
        };

        // TODO: refactor
        $scope.closeWidget = function () {
          if (_widget) {
            _widget.destroy();
            _widget = undefined;
          }
        };

        $element.on('click', openWidget);

        $document.on('click', function(event) {
          if (!$(event.target).is('.drop__filter-tooltip *')) {
            $scope.closeWidget();
          }
        });
      }
    };
  }]);

angular.module('one.components.smartsearch')
  .directive('kbItemInput', function () {
  return {
    restrict: 'A',
    priority: 0,
    link: function ($scope, $element) {
      $element[0].addEventListener('click', function (event) {
        event.stopPropagation();
      }, true);
      $element[0].addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
          $('[kb-item]').first().focus();
        }
      });
    }
  };
});

// Source: styleCore.js
angular.module('one.components.styleCore', [])
  .constant('oneStyleCore', {
      colors: {
        //dynamic colors
        'one-color-d0': {hex: '212121', rgb: [33, 33, 33]},
        'one-color-d1': {hex: '009BC9', rgb: [0, 155, 201]},
        'one-color-d2': {hex: '7ED321', rgb: [126, 211, 33]},
        'one-color-d3': {hex: 'd0021b', rgb: [208, 2, 27]},
        'one-color-d4': {hex: 'eef7fa', rgb: [238, 247, 250]},

        //base colors
        'one-color-b0': {hex: 'ffffff', rgb: [255, 255, 255]},
        'one-color-b1': {hex: 'fbfbfb', rgb: [251, 251, 251]},
        'one-color-b2': {hex: 'eeeeee', rgb: [238, 238, 238]},
        'one-color-b3': {hex: 'e2e2e2', rgb: [226, 226, 226]},
        'one-color-b4': {hex: 'd1d1d1', rgb: [209, 209, 209]},
        'one-color-b5': {hex: 'bcbcbc', rgb: [188, 188, 188]},
        'one-color-b6': {hex: '818181', rgb: [129, 129, 129]},
        'one-color-b7': {hex: '383838', rgb: [56, 56, 56]},
      },
      paddings: {
        'one-padding-l0': {
          px: 0
        },
        'one-padding-l1': {
          px: 2
        },
        'one-padding-l2': {
          px: 5
        },
        'one-padding-l3': {
          px: 7
        },
        'one-padding-l4': {
          px: 10
        },
        'one-padding-l5': {
          px: 15
        },
        'one-padding-l6': {
          px: 20
        },
        'one-padding-l7': {
          px: 25
        },
        'one-padding-l8': {
          px: 30
        },
        'one-padding-l9': {
          px: 40
        },
        'one-padding-l10': {
          px: 60
        }
      },
      margins: {
        'one-margin-l0': {
          px: 0
        },
        'one-margin-l1': {
          px: 2
        },
        'one-margin-l2': {
          px: 5
        },
        'one-margin-l3': {
          px: 7
        },
        'one-margin-l4': {
          px: 10
        },
        'one-margin-l5': {
          px: 15
        },
        'one-margin-l6': {
          px: 20
        },
        'one-margin-l7': {
          px: 25
        },
        'one-margin-l8': {
          px: 30
        },
        'one-margin-l9': {
          px: 40
        },
        'one-margin-l10': {
          px: 60
        }
      }
    }
  );

// Source: tabs.js
angular.module('one.components.tabs', [])
  .controller('oneTabController', ['$scope', '$attrs', '$q', function ($scope, $attrs, $q) {
    $scope.tabOptions = $scope.$eval($attrs.tabOptions);
    $scope.currentTab = {};
    $scope.tabOptions.beforeChange = _.get(
        $scope,
        'tabOptions.beforeChange',
        function() { return $q.when(true); }
    );

    _.forEach($scope.tabOptions.tabDefs, function (tab) {
      if (tab.active) {
        $scope.currentTab = tab;
      }

      // trick any passed badge counts into a function
      tab.getBadgeCount = _.isFunction(tab.badgeCount) ? tab.badgeCount : function() { return tab.badgeCount; };
    });

    if (_.isEmpty($scope.currentTab)) {
      $scope.currentTab = $scope.tabOptions.tabDefs[0];
    }

    $scope.setCurrentTab = function (tab) {
      $scope.tabOptions.beforeChange($scope.currentTab, tab)
        .then(
            function() {
              $scope.currentTab.active = false;
              tab.active = true;
              $scope.currentTab = tab;
            }
        );
    };
  }])
  .directive('oneTabMaster', [function () {
return {
      restrict: 'E',
      controller: 'oneTabController',
      templateUrl: 'tabs/masterTab.tpl.html',
      scope: true
    };
  }])
  .directive('oneTabHeading', [function () {
return {
      restrict: 'E',
      controller: 'oneTabController',
      templateUrl: 'tabs/headingTab.tpl.html',
      scope: true
    };
  }])
  .directive('oneTabInModule', [function () {
return {
      restrict: 'E',
      controller: 'oneTabController',
      templateUrl: 'tabs/inModuleTab.tpl.html',
      scope: true
    };
  }])
  .directive('oneTabMicro', [function () {
return {
      restrict: 'E',
      controller: 'oneTabController',
      templateUrl: 'tabs/microTab.tpl.html',
      scope: true
    };
  }]);

// Source: toggles.js
angular.module('one.components.toggles', [])
  .directive('oneToggle', [function () {
return {
      restrict: 'A',
      require: ['?ngModel'],
      link: {
        pre: function (scope, element, attr, ctrls) {
          element.addClass('one-toggle');
          if (ctrls[0]) {
            var ctrl = ctrls[0];

            var listener = function (ev) {
              if ($(element[0]).hasClass('on')) {
                $(element[0]).removeClass('on');
                $(element[0]).addClass('off');
              } else {
                $(element[0]).removeClass('off');
                $(element[0]).addClass('on');
              }
              ctrl.$setViewValue($(element[0]).hasClass('on'), ev && ev.type);
            };

            element.on('click', listener);

            ctrl.$render = function () {
              if (ctrl.$viewValue) {
                $(element[0]).addClass('on');
                $(element[0]).removeClass('off');
              } else {
                $(element[0]).addClass('off');
                $(element[0]).removeClass('on');
              }
            };
          }
        }
      },
      templateUrl: 'toggles/toggle.tpl.html',
      scope: {
        type: '='
      }
    };
  }]);

// Source: uiGrid.js
// core code for this module goes here

// Source: infiniteLoader.js
(function () {

  angular.module('one.components.uiSelect')
    .directive('oneInfiniteLoader', oneInfiniteLoader);

  oneInfiniteLoader.$inject = ['$q'];
  function oneInfiniteLoader($q) {
    return {
      restrict: 'A',
      require: 'uiSelect',
      link: function (scope, element, attrs, $select) {
        var rawElem = element[0].querySelector('.ui-select-choices');
        var margin = attrs.margin ? parseInt(attrs.margin, 10) : 20;

        function refresh() {
          var refreshPromise = scope.$eval(attrs.oneInfiniteLoader);

          if (refreshPromise && !$select.refreshing) {
            $select.refreshing = true;

            $q.resolve(refreshPromise).finally(function () {
              $select.refreshing = false;
            });
          }
        }

        function checkScroll(event) {
          if (event.originalEvent && event.originalEvent.deltaY) {
            rawElem.scrollTop += event.originalEvent.deltaY;
            event.preventDefault();
            event.stopPropagation();
          }

          if (rawElem.scrollTop + rawElem.offsetHeight >= rawElem.scrollHeight - margin) {
            refresh();
          }
        }

        angular.element(rawElem).on('mousewheel DOMMouseScroll scroll', checkScroll);
      }
    };
  }

})();

// Source: errorModal.js
(function () {
angular.module('one.components.errors.modal', ['mgcrea.ngStrap.modal'])
    .controller('OneErrorModalController', OneErrorModalController)
    .provider('oneErrorModal', oneErrorModalProvider);

  OneErrorModalController.$inject = ['oneErrorModal', 'error', 'title'];
  function OneErrorModalController(oneErrorModal, error, title) {
    var vm = this;

    vm.anyMessageVisible = function () {
      return _.size(vm.errors) > 1 || !_.isEmpty(vm.customTitle);
    };

    vm.errorList = function () {
      if (vm.showDetails) {
        return _.map(vm.errors, 'errorMessage');
      } else {
        return _(vm.errors)
          .map('errorMessage')
          .without(oneErrorModal.genericErrorMessage)
          .uniq()
          .value();
      }
    };

    vm.hasDetails = function () {
      return _(vm.details).flatten().size() > 0;
    };

    vm.process = function (error) {
      vm.errors = vm.errors.concat(error);
      var details = _(error)
        .keys()
        .omitBy(function (key) {
          return key === 'errorMessage' || _.startsWith(key, '_');
        })
        .map(function (key) {
          return [_.startCase(key), error[key]];
        })
        .value();
      vm.details = vm.details.concat([details]);
    };

    vm.title = function () {
      if (!_.isEmpty(vm.customTitle)) {
        return vm.customTitle;
      } else if (_.size(vm.errors) === 1) {
        return vm.errors[0].errorMessage;
      } else {
        return oneErrorModal.genericErrorMessage;
      }
    };

    vm.contactMessage = oneErrorModal.supportMessage
      .replace('[mail]', '<a href="mailto:' + oneErrorModal.supportContactEmail + '">')
      .replace('[/mail]', '</a>');

    vm.customTitle = title;
    vm.errors = [];
    vm.details = [];
    vm.showDetails = false;

    vm.process(error);
  }

  function oneErrorModalProvider() {
    var provider = this;

    oneErrorModalFactory.$inject = ['$modal', '$q', '$rootScope', '$timeout'];
    function oneErrorModalFactory($modal, $q, $rootScope, $timeout) {
      var displayedModal, modalPromise;

      function displayErrorModal(error, options) {
        modalPromise = $q.defer();
        displayedModal = $modal({
          locals: {
            error: error,
            title: _.get(options, 'title')
          },
          controller: 'OneErrorModalController',
          controllerAs: 'modal',
          show: true,
          templateUrl: 'errors/modal/errorModal.tpl.html'
        });

        displayedModal.$scope.$on('modal.hide', function () {
          displayedModal = undefined;
          modalPromise.resolve();
        });

        return modalPromise.promise;
      }

      function normalizedErrorObject(error) {
        return _.isObject(error) ? error : {errorMessage: error};
      }

      function oneErrorModal(error, options) {
        error = normalizedErrorObject(error);

        if (error._displayed) {
          return modalPromise.promise;
        }

        error._displayed = true;

        if (angular.isDefined(displayedModal)) {
          $timeout(function () {
            displayedModal.$element.scope().modal.process(error);
            return modalPromise.promise;
          });
        } else {
          return displayErrorModal(error, options);
        }
      }

      $rootScope.$on('one.error.critical', function (event, data) {
        oneErrorModal(data);
      });

      // Returns the main function + config properties
      return _.assign(oneErrorModal, _.omit(provider, ['$get']));
    }

    provider.$get = oneErrorModalFactory;

    // Config variables, can be overridden by injecting oneErrorHandler(Provider)
    provider.genericErrorMessage = 'This service is temporarily unavailable. Please try again later.';
    provider.supportMessage = 'If the error persists, please contact your Account Manager or ' +
      '[mail]ONE Display support[/mail].';
    provider.supportContactEmail = 'support.onedisplay@teamaol.com';
  }

})();

// Source: axis.js
(function () {
angular.module('one.components.graph.axis', ['one.components.graph'])
    .controller('OneGraphAxisController', OneGraphAxisController)
    .directive('oneGraphAxis', oneGraphAxisDirective);

  OneGraphAxisController.$inject = ['$interpolate', 'oneGraphColors', 'oneGraphConstants'];
  function OneGraphAxisController($interpolate, colors, oneGraphConstants) {
    var vm = this,
      constants = oneGraphConstants.axis;

    var orients = {
      left: -90,
      right: 90
    };

    var defaultTickSize = {
      left: -constants.vertical.tick.width,
      right: constants.vertical.tick.width
    };

    function alternateTickSize(scaleElement, orient) {
      scaleElement.selectAll('g.tick line')
        .attr('x2', function (value, index) {
          if (index % 2) {
            return defaultTickSize[orient] / 2;
          } else {
            return defaultTickSize[orient];
          }
        });
    }

    function alternateTickVisibility(scaleElement) {
      scaleElement.selectAll('.tick text')
        .style('opacity', function (value, index) {
          return (index % 2) ? 0 : 1;
        });
    }

    this.additionalMargin = function additionalMargin(orient, label) {
      var margin;

      if (vm.margin) {
        margin = {
          role: 'axis',
          top: 0,
          right: orient === 'right' ? vm.margin : 0,
          bottom: orient === 'bottom' ? vm.margin : 0,
          left: orient === 'left' ? vm.margin : 0
        };
      } else {
        margin = {
           role: 'axis',
           top: 0,
           right: orient === 'right' ? 15 : 0,
           bottom: orient === 'bottom' ? 20 : 0,
           left: orient === 'left' ? 15 : 0
         };
      }

      if (label) {
        margin[orient] += 20;
      }
      return margin;
    };

    this.updateAxisLabelPositon = function updateAxisLabelPositon(element) {
      var label = d3.select(element).select('.axis-label'),
          translation = this.labelTranslation(),
          rotation = this.labelRotation();
      label.attr('transform', 'translate (' + translation + ') rotate(' + rotation + ')');
      d3.svg.axis().orient(vm.orient);
    };

    this.addLabel = function addLabel(element) {
      element.call(this.axis);
      if (this.label) {
        var rotation = this.labelRotation(),
          translation = this.labelTranslation();

        element.append('text')
          .attr('class', 'axis-label')
          .attr('transform', 'translate(' + translation + ') rotate(' + rotation + ')')
          .attr('text-anchor', 'middle')
          .text(this.label);
      }

      element.selectAll('text')
        .style({
          fill: this.textColor
        });
    };

    vm.drawRulers = function drawRulers(scaleElement, scale) {
      scaleElement.select('.axis-ruler-group').remove();
      var rulersGroup = scaleElement.insert('g', '.tick')
        .attr('class', 'axis-ruler-group');
      switch (vm.rulers) {
        case 'ticks':
          scaleElement.selectAll('.tick').each(function (value) {
            vm.drawSingleRuler(rulersGroup, scale(value));
          });
          break;
      }
    };

    vm.drawSingleRuler = function drawSingleRuler(element, value) {
      element.append('line')
        .datum('axis-ruler')
        .attr('class', 'axis-ruler')
        .attr(vm.rulerPosition(value));
    };

    this.format = function format(tick) {
      return vm.filterExpression({value: tick});
    };

    this.labelRotation = function labelRotation() {
      return orients[this.orient] || 0;
    };

    this.labelTranslation = function labelTranslation() {
      var padding = this.getLabelPadding();
      switch (this.orient) {
        case 'left':
          return '-' + padding + ',' + (this.graphInstance.innerHeight() / 2);
        case 'right':
          return padding + ',' + (this.graphInstance.innerHeight() / 2);
        default:
          return (this.graphInstance.innerWidth() / 2) + ',50';
      }
    };

    this.getLabelPadding = function getLabelPadding() {
      if (!_.isUndefined(vm.tickTextPadding)) {
        return 22 + vm.tickTextPadding;
      } else {
        return 40;
      }
    };

    this.isVertical = function isVertical() {
      return this.orient === 'left' || this.orient === 'right';
    };

    vm.rulerPosition = function rulerPosition(value) {
      switch (vm.orient) {
        case 'bottom':
          return {
            x1: value,
            y1: 0,
            x2: value,
            y2: -vm.graphInstance.innerHeight()
          };

        case 'left':
          return {
            x1: 0,
            y1: value,
            x2: vm.graphInstance.innerWidth(),
            y2: value
          };

        case 'right':
          return {
            x1: -vm.graphInstance.innerWidth(),
            y1: value,
            x2: 0,
            y2: value
          };
      }
    };

    this.scaleStyle = function scaleStyle() {
      if (angular.isDefined(vm.textOnly)) {
        return {'opacity': 0};
      } else {
        return {stroke: vm.axisColor};
      }
    };

    this.selectScale = function selectScale(scales) {
      return scales[this.key];
    };

    this.setScalesFormat = function setScalesFormat() {
      if (angular.isDefined(vm.filter)) {
        vm.filterExpression = $interpolate('{{ value | ' + vm.filter + '}}');
        vm.axis.tickFormat(vm.format);
      }
    };

    this.setScales = function setScales(graph) {
      if (_.has(this, 'min')) {
        graph.setScaleMin(this.key, this.min);
      }

      if (_.has(this, 'max')) {
        graph.setScaleMax(this.key, this.max);
      }
    };

    this.setTransformFromDimensions = function setTransformFromDimensions() {
      if (this.orient === 'bottom') {
        this.transform = { x: 0, y: vm.graphInstance.innerHeight() };
      } else if (this.orient === 'right') {
        this.transform = { x: vm.graphInstance.innerWidth(), y: 0 };
      }
    };

    vm.tickCount = function tickCount(range) {
      var count;
      if (angular.isDefined(vm.manualTickCount)) {
        count = _.parseInt(vm.manualTickCount);
      } else {
        var interval = (vm.isVertical() ? constants.vertical.tick.interval : constants.horizontal.tick.interval);
        count = _.round(_.max(range) / interval) + 1;
        if (vm.isVertical() && (count % 2) === 0) {
          //because of alternating ticks on vertical axis, the number has to be odd
          count++;
        }
      }
      return _.max([count, 2]);
    };

    this.tickPadding = function tickPadding() {
      if (angular.isDefined(vm.textOnly)) {
        return constants.hiddenAxisTickPadding;
      } else if (vm.isVertical()) {
        return constants.vertical.tick.padding;
      } else {
        return constants.horizontal.tick.padding;
      }
    };

    vm.tickValues = function tickValues(domain, range) {
      var min = domain[0],
        diff = domain[1] - min,
        tickCount = vm.tickCount(range);

      return _.map(_.range(tickCount), function (i) {
        return (diff / (tickCount - 1)) * i + min;
      });
    };

    vm.anchorHorizontalAxisValues = function anchorText(style, index, noAxisValues) {
      style['text-anchor'] = index === 0 ? 'start' :
       index === noAxisValues - 1 ? 'end' : 'middle';
    };

    vm.anchorVerticalAxisValues = function verticalAxisValuesTranslation(index, noAxisValues) {
      var x = vm.orient === 'left' ? -5 : 5 ;
      return index === 0 ? x + ',-5' : index === noAxisValues - 1 ? x + ',5' : x + ',0' ;
    };

    this.verticalTickTextPadding = function verticalTickTextPadding(text) {
      if (angular.isDefined(vm.filter)) {
        text = vm.format(text);
        vm.tickTextPadding = text.length * 8;
      } else {
        vm.tickTextPadding = text.length === 1 ? 21 : text.length * 8;
      }
    };

    this.updateScale = function updateScale(element, scale) {
      var scaleElement = d3.select(element),
        tickValues = vm.tickValues(scale.domain(), scale.range());

      vm.axis.tickSize(0);
      vm.axis.tickPadding(vm.tickPadding());
      vm.axis.tickValues(tickValues);
      vm.axis.scale(scale);
      var axisTickValues = scaleElement.call(this.axis).selectAll('text:not(.axis-label)');
      if (!vm.isVertical()) {
        axisTickValues.each(function(d, i) {
          var textStyle = { fill: vm.textColor };
          vm.anchorHorizontalAxisValues(textStyle, i, axisTickValues.size());
          d3.select(this).style(textStyle).attr('transform', 'translate (0,-5)');
        });
      } else {
        var longestTickText;
        axisTickValues.each(function(d, i) {
          var textStyle = { fill: vm.textColor },
              translation = vm.anchorVerticalAxisValues(i, axisTickValues.size());
          d3.select(this).attr('transform', 'translate (' + translation + ')')
              .style(textStyle);
          longestTickText = d ;
        });
        vm.verticalTickTextPadding(longestTickText.toString());
      }

      scaleElement.selectAll('line,path').style(vm.scaleStyle());

      if (vm.isVertical()) {
        if (tickValues.length > 3) {
          alternateTickSize(scaleElement, vm.orient);
          alternateTickVisibility(scaleElement);
        } else {
          scaleElement.selectAll('g.tick line')
            .attr('x2', defaultTickSize[vm.orient]);
        }
      }

      vm.drawRulers(scaleElement, scale);
    };

    this.resetAxis = function resetAxis() {
      this.setTransformFromDimensions();
      this.setScales(this.graphInstance);
      this.setScalesFormat();
    };

    this.axisColor = this.color || colors.axis.stroke;
    this.textColor = this.color || colors.axis.text;

    this.orient = this.orient || 'left';
    this.axis = d3.svg.axis().orient(this.orient);
    this.transform = {x: 0, y: 0};

    vm.graphInstance.registerMargin(vm.additionalMargin(vm.orient, vm.label));
    this.resetAxis();
  }

  function oneGraphAxisDirective() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        data: '=',
        filter: '@',
        graphInstance: '=',
        key: '@',
        label: '@',
        orient: '@',
        color: '=',
        max: '=',
        min: '=',
        rulers: '@',
        textOnly: '@',
        manualTickCount: '@tickCount',
        margin:'='
      },
      bindToController: true,
      controller: 'OneGraphAxisController',
      link: function (scope, elem) {
        var vm = scope.$ctrl;

        scope.$on('updated.scales', function (evt, scales) {
          vm.resetAxis();
          vm.updateScale(elem[0], vm.selectScale(scales));
          vm.updateAxisLabelPositon(elem[0]);
        });

        vm.addLabel(d3.select(elem[0]));
      },
      controllerAs: '$ctrl',
      template: '<g class="axis" ng-attr-transform="translate({{$ctrl.transform.x}},{{$ctrl.transform.y}})"></g>'
    };
  }
})();

// Source: bar.js
(function () {
angular.module('one.components.graph.bar', ['one.components.graph'])
    .controller('OneGraphBarController', OneGraphBarController)
    .directive('oneGraphBar', oneGraphBarDirective);

  OneGraphBarController.$inject = ['$scope', 'oneGraphConstants'];
  function OneGraphBarController($scope, oneGraphConstants) {
    var vm = this,
      constants = oneGraphConstants.bar;

    vm.barHeight = function barHeight(value) {
      return vm.verticalScale()(value);
    };

    vm.clearCache = function clearCache() {
      vm._groupScale = null;
      vm._seriesCache = null;
      vm._seriesScale = null;
      vm._verticalScale = null;
    };

    vm.groupScale = function groupScale(groupData) {
      if (!vm._groupScale) {
        vm._groupScale = d3.scale.ordinal()
          .domain(d3.range(groupData.length))
          .rangeRoundBands([0, vm.seriesScale().rangeBand()], constants.padding);
      }
      return vm._groupScale;
    };

    vm.maxBarHeight = function maxBarHeight() {
      return vm.graphInstance.innerHeight() * (1 - constants.margin);
    };

    vm.maxValue = function maxValue() {
      return _.max(_.map(vm.transformedSeries(), _.max));
    };

    vm.render = function render() {
      vm.clearCache();
      _.each(vm.renderBarsContainer(), _.bind(vm.renderBarGroup, vm));
    };

    vm.renderBarGroup = function renderBarGroup(html, index) {
      var barGroup = d3.select($(html)[0]),
        groupData = vm.transformedSeries()[index],
        scale = vm.groupScale(groupData);

      barGroup
        .attr('transform', 'translate(' + (vm.seriesScale()(index)) + ', 0)')
        .selectAll('rect')
        .data(groupData)
        .enter()
        .append('rect')
        .attr('height', vm.barHeight)
        .attr('width', _.constant(scale.rangeBand()))
        .attr('x', function (item, i) {
          return scale(i);
        })
        .attr('y', function (item) {
          return vm.graphInstance.innerHeight() - vm.barHeight(item);
        })
        .attr('fill', function (item, i) {
          return vm.graphInstance.colorScale(i);
        });
    };

    vm.renderBarsContainer = function renderBarsContainer() {
      return vm.svgBarMain.selectAll('g')
        .data(vm.transformedSeries())
        .enter()
        .append('g')[0];
    };

    vm.seriesScale = function seriesScale() {
      if (!vm._seriesScale) {
        vm._seriesScale = d3.scale.ordinal()
          .domain(d3.range(vm.transformedSeries().length))
          .rangeRoundBands([0, vm.graphInstance.innerWidth()], constants.paddingBetweenGroup);
      }

      return vm._seriesScale;
    };

    vm.transformedSeries = function transformedSeries() {
      if (!vm._seriesCache) {
        vm._seriesCache = _.map(vm.graphInstance.data, function (series) {
          return _.values(_.pick(series, vm.keys));
        });
      }

      return vm._seriesCache;
    };

    vm.verticalScale = function verticalScale() {
      if (!vm._verticalScale) {
        vm._verticalScale =  d3.scale.linear()
          .domain([0, vm.maxValue()])
          .range([0, vm.maxBarHeight()]);
      }

      return vm._verticalScale;
    };

    $scope.$on('updated.data', _.bind(vm.render, this));
  }

  oneGraphBarDirective.$inject = [];
  function oneGraphBarDirective() {

    function link(scope, element) {
      scope.$ctrl.svgBarMain = d3.select($(element)[0]);
    }

    return {
      restrict: 'E',
      controller: 'OneGraphBarController',
      scope: {
        graphInstance: '=',
        keys: '='
      },
      replace: true,
      transclude: true,
      bindToController: true,
      controllerAs: '$ctrl',
      link: link,
      template: '<g class="barMain"></g>'
    };
  }

})();

// Source: gauge.js
(function () {
angular.module('one.components.graph.gauge', ['one.components.graph'])
    .controller('OneGraphGaugeController', OneGraphGaugeController)
    .directive('oneGraphGauge', oneGraphGaugeDirective);

  OneGraphGaugeController.$inject = [];
  function OneGraphGaugeController() {
    var vm = this;
    vm.formatValue = function (value) {
      return (vm.valueSymbol || '') + ((value * vm.valueScale) + vm.valueOffset);
    };
  }

  function redrawGauge(groupElement, arc1, arc2, value) {
    arc1.startAngle(0).endAngle(value * 1.5 * Math.PI);
    arc2.startAngle(value * 1.5 * Math.PI).endAngle(1.5 * Math.PI);
    groupElement.select('.gauge-filled').attr('d', arc1);
    groupElement.select('.gauge-empty').attr('d', arc2);
  }

  oneGraphGaugeDirective.$inject = ['oneGraphColors'];
  function oneGraphGaugeDirective(oneGraphColors) {

    function link(scope, elem) {
      var vm = scope.$ctrl;
      var translation = (vm.graphInstance.innerWidth() / 2) + ', ' + (vm.graphInstance.innerHeight() / 2);
      var radius = Math.min(vm.graphInstance.innerWidth(), vm.graphInstance.innerHeight()) / 2;
      var barWidth = 20 * vm.graphInstance.innerWidth() / 300;
      var chartInset = 10;

      var groupElement = d3.select(elem[0]);
      var groupBody = groupElement.select('.gauge-body');

      groupElement.attr('transform', 'translate(' + translation + ')');
      groupBody.attr('transform', 'rotate(-135)');

      if (angular.isUndefined(vm.color)) {
        vm.color = oneGraphColors.defaultRange[0];
      }
      groupBody.append('path').attr('class', 'arc gauge-filled').style({fill: vm.color});
      groupBody.append('path').attr('class', 'arc gauge-empty');

      var arc2 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);
      var arc1 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);

      groupElement.append('text')
        .attr('class', 'value')
        .attr('text-anchor', 'middle');

      groupElement.append('text')
        .attr('class', 'label min')
        .attr('text-anchor', 'end')
        .attr('y', radius * 0.80)
        .attr('x', '-' + radius * 0.7);

      groupElement.append('text')
        .attr('class', 'label max')
        .attr('text-anchor', 'start')
        .attr('y', radius * 0.80)
        .attr('x', radius * 0.7);

      scope.$on('updated.data', function (event, data) {
        redrawGauge(groupElement, arc1, arc2, data);
        groupElement.select('text.value').text(vm.formatValue(data));
        groupElement.select('text.min').text(vm.formatValue(0));
        groupElement.select('text.max').text(vm.formatValue(1));
      });
    }

    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: 'OneGraphGaugeController',
      link: link,
      bindToController: true,
      controllerAs: '$ctrl',
      template: '<g class="gauge"><g class="gauge-body"></g></g>',
      scope: {
        graphInstance: '=',
        color: '=',
        valueScale: '=',
        valueOffset: '=',
        valueSymbol: '@'
      }
    };
  }

})();

// Source: legend.js
(function () {
angular.module('one.components.graph.legend', ['one.components.graph'])
    .controller('OneGraphLegendItemController', OneGraphLegendItemController)
    .controller('OneGraphLegendController', OneGraphLegendController)
    .directive('oneGraphLegend', oneGraphLegendDirective)
    .directive('oneGraphLegendItem', oneGraphLegendItemDirective);

  OneGraphLegendController.$inject = ['oneGraphConstants'];
  function OneGraphLegendController(oneGraphConstants) {
    var vm = this,
      constants = oneGraphConstants.legend;

    function reduceDimension(items, key, side, padding) {
      var boxSide = {top: 'height', left: 'width'}[side];
      return _(items)
        .takeWhile(function (item) {
          return item.key !== key;
        })
        .reduce(function (sum, item) {
          return sum + padding + item.$element[0].getBBox()[boxSide];
        }, 0);
    }

    vm.accumulatedHeight = function accumulatedHeight(key) {
      return reduceDimension(vm.items, key, 'top', constants.padding.top);
    };

    vm.accumulatedWidth = function accumulatedWidth(key) {
      return reduceDimension(vm.items, key, 'left', constants.padding.left);
    };

    vm.color = function color(key) {
      return vm.graphInstance.colorScale(key);
    };

    vm.registerItem = function registerItem(key, $element) {
      vm.items = vm.items.concat({key: key, $element: $element});
    };

    vm.margin = {
      role: 'legend',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };

    if (vm.orient === 'vertical') {
      vm.margin.left = constants.width;
    } else {
      vm.margin.top = constants.height;
    }
    vm.graphInstance.registerMargin(vm.margin);

    vm.items = [];
  }

  OneGraphLegendItemController.$inject = ['oneGraphConstants', 'oneGraphService'];
  function OneGraphLegendItemController(oneGraphConstants, graphService) {
    var vm = this,
      constants = oneGraphConstants.legend;

    vm.color = function color() {
      return vm.legendInstance.color(vm.key);
    };

    vm.drawLegend = function drawLegend($element) {
      vm.element = $element[0];
      vm.$element = $element;

      var legend = d3.select($element[0]),
        label = d3.select($element.find('.legend-label')[0]);

      label.text(vm.label)
        .attr({
          x: 16
        });
      legend.attr('transform', 'translate(' + vm.position() + ')');

      graphService.drawShape({
        shape: vm.shape,
        container: legend,
        color: vm.color()
      });
    };

    vm.position = function position() {
      if (vm.legendInstance.orient === 'vertical') {
        return [-constants.width,
          constants.padding.top + vm.legendInstance.accumulatedHeight(vm.key)];
      } else {
        return [vm.legendInstance.accumulatedWidth(vm.key),
          ((-constants.height - vm.element.getBBox().height) / 2)];
      }
    };
  }

  oneGraphLegendDirective.$inject = [];
  function oneGraphLegendDirective() {
    function link(scope, $element, attrs, ctrl, transclude) {
      scope.$ctrl = scope.graphInstance;
      transclude(scope, function (clone) {
        $element.append(clone);
      });
    }
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        graphInstance: '=',
        orient: '@'
      },
      bindToController: true,
      controller: 'OneGraphLegendController',
      controllerAs: '$legend',
      link: link,
      template: '<g class="one-graph-legend"></g>'
    };
  }

  oneGraphLegendItemDirective.$inject = [];
  function oneGraphLegendItemDirective() {
    function link(scope, $element) {
      var vm = scope.$legendItem;
      vm.graphInstance = vm.legendInstance.graphInstance;
      vm.legendInstance.registerItem(vm.key, $element);
      vm.drawLegend($element);
    }

    return {
      restrict: 'E',
      replace: true,
      scope: {
        legendInstance: '=',
        key: '@',
        label: '=',
        shape: '@'
      },
      bindToController: true,
      controller: 'OneGraphLegendItemController',
      controllerAs: '$legendItem',
      link: link,
      template: '<g class="one-graph-legend-item"><text class="legend-label"></text></g>'
    };
  }

})();

// Source: line.js
(function () {
angular.module('one.components.graph.line', ['one.components.graph'])
    .service('oneGraphLineService', oneGraphLineService)
    .controller('OneGraphLineController', OneGraphLineController)
    .directive('oneGraphLine', oneGraphLineDirective);

  oneGraphLineService.$inject = [];
  function oneGraphLineService() {
    this.dataUnderCursor = function dataUnderCursor(graph, keyX, position) {
      return this.nearestValue(graph.data, keyX, this.scaledLeftMousePosition(graph, keyX, position));
    };

    this.nearestValue = function nearestValue(data, keyX, x) {
      var upperIndex = _.findIndex(data, function (datum) {
          return datum[keyX] > x;
        }),
        d1 = data[upperIndex] || _.last(data),
        d0 = data[upperIndex - 1] || d1;

      return x - d0[keyX] > d1[keyX] - x ? d1 : d0;
    };

    this.scaledLeftMousePosition = function scaledMousePosition(graph, keyX, position) {
      return graph.scales[keyX].invert(position[0] - graph.graphLeftMargin());
    };
  }

  OneGraphLineController.$inject = ['$scope', 'd3', 'oneGraphLineService'];
  function OneGraphLineController($scope, d3, lineService) {
    var vm = this;

    vm.drawHighlightCircle = function drawHighlightCircle($element) {
      vm.highlightCircle = d3.select($element[0])
        .append('g')
        .style('opacity', 0);

      vm.highlightCircle.classed('highlight-circle', true);

      vm.highlightCircle
        .append('circle')
        .attr({
          r: 4
        })
        .style({
          fill: vm.color
        })
        .classed('inner-circle', true);

      vm.highlightCircle
        .append('circle')
        .attr({
          r: 8.5
        })
        .style({
          fill: vm.color
        })
        .classed('outer-circle', true);
    };

    vm.getX = function getX(datum) {
      return this.scales[this.x](datum[this.x]);
    };

    vm.getY = function getY(datum) {
      return this.scales[this.y](datum[this.y]);
    };

    vm.highlightCirclePosition = function highlightCirclePosition(data) {
      return vm.scales[vm.x](data[vm.x]) + ',' + vm.scales[vm.y](data[vm.y]);
    };

    vm.onMouseMove = function onMouseMove(position) {
      var data = lineService.dataUnderCursor(vm.graphInstance, vm.x, position);
      vm.highlightCircle
        .attr('transform', 'translate(' + vm.highlightCirclePosition(data) + ')')
        .style('opacity', 1);
    };

    vm.onMouseOut = function onMouseOut() {
      vm.highlightCircle.style('opacity', 0);
    };

    vm.selectData = function selectData(data) {
      return this.graph ? data[this.graph] : data;
    };

    vm.updateDataPoints = function updateDataPoints($element, data) {
      d3.select($element[0]).selectAll('.dot').remove();
      d3.select($element[0]).selectAll('.dot').data(data).enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('cx', _.bind(vm.getX, vm))
        .attr('cy', _.bind(vm.getY, vm))
        .style({
          fill: vm.color,
          opacity: 1
        });
    };

    vm.updateData = function updateData($element, data) {
      var vm = this,
        path = d3.select($element.find('path')[0]);

      path.datum(data)
        .transition()
        .attr('d', vm.line)
        .style({
          stroke: vm.color
        });

      path.classed('line', true);

      if (angular.isDefined(vm.plotDataPoints)) {
        vm.updateDataPoints($element, data);
      }

    };

    vm.x = vm.keyX || 'x';
    vm.y = vm.keyY || 'y';

    vm.line = d3.svg.line()
      .x(_.bind(vm.getX, vm))
      .y(_.bind(vm.getY, vm));

    vm.color = vm.graphInstance.colorScale(vm.y);

    $scope.$on('updated.scales', function (event, scales) {
      vm.scales = scales;
    });

  }

  oneGraphLineDirective.$inject = ['d3'];
  function oneGraphLineDirective(d3) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        graphInstance: '=',
        graph: '@',
        keyX: '@',
        keyY: '@',
        highlightCurrentData: '@',
        plotDataPoints:'@'
      },
      bindToController: true,
      controller: 'OneGraphLineController',
      controllerAs: '$ctrl',
      link: function (scope, $element) {
        var vm = scope.$ctrl;

        // Helper for CSS purposes
        d3.select($element[0]).classed('one-graph-line', true);

        if (angular.isDefined(vm.highlightCurrentData)) {
          vm.drawHighlightCircle($element);

          d3.select($element.parents('svg')[0])
            .on(_.uniqueId('scroll.'), mousemove)
            .on(_.uniqueId('mousemove.'), mousemove)
            .on(_.uniqueId('mouseout.'), _.bind(vm.onMouseOut, vm));
        }

        function mousemove() {
          vm.onMouseMove(d3.mouse(this));
        }

        scope.$on('updated.data', function (event, data) {
          vm.updateData($element, vm.selectData(data));

        });
      },
      template: '<g><path class="line"></path></g>'
    };
  }
})();

// Source: pie.js
(function () {
angular.module('one.components.graph.pie', ['one.components.graph'])
    .controller('OneGraphPieController', OneGraphPieController)
    .directive('oneGraphPie', oneGraphPieDirective);

  OneGraphPieController.$inject = ['$scope', '$compile'];
  function OneGraphPieController($scope, $compile) {
    var vm = this;

    vm.drawContainer = function drawContainer(data) {
      var container = d3.select(vm.container);
      container.selectAll('g.labels').remove();
      vm.element = container.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(vm.pie(data))
        .enter();
      if (_.find(data, 'icon')) {
        vm.drawIcon(data);
      } else {
        vm.drawLabels(data);
      }
    };

    vm.drawIcon = function drawIcon() {
      var foreignObject = vm.element.append('foreignObject');

      foreignObject.append(function (item) {
        return $compile(item.data.icon)($scope)[0];
      });

      foreignObject.attr('class', function (item) {
          return vm.labelClass(item.data.icon);
        })
        .attr('height', function () {
          return _.ceil($(this).children().outerHeight()) + 'px';
        })
        .attr('width', function () {
          return _.ceil($(this).children().outerWidth()) + 'px';
        })
        .attr('transform', function (data) {
          var children = $(this).children(),
            iconWidth = children.outerWidth(),
            iconHeight = children.outerHeight(),
            position = vm.labelPosition(data);

          return 'translate(' + vm.iconPosition(position, iconWidth, iconHeight) + ')';
        });
    };

    vm.drawLabels = function drawLabels() {
      vm.element.append('text')
        .attr('transform', function (data) {
          return 'translate(' + vm.labelPosition(data) + ')';
        })
        .attr('dy', '.35em')
        .text(function (item) {
          return item.data.label;
        })
        .attr('class', function (item) {
          return vm.labelClass(item.data.label);
        });
    };

    vm.drawEmptyPie = function drawEmptyPie() {
      var container = d3.select(vm.container),
        radius = vm.radius(),
        text = vm.emptyText || 'No Data';
      container.selectAll('g.slices').remove();
      container.append('circle')
        .classed('empty-circle', true)
        .attr({
          r: radius,
          transform: 'translate(' + vm.position() + ')'
        });

      container.append('foreignObject')
        .classed('empty-label', true)
        .attr('width', vm.radius() * 2)
        .html('<p>' + text + '</p>')
        .attr('transform', function () {
          return 'translate(' + vm.emptyLabelPosition($(this).find('p').height()) + ')';
        });
    };

    vm.drawPie = function drawPie() {
      var ratio;

      vm.arc = d3.svg.arc()
        .outerRadius(vm.radius());
      vm.pie = d3.layout.pie()
        .value(function (d) {
          return d.count;
        })
        .sort(null);
      ratio = vm.ratio();
      vm.labelArc = d3.svg.arc()
        .outerRadius(vm.radius() * ratio)
        .innerRadius(vm.radius() * ratio);
    };

    vm.drawSlices = function drawSlices(data) {
      var container = d3.select(vm.container);
      container.selectAll('g.slices').remove();
      container.attr('transform', 'translate(' + vm.position() + ')');

      var slices = d3.select(vm.container)
        .append('g')
        .attr('class', 'slices');

      slices.selectAll('.slice')
        .data(vm.pie(data))
        .enter().append('g')
        .attr('class', 'slice')
        .append('path')
        .attr('d', vm.arc)
        .attr('fill', function (item) {
          return vm.sliceColor(item.data.label);
        });

      if (angular.isUndefined(vm.hideLabels)) {
        vm.drawContainer(data);
      }
    };

    vm.emptyLabelPosition = function emptyLabelPosition(height) {
      var position = vm.position();

      return [position[0] - vm.radius(), position[1] -  height / 2];
    };

    vm.iconPosition = function iconPosition(position, iconWidth, iconHeight) {
      position[0] = position[0] - (iconWidth / 2);
      position[1] = position[1] - (iconHeight / 2);
      return position;
    };

    vm.labelClass = function labelClass(label) {
      return tinycolor(vm.sliceColor(label)).isLight() ? 'label-dark' : 'label-light';
    };

    vm.labelPosition = function labelPosition(item) {
      return vm.labelArc.centroid(item);
    };

    vm.position = function position() {
      return [vm.graphInstance.innerWidth() / 2, vm.graphInstance.innerHeight() / 2];
    };

    vm.radius = function radius() {
      return Math.min(vm.graphInstance.innerWidth(), vm.graphInstance.innerHeight()) / 2;
    };

    vm.ratio = function ratio() {
      return _.min([vm.graphInstance.graphHeight, vm.graphInstance.graphWidth]) <= 150 ? 0.5 : 0.66;
    };

    vm.sanitizedData = function sanitizedData(data) {
      return _.reject(data, {'count': 0});
    };

    vm.sliceColor = function sliceColor(label) {
      return vm.graphInstance.colorScale(label);
    };

    vm.drawPie();
  }

  oneGraphPieDirective.$inject = [];
  function oneGraphPieDirective() {
    function link(scope, element) {
      var vm = scope.$ctrl;
      scope.$on('updated.data', function (event, data) {
        vm.container = element[0];
        data = vm.sanitizedData(data);
        if (_.isEmpty(data)) {
          vm.drawEmptyPie();
        } else {
          vm.drawSlices(data);
        }
      });
    }

    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        graphInstance: '=',
        hideLabels: '@',
        emptyText: '='
      },
      bindToController: true,
      controller: 'OneGraphPieController',
      controllerAs: '$ctrl',
      link: link,
      template: '<g class="one-graph-pie"></g>'
    };
  }

})();

// Source: scatterplot.js
(function () {
angular.module('one.components.graph.scatterplot', ['one.components.graph'])
    .controller('OneGraphScatterPlotController', OneGraphScatterPlotController)
    .directive('oneGraphScatterPlot', oneGraphScatterPlotDirective);

  OneGraphScatterPlotController.$inject = [];
  function OneGraphScatterPlotController() {
    var vm = this;

    vm.drawScatterPlot = function drawScatterPlot($element, data) {
      d3.select($element[0]).selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('cx', vm.getX)
        .attr('cy', vm.getY)
        .style({
          fill: function (data) {
            return vm.graphInstance.colorScale(data[vm.keySeries]);
          },
          opacity: 0.5
        });
    };

    vm.getX = function getX(data) {
      return vm.scales[vm.keyX](data[vm.keyX]);
    };

    vm.getY = function getY(data) {
      return vm.scales[vm.keyY](data[vm.keyY]);
    };

    vm.keyX = vm.keyX || 'x';
    vm.keyY = vm.keyY || 'y';
  }

  oneGraphScatterPlotDirective.$inject = [];
  function oneGraphScatterPlotDirective() {
    function link(scope, $element) {
      var vm = scope.$ctrl;

      scope.$on('updated.scales', function (event, scales) {
        vm.scales = scales;
      });

      scope.$on('updated.data', function (event, data) {
        vm.drawScatterPlot($element, data);
      });
    }

    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        graphInstance: '=',
        keyX: '@',
        keyY: '@',
        keySeries: '@'
      },
      bindToController: true,
      controller: 'OneGraphScatterPlotController',
      controllerAs: '$ctrl',
      link: link,
      template: '<g class="scatterplot"></g>'
    };
  }

})();

// Source: tooltip.js
(function () {
angular.module('one.components.graph.tooltip', ['one.components.graph', 'one.components.graph.line'])
    .controller('OneGraphTooltipController', OneGraphTooltipController)
    .directive('oneGraphTooltip', oneGraphTooltipDirective);

  OneGraphTooltipController.$inject = ['$scope', '$templateCache', 'oneGraphLineService'];
  function OneGraphTooltipController($scope, $templateCache, lineService) {
    var vm = this,
      ARROW_HEIGHT = 10,
      TOOLTIP_MARGIN = 5,
      INITIAL_TOOLTIP_WIDTH = 200;

    var tooltipWidth = INITIAL_TOOLTIP_WIDTH;

    vm.buildTooltip = function buildTooltip(transclude) {
      vm.$element = $($templateCache.get('graph/tooltip/tooltip.tpl.html'));
      vm.$container.append(vm.$element);
      var innerContainer = vm.$element.find('.inner-container');
      transclude($scope, undefined, innerContainer).appendTo(innerContainer);
      tooltipWidth = vm.$element.width();
      vm.$element.hide();
    };

    vm.dataUnderCursor = function dataUnderCursor(position) {
      switch (vm.position) {
        case 'multiline':
          return lineService.dataUnderCursor(vm.graphInstance, vm.keyX, position);

        default:
          return vm.graphInstance.data;
      }
    };

    vm.highestDataPoint = function highestDataPoint(data) {
      return _.reduce(vm.keys, function (max, key) {
        return _.min([vm.graphInstance.scales[key](data[key]), max]);
      }, Infinity);
    };

    vm.onMouseMove = function onMouseMove(position) {
      vm.$element.show();
      vm.data = vm.dataUnderCursor(position);
      tooltipWidth = vm.$element.width();
      vm.$element.offset(vm.tooltipPosition(position));
    };

    vm.onMouseOut = function onMouseOut() {
      vm.$element.hide();
    };

    vm.tooltipPosition = function tooltipPosition(position) {
      var containerOffset = vm.$container.offset(),
        top,
        left;

      switch (vm.position) {
        case 'multiline':
          top = vm.highestDataPoint(vm.data) +
            containerOffset.top +
            vm.graphInstance.graphTopMargin() -
            vm.$element.height() -
            ARROW_HEIGHT -
            TOOLTIP_MARGIN;

          left = vm.xScale(vm.data[vm.keyX]) +
            containerOffset.left +
            vm.graphInstance.graphLeftMargin() -
            tooltipWidth / 2;
          break;

        default:
          top = position[1] +
            containerOffset.top -
            vm.$element.height() -
            ARROW_HEIGHT;

          left = position[0] +
            containerOffset.left -
            tooltipWidth / 2;

          left = vm.followMouse(position, left, containerOffset);
      }

      return {
        top: top,
        left: left
      };
    };

    vm.followMouse = function followMouse(position, left, containerOffset) {
      var arrowContainer = vm.$element.find('.arrow-wrapper'),
      arrowOffsetTop = top + vm.$element.height(),
      rightOverflow = containerOffset.left + position[0] + tooltipWidth / 2;

      function offTheScreenLeft() {
        return _.max([left, 0]) === 0;
      }
      function offTheScreenRight() {
        return _.min([window.innerWidth, rightOverflow]) === window.innerWidth;
      }
      function checkArrowIsAttachedLeft() {
        return position[0] <= ARROW_HEIGHT;
      }
      function checkArrowIsAttachedRight() {
        return position[0] >= window.innerWidth - ARROW_HEIGHT;
      }

      if (offTheScreenLeft()) {
        if (checkArrowIsAttachedLeft()) {
          left = containerOffset.left -
            tooltipWidth / 2 +
            ARROW_HEIGHT;
        }
        arrowContainer.offset({
          top: arrowOffsetTop,
          left: left
        });
        return 0;
      } else if (offTheScreenRight()) {
        if (checkArrowIsAttachedRight()) {
          left = containerOffset.left +
            tooltipWidth -
            ARROW_HEIGHT;
        }
        arrowContainer.offset({
          top: arrowOffsetTop,
          left: left
        });
        return window.innerWidth - tooltipWidth;
      }
      return left;
    };

    vm.updateScales = function updateScales(event, scales) {
      vm.xScale = scales[vm.keyX];
    };

    vm.keyX = vm.keyX || 'x';
    if (angular.isDefined(vm.keysArray)) {
      vm.keys = _.map(vm.keysArray.split(','), function (key) {
        return _.trim(key);
      });
    }

    // shorthand for tooltip templates
    $scope.$ctrl = vm.graphInstance;

    $scope.$on('updated.scales', vm.updateScales);
  }

  oneGraphTooltipDirective.$inject = ['d3'];
  function oneGraphTooltipDirective(d3) {
    function link(scope, $element, attrs, ctrl, transclude) {
      var vm = scope.$tooltip,
        $graph = $element.parents('svg');

      vm.$container = $graph.parent();
      vm.buildTooltip(transclude);

      d3.select($graph[0])
        .on(_.uniqueId('scroll.'), mousemove)
        .on(_.uniqueId('mousemove.'), mousemove)
        .on(_.uniqueId('mouseout.'), _.bind(vm.onMouseOut, vm));

      function mousemove() {
        scope.$apply(_.bind(function () {
          vm.onMouseMove(d3.mouse(this));
        }, this));
      }
    }

    return {
      restrict: 'E',
      transclude: true,
      bindToController: true,
      scope: {
        graphInstance: '=',
        position: '@',
        keyX: '@',
        keysArray: '@keys'
      },
      controller: 'OneGraphTooltipController',
      controllerAs: '$tooltip',
      link: link
    };
  }

})();

// Source: datepicker.js
(function () {

  angular.module('one.components.inputs', [])
    .provider('oneDatePickerConfig', oneDatePickerConfigProvider)
    .directive('oneDatePicker', oneDatePickerDirective)
    .directive('oneDateTimePicker', oneDatePickerDirective)
    .controller('OneDatePickerController', OneDatePickerController);

  oneDatePickerConfigProvider.$inject = [];
  function oneDatePickerConfigProvider() {
    var provider = this;
    provider.defaultMinutes = [0, 15, 30, 45];
    provider.formats = {
      date: 'L',
      dateTime: 'L - LT'
    };
    provider.$get = _.constant(provider);
  }

  OneDatePickerController.$inject = ['$scope', 'ngModel', 'oneDatePickerConfig'];
  function OneDatePickerController($scope, ngModel, oneDatePickerConfig) {
    var vm = this;

    vm.apply = function () {
      ngModel.$setViewValue(moment({
        year: vm.currentDate.year(),
        month: vm.currentDate.month(),
        date: vm.currentDate.date(),
        hour: (vm.currentPeriod === 'AM' ? 0 : 12) + vm.currentHour,
        minute: vm.currentMinute
      }).format(vm.dateFormat));
      ngModel.$render();
      $scope.close();
    };

    vm.format = function (value) {
      return (value && value.isValid()) ? value.format(vm.dateFormat) : '';
    };
    ngModel.$formatters.push(vm.format);

    vm.generateDays = function (date) {
      vm.currentYear = date.year();
      vm.currentMonth = date.month();
      var generator = date.clone().startOf('month').startOf('week');
      var endDate = date.clone().endOf('month').endOf('week').unix();

      vm.days = [];
      vm.weeks = [];

      function generateWeek() {
        var d = generator.clone();
        generator.add(1, 'day');
        return d;
      }

      while (generator.unix() < endDate) {
        vm.days.push(_.times(7, generateWeek));
      }
    };

    vm.generateHours = function () {
      return _(12).range().map(function (hour) {
        return {
          value: hour,
          label: moment({hour: hour}).format('hh')
        };
      }).value();
    };

    vm.generateMinutes = function () {
      return _.map(vm.availableMinutes, function (minute) {
        return {
          value: minute,
          label: _.padStart(minute, 2, '0')
        };
      });
    };

    vm.isSelected = function (date) {
      return vm.currentDate ? date.isSame(vm.currentDate, 'day') : false;
    };

    vm.isToday = function (date) {
      return date.isSame(moment(), 'day');
    };

    vm.isDisabled = function(date) {
      return ($scope.minDate && $scope.minDate.isValid() && $scope.minDate.isAfter(date, 'day')) ||
        ($scope.maxDate && $scope.maxDate.isValid() && $scope.maxDate.isBefore(date, 'day'));
    };

    vm.nextMonth = function () {
      vm.generateDays(moment({
        year: vm.currentYear,
        month: vm.currentMonth
      }).add(1, 'month'));
    };

    vm.parse = function (value) {
      var date = moment(value, vm.dateFormat, true);
      ngModel.$setValidity('format', date.isValid());
      return date;
    };
    ngModel.$parsers.push(vm.parse);

    vm.previousMonth = function () {
      vm.generateDays(moment({
        year: vm.currentYear,
        month: vm.currentMonth
      }).subtract(1, 'month'));
    };

    vm.reset = function (date) {
      vm.currentDate = (date && date.isValid()) ? date.clone() : undefined;
      vm.currentHour = vm.currentDate ? (vm.currentDate.hour() % 12) : 0;
      vm.currentMinute = vm.currentDate ? vm.currentDate.minute() : _.head(vm.availableMinutes);
      vm.currentPeriod = vm.currentDate ? vm.currentDate.format('A') : 'AM';

      vm.generateDays(vm.currentDate || moment());
    };

    vm.select = function (date) {
      vm.currentDate = date;
      if (date.month() !== vm.currentMonth || date.year() !== vm.currentYear) {
        vm.generateDays(date);
      }
    };

    vm.availableMinutes = $scope.availableMinutes || oneDatePickerConfig.defaultMinutes;

    // shorthand to avoid confusions
    vm.hasTime = $scope.hasTime;
    vm.dateFormat = oneDatePickerConfig.formats[vm.hasTime ? 'dateTime' : 'date'];

    vm.hours = vm.generateHours();
    vm.minutes = vm.generateMinutes();
    vm.months = moment.months();
    vm.weekdays = moment.weekdaysShort();

    $scope.$watch(function () {
      return ngModel.$modelValue;
    }, vm.reset);
  }

  oneDatePickerDirective.$inject = ['$compile', '$templateCache', '$controller', '$window', '$timeout'];
  function oneDatePickerDirective($compile, $templateCache, $controller, $window, $timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        ngModel: '=',
        minDate: '=',
        maxDate: '=',
        availableMinutes: '='
      },
      link: function ($scope, element, attrs, ngModel) {
        function clickOutside(event) {
          if (!element[0].contains(event.target) &&
            !$tooltip[0].contains(event.target) &&
            !$(event.target).hasClass('different-month')) {
            close();
          }
        }

        function close() {
          $tooltip.hide();
        }

        function initController($scope, attrs, ngModel) {
          var pickerScope = $scope.$new();
          pickerScope.hasTime = angular.isDefined(attrs.oneDateTimePicker);
          $controller('OneDatePickerController as vm', {
            $scope: pickerScope,
            ngModel: ngModel
          });

          // Exposed to help unit tests
          _.assign(pickerScope, {
            close: close,
            clickOutside: clickOutside,
            offset: offset,
            onFocus: onFocus
          });
          return pickerScope;
        }

        function initTooltip(element, pickerScope) {
          var $tooltip = $compile($templateCache.get('inputs/datepicker/datepicker.tpl.html'))(pickerScope);
          $tooltip.hide().insertAfter(element);
          element.on('focus', onFocus);
          element.attr('autocomplete', 'off');
          return $tooltip;
        }

        function offset(fieldOffset, fieldHeight, pickerHeight, windowHeight) {
          var _offset = {
            left: fieldOffset.left,
            top: fieldOffset.top + fieldHeight
          };
          if (pickerHeight + _offset.top > windowHeight) {
            _offset.top = fieldOffset.top - pickerHeight;
          }
          return _offset;
        }

        function onFocus() {
          $timeout(function () {
            pickerScope.$apply(function () {
              pickerScope.vm.reset(ngModel.$modelValue);
            });

            $tooltip
              .show()
              .offset(offset(
                element.offset(),
                element.outerHeight(),
                $tooltip.outerHeight(),
                $(document).outerHeight()
              ));
          });
        }

        function initCalendarIcon($scope, $element) {
          var $calendarIcon = $compile(
            '<span class="form-control-feedback">' +
            '<i one-icon="oui-calendar"></i>' +
            '</span>'
          )($scope);
          $element.after($calendarIcon);
          $element.parent().addClass('has-feedback');
        }

        var pickerScope = initController($scope, attrs, ngModel);
        var $tooltip = initTooltip(element, pickerScope);
        initCalendarIcon($scope, element);

        $($window).on('click', clickOutside);
        $scope.$on('$destroy', function () {
          $($window).off('click', clickOutside);
        });
      }
    };
  }

})();

// Source: toggle.js
(function () {
angular.module('one.components.inputs')
    .directive('oneToggle', oneToggle);

  function oneToggle() {
    return {
      restrict: 'C',
      link: function (scope, checkbox) {
        checkbox.wrap('<span class="one-toggle-wrapper"></span>');
        checkbox.after('<span class="toggle-back"></span>' +
                       '<span class="toggle-handle"></span>');
      }
    };
  }

})();

// Source: momentFilter.js
(function () {

  angular.module('one.components.uiGrid')
    .filter('moment', momentFilter);

  function momentFilter() {
    return function (value, dateFormat) {
      return moment.isMoment(value) ? value.format(dateFormat) : value;
    };
  }

})();

// Source: smartsearchboolean.js
angular.module('one.components.smartsearch')
  .directive('smartSearchBoolean', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'smartsearch/plugins/boolean/smartsearchboolean.tpl.html',
      scope: {
        name: '@',
        filter: '=',
        options: '='
      },
      controller: ['$scope', function($scope) {
        $scope.setFilter = function(value) {
          $scope.filter = value;
          $scope.$emit('filter.close');
        };
      }]
    };
  });

// Source: smartsearchdate.js
angular.module('one.components.smartsearch')
  .filter('smartSearchDate', ['$filter', function($filter) {
    return function(value, filter, modifier) {
      if (!modifier) {
        return $filter('date')(value, filter.options && filter.options.dateFormat);
      } else {
        return '';
      }
    };
  }])
  .directive('smartSearchDate', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'smartsearch/plugins/date/smartsearchdate.tpl.html',
      scope: {
        name: '@',
        filter: '=',
        options: '='
      },
      controller: ['$scope', function($scope) {
        var initializing = true;

        $scope.$watch('filter', function() {
          // We want to ignore the first $watch handler.  When the filter
          // changes a second time, then we should close the filter panel
          if (!initializing) {
            $scope.$emit('filter.close');
          }
          initializing = false;
        });
      }]
    };
  });

// Source: smartsearchlist.js
angular.module('one.components.smartsearch')
  .filter('smartSearchList', [function() {
    return function(value, filter, modifier) {
      function _getDisplayValue(value, items) {
        for (var i = 0; i < items.length; i++) {
          if (_.isEqual(items[i].value, value)) {
            return items[i].label;
          }
        }
        return value;
      }

      if (!modifier) {
        var options = filter.options;
        var items = options ? options.items : [];
        var multiselect = options && options.multiselect ? options.multiselect : false;

        if (multiselect) {
          return value
            .map(function(v) { return _getDisplayValue(v, items); })
            .join(', ');
        } else {
          return _getDisplayValue(value, items);
        }
      } else {
        return '';
      }
    };
  }])
  .directive('smartSearchList', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'smartsearch/plugins/list/smartsearchlist.tpl.html',
      scope: {
        name: '@',
        filter: '=',
        options: '='
      },
      link: function($scope, $element) {
        // Doing specific dom node targeting to determine
        // the height of the list relative whatever the maxPopupHeight
        // property on the search control is set to.
        setTimeout(function() {
          var container = $element.parent().parent();
          var searchPane = container.parent();

          var totalUsedHeight = 0;
          var unusedHeight = 0;
          var maxHeight = 0;
          var errorThreshold = 3;

          // If the maxPopupHeight property is not set ignore all this
          if (searchPane[0] && searchPane[0].style.maxHeight !== '') {
            maxHeight = parseInt(searchPane[0].style.maxHeight, 10);
            container.children().each(function(i) {
              var el = $(this)[0];
              // use just the first two nodes
              if (i < 2) {
                totalUsedHeight += el.offsetHeight;
              }
            });
            totalUsedHeight += $('#filter-input__content', $element)[0].offsetHeight;
            unusedHeight = maxHeight - totalUsedHeight;

            $('#filter-input__list', $element).css('height', (unusedHeight - errorThreshold) + 'px');
          }
        }, 0);
      },
      controller: ['$scope', '$filter', function($scope, $filter) {
        var _MAXALLOWEDLIMIT = 100;
        $scope.options = $scope.options || {};
        $scope.options.items = $scope.options.items || [];
        $scope.options.visiblelimit = $scope.options.visiblelimit === undefined || $scope.options.visiblelimit >
          _MAXALLOWEDLIMIT || $scope.options.visiblelimit < 1 ? _MAXALLOWEDLIMIT : $scope.options.visiblelimit;
        $scope.options.multiselect = $scope.options.multiselect || false;

        $scope.isSelected = function(item) {
          if ($scope.options && $scope.options.multiselect) {
            return $scope.filter && !!_.find($scope.filter, function(filterItem) {
              return _.isEqual(filterItem, item.value);
            });
          }
          return _.isEqual($scope.filter, item.value);
        };

        $scope.select = function(item) {
          if (!$scope.isSelected(item)) {
            $scope.addToFilter(item);
          } else {
            $scope.removeFromFilter(item);
          }
          if (!$scope.options.multiselect) {
            $scope.$emit('filter.close');
          }
        };

        $scope.addToFilter = function(item) {
          if (!$scope.options.multiselect) {
            $scope.filter = item.value;
          } else {
            if (!$scope.filter) {
              $scope.filter = [];
            }
            $scope.filter.push(item.value);
          }
        };

        $scope.removeFromFilter = function(item) {
          if ($scope.options.multiselect) {
            var index = _.findIndex($scope.filter, function(f) {
              return _.isEqual(f, item.value);
            });

            $scope.filter.splice(index, 1);
            // remove the filter if there is no valid selection on the list
            if ($scope.filter.length === 0) {
              delete $scope.filter;
            }
          } else {
            if ($scope.filter === item.value) {
              delete $scope.filter;
            }
          }
        };

        $scope.updateItemsSubset = function(text) {
          var items = $scope.options.items;

          if (!_.isEmpty(text)) {
            // filter the list
            items = $filter('filter')(items, text);
          }

          // put selected items at the top
          items = _.sortBy(items, function(item) {
            return $scope.isSelected(item) ? -1 : 1;
          });

          // limit to the visible limit
          $scope.subset = $filter('limitTo')(items, $scope.options.visiblelimit);
        };

        $scope.updateItemsSubset();
      }]
    };
  });

// Source: smartsearchnumber.js
angular.module('one.components.smartsearch')
  .directive('smartSearchNumber', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'smartsearch/plugins/number/smartsearchnumber.tpl.html',
      scope: {
        name: '@',
        filter: '=',
        options: '='
      },
      controller: ['$scope', function($scope) {

        $scope.searchNumberDebounce = _.get($scope, 'options.debounce', 500);

        $scope.$watch('filter', function() {
          if ($scope.filter === null) {
            delete $scope.filter;
          }
        });

        $scope.onKeyDown = function(event) {
          if (event.keyCode === 13) {
            $scope.$emit('filter.close');
          } else if (event.keyCode === 38 || event.keyCode === 40) {
            // Prevent increment / decrement of input value when UP or
            // DOWN arrow key is pressed
            event.preventDefault();
          }
        };
      }]
    };
  });

// Source: smartsearchrelational.js
angular.module('one.components.smartsearch')
  .filter('smartSearchRelational', [function() {
    return function(value, filter, modifier) {
      if (!modifier) {
        return value.value;
      } else {
        var modifierOptions = [
          { name: 'greater than', value: '>' },
          { name: 'less than', value: '<' },
          { name: 'equal', value: '=' },
          { name: 'not equal', value: '!=' }
        ];

        var option = _.find(modifierOptions, {value: value});
        return option ? option.name : '';
      }
    };
  }])
  .directive('smartSearchRelational', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'smartsearch/plugins/relational/smartsearchrelational.tpl.html',
      scope: {
        name: '@',
        filter: '=',
        options: '='
      },
      controller: ['$scope', function($scope) {
        var baseOptions = [
          { name: 'greater than', value: '>' },
          { name: 'less than', value: '<' },
          { name: 'equal', value: '=' },
          { name: 'not equal', value: '!=' }
        ];

        $scope.searchRelationalDebounce = _.get($scope, 'options.debounce', 500);

        $scope.modifierOptions = [];
        var defaultModifer;

        //Defaults to all if not specified
        if (!$scope.options || (!$scope.options.modifierConfig)) {
          $scope.modifierOptions = baseOptions;
        } else {
          var modifierConfig = $scope.options.modifierConfig;

          if (modifierConfig.showGreaterThan) {
            $scope.modifierOptions.push(baseOptions[0]);
          }

          if (modifierConfig.showLessThan) {
            $scope.modifierOptions.push(baseOptions[1]);
          }

          if (modifierConfig.showEquals) {
            $scope.modifierOptions.push(baseOptions[2]);
            defaultModifer = '=';
          }

          if (modifierConfig.showNotEquals) {
            $scope.modifierOptions.push(baseOptions[3]);
          }
        }
        defaultModifer = defaultModifer || $scope.modifierOptions[0].value;

        if ($scope.filter && $scope.filter.hasOwnProperty('value')) {
          $scope._value = $scope.filter.value;
        }

        if ($scope.filter && $scope.filter.modifier) {
          $scope.currentModifier = $scope.filter.modifier;
        } else {
          $scope.currentModifier = defaultModifer;
        }

        $scope.onKeyDown = function(event) {
          if (event.keyCode === 13) {
            $scope.$emit('filter.close');
          }
        };

        $scope.updateFilter = function() {
          if ($scope._value !== null) {
            $scope.filter = {
              value: $scope._value,
              modifier: $scope.currentModifier
            };
          } else {
            delete $scope.filter;
          }
        };

        $scope.setModifier = function(modifierValue) {
          $scope.currentModifier = modifierValue;
          if ($scope.filter) {
            $scope.filter.modifier = modifierValue;
          }
        };
      }]
    };
  });

// Source: smartsearchselect.js
angular.module('one.components.smartsearch')
  .filter('smartSearchSelect', [function() {
    return function(value, filter, modifier) {
      function _getDisplayValue(value, items) {
        for (var i = 0; i < items.length; i++) {
          if (items[i].value === value) {
            return items[i].label;
          }
        }
        return value;
      }

      if (!modifier) {
        var items = filter.options ? filter.options.items : [];
        var multiselect = filter.options ? filter.options.multiselect : false;

        if (multiselect) {
          var values = [];
          for (var i = 0; i < value.length; i++) {
            values.push(_getDisplayValue(value[i], items));
          }
          return values.join(', ');
        } else {
          return _getDisplayValue(value, items);
        }
      } else {
        return '';
      }
    };
  }])
  .directive('smartSearchSelect', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'smartsearch/plugins/select/smartsearchselect.tpl.html',
      scope: {
        name: '@',
        filter: '=',
        options: '='
      },
      controller: ['$scope', function($scope) {
        $scope.itemInFilter = function(item) {
          var value = item.value;
          if ($scope.options.multiselect && $scope.filter instanceof Array) {
            $scope.filter = $scope.filter || [];
            return $scope.filter.indexOf(value) > -1;
          } else {
            return $scope.filter === value;
          }
        };

        $scope.itemClicked = function(item) {
          var value = item.value;

          if ($scope.options.multiselect) {
            $scope.filter = $scope.filter || [];
            var indexInFilter = $scope.filter.indexOf(value);
            if (indexInFilter > -1) {
              $scope.filter.splice(indexInFilter, 1);
            } else {
              $scope.filter.push(value);
            }
            if ($scope.filter.length === 0) {
              delete $scope.filter;
            }
          } else {
            $scope.filter = value;
            $scope.$emit('filter.close');
          }
        };
      }]
    };
  });

// Source: smartsearchstring.js
angular.module('one.components.smartsearch')
  .directive('smartSearchString', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'smartsearch/plugins/string/smartsearchstring.tpl.html',
      scope: {
        name: '@',
        filter: '=',
        options: '='
      },
      controller: ['$scope', function($scope) {
        $scope.initialValue = $scope.filter;
        $scope.text = $scope.filter;

        $scope.searchStringDebounce = _.get($scope, 'options.debounce', 500);

        $scope.$watch('filter', function() {
          if ($scope.filter === '') {
            delete $scope.filter;
          }
        });

        $scope.onKeyDown = function(event) {
          if (event.keyCode === 27) {
            $scope.filter = $scope.initialValue;
          } else if (event.keyCode === 13) {
            $scope.$emit('filter.close');
          }
        };
      }]
    };
  });

// Source: uiGridActions.js
(function () {
angular.module('one.components.uiGrid')
    .service('oneUiGridActionsService', oneUiGridActionsService)
    .service('oneUiGridActionsPanelService', oneUiGridActionsPanelService)
    .controller('oneUiGridActionsController', oneUiGridActionsController)
    .controller('oneUiGridActionsHeaderCellCtrl', oneUiGridActionsHeaderCellCtrl)
    .directive('oneUiGridActions', oneUiGridActionsDirective)
    .constant('oneUiGridActionsCellDefinition', {
      name: 'settings',
      cellTemplate: 'uiGrid/plugins/uiGridActions/cell.tpl.html',
      headerCellTemplate: 'uiGrid/plugins/uiGridActions/headerCell.tpl.html',
      width: 62,
      pinnedRight: true,
      enableCellEdit: false,
      enableHiding: false,
      enableSorting: false
    });

  oneUiGridActionsService.$inject = ['oneUiGridActionsCellDefinition'];
  function oneUiGridActionsService(cellDefinition) {
    function GridActions(grid) {
      var self = this;

      this.grid = grid;
      this.noSetColumnsActionsArrangeable = true;

      this.grid.options.columnDefs.forEach(function (column) {
        if (column.visible === undefined) {
          // this is to ensure that checkboxes in header action popover are checked
          column.visible = true;
        }
        if (column.ocActionsArrangeable === undefined) {
          // all the columns are arrangeable by default
          column.ocActionsArrangeable = true;
        }
        // Hide the settings icon if non of the columns are arrangeable
        if (column.ocActionsArrangeable) {
          self.noSetColumnsActionsArrangeable = false;
        }
      });
      this.grid.options.columnDefs.push(cellDefinition);
    }

    GridActions.prototype.getActions = function getActions() {
      return this.grid.options.oneActions || [];
    };

    GridActions.prototype.shouldDisplayMultipleActions = function shouldDisplayMultipleActions(entity) {
      var self = this,
        actions = self.getActions();

      var visibleActions = _.filter(actions, function (action) {
        return !self.callHiddenHandler(entity, action);
      });

      return visibleActions.length > 1;
    };

    GridActions.prototype.callHiddenHandler = function callHiddenHandler(entity, action) {
      var handler = this.getAppScopeHandler(action.hideHandler);
      if (angular.isDefined(handler)) {
        return handler.call(this.grid.appScope, entity, action);
      }
      return false;
    };

    GridActions.prototype.callActionHandler = function callActionHandler(entity, action) {
      var handler = this.getAppScopeHandler(action.actionHandler);

      if (angular.isDefined(handler) && !this.callDisabledHandler(entity, action)) {
        handler.call(this.grid.appScope, entity, action);
      }
    };

    GridActions.prototype.callDisabledHandler = function callDisabledHandler(entity, action) {
      var handler = this.getAppScopeHandler(action.disabledHandler),
        handlerFn;
      // Force the handler into a function to handle non-function values
      handlerFn = _.isFunction(handler) ? handler : _.constant(handler || false);
      return handlerFn.call(this.grid.appScope, entity, action);
    };

    GridActions.prototype.callLinkHandler = function (entity, action) {
      if (this.callDisabledHandler(entity, action)) {
        return '';
      }
      var handler = this.getAppScopeHandler(action.linkHandler);
      var handlerFn = _.isFunction(handler) ? handler : _.constant(handler || '');
      return handlerFn.call(this.grid.appScope, entity, action);
    };

    GridActions.prototype.getAppScopeHandler = function getAppScopeHandler(handler) {
      return this.grid.appScope.$eval(handler);
    };

    this.initializeGrid = function (grid) {
      var gridActions = new GridActions(grid);
      grid.oneActions = gridActions;
      return gridActions;
    };
  }

  oneUiGridActionsController.$inject = ['$scope', '$timeout'];
  function oneUiGridActionsController($scope, $timeout) {
    var vm = this;

    vm.menuExpanded = false;
    vm.menuHiding = true;
    vm.togglePanel = togglePanel;
    vm.handleClickOutside = handleClickOutside;
    vm.closeOnScroll = closeOnScroll;

    // watch for the grid scrolling to close the menu
    var scrollWatcher = $scope.$watch('grid.isScrollingVertically', closeOnScroll);
    $scope.$on('$destroy', scrollWatcher);

    function togglePanel() {
      if (vm.menuExpanded) {
        hidePanel();
      } else {
        showPanel();
      }
    }

    function showPanel() {
      vm.menuExpanded = true;

      $timeout(function () {
        vm.menuHiding = false;
      });
    }

    function hidePanel() {
      vm.menuHiding = true;

      $timeout(function () {
        vm.menuExpanded = false;
      }, 100);
    }

    function closeOnScroll(isScrolling) {
      if (isScrolling) {
        hidePanel();
      }
    }

    function handleClickOutside() {
      if (vm.menuExpanded) {
        hidePanel();
      }
    }
  }

  oneUiGridActionsHeaderCellCtrl.$inject = ['$timeout', '$filter'];
  function oneUiGridActionsHeaderCellCtrl($timeout, $filter) {
    this.applyFilter = function (column) {
      var renderText = (column.displayName) ? column.displayName : column.name;
      if (column.headerCellFilter && column.displayName) {
        renderText = $filter(column.headerCellFilter)(column.displayName);
      } else if (column.headerCellFilter && column.name) {
        renderText = $filter(column.headerCellFilter)(column.name);
      }
      return renderText;
    };

    this.applyColumnVisibility = function (column, grid) {
      grid.api.core.notifyDataChange('column');
      grid.api.core.raise.columnVisibilityChanged(column);
    };

    this.repositionMenu = function (grid) {
      $timeout(function () {
        var $popover = grid.element.find('.settings-popover');
        $popover.insertBefore($popover.closest('.ui-grid-render-container'));
      });
    };
  }

  oneUiGridActionsPanelService.$inject = [];
  function oneUiGridActionsPanelService() {
    var self = this;

    self.setTop = function(event) {
      var cellContents = $(event.target).closest('.ui-grid-cell-contents'),
        panel = cellContents.find('.one-ui-grid-actions-panel');

      panel.css('top', cellContents.position().top);
    };

    self.getWidth = function(panel) {
      var isPanedHided = panel.hasClass('ng-hide');
      var isPanedHiding = panel.hasClass('hiding');
      var panelWidth = panel.css('visibility', 'hidden').removeClass('ng-hide hiding').outerWidth();

      panel.addClass(isPanedHided ? 'ng-hide' : '').addClass(isPanedHiding ? 'hiding' : '');
      panel.css('visibility', 'visible');

      return panelWidth;
    };

    self.setWidth = function($element) {
      var panels = $element.find('.one-ui-grid-actions-panel');

      _.forEach(panels, function (panelElement) {
        var panel = angular.element(panelElement);

        panel.css('width', self.getWidth(panel));
      });
    };
  }

  oneUiGridActionsDirective.$inject = ['oneUiGridActionsService', 'oneUiGridActionsPanelService', '$timeout'];
  function oneUiGridActionsDirective(oneUiGridActionsService, oneUiGridActionsPanelService, $timeout) {

    function preLink(scope, $elm, attr, uiGridCtrl) {
      scope.gridActions = oneUiGridActionsService.initializeGrid(uiGridCtrl.grid);
      $elm.addClass('one-ui-grid-actions');
    }

    function postLink(scope, $elm) {
      $elm.on('click.one-grid-actions-expand-menu', '.one-ui-grid-actions-toggle', oneUiGridActionsPanelService.setTop);

      $timeout(function () {
        oneUiGridActionsPanelService.setWidth($elm);
      });
    }

    return {
      replace: true,
      priority: -500,
      require: '^uiGrid',
      scope: false,
      link: {
        pre: preLink,
        post: postLink
      }
    };
  }

})();

// Source: uiGridEdit.js
(function () {

  angular.module('one.components.uiGrid')
    .directive('oneUiGridEdit', oneUiGridEditDirective)
    .directive('oneUiGridEditField', oneUiGridEditFieldDirective)
    .directive('uiGridCellContents', uiGridCellContentsDirective)
    .controller('OneUiGridEditController', OneUiGridEditController);

  oneUiGridEditDirective.$inject = [];
  function oneUiGridEditDirective() {
    return {
      restrict: 'A',
      require: '^uiGrid',
      scope: false,
      link: {
        pre: function ($scope, $elm, $attr, uiGridCtrl) {
          uiGridCtrl.grid.options.editableCellTemplate = 'uiGrid/plugins/uiGridEdit/defaultEditField.tpl.html';
        }
      }
    };
  }

  oneUiGridEditFieldDirective.$inject = ['$rootScope'];
  function oneUiGridEditFieldDirective($rootScope) {
    function link($scope, $el) {
      var parentGrid = $el.parents('.ui-grid'),
        children = $el.find('.edit-container').children();
      detachPopup($el, parentGrid);
      ensureInsideGrid($el, parentGrid);
      focusOnField(children);
      $rootScope.$broadcast('one.ui.grid.edit.popup.open', $scope);

      $scope.$on('$destroy', function () {
        // Note: since the directive is detached, it has to be manually removed
        $el.remove();
      });
    }

    function detachPopup($el, parentGrid) {
      var offset = $el.offset();
      offset.top -= 16;
      offset.left -= 5;
      $el.detach();
      $el.appendTo(parentGrid);
      $el.offset(offset);
    }

    function ensureInsideGrid($el, parentGrid) {
      var overflow = ($el.offset().left + $el.outerWidth()) - (parentGrid.offset().left + parentGrid.outerWidth());
      if (overflow > 0) {
        var offset = $el.offset();
        offset.left -= overflow;
        $el.offset(offset);
      }
    }

    function focusOnField(children) {
      if (children[0]) {
        children[0].focus();
      }
    }

    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      templateUrl: 'uiGrid/plugins/uiGridEdit/editField.tpl.html',
      link: link,
      controller: 'OneUiGridEditController as vm'
    };
  }

  uiGridCellContentsDirective.$inject = ['$q'];
  function uiGridCellContentsDirective($q) {
    function isCellEditable(column, value, scope) {
      return $q.when((function (column, value) {
        if (_.isFunction(column.isEditable)) {
          return column.isEditable(value);
        } else if (_.isFunction(column.cellEditableCondition)) {
          return column.cellEditableCondition(scope);
        } else {
          return column.enableCellEdit;
        }
      })(column, value)).then(function (value) {
        return value || $q.reject(value);
      });
    }

    function isHeaderCell(element) {
      return element.is('.ui-grid-header-cell-primary-focus,.settings-cell');
    }

    function link(scope, element) {
      if (isHeaderCell(element) || !scope.col.colDef.enableCellEdit) {
        return;
      }

      var EDITABLE_CELL_CLASS = 'one-ui-editable-cell';

      // Unsatisfying hack, because ui-grid has no way to override the default display cell
      element.wrapInner('<span class="value"></span>');

      scope.$watch(function () {
        return scope.row.entity;
      }, function (newValue) {
        isCellEditable(scope.col.colDef, newValue[scope.col.field], scope).then(function () {
          element.addClass(EDITABLE_CELL_CLASS);
        }).catch(function () {
          element.removeClass(EDITABLE_CELL_CLASS);
        });
      });
    }

    return {
      restrict: 'C',
      link: link
    };
  }

  OneUiGridEditController.$inject = ['$scope', '$q', '$timeout', 'uiGridEditConstants'];
  function OneUiGridEditController($scope, $q, $timeout, uiGridEditConstants) {
    var vm = this;
    var colDef = _.get($scope, '$parent.col.colDef', {});
    var entity = _.get($scope, '$parent.row.entity', {});

    vm.isValid = true;

    vm.cancel = function () {
      // ui-grid will trigger a new digest cycle manually
      // that's why $timeout is necessary
      $timeout(function () {
        $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
      });
    };

    vm.save = function () {
      // (same as above)
      $timeout(function () {
        $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
      });
    };

    vm.validate = function (value) {
      $q.when(colDef.validate(value, entity))
        .then(function (valid) {
          if (valid === true) {
            vm.isValid = true;
          } else {
            return $q.reject(valid);
          }
        })
        .catch(function (message) {
          vm.isValid = false;
          vm.validationMessage = message;
        });
    };

    if (angular.isDefined(colDef.validate)) {
      $scope.$watch(function () {
        return _.get(entity, colDef.name);
      }, vm.validate, true);
    }

    $scope.$on('one.ui.grid.edit.popup.open', function (event, scope) {
      if (scope !== $scope) {
        vm.cancel();
      }
    });
  }

})();

// Source: uiGridSaveRow.js
(function () {
angular.module('one.components.uiGrid')
    .service('oneUiGridSaveRowService', oneUiGridSaveRowService)
    .directive('oneUiGridSaveRow', oneUiGridSaveRow)
    .directive('uiGridViewport', uiGridViewport);

  oneUiGridSaveRowService.$inject = [];
  function oneUiGridSaveRowService() {
    this.initializeGrid = function ($scope, grid) {
      var savePromise;
      var self = this;

      var methods = {
        saveRow: {
          disableRowUntil: function (entity, promise) {
            var row = grid.getRow(entity);
            var enableCellEdit = row.enableCellEdit;
            row.enableCellEdit = false;
            row.isSaving = true;

            return promise.finally(function () {
              row.isSaving = false;
              row.enableCellEdit = enableCellEdit;
            });
          },

          setSavePromise: function (promise) {
            savePromise = promise;
          }
        }
      };

      grid.api.registerMethodsFromObject(methods);

      grid.api.core.on.renderingComplete($scope, function () {
        grid.api.edit.on.afterCellEdit($scope, self.afterCellEdit(grid, savePromise));
      });
    };

    this.afterCellEdit = function (grid, savePromise) {
      return function (entity, colDef, newValue, oldValue) {
        var promise = savePromise(entity, colDef, newValue, oldValue);

        if (promise) {
          grid.api.saveRow.disableRowUntil(entity, promise);
        }
      };
    };
  }

  oneUiGridSaveRow.$inject = ['oneUiGridSaveRowService'];
  function oneUiGridSaveRow(oneUiGridSaveRowService) {
    return {
      restrict: 'A',
      require: '^uiGrid',
      scope: false,
      link: {
        pre: function ($scope, elem, attr, uiGridCtrl) {
          oneUiGridSaveRowService.initializeGrid($scope, uiGridCtrl.grid);
        }
      }
    };
  }

  uiGridViewport.$inject = [];
  function uiGridViewport() {
    return {
      priority: -200, // run after default  directive
      scope: false,
      compile: function ($elm) {
        var rowRepeatDiv = angular.element($elm.children().children()[0]);

        var existingNgClass = rowRepeatDiv.attr('ng-class');
        var newNgClass = '';
        if (existingNgClass) {
          newNgClass = existingNgClass.slice(0, -1) + ', \'one-ui-grid-row-saving\': row.isSaving}';
        } else {
          newNgClass = '{\'one-ui-grid-row-saving\': row.isSaving}';
        }
        rowRepeatDiv.attr('ng-class', newNgClass);

        return {
          pre: _.noop,
          post: _.noop
        };
      }
    };
  }
})();

// Source: uiGridStyling.js
(function () {
  angular.module('one.components.uiGrid')
    .service('oneUiGridStylingService', ['$timeout', '$window',
        function ($timeout, $window) {
          var service = {
            /**
             * @name initializeGrid
             * @description Attaches the service to grid creation
             * @param {Grid} grid The grid we want to work with
             */
            initializeGrid: function ($scope, $elm, grid) {
              service.defaultGridOptions(grid.options);
              $timeout(function () {
                service.addPinnedColumnsShadow($scope, $elm);
              });
            },

            /**
             * @name defaultGridOptions
             * @description initializes default gridOptions required for this plugin
             * @param {gridOptions} gridOptions for the grid that we are working with
             */
            defaultGridOptions: function (gridOptions) {
              if (angular.isUndefined(gridOptions.paginationPageSize)) {
                gridOptions.paginationPageSize = 15;
              }
              if (angular.isUndefined(gridOptions.paginationPageSizes)) {
                gridOptions.paginationPageSizes = [15, 50, 100];
              }
              gridOptions.paginationTemplate = 'uiGrid/plugins/uiGridStyling/pagination.tpl.html';
            },

            toggleShadowClasses: function (contentsWrapper, leftShadow, rightShadow) {
              contentsWrapper.toggleClass('left-shadow', leftShadow);
              contentsWrapper.toggleClass('right-shadow', rightShadow);
            },

            hasScroll: function (gridViewport) {
              return gridViewport[0] && gridViewport[0].scrollWidth !== gridViewport.width();
            },

            checkShadow: function (gridViewport, contentsWrapper) {
              if (service.hasScroll(gridViewport)) {
                var scrollLeft = gridViewport.scrollLeft(),
                  rightScrollPosition = gridViewport[0].scrollWidth - gridViewport.width();
                service.toggleShadowClasses(contentsWrapper, !!scrollLeft, scrollLeft !== rightScrollPosition);
              } else {
                service.toggleShadowClasses(contentsWrapper, false, false);
              }
            },

            addPinnedColumnsShadow: function ($scope, $elm) {
              var contentsWrapper = $elm.find('.ui-grid-contents-wrapper'),
                gridViewport = contentsWrapper.find('.ui-grid-render-container-body .ui-grid-viewport');

              var checkShadow = function () {
                service.checkShadow(gridViewport, contentsWrapper);
              };

              var window = angular.element($window);
              window.on('resize', _.debounce(checkShadow, 250));
              gridViewport.on('scroll', checkShadow);
              $timeout(checkShadow);

              $scope.$on('$destroy', function () {
                window.off('resize', checkShadow);
                gridViewport.off('scroll', checkShadow);
              });
            }
          };

          return service;
        }
      ]
    )
    .controller('oneUiGridStylingController', [function () {
      this.isScrollbarAtTopOrBottom = function (element) {
        var diff = (element.scrollHeight - element.offsetHeight) - element.scrollTop;
        var check = false;
        // sometimes diff is 1 even though scrolling is at bottom due to the same bug
        // that is described in link pre function in oneUiGridStyling directive
        if (diff <= 1 || element.scrollTop === 0) {
          check = true;
        }
        return check;
      };
    }])
    .directive('oneUiGridStyling', [
      '$timeout',
      'oneUiGridStylingService',
      function ($timeout, oneUiGridStylingService) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        controller: 'oneUiGridStylingController',
        controllerAs: 'oneUiStyleCtrl',
        link: {
          pre: function ($scope, $elm, $attr, uiGridCtrl) {
            oneUiGridStylingService.initializeGrid($scope, $elm, uiGridCtrl.grid);
            $elm.addClass('one-ui-grid');
            //TODO: there is a scrolling bug in ui-grid that causes grid and document
            // to scroll at the same time, it cause annoyance for user.
            // so until that bug is resolved, we putting in our own workaround.
            $timeout(function () {
              var $element = angular.element('.ui-grid-pinned-container-right .ui-grid-viewport');

              function onScroll(event) {
                if (!$scope.oneUiStyleCtrl.isScrollbarAtTopOrBottom($element)) {
                  event.stopPropagation();
                  event.preventDefault();
                }
              }

              $element.on('mousewheel DOMMouseScroll scroll', onScroll);
              $scope.$on('$destroy', function () {
                $element.off('mousewheel DOMMouseScroll scroll', onScroll);
              });
            });
          }
        }
      };
    }])

  /**
   * @ngdoc directive
   * @name oneUiGridUnlimited - renamed to default styling name oneUiGridStyling
   * @module ui.grid.unlimited
   * @description directive to be used with ui-grid to add adaptable grid height
   */
    .directive('oneUiGridStyling', oneUiGridUnlimited);

  oneUiGridUnlimited.$inject = ['gridUtil', '$window'];
  function oneUiGridUnlimited(gridUtil, $window) {
    // ui.grid uses a few priority levels, to override build-in height limitation priority has to be greather than 6
    var stylePriority = 10;
    return {
      require: 'uiGrid',
      priority: -1,
      link: function (scope, element, attrs, gridCtrl) {
        if (_.get(gridCtrl, 'grid.options.oneUiGridStyling.unlimitedGrid')) {
          var minHeight = _.get(gridCtrl, 'grid.options.oneUiGridStyling.viewportMinHeight'),
          minHeightStyle = minHeight ? '; min-height: ' + minHeight : '';
          gridCtrl.grid.options.virtualizationThreshold = Number.MAX_SAFE_INTEGER;
          gridCtrl.grid.registerStyleComputation(
            {
              priority: stylePriority,
              func: function () {
                return '\n .grid' + gridCtrl.grid.id +
                  ' .ui-grid-render-container-body .ui-grid-viewport { height: auto' + minHeightStyle + ';}' +
                  '\n .grid' + gridCtrl.grid.id +
                  '.ui-grid.one-ui-grid .one-uigrid-pagination-container { margin-top: 0}';
              }
            });
          scope.$watch(function () {
            return gridUtil.elementHeight(element);
          }, _.debounce(function () {
            element.css('height', 'auto');
            //due to possible error in handleWindowResize() public API method we have to invoke internal handler
            angular.element($window).resize();
          }, 250));
        }
      }
    };
  }
})();

// Source: uiGridSummary.js
(function () {
  angular.module('one.components.uiGrid')
    .directive('oneUiGridSummary', oneUiGridSummary);

  oneUiGridSummary.$inject = ['$q', '$templateCache', '$timeout'];
  function oneUiGridSummary($q, $templateCache, $timeout) {

    function registerSummaryUpdateEvents(grid) {
      grid.api.core.on.rowsRendered(null, function (event) {
        var gridData = event.grid.options.data;
        var columnDefs = event.grid.options.columnDefs;
        _.set(event.grid.options, 'summary.data', {});
        _.each(columnDefs || [], function (columnDef) {
          if (columnDef.summarize) {
            $q.when(columnDef.summarize(gridData)).then(function (summary) {
              event.grid.options.summary.data[columnDef.name] = summary;
            });
          }
        });
      });
    }

    function syncSummaryHorizontalScroll($elm, grid) {
      var $header = $elm.find('.ui-grid-render-container-body .ui-grid-header-viewport');
      var _callback = grid.horizontalScrollSyncCallBackFns.bodyheader;
      grid.addHorizontalScrollSync('bodyheader', function (scrollEvent) {
        _callback(scrollEvent);
        // The summary row can be shown/hidden at any time. We cannot cache this selector.
        $elm.find('.ui-grid-render-container-body .one-ui-grid-summary-header .ui-grid-header-viewport')
          .scrollLeft($header.scrollLeft());
      });
    }

    return {
      restrict: 'A',
      require: '^uiGrid',
      scope: false,
      link: {
        pre: function ($scope, $elm, $attr, uiGridCtrl) {
          var defaultTemplate = $templateCache.get('ui-grid/ui-grid-header');
          var uiGridSummaryTemplate = $templateCache.get('uiGrid/plugins/uiGridSummary/uiGridSummary.tpl.html');
          uiGridCtrl.grid.options.headerTemplate = defaultTemplate + uiGridSummaryTemplate;
          uiGridCtrl.grid.options.scrollDebounce = 0;
          uiGridCtrl.grid.options.summary = _.defaults(uiGridCtrl.grid.options.summary, {
            minimumRowCount: 0
          });

          uiGridCtrl.grid.renderContainers.body.registerViewportAdjuster(function (adjustment) {
            adjustment.height = -$elm.find('.one-ui-grid-summary-header').height();
            return adjustment;
          });

          $timeout(function () {
            syncSummaryHorizontalScroll($elm, uiGridCtrl.grid);
          });

          registerSummaryUpdateEvents(uiGridCtrl.grid);
        }
      }
    };
  }
})();

})(window, document);
