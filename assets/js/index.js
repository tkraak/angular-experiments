angular.module('dayparts', ['angular-dayparts',
                            'ngAnimate',
                            'mgcrea.ngStrap',
                            'mgcrea.ngStrap.tooltip'])
  .controller('MainCtrl', ['$scope', function($scope) {

    $scope.options = {

    reset: true,

    onChange: function(selected) {
        console.log('selected: ', selected)
    },

    selected: ['monday-14', 'monday-15'],

    disableRowSelection: false,

    disableColumnSelection: false
    },

    $scope.tooltip = {
      title: 'Click and drag to select multiple hours.',
      checked: false
    }

  }])

  .config(function($tooltipProvider) {
    angular.extend($tooltipProvider.defaults, {
      animation: 'am-flip-x',
      placement: 'right',
      trigger: 'hover'
    })
  })

angular.element(document).ready(function() {
  angular.bootstrap(document, ['dayparts'])
})
