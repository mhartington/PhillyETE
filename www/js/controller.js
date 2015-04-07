angular.module('phillyete.controllers', [])

.directive('input', function($timeout) {
  return {
    restrict: 'E',
    link: function(scope, element, attr) {
      element.bind('keydown', function(e) {
        if (e.which == 13) {
          setTimeout(function() {
            element[0].blur();
            cordova.plugins.Keyboard.close();
          });
        }
      });
    }
  };
})

.controller('SessionsCtrl', function($scope, AppData, $ionicLoading, $ionicScrollDelegate) {
  $scope.sessions = [];
  $ionicLoading.show({
    template: '<ion-spinner class="spinner-light"></ion-spinner>',
    noBackdrop: true
  });

  AppData.allSessions().then(function(data) {
    $scope.sessions = data;
    $ionicLoading.hide();
  }, function(err) {
    $ionicLoading.hide();
  });
  $scope.resize = function() {
    $ionicScrollDelegate.resize();
  };
  $scope.clearSearch = function() {
    $scope.searchSessions = '';
    cordova.plugins.Keyboard.close();
  };

})

.controller('SessionCtrl', function($scope, AppData, $stateParams) {
  AppData.allSessions().then(function() {
    $scope.session = AppData.getSession($stateParams.sessionId);
  });


  $scope.share = function(session) {
    // Message var that grabs the session title and speaker info
    var message = "Attending " + session.name + ". #PhillyETE";

    // Variables that we pass into the camera api
    var options = {
      quality: 100,
      saveToPhotoAlbum: true
    };
    //Lets call the camper api
    $cordovaCamera.getPicture(options).then(function(imageURI) {
      //create a photo var that will grab the image data
      //from the imageURI create by camera plugin
      var photo = imageURI;

      //Lets share that via social sharing plugin
      $cordovaSocialSharing
      //Share via twitter, and pass in the message & photo
        .shareViaTwitter(message, photo)
        .then(function(result) {
          // Success!
          console.log("Success!");
          //Write to console if everything worked
        }, function(err) {
          //If for some reason the app doesn work,
          //Show an alert to inform the user
          alert("Ruh-roh, looks like something went wrong :(");
        });
      //End Social sharing code

    }, function(err) {
      //If there's an error with the camera, lets log that error
      console.log(err);
      alert("Something went wrong, please try again");
    });
  };
})

.controller('SpeakersCtrl', function($scope, AppData, $ionicLoading, $ionicScrollDelegate) {
  $scope.speakers = [];
  $ionicLoading.show({
    template: '<ion-spinner class="spinner-light"></ion-spinner>',
    noBackdrop: true
  });
  AppData.allSpeakers().then(function(data) {
    $scope.speakers = data;
    $ionicLoading.hide();
  });

  $scope.resize = function() {
    $ionicScrollDelegate.resize();
  };
  $scope.clearSearch = function() {
    $scope.searchSessions = '';
    cordova.plugins.Keyboard.close();

  };
})

.controller('SpeakerCtrl', function($scope, AppData, $stateParams) {
  AppData.allSpeakers().then(function(data) {
    $scope.speaker = AppData.getSpeaker($stateParams.speakerId);
  });
})

.controller('WindowCtrl', function($scope) {
  $scope.place = {};
  $scope.showPlaceDetails = function(param) {
    $scope.place = param;
  };
})


.controller("MapCtrl", function($scope, $timeout, $log, $http, uiGmapGoogleMapApi, $cordovaGeolocation, $ionicLoading) {

  $ionicLoading.show({
    template: '<ion-spinner class="spinner-light"></ion-spinner>',
    noBackdrop: true
  });


  uiGmapGoogleMapApi.then(function(maps) {
    maps.visualRefresh = true;
    $scope.defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(40.82148, -73.66450),
      new google.maps.LatLng(40.66541, -74.31715)
    );


    $scope.map.bounds = {
      northeast: {
        latitude: $scope.defaultBounds.getNorthEast().lat(),
        longitude: $scope.defaultBounds.getNorthEast().lng()
      },
      southwest: {
        latitude: $scope.defaultBounds.getSouthWest().lat(),
        longitude: -$scope.defaultBounds.getSouthWest().lng()

      }
    };
    $scope.searchbox.options.bounds = new google.maps.LatLngBounds($scope.defaultBounds.getNorthEast(), $scope.defaultBounds.getSouthWest());
  });
  var posOptions = {
    timeout: 10000,
    enableHighAccuracy: false
  };
  $cordovaGeolocation.getCurrentPosition(posOptions)
    .then(function(pos) {
      $ionicLoading.hide();
      $scope.center = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      };
    }, function(err) {
      $scope.center = {
        latitude: 43.07493,
        longitude: -89.381388
      };

    });

  $scope.selected = {
      options: {
        visible: false

      },
      templateurl: 'templates/window.html',
      templateparameter: {}
    },
    $scope.map = {
      control: {},
      zoom: 12,
      dragging: false,
      bounds: {},
      markers: [],
      idkey: 'place_id',
      events: {
        idle: function(map) {},
        dragend: function(map) {
          var bounds = map.getBounds();
          var ne = bounds.getNorthEast();
          var sw = bounds.getSouthWest();
          $scope.searchbox.options.bounds = new google.maps.LatLngBounds(sw, ne);
          $scope.searchbox.options.visible = true;
        }
      }
    },
    $scope.searchbox = {
      template: 'templates/searchbox.html',

      options: {
        bounds: {}
      },
      parentdiv: 'searchBoxParent',
      events: {
        places_changed: function(searchBox) {

          places = searchBox.getPlaces();

          if (places.length === 0) {
            return;
          }
          // For each place, get the icon, place name, and location.
          newMarkers = [];
          var bounds = new google.maps.LatLngBounds();
          for (var i = 0, place; place = places[i]; i++) {
            // Create a marker for each place.
            var marker = {
              id: i,
              place_id: place.place_id,
              name: place.name,
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
              options: {
                visible: false
              },
              templateurl: 'templates/window.html',
              templateparameter: place
            };
            newMarkers.push(marker);
            bounds.extend(place.geometry.location);
          }
          $scope.map.bounds = {
            northeast: {
              latitude: bounds.getNorthEast().lat(),
              longitude: bounds.getNorthEast().lng()
            },
            southwest: {
              latitude: bounds.getSouthWest().lat(),
              longitude: bounds.getSouthWest().lng()
            }
          };

          _.each(newMarkers, function(marker) {
            marker.closeClick = function() {
              $scope.selected.options.visible = false;
              marker.options.visble = false;
              return $scope.$apply();
            };
            marker.onClicked = function() {
              $scope.selected.options.visible = false;
              $scope.selected = marker;
              $scope.selected.options.visible = true;
            };
          });

          $scope.map.markers = newMarkers;
        }
      }
    };

});
