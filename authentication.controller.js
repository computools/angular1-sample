/**
 * Created by admin on 18.01.2016.
 */

App.controller('authenticationCtrl',
    ['$scope', '$location', '$rootScope', 'api', 'notification','API_URL', 'constants',
    function ($scope, $location, $rootScope, api, notification, API_URL, constants) {
        var callbackUri             = location.search.replace('?code=', ''),
            action                  = $location.search()['action'],
            token                   = $location.search()['token'];
        $scope.keyOauth             = $location.search()['code'];
        $scope.tokenReferral        = $location.search()['referral-token'];
        $scope.accessDenied         = $location.search()['error'];
        $scope.accessToken          = callbackUri.split('?')[1];
        $scope.forgotPasswordEmail  = '';
        $scope.userPasswordPattern  = constants.PATTERN.PASSWORD_PATTERN;
        $scope.mailPattern          = constants.PATTERN.MAIL_PATTERN;
        $scope.indexTrue            = true;
        $scope.emailTakenAlert      = false;
        $scope.forSignUp            = false;
        $rootScope.profMenu         = false;
        $scope.sentEmail            = false;
        $rootScope.title            = 'Sign Up';
        $scope.forgotPassword       = false;
        $scope.conferm              = false;
        $scope.password             = '';
        $scope.email                = '';
        $scope.emailTakenAlert      = api.emailTakenAlert;
        $scope.emailErrorMass       = api.emailErrorMass;
        $scope.showCreateNewAccount = false;
        $scope.confermEmail         = false;
        $scope.confermEmailDomain   = false;

        if($scope.accessDenied){
            $location.path('/login');
            $location.search('');
            $rootScope.checkPreloaderBlock  = false;
        }

        $scope.forgotPasswordFunc = function () {
            $scope.forgotPassword   = true;
        };

        $scope.createNewAccount = function () {
          $scope.showCreateNewAccount = true;
        };

        if (token) {
            localStorage.setItem("tokenregistration", token);
            if(localStorage.getItem('tokenregistration') && '' !== localStorage.getItem('tokenregistration')) {
                $location.path('/create-account');
                $rootScope.profMenu = false;
            }
        }
        if ($scope.tokenReferral) {
            $rootScope.checkPreloaderBlock  = false;
            localStorage.setItem("referral-token", $scope.tokenReferral);
            $location.search('');

        }
        if(localStorage.getItem("referral-token")){
            $scope.createNewAccount();
        }

        $scope.login = function () {
            sessionStorage.clear();
            localStorage.clear();
            api.login();
        };

        if($scope.accessToken !== undefined){
            $scope.accessToken2  = $scope.accessToken.split('=')[0];
        }

        if (callbackUri !== '' && $scope.keyOauth !== undefined ) {
            api.callbackUri(callbackUri, function (response) {
                api.get('user/status', function (resp) {
                    if (resp.status === "finish") {
                        api.get('whitelabel/user', function (response) {
                            if (response.domain != null) {
                                window.location = 'https://' + response.domain +'.'+ API_URL.prodLink+'/access?access_token=' + localStorage.getItem('access_token') + '&refresh_token=' + localStorage.getItem('refresh_token');
                            } else {
                                $location.path('/library');
                            }
                        });
                    } else if (resp.status === "master") {
                        if (resp.type === 'network') {
                            localStorage.setItem("typeUser", resp.type)
                        }
                        localStorage.setItem('tokenMaster', true);
                        $location.path('/connect-master');
                    } else if (resp.status === "role") {
                        localStorage.setItem('role', true);
                        $location.path('/role');
                    } else if (resp.status === "domain") {
                        localStorage.setItem('tokenDomain', true);
                        $location.path('/create-domain');
                    } else if (resp.status === "colleagues") {
                        localStorage.setItem('inviteColleagues', true);
                        $location.path('/invite-colleagues');
                    } else if (resp.status === "social") {
                        localStorage.setItem('socAccount', true);
                        $location.path('/connect-social');
                    }else if(resp.status === "waiting"){
                        $rootScope.checkProcessing = false;
                        $rootScope.erorMsgFlag = true;
                        $rootScope.erorMsg = 'Your join request is not accepted yet by Network admin. Please wait for the email notification or contact him directly.';
                        $location.path('/login');
                    }
                });
            });
        }


        $scope.authError = function(){
            $rootScope.checkErrorAuto = false;
        };

        if (action === 'creator-login') {
            sessionStorage.clear();
            localStorage.clear();
            $scope.login();
        }

        $scope.conect = function(){
            sessionStorage.clear();
            localStorage.clear();
            $rootScope.checkProcessing = true;
            angular.element('.btn-success').attr('disabled', 'disabled');
            var data = {
                "email": $scope.email,
                "password": $scope.password
            };
            api.post('oauth2/login', data, function (response) {
                sessionStorage.clear();
                localStorage.clear();
                localStorage.setItem('refresh_token', response['refresh_token']);
                localStorage.setItem('access_token', response['access_token']);
                var cookie_date = new Date (new Date().getTime() + 2592000 * 1000);
                document.cookie = "access_token="+ response['access_token']+"; expires="+ cookie_date.toUTCString()+"; path=/; domain = ."+ API_URL.prodLink+"; secure=true";
                document.cookie = "refresh_token="+response['refresh_token']+"; expires="+ cookie_date.toUTCString()+ "; path=/; domain = ."+ API_URL.prodLink+"; secure=true";
                api.get('user/status', function (respStatus) {
                    if(respStatus.status === "finish") {
                        api.get('me', function (resp) {
                            if (resp.team_member === true) {
                                api.get('whitelabel/user', function (response) {
                                    if (response.domain != null) {
                                        window.location = 'https://' + response.domain +'.'+ API_URL.prodLink+'/access?access_token=' + localStorage.getItem('access_token') + '&refresh_token=' + localStorage.getItem('refresh_token');
                                    } else {
                                        $location.path('/library');
                                    }
                                });
                            } else {
                                $rootScope.checkProcessing = false;
                                $rootScope.erorMsg = '';
                                if (response.access_token) {
                                    angular.element('.btn-danger').removeAttr('disabled');
                                    api.get('whitelabel/user', function (response) {
                                        if (response.domain != null) {
                                            window.location = 'https://' + response.domain +'.'+ API_URL.prodLink+'/access?access_token=' + localStorage.getItem('access_token') + '&refresh_token=' + localStorage.getItem('refresh_token');
                                        } else {
                                            $location.path('/library');
                                        }
                                    });
                                }
                            }
                        });
                    }else if(respStatus.status === "master"){
                        if(respStatus.type === 'network'){
                            localStorage.setItem("typeUser", respStatus.type)
                        }
                        localStorage.setItem('tokenMaster', true);
                        $location.path('/connect-master');
                    }else if(respStatus.status === "role"){
                        localStorage.setItem('role', true);
                        $location.path('/role');
                    }else if(respStatus.status === "domain"){
                        localStorage.setItem('tokenDomain', true);
                        $location.path('/create-domain');
                    }else if(respStatus.status === "colleagues"){
                        localStorage.setItem('inviteColleagues', true);
                        $location.path('/invite-colleagues');
                    }else if(respStatus.status === "social"){
                        localStorage.setItem('socAccount', true);
                        $location.path('/connect-social');
                    }else if(respStatus.status === "waiting"){
                        $rootScope.checkProcessing = false;
                        $rootScope.erorMsgFlag = true;
                        $rootScope.erorMsg = 'Your join request is not accepted yet by Network admin. Please wait for the email notification or contact him directly.';
                    }
                });
            }, function (err) {
                $rootScope.checkProcessing = false;
                $rootScope.erorMsg = '';
                if(err.message){
                    $rootScope.erorMsgFlag = true;
                    $rootScope.erorMsg = err.message;
                }else if(err.error){
                    $rootScope.erorMsgFlag = true;
                    $rootScope.erorMsg = err.error;
                }
            });
        };

        $scope.registrationEmail = function(email){
            var emailData, url;
            var domain = window.location.hostname.split('.');
            if(($location.host() !== 'app.'+ API_URL.prodLink &&$location.host() !== API_URL.prodLink)&&!localStorage.getItem("referral-token")){
                $scope.confermEmailDomain = true;
                emailData = {
                    "email": email,
                    "domain": domain[0]
                };
                url = 'mcn/request/domain';
            }else if(localStorage.getItem("referral-token")){
                emailData = {
                    "email": email,
                    "domain": domain[0]
                };
                url = 'mcn/request/domain';
                emailData['referral_token'] = localStorage.getItem("referral-token");
            }else{
                emailData = {
                    "email": email
                };
                url = 'registration/email';
            }
            api.post(url, emailData, function (response) {
                $scope.sentEmail = true;
                api.emailTakenAlert = false;
                $scope.confermEmail = true;
            }, function (error) {
                if(error.code === 409){
                    if($location.path() === '/'){
                        api.emailErrorMass = 'It seems that you already have an account created. Please Sign in with your email and password.';
                        api.emailTakenAlert = true;
                        $location.path('/login');
                    }else{
                        $scope.emailErrorMass = 'It seems that you already have an account created. Please Sign in with your email and password.';
                        $scope.showCreateNewAccount = false;
                    }
                }else{
                    api.emailErrorMass = error.message;
                    $rootScope.checkPreloaderBlock  = false;
                }
                $scope.emailTakenAlert = true;
                $rootScope.checkPreloaderBlock  = false;
            });
        };

        $scope.resend = function(){
            api.post('registration/resend', {"email": $scope.newUserEmail}, function (response) {
                $scope.sentEmail = true;
            });
        };

        $scope.resendPasswordEmail = function(){
            var data = {
                "email": $scope.forgotPasswordEmail
            };
            api.put('registration/reset-password', data, function (response) {
                $scope.conferm = true;
            }, function (error) {
                $scope.emailErrorMass = error.message;
                $scope.emailTakenAlert = true;
                $scope.forgotPassword = false;
            });
        };
        document.onkeyup = function (e) {
            e = e || window.event;
            if (e.keyCode === 13 && !$scope.forgotPassword) {
               angular.element('.getStarted1').click();
            }
            if (e.keyCode === 13 && $scope.forgotPassword) {
                angular.element('.resetPasswordBut').click();
            }
            if (e.keyCode === 13 && $scope.forSignUp&&!$scope.sentEmail) {
                angular.element('.getStarted2').click();
            }
        };
    }
]);
