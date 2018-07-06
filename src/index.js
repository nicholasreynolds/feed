import angular from 'angular';

import './index.less';

angular
  .module('app', ['ngResource'])
  .factory('appSharedService', ['$http', '$q', '$resource', function ($http, $q, $resource) {
    return {
      get(url) {
        const deferred = $q.defer();
        $http
          .get(url)
          .then(data => deferred.resolve(data), data => deferred.reject(data));
        return deferred.promise;
      },
      res(uri) {
        return $resource(uri);
      }
    };
  }])
  .controller('FeedController', ['$log', '$filter', 'appSharedService', function ($log, $filter, appSharedService) {
    const vm = this;
    vm.cities = appSharedService.res('city.list.json').query(); // list of cities available for openweathermap api
    vm.currCityIndex = 0; // the current index of json object in cities list
    vm.apiKey = '9856613742166978ba4d7485e22d22b8';
    vm.lastCall = 0;
    vm.entries = [];
    vm.loadResults = function () {
      const currTime = new Date().getSeconds();
      if (currTime - vm.lastCall > 1) { // free openweather api only allows 1 call/second.
        appSharedService
          .get('https://api.openweathermap.org/data/2.5/weather?id=' + vm.cities[vm.currCityIndex].id + '&APPID=' + vm.apiKey)
          .then(data => {
            vm.lastCall = new Date().getSeconds();
            vm.entries.push(toActivity(data, $filter)); // entries list populates index.html table
            vm.currCityIndex++;
          });
      } else {
        $log.debug('Cannot make more than 1 call/second');
      }
    };
  }]);

// transforms an openweather object to an aggie feed activity
const toActivity = function (weatherObj, $filter) {
  return {
    activity: {
      icon: 'icon-globe',
      actor: {
        id: 'department identifier',
        objectType: 'person',
        displayName: 'IET',
        author: {
          id: 'nkreynolds',
          displayName: 'Nicholas Reynolds'
        }
      },
      verb: 'post',
      title: weatherObj.data.name,
      object: {
        ucdSrcId: 'content identifier',
        objectType: 'notification',
        content: '' + weatherObj.data.name + '  ' +
                  String($filter('number')(weatherObj.data.main.temp - 273.15, 2)) + ' C  ' +
                  weatherObj.data.weather[0].main,
        ucdEdusModel: {}
      },
      to: [
        {
          id: 'public',
          g: true,
          i: false
        }
      ],
      ucdEdusMeta: {
        labels: ['~student-life']
      }
    }
  };
};
