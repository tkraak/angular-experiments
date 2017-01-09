angular.module('collapse', [])
  .directive('collapse', [function () {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: { title: '@'},
      templateUrl: '../vendor/collapse.html',
      controller: function ($scope, $element) {
        $scope.open = false;
        return $scope.toggle = function () {
          console.log($scope)
          return $scope.open = !$scope.open;
        };
      }
    }
  }]);
