angular.module('app', ['angular-dayparts',
                       'collapse',
                       'ngAnimate',
                       'mgcrea.ngStrap',
                       'mgcrea.ngStrap.tooltip'])
  .controller('MainCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {

    const businessHours = ["monday-9", "monday-10", "monday-11", "monday-12", "monday-13", "monday-14", "monday-15", "monday-16", "tuesday-9", "tuesday-10", "tuesday-11", "tuesday-12", "tuesday-13", "tuesday-14", "tuesday-15", "tuesday-16", "wednesday-9", "wednesday-10", "wednesday-11", "wednesday-12", "wednesday-13", "wednesday-14", "wednesday-15", "wednesday-16", "thursday-9", "thursday-10", "thursday-11", "thursday-12", "thursday-13", "thursday-14", "thursday-15", "thursday-16", "friday-9", "friday-10", "friday-11", "friday-12", "friday-13", "friday-14", "friday-15", "friday-16"] 

    const eveningHours = ["monday-18", "monday-19", "monday-20", "monday-21", "monday-22", "monday-23", "tuesday-18", "tuesday-19", "tuesday-20", "tuesday-21", "tuesday-22", "tuesday-23", "wednesday-18", "wednesday-19", "wednesday-20", "wednesday-21", "wednesday-22", "wednesday-23", "thursday-18", "thursday-19", "thursday-20", "thursday-21", "thursday-22", "thursday-23", "friday-18", "friday-19", "friday-20", "friday-21", "friday-22", "friday-23", "saturday-18", "saturday-19", "saturday-20", "saturday-21", "saturday-22", "saturday-23", "sunday-18", "sunday-19", "sunday-20", "sunday-21", "sunday-22", "sunday-23"]

    $scope.preset = function (preset) {
      if (preset === 'weekend') {
        $rootScope.$broadcast('preset', {name: 'saturday', position: 6}, {name: 'sunday', position: 7});
      } else if (preset === 'week') {
        $rootScope.$broadcast('preset', {name: 'monday', position: 1}, {name: 'tuesday', position: 2}, {name: 'wednesday', position: 3}, {name: 'thursday', position: 4}, {name: 'friday', position: 5});
      } else if (preset === 'businessHours') {
        $rootScope.$broadcast('preset', businessHours);
      }
    }

    $scope.businessHoursPreset = function (preset) {
      $rootScope.$broadcast('businessHours', businessHours);
    }

    $scope.eveningHoursPreset = function (preset) {
      $rootScope.$broadcast('eveningHours', eveningHours);
    }

    $scope.customPreset = function (preset) {
      $rootScope.$broadcast('custom');
    }

    var createDay = (day) => {
      var days = [];
      for (var i = 0; i <= 23; i++) {
        days.push(day);
      };
      return days;
    }

    const monday = createDay('monday').map((day, i) => {
      return `${day}-${i}`;
    })

    const tuesday = createDay('tuesday').map((day, i) => {
      return `${day}-${i}`;
    })

    const wednesday = createDay('wednesday').map((day, i) => {
      return `${day}-${i}`;
    })

    const thursday = createDay('thursday').map((day, i) => {
      return `${day}-${i}`;
    })

    const friday = createDay('friday').map((day, i) => {
      return `${day}-${i}`;
    })

    const saturday = createDay('saturday').map((day, i) => {
      return `${day}-${i}`;
    })

    const sunday = createDay('sunday').map((day, i) => {
      return `${day}-${i}`;
    })

    const week = monday.concat(tuesday, wednesday, thursday, friday, saturday, sunday);

    const days = moment.weekdays().map((day, i) => {
      return { name: day, position: i + 1 };
    })

    $scope.options = {
      reset: false,
      onChange: function(selected) {
          console.log('selected: ', selected)
      },
      days: days,
      selected: week,
      disableRowSelection: false,
      disableColumnSelection: false
    }

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
  angular.bootstrap(document, ['app'])
})
