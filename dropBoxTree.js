'use strict';

App.directive('dropBoxTree', ['dropboxService', function (dropboxService) {
    var selectedIds = [];
    return {
        restrict: 'E',
        templateUrl: '/js/app/views/dropBoxTree.html',
        scope: {
            items:"=",
            data: "="

        },
        link: function(scope,element,$rootScope) {
            var attr = {
                'id':'data-id',
                'state':'data-state',
                'isLeaf':'data-is-leaf'
            };

            var selectStatus = {
                'selected' : 'select selected',
                'unselected' : 'select unselected',
                'particleSelected' :'select  particleSelected'
            };

            var itemTmpl = (function templ(){
                var item = document.createElement('div');
                item.className = 'item';
                var arrow  = document.createElement('span');
                arrow.className = 'arrow child';
                arrow.innerHTML = "<i class='fa fa-caret-right'></i>";
                var select = document.createElement('span');
                select.className = selectStatus['unselected'];
                select.setAttribute('ng-click','selectCheck()');
                select.innerHTML = "<i class='fa color2 fa-check-square'></i>";
                var icon  = document.createElement('span');
                icon.className = 'icon folder';
                var title  = document.createElement('span');
                title.className = 'title';
                var items  = document.createElement('div');
                items.className = 'items';
                item.appendChild(arrow);
                item.appendChild(select);
                item.appendChild(icon);
                item.appendChild(title);
                item.appendChild(items);
                return item;
            })();

            var rootItem = element[0].querySelector('.dropBoxTree');

            function buildSelectedList(param) {
                selectedIds = [];
                var items =  rootItem.querySelector('.item').querySelector('.items').querySelectorAll('.item');
                for(var i=0; i<items.length; i++)selectedIds.push({'id':items[i].getAttribute(attr.id),'sync':items[i].querySelector('.select').getAttribute(attr.state)=='selected'})
                scope.items = selectedIds;
                if(param){
                    if(dropboxService.folderId.length>0){
                        dropboxService.folderId.forEach(function (itemId) {
                            items.forEach(function (dataId) {
                                if (dataId.attributes['data-id'].nodeValue === itemId) {
                                    if(!dataId.childNodes[0].className['down']){
                                        dataId.childNodes[0].click(function () {
                                            dataId.childNodes[0].hasClass('down') ? $(this).removeClass('down') : $(this).addClass('down');
                                            items.style.display = items.style.display === 'none' ? 'block' : 'none';
                                        });
                                    }
                                }
                            });
                        });
                    }
                }

            }

            function processTree(item) {
                var isSelectedItems   = item.querySelectorAll('.items .item[data-is-leaf="true"] span.select.selected').length > 0;
                var isUnselectedItems = item.querySelectorAll('.items .item[data-is-leaf="true"] span.select.unselected').length > 0;
                var children = item.querySelector('.items').children;

                if(isSelectedItems) {
                  item.querySelector('.select').className = selectStatus['particleSelected'];
                  item.querySelector('.select.particleSelected .fa').className = "fa fa-square";
                } else {
                    var state = item.querySelector('.select').getAttribute('data-state');
                    if(state === 'unselected' || !state) {
                        item.querySelector('.select').className = selectStatus['unselected'];
                    }
                }

                $('.select.particleSelected[data-state="selected"]').each(function() {
                    $(this).removeClass('particleSelected');
                    $(this).addClass('selected');
                    $(this).find('.fa').removeClass('fa-square').addClass('fa-check-square');
                });

                if (children.length !== 0) {
                    item.className = 'item parent';
                }

                $('.item[data-is-leaf="false"]').first().addClass('firstItem');
                $('.firstItem span.select').first().hover(function() {
                    var spanState = $(this).hasClass('particleSelected');
                    if (!spanState) {
                        $(this).find('.fa').removeClass('fa-check-square').addClass('fa-minus-square');
                    }
                }, function() {
                    var spanState = $(this).hasClass('particleSelected');
                    if (!spanState) {
                        $(this).find('.fa').removeClass('fa-minus-square').addClass('fa-check-square');
                    }
                });

                $('.item.parent[data-is-leaf="false"] > span.select.selected').hover(function() {
                    var spanState = $(this).hasClass('particleSelected');
                    if (!spanState) {
                        $(this).find('.fa').removeClass('fa-check-square').addClass('fa-minus-square');
                    }
                }, function() {
                    var spanState = $(this).hasClass('particleSelected');
                    if (!spanState) {
                        $(this).find('.fa').removeClass('fa-minus-square').addClass('fa-check-square');
                    }
                });
                for(var i=0; i<children.length; i++) processTree(children[i]);
            }

            function processSelected(item,node) {
                var itemState = item.getAttribute(attr.state);
                item.className = selectStatus[itemState];
                var children = node.querySelectorAll('.item');

                for(var i=0; i<children.length; i++){
                    var currentSelect = children[i].querySelector('.select');
                    currentSelect.setAttribute(attr.state,itemState);
                    processSelected(currentSelect, children[i]);
                }
            }

            function addItem(root,data,isOpen){
                var item  = itemTmpl.cloneNode(true);
                var isLeaf = data.children.length === 0;
                item.setAttribute(attr.id,data.id);
                item.setAttribute('data-is-leaf',isLeaf);
                item.querySelector('.title').innerText=data.name;
                var arrow = item.querySelector('.arrow');
                $('.arrow.child').first().addClass('down');
                $('.icon.folder').first().addClass('dropbox');
                // if(isLeaf) arrow.style.visibility = 'hidden';
                arrow.onclick = function () {
                    $(this).hasClass('down') ? $(this).removeClass('down') : $(this).addClass('down');
                    items.style.display = items.style.display === 'none'?  'block':'none';
                };
                var select = item.querySelector('.select');
                if(data['sync']){
                    select.setAttribute(attr.state,'selected');
                    processSelected(select,item);
                }
                select.onclick = function () {
                    this.setAttribute(attr.state,this.getAttribute(attr.state) === 'selected' ? 'unselected': 'selected');
                    selectedIds = [];
                    processSelected(this,item);
                    processTree(rootItem.querySelector('.item'));
                    buildSelectedList(false);
                };

                var items = item.querySelector('.items');
                if(!isOpen) items.style.display = 'none';
                root.appendChild(item);
                return   item.querySelector('.items');
            }

            function buildChildren(container,dataList,isOpen){
                var children = dataList ? dataList : [];
                children.forEach(function (item) {
                    var itemsSelector = addItem(container,item,isOpen);
                    if(item.children) buildChildren(itemsSelector,item.children,false);
                });
            }

            function scroll(){
              $('.dropBoxTree > .item.parent').addClass('mCustomScrollbar').mCustomScrollbar({
                setHeight: 330,
                live: true,
                autoHideScrollbar: false,
                advanced:{
                  updateOnContentResize: true
                }
              });
            }

            function buildTree(data) {
                utils.dom.deleteChild(rootItem);
                buildChildren(rootItem,data,true);
                processTree(rootItem.querySelector('.item'));
                buildSelectedList(true);
                scroll();
            }

            scope.$watch('data', function(){
                if(scope.data.length > 0)buildTree(scope.data);

                element.find('.item').find('.arrow').mouseup(function () {
                    var idFolders = $(this).parent().attr('data-id');
                    dropboxService.folderId.push(idFolders);
                    if(!$(this).hasClass('down')&& !$(this).parent().hasClass('parent')){
                        dropboxService.selectFolder(idFolders);
                    }
                });
            })
        }
    }
}]);