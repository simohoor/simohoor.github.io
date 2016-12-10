// Navigation toggle
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// Show warning after submit of contact form
document.addEventListener("submit", function(){
    document.getElementById('succes').innerHTML = "Het bericht is verzonden!";
});	
// Name and Password from the register-form
var naam = document.getElementById('naam');
var pw = document.getElementById('pw');

// Storing input from register-form
function store() {

    localStorage.setItem('naam', naam.value);
    localStorage.setItem('pw', pw.value);	
	alert("U ben geregistreerd " + localStorage.getItem('naam') + "!");
}

// Check if stored data from register-form is equal to entered data in the login-form
function check() {

    // Stored data from the register-form
    var storedName = localStorage.getItem('naam');
	var storedPw = localStorage.getItem('pw');

    // Entered data from the login-form
    var userName = document.getElementById('userName');
    var userPw = document.getElementById('userPw');

    // Check if stored data from register-form is equal to data from login form
    if(userName.value == storedName && userPw.value == storedPw ) {
        alert('U bent ingelogd');
    } 
	else {
		alert('Wachtwoord of gebruikersnaam is foutief. Probeer het nog eens.');
	}
}
;(function() {
	
	function Wtdapp(){	
		// Variables
		var map;			
		// URL of the Search API
		this.API_URL_FILMVOORSTELLINGENXML = "https://datatank.stad.gent/4/cultuursportvrijetijd/historischefilmvoorstellingen.xml"
		this.API_URL_BIOSCOPENXML = 'https://datatank.stad.gent/4/cultuursportvrijetijd/bioscopen.xml'
		this.API_URL_SPORTCENTRAXML = 'https://datatank.stad.gent/4/cultuursportvrijetijd/sportcentra.xml'
		this.API_URL_BIBLIOTHEKENXML = 'https://datatank.stad.gent/4/cultuursportvrijetijd/bibliotheek.xml';
		this.API_URL_MUSEA = "https://datatank.stad.gent/4/cultuursportvrijetijd/kunstenplan.json";
		
		// Initialize App
		this.init = function() {

			// Load Film map
			var film =  document.getElementById('mapfilm');
			if (typeof(film) != 'undefined' && film != null)
			{
				this.CreateFilm();
			}	

			// Load Sports map
			var sport =  document.getElementById('mapsportuitstap');
			if (typeof(sport) != 'undefined' && sport != null)
			{				
				this.CreateSportUitstap();
			}

			// Load Literature map
			var literatuur =  document.getElementById('mapliteratuur');
			if (typeof(literatuur) != 'undefined' && literatuur != null)
			{
				this.CreateLiterature();
			}
			// Weather
			this.CreateWeatherWidget();

			// Load surprise
			var surprise = document.getElementById('mapsurprise');
			if (typeof(surprise) != 'undefined' && surprise != null)
			{
				this.CreateSurprise();
			}		
    	};

		this.CreateWeatherWidget = function() {
            var weatherWidget1 = new WeatherWidget(0, document.querySelector('.weather-widget'));
            weatherWidget1.loadData();
        },
		this.CreateSportUitstap = function () {	
			var _urlxml = this.API_URL_SPORTCENTRAXML;

			map = L.map('mapsportuitstap').setView([51.0543, 3.7174], 12.45);	
			// Current location
			navigator.geolocation.getCurrentPosition(function(position) {
				var latit = position.coords.latitude;
				var longit = position.coords.longitude; 
				// Map achtergrond
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map);			
				L.Routing.control({				
					waypoints: [					
						// Current location
						L.latLng(latit, longit),
						// Centrum Gent
						L.latLng(51.0535, 3.7304)
					],
					routeWhileDragging: true
				}).addTo(map)
			});		
			// Inladen xmldata
				Utils.getXMLByPromise(_urlxml).then(
					function(data){
						
						// Icon
						var myIcon = L.icon({
							iconUrl: '/images/icons/green.png',
							iconRetinaUrl: 'my-icon@2x.png',
							iconSize: [27, 41],
							
						});		
						var allcoords = data.querySelectorAll('coordinates');			
						for(i=0; i < allcoords.length; i++){
							_xmldata = data.getElementsByTagName('coordinates')[i];
							// Global
							var temp = allcoords[i].parentElement.parentElement;
							var temp1 = temp.querySelectorAll('SimpleData');
							// Name					
							var nametemp2 = temp1[1].textContent;
							
							// Location
							var wholeString = _xmldata.childNodes[0];
							var longandlat = wholeString.nodeValue.substring(0,wholeString.nodeValue.length-3);	
							var indexcomma = longandlat.indexOf(",");
							var long = longandlat.substring(0, indexcomma);
							var lat	= longandlat.substring(indexcomma + 1, longandlat.length);	
							// Street						
							var streettemp2 = temp1[2].textContent;	
							// Housenr	
							var housenrtemp2 = temp1[3].textContent;	
							// Postalcode	
							var postalcodetemp2 = temp1[4].textContent;	
							// City
							var citytemp2 = temp1[5].textContent;
							var typetemp2 = temp1[6].textContent;
							var tempstring = "";
								tempstring += '<h3>' + nametemp2 + '</h3>';	
								tempstring += '<p>' + streettemp2 + ' ' + housenrtemp2 + '<br>';
								tempstring += postalcodetemp2+ ' ' + citytemp2 +  '<br>';
								tempstring += typetemp2 + '</p>';
								tempstring += '<iframe src="https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Fsimohoor.github.io%2F&layout=button&size=large&mobile_iframe=true&width=71&height=28&appId" width="71" height="28" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>';
								
								// Markers 
								L.marker([lat, long], {icon: myIcon}).addTo(map)
								.bindPopup(tempstring)    
						}
						 						
					},		
					
					function(status){
						console.log(status);
					}	
					
				);
					
    	},
		this.CreateFilm = function () {
			var _url = this.API_URL_BIOSCOPEN;
			var _urlFilm = this.API_URL_FILMVOORSTELLINGEN;

			var _urlxml = this.API_URL_BIOSCOPENXML;
			var _urlFilmxml = this.API_URL_FILMVOORSTELLINGENXML;

			map = L.map('mapfilm').setView([51.0543, 3.7174], 12.45);	
			// Current location
			navigator.geolocation.getCurrentPosition(function(position) {
				var latit = position.coords.latitude;
				var longit = position.coords.longitude; 
				// Map achtergrond
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map);			
				L.Routing.control({				
					waypoints: [					
						// Current location
						L.latLng(latit, longit),
						// Centrum Gent
						L.latLng(51.0535, 3.7304)
					],
					routeWhileDragging: true
				}).addTo(map)
			});	
			// Inladen data voorstellingen
				Utils.getXMLByPromise(_urlFilmxml).then(
					function(data){
						var allcoords = data.querySelectorAll('coordinates');
						// Icon
						var myIcon = L.icon({
							iconUrl: '/images/icons/green.png',
							iconRetinaUrl: 'my-icon@2x.png',
							iconSize: [27, 41],
							
						});								
						for(i=0; i < allcoords.length; i++){
							_xmldata = data.getElementsByTagName('coordinates')[i];
							// Global
							var temp = allcoords[i].parentElement.parentElement;
							var temp1 = temp.querySelectorAll('SimpleData');
							// Name					
							var nametemp2 = temp1[1].textContent;
							
							// Location
							var wholeString = _xmldata.childNodes[0];
							var longandlat = wholeString.nodeValue.substring(0,wholeString.nodeValue.length-3);	
							var indexcomma = longandlat.indexOf(",");
							var long = longandlat.substring(0, indexcomma);
							var lat	= longandlat.substring(indexcomma + 1, longandlat.length);	
							// Street						
							var streettemp2 = temp1[3].textContent;	
							// Housenr	
							var housenrtemp2 = temp1[4].textContent;	
							// Postalcode	
							var postalcodetemp2 = temp1[5].textContent;	
							// City
							var citytemp2 = temp1[6].textContent;
							// Jaargang
							var typetemp2 = temp1[7].textContent;
							var tempstring = "";
								tempstring += '<h3>' + nametemp2 + '</h3>';	
								tempstring += '<p>' + streettemp2 + ' ' + housenrtemp2 + '<br>';
								tempstring += postalcodetemp2+ ' ' + citytemp2 + '<br>';
								tempstring += "Jaargang : " + typetemp2 + '<br>';
								tempstring += "Categorie : historische filmvoorstelling</p>";
								tempstring += '<iframe src="https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Fsimohoor.github.io%2F&layout=button&size=large&mobile_iframe=true&width=71&height=28&appId" width="71" height="28" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>';
														
								// Markers 
								L.marker([lat, long], {icon: myIcon}).addTo(map)
								.bindPopup(tempstring)    
						}
						
					},		
					function(status){
						console.log(status);
					}	
					
				);
			// Inladen data bioscopen
			Utils.getXMLByPromise(_urlxml).then(
				
					function(data){
						var allcoords = data.querySelectorAll('coordinates');	
						// Icon
						var myIcon = L.icon({
							iconUrl: '/images/icons/red.png',
							iconRetinaUrl: 'my-icon@2x.png',
							iconSize: [27, 41],
							
						});			
						for(i=0; i < allcoords.length; i++){
							_xmldata = data.getElementsByTagName('coordinates')[i];
							// Global
							var temp = allcoords[i].parentElement.parentElement;
							var temp1 = temp.querySelectorAll('SimpleData');
							// Name					
							var nametemp2 = temp1[2].textContent;
							
							// Location
							var wholeString = _xmldata.childNodes[0];
							var longandlat = wholeString.nodeValue.substring(0,wholeString.nodeValue.length-3);	
							var indexcomma = longandlat.indexOf(",");
							var long = longandlat.substring(0, indexcomma);
							var lat	= longandlat.substring(indexcomma + 1, longandlat.length);	
							// Street						
							var streettemp2 = temp1[3].textContent;	
							
							var tempstring = "";
								tempstring += '<h3>' + nametemp2 + '</h3>';	
								tempstring += '<p>' + streettemp2 + '<br>';
								tempstring += "Categorie : bioscoop </p>";
								tempstring += '<iframe src="https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Fsimohoor.github.io%2F&layout=button&size=large&mobile_iframe=true&width=71&height=28&appId" width="71" height="28" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>';														
								// Markers 
								L.marker([lat, long], {icon: myIcon}).addTo(map)
								.bindPopup(tempstring)    
						}
						
					},		
					function(status){
						console.log(status);
					}	
					
				);	
    	
		},
		this.CreateLiterature = function () {
			var _url = this.API_URL_BIBLIOTHEKENXML;
			var _urlmusea = this.API_URL_MUSEA;
			map = L.map('mapliteratuur').setView([51.0543, 3.7174], 12.45);	
			// Current location
			navigator.geolocation.getCurrentPosition(function(position) {
				var latit = position.coords.latitude;
				var longit = position.coords.longitude; 
				// Map achtergrond
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map);			
				L.Routing.control({				
					waypoints: [					
						// Current location
						L.latLng(latit, longit),
						// Centrum Gent
						L.latLng(51.0535, 3.7304)
					],
					routeWhileDragging: true
				}).addTo(map)
			});
	
			// Inladen data 
				Utils.getXMLByPromise(_url).then(
					function(data){
						var allcoords = data.querySelectorAll('coordinates');	
						// Icon
						var myIcon = L.icon({
							iconUrl: '/images/icons/green.png',
							iconRetinaUrl: 'my-icon@2x.png',
							iconSize: [27, 41],
							
						});		
						for(i=0; i < allcoords.length; i++){
							_xmldata = data.getElementsByTagName('coordinates')[i];
							// Global
							var temp = allcoords[i].parentElement.parentElement;
							var temp1 = temp.querySelectorAll('SimpleData');
							// Name					
							var nametemp2 = temp1[1].textContent;
							
							// Location
							var wholeString = _xmldata.childNodes[0];
							var longandlat = wholeString.nodeValue.substring(0,wholeString.nodeValue.length-3);	
							var indexcomma = longandlat.indexOf(",");
							var long = longandlat.substring(0, indexcomma);
							var lat	= longandlat.substring(indexcomma + 1, longandlat.length);	

							var tempstring = "";
							tempstring += '<h3>' + nametemp2 + '</h3>';
							tempstring += "Categorie : bibliotheek </p>";
							tempstring += '<iframe src="https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Fsimohoor.github.io%2F&layout=button&size=large&mobile_iframe=true&width=71&height=28&appId" width="71" height="28" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>';	
																	
							// Markers 
							L.marker([lat, long], {icon: myIcon}).addTo(map)
							.bindPopup(tempstring)    
						}
						
					},		
					function(status){
						console.log(status);
					}
				);

				Utils.getJSONByPromise(_urlmusea).then(
					
					function(data) {
						// Icon
						var myIcon = L.icon({
							iconUrl: '/images/icons/red.png',
							iconRetinaUrl: 'my-icon@2x.png',
							iconSize: [27, 41],
							
						});							
						_dataMusea = data;					
						var i = 0;		
						var templat;
						var templong;		
						while (i <= _dataMusea.length ){
							templat = _dataMusea[i].latitude
							templong = _dataMusea[i].longitude
							// Stringbuilder
							var tempstring = "";
							tempstring += '<h3>' + _dataMusea[i].Naam + '</h3>';
							tempstring += '<p>' + _dataMusea[i].Straat + ' ' + _dataMusea[i].huisnr + '<br>';
							tempstring += _dataMusea[i].Postcode + ' ' + _dataMusea[i].Gemeente +  '<br>';
							tempstring += '<a href=http://' + _dataMusea[i].website + ' target=_blank>' + _dataMusea[i].website + '</a><br>';
							tempstring += "Categorie : museum</p>";
							tempstring += '<iframe src="https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Fsimohoor.github.io%2F&layout=button&size=large&mobile_iframe=true&width=71&height=28&appId" width="71" height="28" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>';

							// Markers 
							L.marker([templat, templong], {icon: myIcon}).addTo(map)
							.bindPopup(tempstring)    
							i++
						}
						console.log("musea");
					    UpdateMusea();
					},
					function(status) {
						console.log(status);
					}
				);		
				function UpdateMusea(){
					L.geoJson(_dataMusea).addTo(map);
				};
				function UpdateBibliotheek(){
					L.geoJson(_data).addTo(map);
				}		
    	};	
		this.CreateSurprise = function(){			
			var myArray = ['mapfilm', 'mapsportuitstap', 'mapliteratuur'];    
			var rand = myArray[Math.floor(Math.random() * myArray.length)];
			var surpr = document.getElementById("mapsurprise");
			if(typeof(surpr) != 'undefined' && surpr != null){
				surpr.id = rand;
			}else{
				surpr = document.getElementsByClassName("mapcontainer").id = rand;
			}
			switch(rand) {
				case "mapfilm":
					this.CreateFilm();
					break;
				case "mapsportuitstap":
					this.CreateSportUitstap();
					break;
				case "mapliteratuur":
					this.CreateLiterature();
					break;			
			}
			var amountofmarkers = $('.leaflet-marker-pane img').length;
		
			var randommarker = Math.floor(Math.random() * amountofmarkers) + 1;
			Utils.surprise(randommarker);
		}	
	}

	var app = new Wtdapp();  
	app.init();
	
  })();

  