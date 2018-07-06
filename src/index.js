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
  .controller('FeedController', ['$log', 'appSharedService', function ($log, appSharedService) {
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
            vm.entries.push(data); // entries list populates index.html table
            vm.currCityIndex++;
          });
      } else {
        $log.debug('Cannot make more than 1 call/second');
      }
    };
  }]);
