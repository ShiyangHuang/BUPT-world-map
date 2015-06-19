    var mapApp = angular.module('mapComponentsApp', ['ngLoadingSpinner', 'ui.gravatar']);

    mapApp.directive('sayWhere', function ($compile) {
      return {
        controller: function ($scope, $http) {
          var map;
          var serverURL = "http://54.191.226.150:3001/api/products";
          var postURL = "http://54.191.226.150:3001/api/products";
          //注册地图
          this.registerMap = function (myMap) {
            var center = myMap.getCenter(),
              latitude = center.lat(),
              longitude = center.lng();

            map = myMap;
            $scope.map = map;
            $scope.latitude = latitude;
            $scope.longitude = longitude;
            $scope.userinfo = {"username":"","email":"","lat":0,"lng":0};
          };

          $scope.infoWindows = [];
          $scope.showAll = function() {
            return $scope.ifShowAll;
          }

          var ifShowForm = false;

          $scope.showForm = function () {
            ifShowForm = !ifShowForm;
          };

          $scope.hasFrom = function() {
            return ifShowForm;
          };

          $scope.closeForm = function() {
            ifShowForm = false;
          };
          
          $scope.deleteMe = function () {
              var id = 0;
              for (i in $scope.items) {
                if ($scope.items[i].email == $scope.userinfo.email) {
                  id = $scope.items[i]._id;
                  console.log(id);
                }
              }
               $http.delete(postURL + "/" + id).success(function(data) {
                console.log("success");
              }).error(function(err) {
                console.log(err);
              });
          };

          $scope.submit = function () {
            if ($scope.userinfo.username == "" || $scope.userinfo.email == "") return;
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(function (position) {
                var c = position.coords;
                $scope.mylocation = c;
                $scope.userinfo.lat = c.latitude + Math.random() / 100;;
                $scope.userinfo.lng = c.longitude + Math.random() / 100;;
                console.log($scope.userinfo);
                $http.post(postURL,$scope.userinfo).success(function(data) {
                  console.log("success");
                }).error(function(err) {
                  console.log(err);
                  if (err.name == "MongoError") {
                    var id = 0;
                    for (i in $scope.items) {
                      if ($scope.items[i].email == $scope.userinfo.email) {
                        id = $scope.items[i]._id;
                        console.log(id);
                      }
                    }
                    $http.put(postURL + "/" + id,$scope.userinfo).success(function(data) {
                      console.log("success");
                    }).error(function(err) {
                      console.log(err);
                    });
                  }
                });  
              });
            }
            $scope.getMarkers();
          };

          $scope.items = [];

          $scope.infowindows = function() {
            google.maps.event.addListener($scope.myLocationMarker, 'click', function () {
                infoWindowService.setData(todoId, marker.getTitle(), marker.get("desc"));
                infoWindowService.open($scope.myLocationMarker);
                var infoWindow;
                this.data = {};
                  this.data.id = 1;
                  this.data.title = $scope.myLocationMarker.title;
                infowindow.open(map, $scope.myLocationMarker);
            });
          }

          $scope.markers = [];

          $scope.addAll = function () {
            $scope.ifShowAll = !$scope.ifShowAll;
            $scope.countItems = 0;
            for(var i in $scope.items) {
              //console.log(i);
              $scope.countItems++;
              $scope.addMoreMarkers($scope.items[i].username, $scope.items[i].email, $scope.items[i].lat, $scope.items[i].lng);
            }
            //console.log($scope.markers);
          };
          
          $scope.removeAll = function () {
            $scope.ifShowAll = !$scope.ifShowAll;
            for(var i in $scope.markers) {
              $scope.markers[i].setMap(null);
            }
          };

          $scope.addMoreMarkers = function(name, email, lat, lon ){
              lat -= Math.random() / 100;
              lon -= Math.random() / 100;
              editSignImage = new google.maps.MarkerImage("byr.png",
                new google.maps.Size(40, 42),
                new google.maps.Point(0,0),
                new google.maps.Point(0, 20),
                new google.maps.Size(20, 21));
              var marker = new google.maps.Marker({
                map: map,
                title: 'text',
                //icon: editSignImage,
                position: new google.maps.LatLng(lat, lon)
              })
              $scope.markers.push(marker);
              $scope.addInfoWindow(name, email, marker);
          };
          
          $scope.addInfoWindow = function (name, email, marker) {
            var contentString = '<div class="popwindow">' + 
                                    '<img class="avatar" gravatar-src="\''+ email + '\'" gravatar-size="40">' + 
                                    '<p class="poptext">' + name + '</p></br>' +
                                    //'<p class="poptext">' + email.substr(email.firstIndexOf("@")) + '</p>' +
                                '</div>';

            var compiled = $compile(contentString)($scope);

            var infowindow = new google.maps.InfoWindow({
                content: compiled[0]
            });
            $scope.infoWindows.push(infowindow);
            google.maps.event.addListener(marker, 'click', function() {
                for (i in $scope.infoWindows) {
                  $scope.infoWindows[i].close();
                }
                infowindow.open($scope.map,marker);
            });
          };

          $scope.refreshMarkers = function() {
            $scope.removeAll();
            $scope.addAll();
          }

          $scope.getMarkers = function() {
              $http.get(serverURL).success(function (data) {
                  //alert(data);
                  $scope.items = data;
                  $scope.refreshMarkers();
              }).error(function(err) {
                  console.log(err);
              });
          };

          //复位地图markers
          $scope.resetMapMarkers = function() {
            $scope.myLocationMarker.setMap(null);
          };

          $scope.$watch('latitude + longitude', function (newValue, oldValue) {
            if (newValue !== oldValue) { 
              var center = map.getCenter(),
                latitude = center.lat(),
                longitude = center.lng();
              if ($scope.latitude !== latitude || $scope.longitude !== longitude)
                map.setCenter(new google.maps.LatLng($scope.latitude, $scope.longitude));
            }
            
          });
        },
        link: function (scope, elem, attrs, ctrl) {
          var mapOptions,
            latitude = attrs.latitude,
            longitude = attrs.longitude,
            controlTemplate,
            controlButton,
            controlElem,
            infowindow,
            intervalId,
            map;

          // parsing latLong or setting default location
          latitude = latitude && parseFloat(latitude, 10) || 40.6966409;
          longitude = longitude && parseFloat(longitude, 10) || -73.919108;

          mapOptions = {
            zoom: 4,
            disableDefaultUI: true,
            center: new google.maps.LatLng(latitude, longitude),
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          ctrl.autofreshon = false;
          map = new google.maps.Map(elem[0], mapOptions);

          ctrl.registerMap(map);
          //ctrl.registerInfoWindow(infowindow);
          controlTemplate = document.getElementById('whereControl').innerHTML.trim();
          controlElem = $compile(controlTemplate)(scope);
          map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlElem[0]);

          function centerChangedCallback (scope, map) {
            return function () {
              var center = map.getCenter();
              scope.latitude = center.lat();
              scope.longitude = center.lng();
              if(!scope.$$phase) scope.$apply();
            };
          }

          google.maps.event.addListener(map, 'center_changed', centerChangedCallback(scope, map));
        }
      };
    });    
