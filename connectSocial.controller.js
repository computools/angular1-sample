App.controller('connectSocial',
    ['$scope', '$location', '$rootScope', 'api', 'welcomeService', 'API_URL', 'conectSocNetwork',
        function ($scope, $location, $rootScope, api, welcomeService, API_URL, conectSocNetwork) {
            $rootScope.profMenu             = false;
            $scope.sentEmail                = false;
            $rootScope.title                = 'Connect Social';
            $rootScope.checkPreloaderBlock  = false;
            $scope.conditions               = false;
            $scope.user                     = {};
            $scope.socCheck                 = {};
            $rootScope.signin               = false;
            $scope.freeBlock                = false;
            $scope.connectSocialPreloader   = true;

            $scope.arraySocNetworck = {
                'youtube':{type:'youtube', ready:false ,avatarUrl:'',screenname:''},
                'facebook':{type:'facebook', ready:false ,avatarUrl:'',screenname:''},
                'dailymotion':{type:'dailymotion', ready:false ,avatarUrl:'',screenname:''},
                'instagram':{type:'instagram', ready:false ,avatarUrl:'',screenname:''},
                'twitter':{type:'twitter', ready:false ,avatarUrl:'',screenname:''}
            };

            if($location.path() === '/connect-social') {
                api.get('service', function (response) {
                    $scope.namePlatforms = response._embedded.services;
                    $scope.connectSocialPreloader = false;                    
                });
            }

            $scope.socLogin = function(service){
                sessionStorage.setItem('platformNameConnect', service);
                $scope.showThisPopup = false;
                conectSocNetwork.connectTo(service, false, function () {
                    $scope.refreshPage();
                });
            };

            $scope.myProfile = function(done){
                api.get('me', function (resp) {
                    $scope.user.team_member = resp.team_member;
                    $scope.user.admin = resp.admin;
                    $scope.user.is_member = resp.is_member;
                    $scope.user.email = resp.email;
                    $scope.user.username = resp.username;
                    $scope.user.sourcesImg = resp.avatar_url;
                    $scope.user.empty = false;
                });
            };
            $scope.myProfile();

            function printService(item, i, services){
                if($location.path() === '/connect-social') {
                    if (item.type !== 'dropbox') {
                        if (item.type) {
                            $scope.arraySocNetworck[item.type].avatarUrl = item.avatar_url;
                            $scope.arraySocNetworck[item.type].screenname = item.screenname;
                            $scope.socFollowersCount = item.followers;
                        }
                        $scope.socCheck[services[i].type] = true;
                        $scope.arraySocNetworck[services[i].type].ready = true;
                    }
                }
            }
            $scope.loginService = function (name) {
                localStorage.setItem('serviceName', name);
                welcomeService.loginService(function (response) {
                    $scope.importStatus(response.id);
                });
            };

            if(localStorage.getItem('serviceName') && $location.path() === '/connect-social') {
                welcomeService.callbackLoginService($scope.callbackUriSoc, function (response) {
                    $scope.countss = response['servicesLength'];
                    welcomeService.welcomeService(function (response) {
                        $scope.servicesType = response._embedded.services;
                        $scope.countService = angular.element('.activeService').length;
                        $scope.countss = response._embedded.services.length;
                        $scope.servicesType.forEach(printService);
                    });
                });
            }

            $scope.refreshPage = function() {
                if ($location.path() === '/connect-social') {
                    welcomeService.welcomeService(function (response) {
                        $scope.socFollowers = 0;
                        $scope.countService = angular.element('.activeService').length;
                        $scope.countss = response._embedded.services.length;
                        $scope.servicesType = response._embedded.services;
                        $scope.servicesType.forEach(printService);
                        $scope.servicesType.forEach(function (item) {
                            if (item.type !== 'dropbox') {
                                $scope.socFollowers += item.followers;
                            }
                        });
                    });
                }
            };
            $scope.refreshPage();

            $scope.importStatus = function(id){
                api.get('service/'+id+'/status',function (response) {
                    $scope.namePlatforms = response._embedded.services;
                });
            };


            $scope.startTrial = function(){
                if($location.path() === '/connect-social') {
                    api.get('service', function (response) {
                        $scope.namePlatforms = response._embedded.services;
                        if(0<$scope.namePlatforms.length){
                            api.get('whitelabel/user', function (response) {
                                if (response) {
                                    localStorage.removeItem('socAccount');
                                    $location.search('');
                                    api.post('user/status', {status:"finish"}, function (response) {});
                                    if (response) {
                                        window.location = 'https://' + response.domain +'.'+ API_URL.prodLink+'/access?access_token=' + localStorage.getItem('access_token') + '&refresh_token=' + localStorage.getItem('refresh_token');
                                    }
                                }
                            });
                        }
                    });
                }
            };

            $scope.continueFreeBlock = function(){
                $scope.freeBlock=true;
            }
        }
]);