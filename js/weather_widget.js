// Class: WeatherWidget
var WeatherWidget = (function() {
    // Private variables
    var _id, _container, _url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%20%3D%20'http%3A%2F%2Fdatatank.stad.gent%2F4%2Fmilieuennatuur%2Fweersomstandigheden.json'&format=json&diagnostics=true&callback=", _data;

    // Constructor
    WeatherWidget.prototype.constructor = WeatherWidget;
    function WeatherWidget(id, container) {
        _id = id;
        _container = container;
    }

    // Method: toString
    // String representation of object
    WeatherWidget.prototype.toString = function() {
        return "Weather Widget with id " + _id;
    };

    // Method: toString
    // String representation of object
    WeatherWidget.prototype.loadData = function() {

        var self = this;
        Utils.getJSONByPromise(_url).then(
            function(data) {                
                _data = data;
                self.update();
                console.log(_data);
            },
            function(status) {
                console.log(status);
            }
        );
    };

    // Method: update
    WeatherWidget.prototype.update = function() {

        var attributes = _data.query.results.json.properties.attributes;

        _container.querySelector('.now_temp').innerHTML = attributes[0].value + '°C';
        _container.querySelector('.now_wind-speed').innerHTML = attributes[4].value + " Km/h";

    };

    return WeatherWidget;

})();