var Utils = {
    getParamsFromUrl: function (url) {
        var regex = /[?&]([^=#]+)=([^&#]*)/g,
            params = {},
            match;
        while (match = regex.exec(url)) {
            params[match[1]] = match[2];
        }
        return params;
    },
    getJSONByPromise: function (url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('get', url, true);
            xhr.responseType = 'json';
            xhr.onload = function () {
                if (xhr.status == 200) {
                    var data = (!xhr.responseType) ? JSON.parse(xhr.response) : xhr.response;
                    resolve(data);
                } else {
                    reject(status);
                }
            };
            xhr.onerror = function () {
                reject(Error("Network Error"));
            };
            xhr.send();
        });
    },
    getJSONPByPromise: function (url) {

        var script = document.createElement('script');
        script.src = url;

        script.onload = function () {
            this.remove();
        };// After scripts is loaded and executed, remoe it from the DOM

        var head = document.getElementsByTagName('head')[0];
        head.insertBefore(script, head.firstChild);// Insert script into the DOM

        var params = this.getParamsFromUrl(url);
        var callbackStr = 'json_callback';
        if (params['prefix']) {
            callbackStr = params['prefix'];
        } else if (params['callback']) {
            callbackStr = params['callback'];
        }
        return new Promise(function (resolve, reject) {
            window[callbackStr] = function (data) {
                resolve(data);
            }
        });
    },
    login: function () {
        if (document.querySelector("#navheadlogin li:nth-of-type(5)").innerHTML = "Log in") {
            document.querySelector("#navheadlogin li:nth-of-type(5)").style.display = 'none';
            document.querySelector("#navsidelogin li:nth-of-type(6) a").innerHTML = 'Profiel';

        } else {
            document.querySelector("#navheadlogin li:nth-of-type(5)").style.display = 'visible';
            document.querySelector("#navsidelogin li:nth-of-type(6) a").innerHTML = 'Registreer';
        }
    },
    getXMLByPromise: function (url) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open("get", url, true);
            request.onload = function () {
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
    trim: function (str) {
        return str.replace(/^\s+|\s+$/gm, '');
    },
    guid: function () {
        var i, random;
        var uuid = '';

        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    },
    store: function (namespace, data) {
        if (arguments.length > 1) {
            return localStorage.setItem(namespace, JSON.stringify(data));
        } else {
            var storedData = localStorage.getItem(namespace);
            return (storedData && JSON.parse(storedData)) || null;
        }
    },
    getAge: function (dayOfBirth) {
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
    surprise: function (randnumber) {
        var i = randnumber;
        var element = document.getElementsByClassName("leaflet-marker-pane img");
        element[i].click();
    },
    Weather: function (lang, long) {
        // Private variables
        var long = long;
        var lat = lang;
        var key = "f65ba1d676eb487aed3f0555d935a10e";
        var fulldtext = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%20%3D%20%22http%3A%2F%2Fapi.openweathermap.org%2Fdata%2F2.5%2Fweather%3Flat%3D50.93781%26lon%3D4.040952%26APPID%3Df65ba1d676eb487aed3f0555d935a10e%22&diagnostics=true";
        var WUrlFirst = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%20%3D%20%22http%3A%2F%2Fapi.openweathermap.org%2Fdata%2F2.5%2Fweather%3Flat%3D" + lat + "%26lon%3D" + long + "%26APPID%3D" + key + "%22&diagnostics=true";
        // Inladen data Weather
        Utils.getXMLByPromise(WUrlFirst).then(
            function (data) {
                var allcoords = data.querySelectorAll('coordinates');
                function FtoC(far) {
                    var Cel = ((far - 32) / 1, 8);
                    return Cel;
                };
                function GetWicon(icon) {
                    var Iconurl = "http://openweathermap.org/img/w/" + icon + ".png"
                    return Iconurl;
                }
                _xmldata = data;
                // info
                var Stad = _xmldata.getElementsByTagName('name')[0].childNodes[0].nodeValue;
                var Windsnel = _xmldata.getElementsByTagName('speed')[0].childNodes[0].nodeValue;
                var MinimumtempF = _xmldata.getElementsByTagName('temp_min')[0].childNodes[0].nodeValue;
                var MaximumtempF = _xmldata.getElementsByTagName('temp_max')[0].childNodes[0].nodeValue;
                var TempF = _xmldata.getElementsByTagName('temp')[0].childNodes[0].nodeValue;
                var MinimumtempC = FtoC(MinimumtempF);
                var MaximumtempC = FtoC(MaximumtempF);
                var TempC = FtoC(TempF);
                var Iconurl = GetWicon(_xmldata.getElementsByTagName('icon')[0].childNodes[0].nodeValue);

                if (TempC < 0) {
                    document.querySelector('.temp').style.backgroundColor = "#CO392B";
                };
                var tempstring = "";
                tempstring += "<img src=" + Iconurl + " alt='Het weer in " + Stad + "' height='80' width='80'><p><span class='temp'>" + TempC + "°C</span></p>";
                tempstring += "<p>Minimum: " + MinimumtempC + "°C <br> Maximum: " + MaximumtempC + "°C</p><br>";
                tempstring += "<p>windsnelheid " + Windsnel + " m/s</p><br>";

                document.querySelector('.OpenWeather').innerHTML = tempstring;
                document.querySelector('.weather-title').innerHTML = "Het weer in " + Stad;
            },
            function (status) {
                console.log(status);
            }
        );
    }
}