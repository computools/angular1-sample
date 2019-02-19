'use strict';
App.factory('api',
    ['$http','$location', '$rootScope', 'AUTH', 'API_URL','notification',
        function ( $http,$location, $rootScope, AUTH, API_URL,notification) {
            var that                = {};
            var isStartRefreshing   = false;
            var refreshCalbacks     = [];
            that.tokenId            = $location.search()['id'];
            that.user               = { empty: true};
            that.linkAuto           = {};
            that.tokenInvitation    = localStorage.getItem("tokenInvitation");
            that.url                = '';
            that.periodPublish      = '';
            that.filterVideo;
            that.emailTakenAlert    = false;
            that.emailErrorMass     = '';
            that.loadFilesCount     = 0;
            that.filterPlayList;
            that.videoShowLibrari   = true;
            that.playListShowLibrari = false;
            var initListeners       = [];
            that.emailErrorMass;
            that.emailTakenAlert;
            that.erorMsgFlag;
            that.erorMsg;

            angular.element('.mainNext').removeClass('displayNone');

            function callInitListeners(){
               initListeners.forEach(function(item){ item()});
            }

            that.initProfile = function(callback){
               that.user.empty ? initListeners.push(callback) : callback();
            };

            that.logout = function(){
                sessionStorage.setItem('zoom','');
                localStorage.setItem('refresh_token','');
                localStorage.setItem('access_token', '');
                var cookie_date = new Date (new Date().getTime() -1);
                document.cookie = "access_token=; expires="+ cookie_date.toUTCString()+"; path=/; domain = ."+ API_URL.prodLink+"; secure=true";
                document.cookie = "refresh_token=; expires="+ cookie_date.toUTCString()+"; path=/; domain = ."+ API_URL.prodLink+"; secure=true";
                sessionStorage.clear();
                localStorage.clear();
                that.user = {};
            };

            that.login = function (callback) {
                $http.get(API_URL.auth+'/oauth2/authorize/youtube')
                    .success(function (response) {
                        window.location = response['authorise_url'];
                    }).error(function(err){

                        if(callback) callback(err);
                });
            };

            that.callbackUri = function (callbackUri, callback) {
                if (callbackUri !== undefined) {
                    $rootScope.checkPreloaderBlock  = true;
                    if(!that.tokenInvitation){
                        that.url = API_URL.auth+'/oauth2/token/youtube?code='+callbackUri;
                    }else{
                        that.url = API_URL.auth+'/oauth2/token/youtube?code='+callbackUri+'&token='+that.tokenInvitation;
                    }
                    $http({
                        "async": true,
                        "crossDomain": true,
                        method: 'POST',
                        url: that.url,
                        data:''
                    }).success(function (response) {
                        $rootScope.checkPreloaderBlock  = true;
                            response['status']= true;
                            localStorage.setItem('refresh_token', response['refresh_token']);
                            localStorage.setItem('access_token', response['access_token']);
                            var cookie_date = new Date (new Date().getTime() + 2592000 * 1000);
                            document.cookie = "access_token="+ response['access_token']+"; expires="+ cookie_date.toUTCString()+"; path=/; domain = ."+ API_URL.prodLink+"; secure=true";
                            document.cookie = "refresh_token="+response['refresh_token']+"; expires="+ cookie_date.toUTCString()+ "; path=/; domain = ."+ API_URL.prodLink+"; secure=true";
                            localStorage.setItem('tokenInvitation', '');
                            callback(response);
                    }).error(function (err) {
                        $rootScope.checkPreloaderBlock = false;
                        $rootScope.errorLoginYoutube = true;
                        $rootScope.errorMassege = err.message;
                        if(err.code === 401){
                            $rootScope.erorMsg = err.message;
                            $rootScope.erorMsgFlag = true;
                            $location.search('');
                            $location.path('/login');
                        }
                    });
                }
            };

            that.refreshingToken = function(callback){
                refreshCalbacks.push(callback);
                if(isStartRefreshing){
                   return;
                } else {
                    isStartRefreshing =true;
                }
                $http({
                    "async": true,
                    "crossDomain": true,
                    method: 'GET',
                    url:  API_URL.auth+'/oauth/v2/token?'+$.param({'grant_type':'refresh_token',
                        'refresh_token':localStorage.getItem('refresh_token'),
                        'client_id':AUTH.client_id,
                        'client_secret':AUTH.client_secret})
                }).success(function (response) {
                    localStorage.setItem('refresh_token', response['refresh_token']);
                    localStorage.setItem('access_token', response['access_token']);
                    isStartRefreshing = false;
                    refreshCalbacks.forEach(function(action){action()});
                }).error(function(data, status){
                    isStartRefreshing = false;
                });
            };

            that.call = function(method,url,data,done,error,isFromEncoding){
                var targetUrl = $location.path();
                var tryCount = 0;
                var params = {
                    "async": true,
                    "crossDomain": true,
                    method: method,
                    url: API_URL.auth+'/'+url,
                    headers: {
                        "Authorization": "Bearer " + localStorage['access_token'],
                        "Content-Type": "application/json"
                    }
                };
                if(data){
                    params.data =  isFromEncoding ? $.param(data):data;
                }
                $http(params).success(function (response) {
                    if(done) done(response);
                }).error(function(data, status) {
                    if(data.error === 'invalid_grant' ){
                        sessionStorage.clear();
                        localStorage.clear();
                        var cookie_date = new Date (new Date().getTime() -1);
                        document.cookie = "access_token=; expires="+ cookie_date.toUTCString()+"; path=/; domain = ."+ API_URL.prodLink+"; secure=true";
                        document.cookie = "refresh_token=; expires="+ cookie_date.toUTCString()+"; path=/; domain = ."+ API_URL.prodLink+"; secure=true";
                        window.location = '/';
                    } else  if(error) {
                        error(data,status);
                    } else {
                        var urlArray = url.split('/');
                        var title = urlArray[0].capitalize();
                        var max = urlArray.length > 2 ? 2 : urlArray.length;
                        for(var i=1; i<max; i++){
                            if(utils.string.isLetter(urlArray[i][0])){
                                title+=' '+urlArray[i];
                            }
                        }
                        if(targetUrl !== '/login'){
                            notification.addError(targetUrl,title+' failed',data.message);
                        }
                    }
                });
            };

            that.get = function(url,done,error){
                that.call('GET',url,null,done,error,true);
            };

            that.post = function(url,data,done,error){
                that.call('POST',url,data,done,error,false);
            };
            that.put = function(url,data,done,error){
                that.call('PUT',url,data,done,error,false);
            };
            that.patch = function(url,data,done,error){
                that.call('PATCH',url,data,done,error,false);
            };
            that.link = function(url,data,done,error){
                that.call('LINK',url,data,done,error,false);
            };
            that.delete = function(url,data,done,error){
                that.call('DELETE',url,data,done,error,false);
            };
            that.unlink = function(url,data,done,error){
                that.call('UNLINK',url,data,done,error,false);
            };

            that.loadFile = function(file,index,fileArray, callback){
                $.ajax({
                    url: API_URL.auth + "/upload/video",
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", "Bearer " + localStorage['access_token'])
                    },
                    xhr: function () {
                        var myXhr = $.ajaxSettings.xhr();
                        if (myXhr.upload) {
                            myXhr.upload.addEventListener('progress', function(e){
                                if (e.lengthComputable) {
                                    var max = e.total;
                                    var current = e.loaded;
                                    var percentage = (current * 100) / max;
                                    var i = 0, type = ['b', 'Kb', 'Mb', 'Gb'];
                                    while ((current / 1000 | 0) && i < type.length - 1) {
                                        current /= 1024;
                                        i++;
                                    }
                                    $rootScope.dropZoneEvents.setProgress(index,max,current,percentage,type[i])
                                }
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            }, false);
                        }
                        return myXhr;
                    },
                    type: "POST",
                    data: file,
                    processData: false
                }).success(function(resp){
                    var data = {
                        'title': file['name']
                    };
                    that.patch('video/' + resp['id'] + '/overview',data,function(response){
                        if (that.loadFilesCount === fileArray.length - 1) {
                            callback();
                            $rootScope.dropZoneEvents.endFileLoad();
                            $rootScope.preventPage = false;
                            $rootScope.pageClose(false);
                        }
                        that.loadFilesCount++;
                    });
                }).error(function (err) {
                    if(err.statusText === "error"){
                        callback();
                        $rootScope.errorMessage(err.statusText, "", "");
                        $rootScope.dropZoneEvents.endFileLoad();
                    }
                    if(err.responseJSON.code === 400){
                        callback();
                        $rootScope.errorMessage(err.responseJSON.code, err.message, file['name']);
                        $rootScope.dropZoneEvents.endFileLoad();
                    }
                    if(err.responseJSON.code === 403){
                        callback();
                        $rootScope.errorMessage(err.responseJSON.code, err.responseJSON.message, "");
                        $rootScope.dropZoneEvents.endFileLoad();
                    }
                });
            };




            that.myProfile = function(done){
                that.get('me', function (resp) {
                    that.user.allInfo           = resp;
                    that.user.team_member       = resp.team_member;
                    that.user.admin             = resp.admin;
                    that.user.is_member         = resp.is_member;
                    that.user.email             = resp.email;
                    that.user.username          = resp.username;
                    that.user.sourcesImg        = resp.avatar_url;
                    that.user.empty             = false;
                    $rootScope.userTeamMember   = resp.team_member;
                    $rootScope.userAdmin        = resp.admin;
                    $rootScope.userIsMember     = resp.is_member;
                    $rootScope.avatar_url       = resp.avatar ? "background-image :  url('"+API_URL.avatar_uri+resp.avatar+"')" : that.user.sourcesImg ? "background-image :  url('"+that.user.sourcesImg+"')" : "background-image : url('/img/User_Avatar.png')";
                    $rootScope.userAvatarUrl    = resp.avatar_url?resp.avatar_url:resp.avatar;
                    callInitListeners();
                    if(done)done(resp);
                });
            };
            that.token = function(token){
                if(!token) return window.localStorage['access_token'];
                window.localStorage.setItem('access_token',token);
            };
            that.refreshToken = function(token){
                if(!token) return window.localStorage['refresh_token'];
                window.localStorage.setItem('refresh_token',token);
            };
            return that;
        }]);

