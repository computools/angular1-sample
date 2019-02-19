'use strict';
App.factory('whitelabel',
    ['api', '$location', '$rootScope', 'hardStorage', 'notification', 'API_URL',
        function (api, $location, $rootScope, hardStorage, notification, API_URL) {
            var currentCustomizationObject = null;
            var currentDomain = config.url.rootHost;
            function createCustomizationObject(logo,logoStyle,headerColor,buttonColor,buttonActiveColor,buttonHoverColor){
                var obj =  {
                    'headerColor':headerColor,
                    'buttonColor':buttonColor,
                    'buttonActiveColor':buttonActiveColor,
                    'buttonHoverColor':buttonHoverColor
                };
                if(logo && logo !== ''){
                    obj['logo']= logo;
                    obj['logoStyle']=logoStyle;
                }
                return obj;
            }
            function setByHardStore(){
                var str =  hardStorage.get(customization.marker);
                if(str && str !== 'null') currentCustomizationObject = JSON.parse(str);
            }
            return {
                processToken: function(){
                    var token  = utils.querys.getParameterByName('intoken',window.location.search);
                    var refreshToken = utils.querys.getParameterByName('refreshToken',window.location.search);
                    if(token){
                        api.token(token);
                        api.refreshToken(refreshToken);
                        window.location = '/library';
                    }
                },
                setByHardStore: function(){
                    currentCustomizationObject = JSON.parse( hardStorage.get(customization.marker));
                },
                setByDomain: function (domian) {
                    if(domian === window.location.hostname){
                        var domain = domian.split('.');
                        api.get('whitelabel/bydomain?domain='+domain[0],function(resp){
                            currentCustomizationObject = resp.settings;
                            hardStorage.set(customization.marker,JSON.stringify(currentCustomizationObject));
                            customization.insertStyles(currentCustomizationObject);
                        },function(){
                            hardStorage.remove(customization.marker);
                            customization.removeStyles();
                        });
                    }

                },
                setByCurrentUser: function(){
                    if(window.location.hostname !== API_URL.root) {
                        api.get('company', function (resp) {
                            if (resp['domain'] && resp['domain'] !== '' && resp['domain'] !== window.location.hostname.split('.')[0]) {
                                var token = api.token();
                                var refreshToken = api.refreshToken();
                            }
                            if (resp['data'] && resp['data'] !== 'null' && resp['data'] !== '') {
                                currentCustomizationObject = JSON.parse(resp['data']);
                                currentCustomizationObject.logo = resp['logo'];
                                hardStorage.set(customization.marker, JSON.stringify(currentCustomizationObject));
                                customization.insertStyles(currentCustomizationObject);
                            }else{
                                currentCustomizationObject = {
                                    buttonActiveColor:"#289472",
                                    buttonColor:"#3ca886",
                                    buttonHoverColor:"#50bc9a",
                                    headerColor: "#222b45",
                                };
                                hardStorage.set(customization.marker, JSON.stringify(currentCustomizationObject));
                                customization.insertStyles(currentCustomizationObject);
                            }
                        }, function () {
                            hardStorage.remove(customization.marker);
                            customization.removeStyles();
                        });
                    }
                    return false;
                },
                save:function(isNew,domain,logo,logoStyle,headerColor,buttonColor,buttonActiveColor,buttonHoverColor,done){

                    var customizationObject = createCustomizationObject(logo,logoStyle,headerColor,buttonColor,buttonActiveColor,buttonHoverColor);
                    var data = {
                        'data':customizationObject
                    };
                    console.log(data);
                    if(isNew) data['domain']= domian+'.'+domain;
                    api.patch('company',data,function(resp){
                        notification.addMessage($location.path(),'Customisation saved','New customisation saved');
                        currentCustomizationObject = customizationObject;
                        hardStorage.set(customization.marker,JSON.stringify(currentCustomizationObject));
                        customization.insertStyles(currentCustomizationObject);
                        done();
                    },function(err){
                        notification.addError($location.path(),'Customisation save failed',err.message);
                        done();
                    });
                },
                domain : function(){
                    return window.location.hostname.replace('.'+currentDomain,'');
                },
                customizationObject : function(){
                    if(!currentCustomizationObject)setByHardStore();
                    return currentCustomizationObject;
                },
                user : api.user
            };
        }]
);
