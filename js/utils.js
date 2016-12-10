var Utils = {
    getParamsFromUrl: function(url) {
        var regex = /[?&]([^=#]+)=([^&#]*)/g,
            params = {},
            match;
        while(match = regex.exec(url)) {
            params[match[1]] = match[2];
        }
        return params;
    },
    getJSONByPromise: function(url){
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('get', url, true);
            xhr.responseType = 'json';
            xhr.onload = function() {
                if (xhr.status == 200) {
                    var data = (!xhr.responseType)?JSON.parse(xhr.response):xhr.response;
                    resolve(data);
                } else {
                    reject(status);
                }
            };
            xhr.onerror = function() {
                reject(Error("Network Error"));
            };
            xhr.send();
        });
    },
    getJSONPByPromise: function(url) {

        var script = document.createElement('script');
        script.src = url;

        script.onload = function () {
            this.remove();
        };// After scripts is loaded and executed, remoe it from the DOM

        var head = document.getElementsByTagName('head')[0];
        head.insertBefore(script, head.firstChild);// Insert script into the DOM

        var params = this.getParamsFromUrl(url);
        var callbackStr = 'json_callback';
        if(params['prefix']) {
            callbackStr = params['prefix'];
        } else if(params['callback']) {
            callbackStr = params['callback'];
        }
        return new Promise(function(resolve, reject) {
            window[callbackStr] = function(data) {
                resolve(data);
            }
        });
    },
    login: function(){
        document.querySelector("#navheadlogin li:nth-of-type(5)").innerHTML = "logout";
		document.querySelector("#navsidelogin li:nth-of-type(5) a").innerHTML = "logout";

		document.querySelector("#navheadlogin li:nth-of-type(6) a").style.display = 'none';
		document.querySelector("#navsidelogin li:nth-of-type(6) a").style.display = 'none';
    },
    getXMLByPromise: function(url) {   
      return new Promise(function(resolve, reject){
        var request = new XMLHttpRequest();
        request.open("get", url, true);
        request.onload = function(){
            if (request.status == 200) {
                    var data = request.responseXML;
                    resolve(data);
                } else {
                    reject(status);
                }
        };
        request.send();  
        
      })
    },
    pluralize: function (count, word) {
        return count === 1 ? word : word + 's';
    },
    trim: function(str){
        return str.replace(/^\s+|\s+$/gm,'');
    },
    guid: function(){
        var i, random;
        var uuid = '';

        for (i = 0; i < 32; i++){
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    },
    store: function(namespace, data) {
        if(arguments.length > 1) {
            return localStorage.setItem(namespace, JSON.stringify(data));
        } else {
            var storedData = localStorage.getItem(namespace);
            return (storedData && JSON.parse(storedData)) || null;
        }
    },
    getAge: function(dayOfBirth) {
        var now = new Date();
        var thisYear = 0;
        if (now.getMonth() < dayOfBirth.getMonth()) {
            thisYear = 1;
        } else if ((now.getMonth() == dayOfBirth.getMonth()) && now.getDate() < dayOfBirth.getDate()) {
            thisYear = 1;
        }
        var age = now.getFullYear() - dayOfBirth.getFullYear() - thisYear;
        return age;
    },
    surprise: function(randnumber){
        var i = randnumber;
        var element = document.getElementsByClassName("leaflet-marker-pane img");
        element[i].click();
        

    }
    
}