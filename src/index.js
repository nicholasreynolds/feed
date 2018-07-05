import angular from 'angular';

import 'angular-ui-router';
import routesConfig from './routes';

import './index.less';

angular
  .module('app', ['ui.router'])
  .config(routesConfig)
  .controller('FeedController', function ($http, $log) {
    const vm = this;
    $http.get('/app/cities.list.json').then(res => {
      vm.cities = res.data; // list of cities available for openweathermap api
    });
    vm.currCityIndex = 0; // the current index of json object in cities list
    vm.apiKey = '9856613742166978ba4d7485e22d22b8';
    vm.lastCall = 0;
    vm.loadResults = function () {
      const currTime = new Date().getSeconds();
      if (currTime - vm.lastCall > 1) { // free openweather api only allows 1 call/second
        $http.get('https://api.openweathermap.org/data/2.5/weather?id=' + vm.cities[vm.currCityIndex] + '&APPID=' + vm.apiKey).then(res => {
          vm.lastCall = new Date().getSeconds();
          $log.debug(res.data);
        });
      } else {
        $log.debug('Cannot make more than 1 call/second');
      }
    };
  });
