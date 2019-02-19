App.filter('cDate', function () {
    return function (seconds) {
        if (seconds <= 0)return 'a moment';
        if (seconds < 60)return seconds + ' sec';

        var time = seconds / 60;
        if (time >= 1 && time < 60) return time.toFixed(0) + ' min';
        time = time / 60;
        if (time >= 1 && time < 24) return time.toFixed(0) + (time < 2 ? ' hour' : ' hours');
        time = time / 24;
        if (time >= 1 && time < 30)return time.toFixed(0) + (time < 2 ? ' day' : ' days');
        time = time / 30;
        if (time >= 1 && time < 12)return time.toFixed(0) + (time < 2 ? ' month' : ' months');
        time = time / 12;
        return time.toFixed(0) + (time < 2 ? ' year' : ' years');
    };
});

App.filter('cTime', function () {
    return function (seconds) {
        if (seconds <= 0)return;
        if (seconds < 60){
            function returnSeconds(e){
                if(e<10){
                    return '0'+e;
                }
                else{
                    return e;
                }
            }
            return '00:00:'+returnSeconds(seconds);
        }else{
            function retur(e){
                if(e<10){
                    return '0'+e;
                }
                else{
                    return e;
                }
            }
            var hours= Math.floor((seconds / 3600));
            var minutes = Math.floor(((seconds - hours * 3600) / 60));
            var seconds1 = seconds - (hours * 3600) - (minutes * 60);
            return retur(hours)+':'+retur(minutes)+':'+retur(seconds1);
        }
    }
});

App.filter('cSize', function () {
    return function (size) {
        var i = 0, type = ['b', 'Kb', 'Mb', 'Gb'];
        while ((size / 1000 | 0) && i < type.length - 1) {
            size /= 1024;
            i++;
            var time = size.toFixed(2)+type[i];
        }
        return time;
    };
});

App.filter('cBitRate', function () {
    return function (size) {
        var i = 0, type = ['bps', 'Kbps', 'Mbps', 'Gbps'];
        while ((size / 1000 | 0) && i < type.length - 1) {
            size /= 1000;
            i++;
            var time = size.toFixed(2)+type[i];
        }
        return time;
    };
});

App.filter('otherDate', function () {
    return function (hours) {
        if (seconds <= 0)return 'a moment';
        if (seconds < 60)return seconds + ' sec';
        var time = seconds / 60;
        if (time >= 1 && time < 60) return time.toFixed(0) + ' min';
        time = time / 60;
        if (time >= 1 && time < 24) return time.toFixed(0) + (time < 2 ? ' hour' : ' hours');
        time = time / 24;
        if (time >= 1 && time < 30)return time.toFixed(0) + (time < 2 ? ' day' : ' days');
        time = time / 30;
        if (time >= 1 && time < 12)return time.toFixed(0) + (time < 2 ? ' month' : ' months');
        time = time / 12;
        return time.toFixed(0) + (time < 2 ? ' year' : ' years');
    };
});

App.filter('startFrom', function(){
    return function(input, start){
        start = +start;
        return input.slice(start);
    }
})

