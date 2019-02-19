App.controller('videoPlatform',[
    '$scope', '$rootScope', '$http', '$location', '$q', 'API_URL', 'welcomeService', 'api', 'notification', 'conectSocNetwork', 'videoPlatformsFact',
    function($scope, $rootScope, $http, $location, $q, API_URL, welcomeService, api, notification, conectSocNetwork, videoPlatformsFact) {
        var notificationTarget      = $location.path();
        $rootScope.profMenu         = true;
        $rootScope.signin           = false;
        $rootScope.title            = 'Video Platform';
        $rootScope.linkStyle        = $location.path();
        $scope.user                 = api.user;
        $scope.closeAuto            = false;
        $scope.dailymotionPlatform  = [];
        $scope.facebookPlatform     = [];
        $scope.instagramPlatform    = [];
        $scope.twitterPlatform      = [];
        $scope.actionD              = false;
        $scope.showSubSer           = true;
        $scope.serviceNameShow      = 'youtube';
        $scope.autoPublishYou       = false;
        $scope.selecteTime          = true;
        $scope.selectSubServices    = true;
        $scope.numeItem             = $('.blockManiChannel .blockInfo').length;
        $scope.selecteValue         = 'Immediately';
        $scope.indexDate            = '1';
        $scope.indexDateYou         = '1';
        $scope.allPlatform          = [];
        $scope.conectMyNetwork      = [];
        $rootScope.planLimit        = false;
        $scope.showCloud            = false;
        $scope.preloaderPlatforms   = true;





        sessionStorage.setItem('platformNameConnect', 'YouTube');
        sessionStorage.setItem('platformName', 'youtube');

        if(sessionStorage.getItem('arrayYoutubeIdNoConnect')){
            $scope.arrayYoutubeIdNoConnect = JSON.parse(sessionStorage.getItem('arrayYoutubeIdNoConnect'));
        }
        if(sessionStorage.getItem('closeYoutubePopUp')){
            $scope.closePopUpYoutube = sessionStorage.getItem('closeYoutubePopUp');
        }else{
            $scope.closePopUpYoutube = true;
        }
        if(localStorage.getItem('autoPublishYoutube')){
            $scope.autoPublishYou = JSON.parse(localStorage.getItem('autoPublishYoutube'));
            $scope.varArrayDailymotion = JSON.parse(sessionStorage.getItem('resp'));
            $scope.arrayYoutub = JSON.parse(sessionStorage.getItem('arrayData'));
        }

        if (!localStorage.getItem('alertConnectAnotherChannel')) {
            localStorage.setItem('alertConnectAnotherChannel', true);
            $scope.alertConnectAnotherChannel = JSON.parse(localStorage.getItem('alertConnectAnotherChannel'));
    
        } else {
            $scope.alertConnectAnotherChannel = JSON.parse(localStorage.getItem('alertConnectAnotherChannel'));
        }

        setTimeout(function(){
            if(sessionStorage.getItem('platformName')){
                $scope.serviceNameShow = sessionStorage.getItem('platformName');
            }else{
                $scope.serviceNameShow = 'youtube';
            }
        },0);

        $scope.showSubServices = function (id) {
            localStorage.setItem('ServiceID',id);
            $scope.parentServiceId = id;
            $scope.showSetings = true;
            $scope.autoFacebookPopup = false;
            localStorage.setItem('autoFacebookPopup', false);
        };

        $scope.getServicePlatforms = function(){
            api.get('service',function (response) {
                $scope.namePlatforms = response._embedded.services;
                $scope.platforms['youtube'].items = [];
                $scope.platforms['dailymotion'].items = [];
                $scope.platforms['facebook'].items = [];
                $scope.platforms['instagram'].items = [];
                $scope.platforms['twitter'].items = [];
                $scope.allPlatformType = [];
                response._embedded.services.forEach(function(item){
                    if(item.type !== "dropbox") {
                        $scope.platforms[item.type].items.push(item);
                        $scope.conectMyNetwork.forEach(function (user) {
                            if (user.info.id === item.user_id) {
                                if (item.type !== 'youtube') {
                                    $scope.allPlatform[item.user_id] = [];
                                }
                                $scope.allPlatform[item.user_id+'_'+item.type] = true;
                                $scope.allPlatformType[item.type] = true;
                            }
                        });
                    }

                    if(item.type === 'dailymotion'){
                        $scope.dailymotionPlatform.push(item);
                    }else if(item.type === 'facebook') {
                        $scope.facebookPlatform.push(item);
                    }else if(item.type === 'instagram'){
                        $scope.instagramPlatform.push(item);
                    }else if(item.type === 'twitter'){
                        $scope.twitterPlatform.push(item);
                    }else if(item.type === 'youtube' && item.mine === 1) {
                        if (item.linked == null) {
                        }
                    }
                    item.import = -1;
                    if(item.import !== 0 && item.import >1){
                        var interval = setInterval(function(){
                            api.get('service/'+item.id+'/status',function (progressDetail) {
                                item.import = progressDetail.import;
                                if(progressDetail.video_count)item.video_count = progressDetail.video_count;
                                if(item.import === 100) clearInterval(interval);
                            },function(){
                                clearInterval(interval)
                            });
                        },1000)
                    }
                    $scope.showCloud = true;
                });
                $scope.getServiceVideoCount();
            });
        };

        $scope.network = function(){
            api.get('network', function (response) {
                if (response) {
                    $scope.conectMyNetwork = response.members;
                    $scope.conecMyNetworkavatar = API_URL.avatar_uri;
                    $scope.conectMyNetwork.forEach(function(item) {
                        if(item.info.is_member === 1){
                            $scope.allPlatform['youtube']=[];
                        }
                        $scope.allPlatform[item.type] = [];
                    });
                }
                $scope.getServicePlatforms();
            });
        };

        $scope.initProfileApi = function(){
            api.initProfile(function() {
                if (($scope.user.admin === 1) || ($scope.user.team_member === true)){
                    $scope.network();
                } else {
                    $scope.getServicePlatforms();
                }
            });
        };
        $scope.initProfileApi();

        $scope.servicesTabs = function(service){
            switch (service){
                case "youtube" :
                    $scope.serviceNameShow = service;
                    sessionStorage.setItem('platformName', service);
                    sessionStorage.setItem('platformNameConnect', 'YouTube');
                    break;
                case "facebook" :
                    $scope.serviceNameShow = service;
                    sessionStorage.setItem('platformName', service);
                    sessionStorage.setItem('platformNameConnect', 'Facebook');
                    break;
                case "dailymotion" :
                    $scope.serviceNameShow = service;
                    sessionStorage.setItem('platformName', service);
                    sessionStorage.setItem('platformNameConnect', 'Dailymotion');
                    break;
                case "instagram" :
                    $scope.serviceNameShow = service;
                    sessionStorage.setItem('platformName', service);
                    sessionStorage.setItem('platformNameConnect', 'Instagram');
                    break;
                case "twitter" :
                    $scope.serviceNameShow = service;
                    sessionStorage.setItem('platformName', service);
                    sessionStorage.setItem('platformNameConnect', 'Twitter');
                    break;
            }
        };

        $scope.platforms = {
            'youtube':{type:'YouTube', serviceName:'youtube', title:'YouTube Channels' ,items:[]},
            'facebook':{type:'Facebook', serviceName:'facebook', title:'Facebook Accounts' ,items:[]},
            'dailymotion':{type:'Dailymotion', serviceName:'dailymotion', title:'Dailymotion Channels' ,items:[]},
            'instagram':{type:'Instagram', serviceName:'instagram', title:'Instagram Channels' ,items:[]},
            'twitter':{type:'Twitter', serviceName:'twitter', title:'Twitter Channels' ,items:[]}
        };
        /*Pagination*/




        $scope.$watch("namePlatforms", function() {
            videoPlatformsFact.setPlatforms($scope.platforms[$scope.serviceNameShow].items);
            $scope.todos = videoPlatformsFact.getPagePlatforms();
            $scope.paginationList = videoPlatformsFact.getPagenetionList();
        });

        $scope.$watch("serviceNameShow", function() {
            videoPlatformsFact.setPlatforms($scope.platforms[$scope.serviceNameShow].items);
            $scope.todos = videoPlatformsFact.getPagePlatforms();
            $scope.paginationList = videoPlatformsFact.getPagenetionList();
        });

        $scope.showPage = function (page) {
            if(page === 'prev'){
                $scope.todos = videoPlatformsFact.getPrevPagePlatforms();
            } else if(page === 'next'){
                $scope.todos = videoPlatformsFact.getNextPagePlatforms();
            }else{
                $scope.todos = videoPlatformsFact.getPagePlatforms(page);
            }
        };
        $scope.currentPageNum = function () {
            return videoPlatformsFact.getCurrentPageNum();
        };
        /*Paginatiohfhdjn*/

        $scope.getServiceVideoCount = function(){
            api.get('service/count',function (response) {
                $scope.serviceVideoCount = [];
                response.forEach(function(itemVideoCount){
                    if(itemVideoCount.subservices.length !== 0){
                        $scope.serviceVideoCount[itemVideoCount.id+'_'+itemVideoCount.type] = itemVideoCount.video_count;
                        itemVideoCount.subservices.forEach(function(itemSub){
                            $scope.serviceVideoCount[itemSub.id+'_'+itemVideoCount.type] = itemSub.video_count;
                        });
                    }else{
                        $scope.serviceVideoCount[itemVideoCount.id+'_'+itemVideoCount.type] = itemVideoCount.video_count;
                    }

                });
                $scope.preloaderPlatforms = false;
            });
        };

        $scope.selectedPublishing = function(){
            if($scope.selecteTime === true){
                $scope.selecteTime = false;
            }else{
                $scope.selecteTime = true;
            }
        };

        $scope.showConnectAnotherChannelPopup = function(platformName) {
            $scope.showThisPopup = true;
            $scope.platformName = platformName;
        };

        $scope.connectTo = function(type, switchs){
            $scope.showThisPopup = false;
            conectSocNetwork.connectTo(type, switchs, function () {
                $scope.getServicePlatforms();
                var errorCode = document.cookie.match ( '(^|;) ?planLimit=([^;]*)(;|$)' );
                if(unescape(errorCode[2]) === 403){
                    $scope.planLimit = true;
                }
            });
        };

        $scope.cancelAlert = function () {
            $scope.alertConnectAnotherChannel = JSON.parse(localStorage.getItem('alertConnectAnotherChannel'));
            localStorage.setItem('cancelAlert', true);
            $scope.checking = true;
        };

        $scope.cancelAlertConnectAnotherChannel = function () {
            if (angular.element('.checkedDel').hasClass('checkedDelete')) {
                angular.element('.checkedDel').removeClass('checkedDelete borderColor2 backgroundColor2');
                localStorage.setItem('alertConnectAnotherChannel', true);
            } else {
                angular.element('.checkedDel').addClass('checkedDelete borderColor2 backgroundColor2');
                localStorage.setItem('alertConnectAnotherChannel', false);
            }
             $scope.alertConnectAnotherChannel = JSON.parse(sessionStorage.getItem('alertConnectAnotherChannel'));
        };

        $scope.connectToSubService = function(serviceId, subServiceId){
            var data = {
                "active" : true
            };
            api.patch('service/'+serviceId+'/subservice/'+subServiceId, data, function(resp){
                $scope.platforms['facebook'].items.forEach(function(itemPlatform){
                    itemPlatform.sub_services.forEach(function(itemSubServices){
                        if(itemSubServices.id === subServiceId){
                            itemSubServices.active = true;
                        }
                    });
                });
                notification.addMessage(notificationTarget, 'New '+ $scope.platforms[sessionStorage.getItem('platformName')].type+ ' channel added successfully', $scope.platforms['facebook'].type+' account: '+resp.screenname+' was added.');
            },function(error){
                notification.addError(notificationTarget, 'New '+ $scope.platforms[sessionStorage.getItem('platformName')].type+ ' channel connection was not successful', error.message);
            });
        };

        $scope.showAlertDisconnect = function(id, fbId, fbName, fbType){
            $scope.idItem   = id;
            $scope.fbId     = fbId;
            $scope.fbName   = fbName;
            $scope.fbType   = fbType;
            $scope.showDisconnect = true;
        };

        $scope.diconnectToSubService = function(serviceId, subServiceId, type, name){
            var data = {
                "active" : false
            };
            api.patch('service/'+serviceId+'/subservice/'+subServiceId, data, function(resp){
                $scope.platforms['facebook'].items.forEach(function(itemPlatform){
                    itemPlatform.sub_services.forEach(function(itemSubServices){
                        if(itemSubServices.id === subServiceId){
                            itemSubServices.active = false;
                            $scope.showDisconnect=false;
                        }
                    });
                });
                notification.addMessage(notificationTarget, 'Channel '+name+ ' was deleted successfully', $scope.platforms[sessionStorage.getItem('platformName')].type+  ' channel '+name+' was deleted');
            });
        };

        $scope.deleteSource = function(id,type,name){
            api.delete('service/'+id,{},function(resp){
                $scope.platforms[type].items = $scope.platforms[type].items.filter(function(item){
                    return item.id !== id;
                });
                $scope.platforms['youtube'].items.forEach(function(itemPlatform){
                    if (itemPlatform.linked == null && itemPlatform.mine === true) {
                    }
                });
                $scope.getServicePlatforms();
                notification.addMessage(notificationTarget, 'Channel '+name+ ' was deleted successfully', $scope.platforms[sessionStorage.getItem('platformName')].type+  ' channel '+name+' was deleted');
            });
        };
    }
]);
