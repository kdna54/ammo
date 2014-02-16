angular.module('ammoApp')

  /* 
  ========== SearchService ==========
  Search Service is divided by services functions (youtube, soundcloud) 

  Params: 
    userInput
      - whatever the user typed on the search box, used to create the url used in the ‘GET’ request
  Return:
    none.
    async GET returns an argument with a set of properties. See var song for reference.

  */
  .service('SearchService', function($http, QueueService) {
    this.searchResults = []; // store search results

    var that = this; //reference to service object

    this.youtube = function(userInput){

      // emptying searchResults. Cannot assign empty array because controller/view will lose reference
      this.searchResults = []; //.splice(0, this.searchResults.length); // store search results

      var limit = 5;
      
      $http({ method: 'GET', url: 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=' + limit + '&q=' + userInput + '&type=video&videoCategoryId=10&key=AIzaSyCsNh0OdWpESmiBBlzjpMjvbrMyKTFFFe8' })
      .then(function(results) {
        results.data.items.forEach(function(video) { 
          var service_id = video.id.videoId; // We need this here because we are using the service_id to generate the url

          var song = {
            title: video.snippet.title,
            service: "youtube",
            serviceId: service_id,
            url: "http://youtu.be/" + service_id,
            image: video.snippet.thumbnails.high.url
          };

          $http({ method: 'GET', url: 'https://www.googleapis.com/youtube/v3/videos?id=' + service_id + '&part=contentDetails&key=AIzaSyCsNh0OdWpESmiBBlzjpMjvbrMyKTFFFe8'})
          .then(function(newResults) {
            var duration = newResults.data.items[0].contentDetails.duration;
            // var array = duration.match(/(\d+)(?=[MHS])/ig)||[]; 
            var hours = duration.match(/(\d+)(?=[H])/ig)||[0]; 
            var minutes = duration.match(/(\d+)(?=[M])/ig)||[0]; 
            var seconds = duration.match(/(\d+)(?=[S])/ig)||[0]; 

            song.duration = (parseInt(hours) * 60 * 60) + parseInt(minutes) * 60 + parseInt(seconds);

            that.searchResults.push(song);

          });
        });
      });
    };


    this.soundcloud = function(userInput) {
      //limit: number of results to return
      var limit = 3;

      //clientId for soundcloud api authorization
      var clientId = "456165005356d6638c4eabfc515d11aa";

      //searchUrl: get request url for query
      //"q" is the search query
      var searchUrl = "http://api.soundcloud.com/tracks?";
      searchUrl = searchUrl + "q=" + userInput + "&limit=" + limit + "&client_id=" + clientId + "&format=json";
      $http.get(searchUrl).
        success(function(data, status, headers, config) {
          //add each returned track title to each list
          data.forEach(function(track) {
            if (track.streamable) { //*******if not streamable will throw error
              //relevant data for each song
              var song = {
                url: track.uri,
                service: 'soundcloud',
                serviceId: track.id,
                title: track.title,
                artist: track.user.username,
                image: track.artwork_url,
                duration: Math.floor(track.duration/1000)
              };
              that.searchResults.push(song);
            }
          });
        }).
        error(function(data, status, headers, config) {
          console.log('failed query');
        }); 
    };
  });