// navigation toggle
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
;(function() {
	function Wtdapp(){	
		//variables
		var map;			
		// URL of the Search API
		this.API_URL_FILMVOORSTELLINGENXML = "https://datatank.stad.gent/4/cultuursportvrijetijd/historischefilmvoorstellingen.xml"
		this.API_URL_BIOSCOPENXML = 'https://datatank.stad.gent/4/cultuursportvrijetijd/bioscopen.xml'
		this.API_URL_SPORTCENTRAXML = 'https://datatank.stad.gent/4/cultuursportvrijetijd/sportcentra.xml'
		this.API_URL_BIBLIOTHEKENXML = 'https://datatank.stad.gent/4/cultuursportvrijetijd/bibliotheek.xml';
		this.API_URL_MUSEA = "https://datatank.stad.gent/4/cultuursportvrijetijd/kunstenplan.json";
		
		// Initialize App
		this.init = function() {

			// Hack
			var that = this;
			
			this._unitTesting = false; // Unit Testing the features in ApplicationDbContext or not
            this._widthHandlebarsAndLoDash = true; // Use Handlebars Template Engine And LoDash or Not

            this.URLRANDOMUSERME = 'http://api.randomuser.me/?results=500&callback=json_callback';// Cache the url with random users in variable URLRANDOMUSERME

            this._applicationDbContext = ApplicationDbContext; // Reference to the ApplicationDbContext object
            this._applicationDbContext.init('ahs.gdm.mmp.lecturerama'); // Initialize the ApplicationDbContext object via the methode init. Do not forget the connection string as a parametervalue of this function
            this._userManager = UserManager; // Reference to the UserManager object
            this._userManager.init(this._applicationDbContext);// Initialize the UserManager object via the methode init. Do not forget the reference to the this._applicationDbContext variable as a parametervalue of this function

            this._frmLogin = document.querySelector('#frm-login'); // Cache Form Login
            this.registerEventListeners(); // Register the Event Listeners for all present elements

			this._hbsCache = {};// Handlebars cache for templates
			this._hbsPartialsCache = {};// Handlebars cache for partials

            this._activeUser = null; // Active User


            if(this._unitTesting || this._applicationDbContext.getLecturers() == null) {
                this.unitTests();
            }

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

			this.CreateWeatherWidget();
			
    	};

        this.registerEventListeners = function() {

            // Event Listeners for Form Login
            if(this._frmLogin != null) {
                var self = this; // Hack for this keyword within an event listener of another object

                this._frmLogin.addEventListener('submit', function(ev) {
                    ev.preventDefault();

                    var userName = Utils.trim(this.querySelectorAll('[name="txtUserName"]')[0].value);
                    var passWord = Utils.trim(this.querySelectorAll('[name="txtPassWord"]')[0].value);
                    var result = self._userManager.login(userName, passWord);
                    if(result == null) {

                    } else if(result == false) {

                    } else {
                        self._activeUser = result; // User is Logged in
                        self.updateUI();
                    }
                    
                    return false;
                });
            }

        },
        this.updateUI = function() {
            if( this._widthHandlebarsAndLoDash) {
                this.updateUILecturers('list-lecturers', '#template-list-lecturers');
            } else {
                this.updateUIOldSchoolLecturers();
            }
        },
        this.updateUIOldSchoolLecturers = function() {
            if(this._applicationDbContext.getTinderizeLecturersByUserId(this._activeUser.Id) != null) {
                var tempStr = '';
                var ch = window.innerHeight - 110;
                console.log("test");
                var lecturers = this._applicationDbContext.getTinderizeLecturersByUserId(this._activeUser.Id), lecturer = null;
                for(var i=0;i<lecturers.length;i++) {
                    var lecturer = lecturers[i];
                    tempStr += '<div class="lecturer" data-id="' + lecturer.Id + '">';
                    tempStr += '<div class="lecturer__meta">' + '<span class="lecturer__gender">' + Genders.properties[lecturer.Gender].name + '</span>' + '<span class="lecturer__age">' + Utils.getAge(new Date(lecturer.DayOfBirth)) + '</span>' + '</div>';
                    tempStr += '<picture class="lecturer__picture">';
                    tempStr += '<img src="' + lecturer.Picture + '" />';
                    tempStr += '</picture>';
                    tempStr += '<h3 class="lecturer__name">' + lecturer.FirstName + ' ' + lecturer.SurName + '</h3>';
                    tempStr += '<div class="lecturer__actions">';
                    tempStr += '<span class="material-icons like" data-id="' + lecturer.Id + '" data-tinderize="1">&#xE87D;</span>';
                    tempStr += '<span class="material-icons dislike" data-id="' + lecturer.Id + '" data-tinderize="2">&#xE043;</span>';
                    tempStr += '</div>';
                    tempStr += '</div>';
                };

                document.querySelector('.list-lecturers-content').innerHTML = tempStr;
                
                this.registerLecturerEventListeners(); // Register EventListeners for all like and dislike buttons
            }
        },
        this.updateUILecturers = function(hbsTmplName, hbsTmplId) {
            if(!this._hbsCache[hbsTmplName]) {
				var src = document.querySelector(hbsTmplId).innerHTML;// Get the contents from the specified hbs template
				this._hbsCache[hbsTmplName] = Handlebars.compile(src);// Compile the source and add it to the hbs cache
			}	
			document.querySelector('.list-lecturers-content').innerHTML = this._hbsCache[hbsTmplName](this._applicationDbContext.getTinderizeLecturersByUserId(this._activeUser.Id));// Write compiled content to the appropriate container

            this.registerLecturerEventListeners(); // Register EventListeners for all like and dislike buttons
        },
        this.registerLecturerEventListeners = function() {
            var self = this;

            var lecturerElements = document.querySelectorAll('.lecturer');
            if(lecturerElements != null && lecturerElements.length > 0) {
                var lecturerElement = null;
                for(var i=0;i<lecturerElements.length;i++) {
                    lecturerElement = lecturerElements[i];
                    lecturerElement.querySelector('.like').addEventListener('click', function(ev) {
                        self.addTinderizeLecturer(this.dataset.id, this.dataset.tinderize);
                    });
                    lecturerElement.querySelector('.dislike').addEventListener('click', function(ev) {
                        self.addTinderizeLecturer(this.dataset.id, this.dataset.tinderize);
                    });
                }
            }
        },
        this.addTinderizeLecturer = function(lecturerId, tinderize) {
            var tinderizeLecturer = new TinderizeLecturer();
            tinderizeLecturer.UserId = this._activeUser.Id;
            tinderizeLecturer.LecturerId = lecturerId;
            tinderizeLecturer.Tinderize = tinderize;
            var tinderizeLecturerAdded = this._applicationDbContext.addTinderizeLecturer(tinderizeLecturer);

            if(tinderizeLecturerAdded != null) {
                var lecturerElement = document.querySelector(`.lecturer[data-id="${lecturerId}"]`);

                if(lecturerElement != null) {
                    lecturerElement.parentElement.removeChild(lecturerElement);
                }
            }
        },
        this.unitTests = function() {

            var self = this; // Closure

            //Unit Testing the Lecturers
            if(this._applicationDbContext.getLecturers() == null) {

                // Load JSON from corresponding RandomUserMe API with certain URL
                Utils.getJSONPByPromise(this.URLRANDOMUSERME).then(
                    function(data) {
                        var users = data.results, lecturer = null, user = null;
                        for(var i=0;i<users.length;i++) {
                            user = users[i];
                            lecturer = new Lecturer();
                            lecturer.FirstName = user.name.first;
                            lecturer.SurName = user.name.last;
                            lecturer.DayOfBirth = new Date(user.dob);
                            lecturer.UserName = user.login.username;
                            lecturer.PassWord = user.login.password;
                            lecturer.Email = user.email;
                            lecturer.Picture = user.picture.large;
                            switch(user.gender) {
                                case 'male': lecturer.Gender = Genders.MALE;break;
                                case 'female': lecturer.Gender = Genders.FEMALE;break;
                                default: lecturer.Gender = Genders.NOTKNOWN;break;
                            }
                            var lecturerAdded = self._applicationDbContext.addLecturer(lecturer);
                        }
                    },
                    function(status) {
                        console.log(status);
                    }
                );

            } else {
                // Update a lecturer
                var id = this._applicationDbContext.getLecturers()[0].Id;
                var lecturer = this._applicationDbContext.getLecturerById(id);
                if(lecturer != null) {
                    lecturer.FirstName = 'Olivia';
                    var result = this._applicationDbContext.updateLecturer(lecturer);
                    console.log(result);
                }

                // Soft delete or undelete a lecturer
                lecturer = this._applicationDbContext.getLecturerById(id);
                if(lecturer != null) {
                    var result = (lecturer.DeletedAt == null || lecturer.DeletedAt == undefined)?this._applicationDbContext.softDeleteLecturer(lecturer.Id):this._applicationDbContext.softUnDeleteLecturer(lecturer.Id);
                    console.log(result);
                }

                // Delete a lecturer
                lecturer = this._applicationDbContext.getLecturerById(id);
                if(lecturer != null) {
                    var result = this._applicationDbContext.deleteLecturer(lecturer.Id)
                    console.log(result);
                }
            }

        },
		this.CreateWeatherWidget = function() {
            var weatherWidget1 = new WeatherWidget(0, document.querySelector('.weather-widget'));
            weatherWidget1.loadData();
        },
		this.CreateSportUitstap = function () {	
			var _urlxml = this.API_URL_SPORTCENTRAXML;

			map = L.map('mapsportuitstap').setView([51.0543, 3.7174], 12.45);	
			//current location
			navigator.geolocation.getCurrentPosition(function(position) {
				var latit = position.coords.latitude;
				var longit = position.coords.longitude; 
				// Map achtergrond
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map);			
				L.Routing.control({				
					waypoints: [					
						// Moet current location worden
						L.latLng(latit, longit),
						// Moet gevraagde destination worden
						L.latLng(51.0535, 3.7304)
					],
					routeWhileDragging: true
				}).addTo(map)
			});		
			//inladen xmldata
				Utils.getXMLByPromise(_urlxml).then(
					function(data){
						var allcoords = data.querySelectorAll('coordinates');			
						for(i=0; i < allcoords.length; i++){
							_xmldata = data.getElementsByTagName('coordinates')[i];
							//global
							var temp = allcoords[i].parentElement.parentElement;
							var temp1 = temp.querySelectorAll('SimpleData');
							//name					
							var nametemp2 = temp1[1].textContent;
							
							//location
							var wholeString = _xmldata.childNodes[0];
							var longandlat = wholeString.nodeValue.substring(0,wholeString.nodeValue.length-3);	
							var indexcomma = longandlat.indexOf(",");
							var long = longandlat.substring(0, indexcomma);
							var lat	= longandlat.substring(indexcomma + 1, longandlat.length);	
							//street						
							var streettemp2 = temp1[2].textContent;	
							// housenr	
							var housenrtemp2 = temp1[3].textContent;	
							//postalcode	
							var postalcodetemp2 = temp1[4].textContent;	
							//city
							var citytemp2 = temp1[5].textContent;
							//city
							var typetemp2 = temp1[6].textContent;
							//console.log("naam = " + nametemp2 + ", lat = " + lat + ", long = " + long);
							var tempstring = "";
								tempstring += '<h3>' + nametemp2 + '</h3>';	
								tempstring += '<p>' + streettemp2 + ' ' + housenrtemp2 + '<br>';
								tempstring += postalcodetemp2+ ' ' + citytemp2 +  '<br>';
								tempstring += typetemp2 + '</p>';
														
								// Markers 
								L.marker([lat, long]).addTo(map)
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
			//current location
			navigator.geolocation.getCurrentPosition(function(position) {
				var latit = position.coords.latitude;
				var longit = position.coords.longitude; 
				// Map achtergrond
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map);			
				L.Routing.control({				
					waypoints: [					
						// Moet current location worden
						L.latLng(latit, longit),
						// Moet gevraagde destination worden
						L.latLng(51.0535, 3.7304)
					],
					routeWhileDragging: true
				}).addTo(map)
			});	
			//inlladen data voorstellingen
				Utils.getXMLByPromise(_urlFilmxml).then(
					function(data){
						var allcoords = data.querySelectorAll('coordinates');
						//icon
						var myIcon = L.icon({
							iconUrl: '/images/icons/green.png',
							iconRetinaUrl: 'my-icon@2x.png',
							iconSize: [30, 41],
							
						});								
						for(i=0; i < allcoords.length; i++){
							_xmldata = data.getElementsByTagName('coordinates')[i];
							//global
							var temp = allcoords[i].parentElement.parentElement;
							var temp1 = temp.querySelectorAll('SimpleData');
							//name					
							var nametemp2 = temp1[1].textContent;
							
							//location
							var wholeString = _xmldata.childNodes[0];
							var longandlat = wholeString.nodeValue.substring(0,wholeString.nodeValue.length-3);	
							var indexcomma = longandlat.indexOf(",");
							var long = longandlat.substring(0, indexcomma);
							var lat	= longandlat.substring(indexcomma + 1, longandlat.length);	
							//street						
							var streettemp2 = temp1[3].textContent;	
							// housenr	
							var housenrtemp2 = temp1[4].textContent;	
							//postalcode	
							var postalcodetemp2 = temp1[5].textContent;	
							//city
							var citytemp2 = temp1[6].textContent;
							//jaargang
							var typetemp2 = temp1[7].textContent;
							//console.log("naam = " + nametemp2 + ", lat = " + lat + ", long = " + long);
							var tempstring = "";
								tempstring += '<h3>' + nametemp2 + '</h3>';	
								tempstring += '<p>' + streettemp2 + ' ' + housenrtemp2 + '<br>';
								tempstring += postalcodetemp2+ ' ' + citytemp2 +  '<br>';
								tempstring += "Jaargang : " + typetemp2 + '</p>';
														
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
						for(i=0; i < allcoords.length; i++){
							_xmldata = data.getElementsByTagName('coordinates')[i];
							//global
							var temp = allcoords[i].parentElement.parentElement;
							var temp1 = temp.querySelectorAll('SimpleData');
							//name					
							var nametemp2 = temp1[2].textContent;
							
							//location
							var wholeString = _xmldata.childNodes[0];
							var longandlat = wholeString.nodeValue.substring(0,wholeString.nodeValue.length-3);	
							var indexcomma = longandlat.indexOf(",");
							var long = longandlat.substring(0, indexcomma);
							var lat	= longandlat.substring(indexcomma + 1, longandlat.length);	
							//street						
							var streettemp2 = temp1[3].textContent;	
							
							var tempstring = "";
								tempstring += '<h3>' + nametemp2 + '</h3>';	
								tempstring += '<p>' + streettemp2 + '</p>';														
								// Markers 
								L.marker([lat, long]).addTo(map)
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
			//current location
			navigator.geolocation.getCurrentPosition(function(position) {
				var latit = position.coords.latitude;
				var longit = position.coords.longitude; 
				// Map achtergrond
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map);			
				L.Routing.control({				
					waypoints: [					
						// Moet current location worden
						L.latLng(latit, longit),
						// Moet gevraagde destination worden
						L.latLng(51.0535, 3.7304)
					],
					routeWhileDragging: true
				}).addTo(map)
			});
	
			// Inladen data 
				Utils.getXMLByPromise(_url).then(
					function(data){
						var allcoords = data.querySelectorAll('coordinates');	
						//icon
						var myIcon = L.icon({
							iconUrl: '/images/icons/green.png',
							iconRetinaUrl: 'my-icon@2x.png',
							iconSize: [30, 41],
							
						});		
						for(i=0; i < allcoords.length; i++){
							_xmldata = data.getElementsByTagName('coordinates')[i];
							//global
							var temp = allcoords[i].parentElement.parentElement;
							var temp1 = temp.querySelectorAll('SimpleData');
							//name					
							var nametemp2 = temp1[1].textContent;
							
							//location
							var wholeString = _xmldata.childNodes[0];
							var longandlat = wholeString.nodeValue.substring(0,wholeString.nodeValue.length-3);	
							var indexcomma = longandlat.indexOf(",");
							var long = longandlat.substring(0, indexcomma);
							var lat	= longandlat.substring(indexcomma + 1, longandlat.length);	

							var tempstring = "";
							tempstring += '<h3>' + nametemp2 + '</h3>';	
																	
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
						_dataMusea = data;					
						var i = 0;		
						var templat;
						var templong;		
						while (i <= _dataMusea.length ){
							templat = _dataMusea[i].latitude
							templong = _dataMusea[i].longitude
							//stringbuilder
							var tempstring = "";
							tempstring += '<h3>' + _dataMusea[i].Naam + '</h3>';
							tempstring += '<p>' + _dataMusea[i].Straat + ' ' + _dataMusea[i].huisnr + '<br>';
							tempstring += _dataMusea[i].Postcode + ' ' + _dataMusea[i].Gemeente +  '<br>';
							tempstring += '<a href=http://' + _dataMusea[i].website + ' target=_blank>' + _dataMusea[i].website + '</a></p>';
							// Markers 
							L.marker([templat, templong]).addTo(map)
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
	}

	var app = new Wtdapp();  
	app.init();
  })();

  