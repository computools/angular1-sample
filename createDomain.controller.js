App.controller('createDomain',
    ['$scope', '$http', '$location', '$rootScope', 'api', 'constants',
        function ($scope, $http, $location, $rootScope, api, constants) {
            $rootScope.profMenu             = false;
            $scope.sentEmail                = false;
            $rootScope.title                = 'Create Domain';
            $rootScope.checkPreloaderBlock  = false;
            $scope.conditions               = false;
            $scope.newUserEmail             = localStorage.getItem("newUserEmail");
            $scope.domainPattern            = constants.PATTERN.DOMAIN_PATTERN;
            $scope.domain                   = sessionStorage.getItem('newNameCompany');
            $scope.countryValue             = sessionStorage.getItem('countryValue');
            if($scope.domain){
                $scope.domain               = $scope.domain.toLowerCase().replace(constants.PATTERN.DOMAIN,"");
            }
            $scope.showListDomain           = false;
            $scope.listDomain               = ['mysubdomain1','mysubdomain2','mysubdomain3'];

            if($location.path() === '/role') {
                api.get('service', function (response) {
                    $scope.namePlatforms = response._embedded.services;
                    if(0 < $scope.namePlatforms.length && localStorage.getItem('tokenDomain')) {
                        $location.path('/create-domain');
                        $rootScope.profMenu = false;
                    } else if(0 < $scope.namePlatforms.length && !localStorage.getItem('tokenDomain')){
                        $location.path('/role');
                        $rootScope.profMenu = true;
                    }
                });
            }


            if($location.path() === '/create-domain') {
                if(localStorage.getItem('tokenDomain')) {
                    $location.path('/create-domain');
                    $rootScope.profMenu = false;
                } else {
                    $location.path('/role');
                    $rootScope.profMenu = false;
                }
            }

            $scope.changeDomain = function (name) {
                $scope.domain           = name;
                $scope.showListDomain   = false
            };

            $scope.companyNewDomain = function (domain) {
                var data = {
                    "name": sessionStorage.getItem('newNameCompany')?sessionStorage.getItem('newNameCompany'):$scope.domain,
                    "country": $scope.countryValue,
                    "type": 1,
                    "domain": $scope.domain.toLowerCase().replace(constants.PATTERN.DOMAIN,"")
                };
                api.post('company', data, function (response) {
                    api.post('user/status', {status:"colleagues"}, function (response) {
                        localStorage.setItem('inviteColleagues', true);
                        localStorage.removeItem('tokenDomain');
                        $location.path('/invite-colleagues');
                    });

                },function (error) {
                    $scope.showListDomain = true;
                    $scope.listDomain = error.possible_domains;
                });
            };


        }
    ]);