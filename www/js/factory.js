// Lets create a module that we can inject into our app.js
angular.module('phillyete.factory', [])
  // Then lets create a factory and inject  the $http service
  .factory('AppData', function($http) {
    // create an empty array
    var sessions = [];
    var speakers = [];
    return {
      allSessions: function() {
        return $http.get('js/data.json').then(function(responce) {
          sessions = responce.data.sessions;
          return sessions;
        });
      },
      getSession: function(sessionId) {
        for (i = 0; i < sessions.length; i++) {
          if (sessions[i].id == parseInt(sessionId)) {
            return sessions[i];
          }
        }
        return null;
      },
      allSpeakers: function() {
        return $http.get('js/data.json').then(function(responce) {
          speakers = responce.data.speakers
          return speakers;
        });
      },
      getSpeaker: function(speakerId) {
        for (i = 0; i < speakers.length; i++) {
          if (speakers[i].id == parseInt(speakerId)) {
            return speakers[i];
          }
        }
        return null;
      }
    };
  });
