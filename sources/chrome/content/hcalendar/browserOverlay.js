// Hebrew Calendar extension for Mozilla Firefox
 // Copyright (C) 2005-2012  Igor Ziselman (hcalendar.blogspot.com)

// For licensing terms, please refer to readme.txt in this extension's XPInstall 
// package or its installation directory on your computer.

//
//	References:
//	- https://developer.mozilla.org/en/XUL_School/JavaScript_Object_Management
//

/**
 * HCalendarChrome namespace.
 */
if ("undefined" == typeof(HCalendarChrome)) {
  var HCalendarChrome = {};
};

HCalendarChrome.HCalendar = 
{	
	arrDays: new Array(""),

	arrDaysAbbr: new Array(""),
	
	arrMonths: new Array(""),
	
	arrMonthsAbbr: new Array(""),
	
	arrOrdinals: new Array(""),
 
	positioned: false, 
	Time: new Object(), 
	Timer: null,

	HCalendar_EntityConstants:function()
	{	
		this.SECONDS = "s";
		this.MINUTES = "m";
		this.HOURS_12 = "h";
		this.HOURS_12_ZEROED = "hh";
		this.HOURS_24 = "H";
		this.HOURS_24_ZEROED = "HH";
		this.AMPM_LOWER = "am";
		this.AMPM_LOWER_ABBR = "a.m.";
		this.AMPM_UPPER = "AM";
		this.AMPM_UPPER_ABBR = "A.M.";
		this.GMT_OFFSET = "offset";
		this.YEAR = "yyyy";
		this.YEAR_ABBR = "yy";
		this.MONTH = "m";
		this.MONTH_ZEROED = "mm";
		this.DAY = "d";
		this.DAY_ZEROED = "dd";
		this.DAY_ORDINAL = "ddd";
		this.MONTH_NAME = "month";
		this.MONTH_NAME_ABBR = "mth";
		this.WEEKDAY = "weekday";
		this.WEEKDAY_ABBR = "wkd";
		return this;
	},
	
	init: function() 
	{
		this.language = 0;
		this.location = 0;
		this.textColor = 0;
		this.holidayColor = 0;
		this.fontSize = 11;
		this.enabledHint = true;
		this.dst = 0;
		this.autoDST = 0;
		this.showOmerCounting = true;
		this.showOmerDetails = true;
		this.showCivilHolidays = true;
		this.daySwitchBySunSet = true;
		this.lastDaysBefore = -1;

		//this.hintShowCivilianDate = true;
		this.hintShowNumberDaysBeforeShabbat = true;
		this.hintShowSunRise = false;
		this.hintShowSunSet = false;
		this.hintShowParasha = true;
		this.format24Hour = true;

		this.ShabbatStartsTime = "";
		this.CandleLightingTime = null;
		this.sunSetTime = 0;
		this.sunRiseTime = 0;
		this.currentParashaName = "";
		this.Entities = new this.HCalendar_EntityConstants();

		this.hHCalendar = document.getElementById("statusbar-hcalendar-display");
		this.hToolTip = document.getElementById("hcalendar-tooltip-value");
		
		var hBundle = document.getElementById("hcalendar-bundle");
		if (hBundle!=null)
		{
			this.arrDays = this.arrDays.concat(hBundle.getString("listWeekdays").split(","));
			this.arrDaysAbbr = this.arrDaysAbbr.concat(hBundle.getString("listWeekdaysAbbr").split(","));
			this.arrMonths = this.arrMonths.concat(hBundle.getString("listMonths").split(","));
			this.arrMonthsAbbr = this.arrMonthsAbbr.concat(hBundle.getString("listMonthsAbbr").split(","));
			this.arrOrdinals = this.arrOrdinals.concat(hBundle.getString("listOrdinals").split(","));
		}
	
		this.hToolTipCCalendar = document.getElementById("hcalendar-ccalendar-value");
		this.hToolTipZmanim = document.getElementById("hcalendar-zmanim-value");
		this.Prefs = new HCalendar_PrefManager();
		this.Prefs.migrateToBranchExtensions();

		this.bOpenInANewTab = true;
		this.bSelectAfterOpening = true;
		
		this.locationType = 0;
		this.bIsrael = true;
		this.loadedByZIP = false;
		this.locationData = new Array();
		this.loadConfig();

		this.setPanelPosition();
	
		this.timerInterval = 1000;
		this.forceRefresh();

		if (!this.positioned) 
		{ 
			window.setTimeout(function() { HCalendarChrome.HCalendar.setPanelPosition(); }, 1000); 
		}

		//this.upDateMenu();
		this.upDateParasha();
	},
	
	destruct: function() 
	{		
		try { window.clearInterval(this.Timer); } catch(ex) {}		
	},

	getNow: function()
	{
		var uDate = new Date();
		//return uDate;
		
		if (this.getPref("hcalendar.debug.simulation"))
		{
			var simulatedYear = this.getPref("hcalendar.debug.yearSimulated");
			var simulatedMonth = this.getPref("hcalendar.debug.monthSimulated");
			var simulatedDay = this.getPref("hcalendar.debug.daySimulated");
			uDate = new Date(simulatedYear, simulatedMonth, simulatedDay, 0, 0, 0, 0);
		}
		return uDate;
	},
	
	forceRefresh: function() 
	{		
		window.clearInterval(this.Timer);
		
		this.GMToffset = "";
		
		var uDate = this.getNow();

		this.Time.secs = uDate.getSeconds();
		
		this.Time.mins = uDate.getMinutes();
		
		this.Time.hours = uDate.getHours();
		
		this.updateDate(uDate);
		
		this.updateView();
		
		this.Timer = window.setInterval(function() { HCalendarTimer(); }, this.timerInterval);
	
	},

	upDateParasha: function()
	{
		var uDate = this.getCorrectDay();
		var uShabbatDate = FindShabbat(uDate);
		var parashaDateKey = this.dateToStr(uShabbatDate);
		var savedParashaKey = this.getPref("hcalendar.parashaDate");
				
		if (parashaDateKey == savedParashaKey)
		{
			this.currentParashaName = this.getPref("hcalendar.parashaName");
			this.showParasha();
		}else
		{
			this.forceShowParasha();
		}		
	},
	forceShowParasha: function()
	{
		this.showParashaForDayImpl();
		//window.setTimeout(function() { HCalendarChrome.HCalendar.showParashaForDayImpl(); }, 5000); 
		//showParashaForDay(uDate, this.upDateParashaAnswer);
	},
	showParashaForDayImpl: function()
	{
		var uDate = this.getCorrectDay();
		//var bHebrewLanguage = (this.language == 1 || this.language == 2);
		var bHebrewLanguage = false;
		showParashaForDay_factory(uDate, this.upDateParashaAnswer, this.bIsrael, bHebrewLanguage);
	},
	upDateParashaAnswer: function(status, parashaName)
	{
		if (status == 0)
		{
			HCalendarChrome.HCalendar.currentParashaName = parashaName;

			var uDate = HCalendarChrome.HCalendar.getCorrectDay();
			var uShabbatDate = FindShabbat(uDate);
			var parashaDateKey = HCalendarChrome.HCalendar.dateToStr(uShabbatDate);

			HCalendarChrome.HCalendar.setPref("hcalendar.parashaDate", parashaDateKey);
			HCalendarChrome.HCalendar.setPref("hcalendar.parashaName", HCalendarChrome.HCalendar.currentParashaName);

			HCalendarChrome.HCalendar.showParasha();
			HCalendarChrome.HCalendar.forceRefresh();
		}		
	},
	getCorrectDay: function()
	{
		var uDate = this.getNow();
		var isEvening = this.isEveningIdentify(uDate);
		if (isEvening)
		{
			uDate = new Date(uDate.getFullYear(), uDate.getMonth(), uDate.getDate() + 1, 0, 1);
		}
		return uDate;
	},
	showParasha: function()
	{
		var panelParasha = document.getElementById("hc-parasha-panel");
		if (panelParasha != null)
		{
			panelParasha.setAttribute("label", this.currentParashaName);
		}
	},
	clickParashaPanel: function(event)
	{
		alert("parsha: " + this.currentParashaName);
	},
	dateToStr: function (uDate)
	{
		var date = uDate.getDate();
		var month = uDate.getMonth() + 1;
		var year = uDate.getFullYear();
		return date + "/" + month + "/" + year;
	},
	dateToStandard: function (uDate)
	{
		var date = HCalendarChrome.HCalendar.zeroed(uDate.getDate());
		var month = HCalendarChrome.HCalendar.zeroed(uDate.getMonth() + 1);
		var year = uDate.getFullYear();
		return year.toString() + month.toString() + date.toString();
	},
	getTimeZone: function() 
	{
		var rightNow = this.getNow();
		var date1 = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0, 0);
		var date2 = new Date(rightNow.getFullYear(), 6, 1, 0, 0, 0, 0);
		var temp = date1.toGMTString();
		var date3 = new Date(temp.substring(0, temp.lastIndexOf(" ")-1));
		var temp = date2.toGMTString();
		var date4 = new Date(temp.substring(0, temp.lastIndexOf(" ")-1));
		var hoursDiffStdTime = (date1 - date3) / (1000 * 60 * 60);
		var hoursDiffDaylightTime = (date2 - date4) / (1000 * 60 * 60);
		if (hoursDiffDaylightTime == hoursDiffStdTime) {
			//alert("Time zone is GMT " + hoursDiffStdTime + ".\nDaylight Saving Time is NOT observed here.");
			return hoursDiffStdTime;
		} else {
			//alert("Time zone is GMT " + hoursDiffStdTime + ".\nDaylight Saving Time is observed here.");
			return hoursDiffStdTime + 1;
		}
	},	
	getPref: function(strName) 
	{		
		return this.Prefs.getPref(strName);
	},
	
	setPref: function(strID, varValue) 
	{ 
		this.Prefs.setPref(strID, varValue); 
	},
	smartViewUpdate: function() 
	{
		var uDate = this.getNow();
		
		var secs = uDate.getSeconds();
		
		if (this.Time.secs == secs) 
		{ 
			return; 
		}
		
		this.Time.secs = secs;
		
		if (secs < 1) 
		{			
			this.Time.mins = uDate.getMinutes();		
			this.Time.hours = uDate.getHours();
		
			if ((this.Time.mins < 1) && (this.Time.hours < 1)) 
			{
				this.updateDate(uDate);
			}
		
		} else 
		{			
			return; 
		}
		
		this.updateView();	
	},
	
	updateDate: function(uDate) 
	{
		this.Time.day = uDate.getDay() + 1;
		this.Time.date = uDate.getDate();
		this.Time.month = uDate.getMonth() + 1;
		this.Time.year = uDate.getFullYear();

		var civilDate = "";
		//if (this.hintShowCivilianDate) 
		civilDate = (this.arrDays[this.Time.day] + ", " + this.arrMonths[this.Time.month] + " " + this.Time.date + ", " + this.Time.year + " CE");
		
		var actualDST = this.getActualDST();		
		civilDate += (actualDST==1)?"(Daylight)":"(Standard)";

		var beforeShabbatMessage = "Shabbat";
		var daysBefore = 7 - this.Time.day;
		//if (daysBefore != 0 && this.hintShowNumberDaysBeforeShabbat)
	
		if (this.isEveningIdentify(uDate))
		{
			if (daysBefore > 0)
				daysBefore--;
			else
				daysBefore = 6;
		}
		
//		if (this.daySwitchBySunSet && this.isLocation && this.sunSetTime>0)
//		{
//			var u_now_time = uDate.getHours() + uDate.getMinutes()/60;
//			if (u_now_time >= this.sunSetTime)
//			{
//				if (daysBefore > 0)
//					daysBefore--;
//				else
//					daysBefore = 6;
//			}
//		}
		
		if (daysBefore != 0)
		{
			if (daysBefore == 1)
			{
				beforeShabbatMessage = "1 day before Shabbat";
			}
			else
			{
				beforeShabbatMessage = daysBefore + " days before Shabbat";
			}
		}


		if (this.hToolTip != null)
		{
			var toolTipMessage = beforeShabbatMessage;
			var toolTipZmanimMessage = "";

			this.ShabbatStartsTime = "";
			this.CandleLightingTime = null;
			if (this.isLocation())
			{
				var now = this.getNow();
				var sunData = this.calculateSunRaise(now);
				if (sunData != null)
				{
					var sunRise = sunData[0];
					var sunSet = sunData[1];
					civilDate += ", sunrise: " + sunRise;
					civilDate += ", sunset: " + sunSet;

					this.ShabbatStartsTime = sunData[2];
					this.CandleLightingTime = sunData[5];
					var zmanShema = sunData[3];
					var zmanMinhaGdola = sunData[4];

					toolTipZmanimMessage = "Sof zman shema: " + zmanShema;
					toolTipZmanimMessage += "; Mincha  gedolah: " + zmanMinhaGdola;
				}				
			}


			if (this.enabledHint)
			{
				if (this.lastDaysBefore != daysBefore)
				{
					this.lastDaysBefore = daysBefore;
					this.upDateParasha();
				}
				if (this.currentParashaName != "")
					toolTipMessage += ", Parsha: " + this.currentParashaName;
				this.hToolTipCCalendar.setAttribute("value", civilDate);
				this.hToolTipZmanim.setAttribute("value", toolTipZmanimMessage);
				this.hToolTip.setAttribute("value", toolTipMessage);
			}
		}
	},
	isEveningIdentify: function(uDate)
	{
	    var nextDay = false;
		
		if (this.daySwitchBySunSet && this.isLocation && this.sunSetTime>0)
		{
			var u_now_time = uDate.getHours() + uDate.getMinutes()/60;
			if (u_now_time >= this.sunSetTime)
			{
				nextDay = true;
			}
		}
		return nextDay;
	},
	updateView: function() 
	{	
		var isHoliday = 0;
		var now = this.getNow();
		var hnow = now;
		var now_time = now.getHours() + now.getMinutes()/60;

		var isEvening = false;
		if (this.daySwitchBySunSet && this.isLocation && this.sunSetTime>0)
		{
			if (now_time >= this.sunSetTime)
			{
				isEvening = true;
				hnow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
			}
		}		

		var isNight = false;
		if (this.daySwitchBySunSet && this.isLocation && this.sunRiseTime>0)
		{
			if (now_time < this.sunRiseTime)
				isNight = true;
		}

		var hebrewDate = this.getHebrewDate(hnow);
		var weekDay = this.getWeekDay(hnow);
		var holidayId = this.getHolidayId(hnow);
		var holidayName = this.getHolidayName(holidayId);
		var dayOmerId = 0;
		if (this.showOmerCounting) 
			dayOmerId = this.getOmerDay(hnow);

		var showCalendarText = hebrewDate;
		if (weekDay != "")
		{
			showCalendarText = weekDay + ", " + showCalendarText;
			isHoliday = 1;
		}
		if (holidayName != "")
		{
			showCalendarText = showCalendarText + ", " + holidayName;
			isHoliday = 1;
		}
		if (dayOmerId != 0)
		{
			var englishDescription = "";
			var hebrewDescription = "";
			
			if (this.showOmerDetails)
			{
				var omerWeek = (((dayOmerId - 1)/ 7) | 0) + 1;
				var omerDayInWeek = dayOmerId % 7;
				if (omerDayInWeek == 0)
					omerDayInWeek = 7;
								
				englishDescription = omerOnEnglish[omerDayInWeek] +" Shebe" + omerOnEnglish[omerWeek];
				hebrewDescription = omerOnHebrew[omerDayInWeek] +" \u05E9\u05D1" + omerOnHebrew[omerWeek];
				
				englishDescription = " (" + englishDescription +")";
				hebrewDescription = " (" + hebrewDescription +")";
			}
			
			if (isEvening || isNight)
			{
				if (this.language == 1) // Hebrew
				{
					showCalendarText = showCalendarText + ", " + this.getHebDayOnHebrew(dayOmerId) + hebrewDescription + " \u05D9\u05DE\u05D9\u05DD\u0020\u05DC\u05E2\u05D5\u05DE\u05E8";
				}
				else
				if (this.language == 2) // Hebrew + numbers
				{
					showCalendarText = showCalendarText + ", " + this.getHebDayOnHebrew(dayOmerId) + " " + dayOmerId + hebrewDescription + " \u05D9\u05DE\u05D9\u05DD\u0020\u05DC\u05E2\u05D5\u05DE\u05E8";
				}
				else
				if (this.language == 3) // Heblish
				{
					showCalendarText = showCalendarText + ", " + FormatDay(dayOmerId) + "(" + this.getHebDayOnEnglish(dayOmerId) + ")" + englishDescription + " Omer Day";
				}
				else // English
				{
					showCalendarText = showCalendarText + ", " + FormatDay(dayOmerId) + englishDescription + " Omer Tonight";
				}
			}
			else
			{
				if (this.language == 1) // Hebrew
				{
					showCalendarText = showCalendarText + ", " + this.getHebDayOnHebrew(dayOmerId) + hebrewDescription + " \u05D9\u05DE\u05D9\u05DD\u0020\u05DC\u05E2\u05D5\u05DE\u05E8";
				}
				else
				if (this.language == 2) // Hebrew + numbers
				{
					showCalendarText = showCalendarText + ", " + this.getHebDayOnHebrew(dayOmerId) + " " + dayOmerId + hebrewDescription + " \u05D9\u05DE\u05D9\u05DD\u0020\u05DC\u05E2\u05D5\u05DE\u05E8";
				}
				else
				if (this.language == 3) // Heblish
				{
					showCalendarText = showCalendarText + ", " + FormatDay(dayOmerId) + "(" + this.getHebDayOnEnglish(dayOmerId) + ")" + englishDescription + " Omer Day";
				}
				else // English
				{
					showCalendarText = showCalendarText + ", " + FormatDay(dayOmerId) + englishDescription + " Omer Day";
				}
			}
		}

		var hDay = hnow.getDay();
		var dayPart = ""; 
		if (isEvening)
		{
			var isFriday = (hDay == 6); // evening Friday (after sunset), Shabbat
			var isSunday = (hDay == 0);

			if (isFriday)
			{
				if (this.language == 1 || this.language == 2)
					dayPart = "\u05DC\u05D9\u05DC";
				else
					dayPart = "Leil";
			}
			else
			{
				if (this.language == 1 || this.language == 2)
					dayPart = "\u05D0\u05D5\u05E8\u0020\u05DC\u05D9\u05D5\u05DD\u0020" + this.nextDay_Hebrew(hDay) +"',";
				else
					dayPart = "Or le Yom " + this.nextDay_Eniglish(hDay) + ",";
			}

		}
		if (isNight)
		{
			var isSaturday = (hDay == 6); // Shabbat
			if (isSaturday)
			{
				if (this.language == 1 || this.language == 2)
					dayPart = "\u05DC\u05D9\u05DC";
				else
					dayPart = "Leil";
			}	
			else
			{
				if (this.language == 1 || this.language == 2)
					dayPart = "\u05D0\u05D5\u05E8\u0020\u05DC\u05D9\u05D5\u05DD\u0020" + this.nextDay_Hebrew(hDay) +"',";
				else
					dayPart = "Or le Yom " + this.nextDay_Eniglish(hDay) + ",";
			}
		}
		if (!isEvening && !isNight)
		{
			var isSaturday = (hDay == 6); // Shabbat
			if (!isSaturday)
			{
				if (this.language == 1 || this.language == 2)
					dayPart = "\u05D9\u05D5\u05DD\u0020" + this.nextDay_Hebrew(hDay) +"',";
				else
					dayPart = "Yom " + this.nextDay_Eniglish(hDay) + ",";
			}
		}

		if (dayPart != "")
			showCalendarText = dayPart + " " + showCalendarText;

		if (this.ShabbatStartsTime != "")
		{
			if (now_time >= this.CandleLightingTime)
			{
				if (this.language == 1 || this.language == 2)
					showCalendarText = "\u05DB\u05E0\u05D9\u05E1\u05EA \u05E9\u05D1\u05EA " + this.ShabbatStartsTime + ", " + showCalendarText;
				else
					showCalendarText = "Shabbat began: " + this.ShabbatStartsTime + ", " + showCalendarText;
			}
			else
			{
				if (this.language == 1 || this.language == 2)
					showCalendarText = "\u05DB\u05E0\u05D9\u05E1\u05EA \u05E9\u05D1\u05EA " + this.ShabbatStartsTime + ", " + showCalendarText;
				else
					showCalendarText = "Shabbat begins: " + this.ShabbatStartsTime + ", " + showCalendarText;
			}
		}

		this.hHCalendar.label = showCalendarText;

		// "font-weight: bold;"
		// "font-size: 1.2em;
		var styleValue = "font-size:" + this.fontSize + "px;";
		if (isHoliday == 1)
		{
			//this.hHCalendar.style.color = this.holidayColor;
			styleValue += "color:" + this.holidayColor + ";";
		}
		else
		{
			//this.hHCalendar.style.color = this.textColor;
			styleValue += "color:" + this.textColor + ";";
		}
		this.hHCalendar.setAttribute("style", styleValue);
	},

	isLocation: function()
	{
		if (this.locationType == 0 && this.location != 0)
			return true;
		if (this.locationType == 1 && this.loadedByZIP)
			return true;
		if (this.locationType == 2)
			return true;
		return false;
	},
	loadConfig: function()
	{
		this.language = this.getPref("hcalendar.language");

		this.location = this.getPref("hcalendar.location");

		this.textColor = this.getPref("hcalendar.textColor");

		this.holidayColor = this.getPref("hcalendar.holidayColor");

		this.fontSize = this.getPref("hcalendar.fontSize");
		this.dst = this.getPref("hcalendar.dst");
		this.autoDST = this.getPref("hcalendar.autoDST");
		this.showOmerCounting = this.getPref("hcalendar.ShowOmerCounting");
		this.showOmerDetails = this.getPref("hcalendar.ShowOmerDetails");
		this.showCivilHolidays = this.getPref("hcalendar.ShowCivilHolidays");

		this.daySwitchBySunSet = this.getPref("hcalendar.daySwitchBySunSet");

		//this.hintShowCivilianDate = this.getPref("hcalendar.hint.show.CivilianDate");
		this.hintShowNumberDaysBeforeShabbat = this.getPref("hcalendar.hint.show.NumberDaysBeforeShabbat");
		this.hintShowSunRise = this.getPref("hcalendar.hint.show.SunRise");
		this.hintShowSunSet = this.getPref("hcalendar.hint.show.SunSet");
		this.hintShowParasha = this.getPref("hcalendar.hint.show.Parasha");
		this.format24Hour = this.getPref("hcalendar.24HourFormat");

		this.locationType = this.getPref("hcalendar.locationType");
		this.bIsrael = this.getPref("hcalendar.hint.showParashaInIsrael");

		this.bOpenInANewTab = this.getPref("hcalendar.openInANewTab");
		this.bSelectAfterOpening = this.getPref("hcalendar.selectAfterOpening");

		if (this.locationType == 0 && this.location > 0)
		{
			var hLocations = document.getElementById("hcalendar-locations");

			var locationDataString = hLocations.getString("location_" + this.location.toString());
			var locationDataStr = new Array();
			locationDataStr = locationDataString.split(",");

			// format:
			// 	location name, 
			// 	latd, latm, nsi,
			//	lngd, lngm, ewi,
			//	adj, beforeShabbarLight

			var nsi = 0;
			if (locationDataStr[3] == 'S')
				nsi = 1;
			ewi = 0;
			if (locationDataStr[6] == 'E')
				ewi = 1;

			this.locationData = new Array (
				this.location,
				parseInt(locationDataStr[1]), parseInt(locationDataStr[2]), nsi,
				parseInt(locationDataStr[4]), parseInt(locationDataStr[5]), ewi,
				parseFloat(locationDataStr[7]), parseInt(locationDataStr[8]));
		}
		if (this.locationType == 1)
		{
			this.loadedByZIP = this.getPref("hcalendar.ZIP_loaded");
			if (this.loadedByZIP)
			{
				var zipCode = this.getPref("hcalendar.ZIP_ZipCode");
				var timeZoneByZIP = this.getPref("hcalendar.ZIP_TimeZone");

				var latDegreesValueByZIP = this.getPref("hcalendar.ZIP_latDegrees");
				var latRadiansValueByZIP = this.getPref("hcalendar.ZIP_latRadian");
				var lonDegreesValueByZIP = this.getPref("hcalendar.ZIP_lonDegrees");
				var lonRadiansValueByZIP = this.getPref("hcalendar.ZIP_lonRadians");
				this.locationData = new Array (zipCode, 
					parseInt(latDegreesValueByZIP), parseInt(latRadiansValueByZIP), 0,
					parseInt(lonDegreesValueByZIP), parseInt(lonRadiansValueByZIP), 0,
					parseFloat(timeZoneByZIP), 18);
			}
		}
		if (this.locationType == 2)
		{
			var latDegreesValueByCOORD = this.getPref("hcalendar.COORD_latDegrees");
			var latRadiansValueByCOORD = this.getPref("hcalendar.COORD_latRadian");
			var lonDegreesValueByCOORD = this.getPref("hcalendar.COORD_lonDegrees");
			var lonRadiansValueByCOORD = this.getPref("hcalendar.COORD_lonRadians");
			var timeZoneByCOORD = this.getPref("hcalendar.COORD_TimeZone");
			var NSbyCoord = this.getPref("hcalendar.COORD_NS");
			var WEbyCoord = this.getPref("hcalendar.COORD_WE");
			var NSbyCoordInt = (NSbyCoord == "S") ? 1 : 0;

			var WEbyCoordInt = (WEbyCoord == "E") ? 1 : 0;

			this.locationData = new Array (2, 
				parseInt(latDegreesValueByCOORD), parseInt(latRadiansValueByCOORD), NSbyCoordInt,
				parseInt(lonDegreesValueByCOORD), parseInt(lonRadiansValueByCOORD), WEbyCoordInt,
				parseFloat(timeZoneByCOORD), 18);
		}
		
		//alert(	this.locationData[0] + ": " +
		//	this.locationData[1] + "." + this.locationData[2] + "(" + this.locationData[3] +") " +
		//	this.locationData[4] + "." + this.locationData[5] + "(" + this.locationData[6] +")"
		//	); 
	},
	load_and_updateView: function()
	{
		var bIsraelBefore = this.bIsrael;
		this.loadConfig();
		this.forceRefresh();

		if (bIsraelBefore != this.bIsrael)
			this.forceShowParasha();
	},
	buildDateViewArrays: function(strFormat) 
	{		
		var arrEntities = new Array(
			this.Entities.MONTH_NAME,
			
			this.Entities.MONTH_NAME_ABBR,
			this.Entities.WEEKDAY,
			this.Entities.WEEKDAY_ABBR,
			this.Entities.YEAR,	
			this.Entities.YEAR_ABBR,
			this.Entities.MONTH_ZEROED,
			this.Entities.MONTH,
			this.Entities.DAY_ORDINAL,
			this.Entities.DAY_ZEROED,
			this.Entities.DAY );
	},
	
	zeroed: function(numIn) 
	{
		return (numIn > 9) ? numIn : ("0" + numIn);
	
	},
	
	twelveHour: function(numIn) 
	{
		
		if ((numIn == 0) || (numIn == 12)) 
		{ 
			return "12"; 
		}
		return (numIn % 12);
	
	},
	
	getGMTOffset: function() 
	{		
		var sTemp;
		
		var offset = new Date().getTimezoneOffset();
		
		if (offset == 0) 
		{			
			sTemp = "+0000";		
		} else 
		{
			var numHours, numMins;
			
			sTemp = (offset > 0) ? "-" : "+";
			
			offset = Math.abs(offset);
			
			numHours = Math.floor(offset / 60);
			
			numMins = offset - (numHours * 60);
			
			if (numHours < 10) 
			{ 
				numHours = "0" + numHours; 
			}
			
			if (numMins < 10) 
			{ 
				numMins = "0" + numMins; 
			}
			
			sTemp += String(numHours) + String(numMins);
		
		}
		
		return sTemp;
	
	},
	
	setPanelPosition: function() 
	{
	
		this.positioned = true;
		return ;	
		try 
		{	
			var statusbar = document.getElementById("status-bar");

			var arrNodes = statusbar.getElementsByAttribute("id", "livemark-button");
			if (arrNodes.length > 0)
			{
				statusbar.removeChild(this.hHCalendar);

				statusbar.insertBefore(this.hHCalendar, arrNodes[0].nextSibling);

				this.positioned = true;
			}
		} 
		catch(ex) 
		{ dump(ex + "\n"); }	
	},

	clickHandler: function(event) 
	{		
		if (event.button == 0) 
		{			
			this.forceRefresh();
		
		}	
	},

	DblclickHandler: function (event)
	{
		if (event.button == 0) 
		{			
			this.popupOptions();		
		}
	
	},
	onToolbarButtonCommand: function(event)
	{
		switch(event.button) {
			case 0:
			// Left click
			this.popupOptions();
			break;
			case 1:
			// Middle click
			break;
			case 2:
			// Right click
			break;
		}	
	},
	
	getHebrewDate: function(uDate)
	{
		var tday = uDate.getDate();
		var tmonth = uDate.getMonth() + 1;
		var tyear = uDate.getYear();
		
		// if date from Netscape, then add 1900
		if (tyear < 1900)
			tyear += 1900;

		var hebDate = civ2heb(tday, tmonth, tyear);

		var hmS = hebDate.substring(hebDate.indexOf(' ')+1, hebDate.length);
		var hDay = parseInt(hebDate.substring(0, hebDate.indexOf(' ')));
		var hMonth = parseInt(hmS.substring(0, hmS.indexOf(' ')));
		var hYear = hmS.substring(hmS.indexOf(' ')+1, hmS.length);
		var hYearStr = hYear;

			// 5766
			// hYearStr = " " + "\u05EA\u05E9\u05E1" + "''" + "\u05D5";
			// hYearStr = " " + "\u05EA\u05E9\u05E1" + "''" + "\u05D5" + " 5766";

		if (this.language == 1)
		{
			hYearStr = " " + hebYearHex(hYear);
		}
		if (this.language == 2)
		{
			hYearStr = " " + hebYearHex(hYear) + " " + hYear;
		}

		if (this.language == 1) // Hebrew
		{
			var hebMonthName = this.getHebMonth(hMonth);
			var fullDate = this.getHebDayOnHebrew(hDay) + " " + "\u05D1" + hebMonthName;
			fullDate = fullDate + " " + hYearStr;
		}
		else
		if (this.language == 2) // Hebrew + numbers
		{
			var hebMonthName = this.getHebMonth(hMonth);
			var fullDate = this.getHebDayOnHebrew(hDay)+ " " + hDay + " " + "\u05D1" + hebMonthName;
			fullDate = fullDate + " " + hYearStr;
		}
		else
		if (this.language == 3) // Heblish
		{
			var hebMonthName = this.getHebMonth(hMonth);
			var fullDate = FormatDay(hDay) + "(" + this.getHebDayOnEnglish(hDay) + ")" + " " + hebMonthName;
			fullDate = fullDate + ", " + hYearStr;
		}
		else // English
		{
			var hebMonthName = this.getHebMonth(hMonth);
			var fullDate = FormatDay(hDay) + " " + hebMonthName;
			fullDate = fullDate + ", " + hYearStr;
		}
		return fullDate;
	},
	getWeekDay: function(uDate)
	{
		var dow = uDate.getDay() + 1;

		if (dow == 7)
		{
			
			if (this.language == 1)
			{
				return "\u05E9\u05D1\u05EA"; // "shabbat"
			} 
			else
			if (this.language == 2)
			{
				return "\u05E9\u05D1\u05EA"; // "shabbat"
			} 
			else
			{
				return "Shabbat";
			}
		}
		return "";
	},
	getHolidayId: function(uDate)
	{
		// get civil date
		var cday = uDate.getDate();
		var cmonth = uDate.getMonth() + 1;
		var cyear = uDate.getYear();
		var dow = uDate.getDay() + 1;
		
		// if date from Netscape, then add 1900
		if (cyear < 1900)
			cyear += 1900;

		// convert civil date to hebrew
		var hdate = civ2heb(cday, cmonth, cyear);
		var hday = parseInt(hdate.substring(0, hdate.indexOf(' ')));
		var hm = hdate.substring(hdate.indexOf(' ')+1, hdate.length);
		var hmonth = parseInt(hm.substring(0, hm.indexOf(' ')));

		//var hebrewHolidayName = moadim(cday, cmonth, cyear, hday, hmonth, dow);
		var hebrewHolidayInt;
		if (this.bIsrael)
			hebrewHolidayInt = moadimInt(cday, cmonth, cyear, hday, hmonth, dow);
		else
			hebrewHolidayInt = moadimIntInDiaspora(cday, cmonth, cyear, hday, hmonth, dow);
			
		if (this.showCivilHolidays && (hebrewHolidayInt == hlNo))
		{
			hebrewHolidayInt = GetCivilHolidayId(cday, cmonth, cyear, hday, hmonth, dow);
		}		
			
		return hebrewHolidayInt;
	},
	getHolidayName: function(hebrewHolidayInt)
	{
		var hebrewHolidayName = "";
		if (this.language == 1)
		{
			hebrewHolidayName = moadimOnHebrew[hebrewHolidayInt + 1];
		} 
		else
		if (this.language == 2)
		{
			hebrewHolidayName = moadimOnHebrew[hebrewHolidayInt + 1];
		} 
		else
		{
			hebrewHolidayName = moadimOnEnglish[hebrewHolidayInt + 1];
		}
		return hebrewHolidayName;
	},
	getOmerDay: function(uDate)
	{
		// get civil date
		var cday = uDate.getDate();
		var cmonth = uDate.getMonth() + 1;
		var cyear = uDate.getYear();
		var dow = uDate.getDay() + 1;
		
		// if date from Netscape, then add 1900
		if (cyear < 1900)
			cyear += 1900;

		// convert civil date to hebrew
		var hdate = civ2heb(cday, cmonth, cyear);
		var hday = parseInt(hdate.substring(0, hdate.indexOf(' ')));
		var hm = hdate.substring(hdate.indexOf(' ')+1, hdate.length);
		var hmonth = parseInt(hm.substring(0, hm.indexOf(' ')));

		var omerDay = OmerDayInt(cday, cmonth, cyear, hday, hmonth, dow);
		return omerDay;
	},	
	nextDay_Eniglish: function (erevDay)
	{
		if (erevDay == 0)
			return "Aleph";
		if (erevDay == 1)
			return "Bet";
		if (erevDay == 2)
			return "Gimmel";
		if (erevDay == 3)
			return "Dalet";
		if (erevDay == 4)
			return "Hey";
		if (erevDay == 5)
			return "Vav";
		return "";			
	},
	nextDay_Hebrew: function (erevDay)
	{
		if (erevDay == 0)
			return "\u05D0";
		if (erevDay == 1)
			return "\u05D1";
		if (erevDay == 2)
			return "\u05D2";
		if (erevDay == 3)
			return "\u05D3";
		if (erevDay == 4)
			return "\u05D4";
		if (erevDay == 5)
			return "\u05D5";
		return "";			
	},
	popupSetEnglish: function()
	{
		this.language = 0;
		this.forceRefresh();
		this.setPref("hcalendar.language", 0);
		return ;
	},
	popupSetHebrew: function()
	{
		this.language = 1;
		this.forceRefresh();
		this.setPref("hcalendar.language", 1);
		return ;
	},
	popupSetHeblish: function()
	{
		this.language = 2;
		this.forceRefresh();
		this.setPref("hcalendar.language", 2);
		return ;
	},
	popupOptions: function()
	{
		this.enabledHint = false;
		try
		{
			window.hcalendarDialog = window.openDialog(
				"chrome://hcalendar/content/options.xul", 
				"_blank",
				"chrome,modal,centerscreen,resizable=no,dependent=yes");

		}
		catch(ex)  { alert("openUrl(): exception <" + ex + ">\n"); }
		this.enabledHint = true;
		this.load_and_updateView();
		return ;
	},
	showConverterWindow: function()
	{
		this.enabledHint = false;
		try
		{
			window.hcalendarDialog = window.openDialog(
				"chrome://hcalendar/content/converter.xul", 
				"_blank",
				"chrome,modal,centerscreen,resizable=no,dependent=yes");

		}
		catch(ex)  { alert("openUrl(): exception <" + ex + ">\n"); }
		this.enabledHint = true;
		//this.load_and_updateView();
		return ;
	},
	showGematriyaWindow: function()
	{
		this.enabledHint = false;
		try
		{
			window.hcalendarDialog = window.openDialog(
				"chrome://hcalendar/content/gematriya.xul", 
				"_blank",
				"chrome,modal,centerscreen,resizable=no,dependent=yes");

		}
		catch(ex)  { alert("openUrl(): exception <" + ex + ">\n"); }
		this.enabledHint = true;
		return ;
	},
	copyToClipboard: function()
	{
		copy_clip(this.hHCalendar.label);
		return ;
	},
	postToBuzz: function()
	{
		var hebrewDate = this.hHCalendar.label;
		var link = "http://hcalendar.blogspot.com";
		var postToBuzzLine = "http://www.google.com/buzz/post?message=" + hebrewDate + "&url=" + link;
		this.smartOpenUrl(postToBuzzLine);
		return ;
	},
	postToTweeter: function()
	{
		var hebrewDate = this.hHCalendar.label;
		var author = "@HebrewCalendar";
		var postToTweeterLine = "http://twitter.com/home/?status=" + hebrewDate + " " + author;
		this.smartOpenUrl(postToTweeterLine);
		return ;
	},

	calendarManagerCreateGoogleEvent: function()
	{
		//http://www.google.com/googlecalendar/event_publisher_guide.html
		// http://www.google.com/googlecalendar/event_publisher_guide_detail.html
		var uDate = this.getCorrectDay();	
		var uShabbatDate = FindShabbat(uDate);
		var uFridayDate = new Date(uShabbatDate.getFullYear(), uShabbatDate.getMonth(), uShabbatDate.getDate() - 1, 0, 1);
		var eventDate = this.dateToStandard(uFridayDate);
		var eventStartTime = "1200";
		var eventFinishTime = "1201";
		//var timeZone = this.getTimeZone();
		//var eventZone = this.zeroed( timeZone) + "Z";
		var eventZone = "00";
		var blogUrl = "http://hcalendar.blogspot.com";

		var location = "";		
		if (this.locationType == 0 && this.location != 0)
		{
			var hLocations = document.getElementById("hcalendar-locations");
			var locationDataString = hLocations.getString("location_" + this.location.toString());
			var locationDataStr = new Array();
			locationDataStr = locationDataString.split(",");
		
			location = locationDataStr[0];
		}
		
		var ShabbatBeginsAt = "";
		var sunData = this.calculateSunRaise(uFridayDate);
		if (sunData != null)
		{
			ShabbatBeginsAt = sunData[2];
		}				
				
		var eventName = "Reminder: Shabbat begins at " + ShabbatBeginsAt + ", Parsha%20" + this.currentParashaName;
		var eventDetails = blogUrl; //"";//this.hHCalendar.label;
		var url = "http://www.google.com/calendar/event?action=TEMPLATE&text=" + eventName +
				"&dates=" + eventDate + 
				"T" + eventStartTime + eventZone + "/" + eventDate + 
				"T" + eventFinishTime + eventZone + 
				"&details=" + eventDetails +
				"&location=" + location +
				"&trp=false" + 
				"&sprop=" +
				"&sprop=name:";
		this.smartOpenUrl(url);
		return ;
	},
	
	calendarManagerCreateYahooEvent: function()
	{
		// http://richmarr.wordpress.com/2008/01/07/adding-events-to-users-calendars-part-2-web-calendars/
		
		var uDate = this.getCorrectDay();	
		var uShabbatDate = FindShabbat(uDate);
		var uFridayDate = new Date(uShabbatDate.getFullYear(), uShabbatDate.getMonth(), uShabbatDate.getDate() - 1, 0, 1);
		var eventDate = this.dateToStandard(uFridayDate);
		var eventStartTime = "120000";
		var eventFinishTime = "1201";
		//var timeZone = this.getTimeZone();
		//var eventZone = this.zeroed( timeZone) + "Z";
		var eventZone = "00";
		var blogUrl = "http://hcalendar.blogspot.com";
		
		var location = "";		
		if (this.locationType == 0 && this.location != 0)
		{
			var hLocations = document.getElementById("hcalendar-locations");
			var locationDataString = hLocations.getString("location_" + this.location.toString());
			var locationDataStr = new Array();
			locationDataStr = locationDataString.split(",");
		
			location = locationDataStr[0];
		}

		var ShabbatBeginsAt = "";
		var sunData = this.calculateSunRaise(uFridayDate);
		if (sunData != null)
		{
			ShabbatBeginsAt = sunData[2];
		}				
		
		var eventName = "Reminder: Shabbat begins at " + ShabbatBeginsAt + ", Parsha%20" + this.currentParashaName;
		var eventDetails = "";//this.hHCalendar.label;
		var url = "http://calendar.yahoo.com/?v=60" +
				"&view=d" +
				"&type=20" + 
				"&title=" + eventName + 
				"&st=" + eventDate + "T" + eventStartTime +
				"&desc=" + blogUrl + 
				"&in_loc=" + location +
				"&url=" + blogUrl;
		this.smartOpenUrl(url);
		return ;
	},
		
	popupOpenKaluach: function()
	{
		//open("chrome://hcalendar/content/KaluachJS.htm");
		//this.openUrl("chrome://hcalendar/content/KaluachJS.htm");
		this.smartOpenUrl("chrome://hcalendar/content/KaluachJS.htm");
		return ;
	},
	popupOpenBlog: function()
	{
		//open("http://hcalendar.blogspot.com");
		//this.openUrl("http://hcalendar.blogspot.com");
		
		//if (this.bOpenInANewTab)
		//{
		//	if (this.bSelectAfterOpening)
		//		gBrowser.selectedTab = gBrowser.addTab("http://hcalendar.blogspot.com");
		//	else
		//		gBrowser.addTab("http://hcalendar.blogspot.com");
		//}	
		//else
		//	gBrowser.loadURI("http://hcalendar.blogspot.com");
		this.smartOpenUrl("http://hcalendar.blogspot.com");
		return ;
	},
	smartOpenUrl: function(url)
	{
		var processedIfNotBrowser = this.processIfNotBrowser(url);
		if (processedIfNotBrowser)
			return ;
		
		var cBrowser = null;
		try
		{
			if ((gBrowser != undefined) && (gBrowser != null))
				cBrowser = gBrowser
			else	
				cBrowser = this.getBrowser();
		}
		catch (ex)
		{
			cBrowser = this.getBrowser();
		}
		
		if (this.bOpenInANewTab)
		{
			if (this.bSelectAfterOpening)
				cBrowser.selectedTab = cBrowser.addTab(url);
			else
				cBrowser.addTab(url);
		}	
		else
			cBrowser.loadURI(url);
		return ;
	},
	openUrl: function(url)
	{
		var opened = this.processIfNotBrowser(url);
	
//		// AFM - another hack. Try messenger interface first in case we're in Thunderbird
//		//
//		if (typeof Components.interfaces.nsIMessenger != "undefined")
//		{
//			try
//			{
//				var messenger = Components.classes["@mozilla.org/messenger;1"].getService(Components.interfaces.nsIMessenger);
//				if (messenger)
//				{
//					messenger.launchExternalURL(url);
//					opened = true;
//				}
//			}
//			catch(ex) { alert("openUrl(): exception <" + ex + ">\n"); }
//		}
	
		if (!opened)
			open(url);
	},
	processIfNotBrowser: function(url)
	{
		var opened = false;
	
		// AFM - another hack. Try messenger interface first in case we're in Thunderbird
		//
		if (typeof Components.interfaces.nsIMessenger != "undefined")
		{
			try
			{
				var messenger = Components.classes["@mozilla.org/messenger;1"].getService(Components.interfaces.nsIMessenger);
				if (messenger)
				{
					messenger.launchExternalURL(url);
					opened = true;
				}
			}
			catch(ex) { alert("openUrl(): exception <" + ex + ">\n"); }
		}
		return opened;
	},
	getBrowser: function () 
	{ 
        var browser = document.getElementById('browser'); 
        return browser; 
	},

	getHebMonth: function(hMonth)
	{
		if (this.language == 1)
		{
			var hebMontNamehHebrew = this.getHebMonthOnHebrew(hMonth);
			return hebMontNamehHebrew;
		}
		if (this.language == 2)
		{
			var hebMontNamehHebrew = this.getHebMonthOnHebrew(hMonth);
			return hebMontNamehHebrew;
		}
		var hebMonthNameEnglish = this.getHebMonthOnEnglish(hMonth);
		return hebMonthNameEnglish;
	},
	getHebDayOnHebrew: function(hDay)
	{
		var hebrewDate = hebDayOnHebrew[hDay];
		return hebrewDate;
	},
	getHebDayOnEnglish: function(hDay)
	{
		var hebrewDate = hebDayOnEnglish[hDay];
		return hebrewDate;
	},
	getHebMonthOnEnglish: function(hMonth)
	{
		var monthName = hebMonth[hMonth+1];
		return monthName;
	},
	getHebMonthOnHebrew: function(hMonth)
	{
		var monthName = hebMonthOnHebrew[hMonth+1];

		return monthName;
	},
	calculateDST: function()
	{
		var today = new Date();
		
		var jan = new Date(today.getFullYear(), 0, 1);
		var jul = new Date(today.getFullYear(), 6, 1);
		var getTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
		
		return today.getTimezoneOffset() < getTimezoneOffset;
	},
	getActualDST: function()
	{
		var actualDST = this.dst;
		if (this.autoDST !=0)
		{
			var calcDST = this.calculateDST();
			actualDST = calcDST?1:0;
		}
		return actualDST;
	},
	calculateSunRaise: function(date)
	{
		var latd = this.locationData[1];
		var latm = this.locationData[2];
		var nsi = this.locationData[3];
		var lngd = this.locationData[4];
		var lngm = this.locationData[5];
		var ewi = this.locationData[6];
		var adj = this.locationData[7];
		var beforeShabbatLight = this.locationData[8];

		
		var d = date.getDate();
   		var m = date.getMonth() + 1;
		var y = date.getYear();

		//adj = - adj;
		adj += this.getActualDST();	// var dst = 0;	// winter time
		//var ampm = 0; 		// 24 hours
		var ampm = this.format24Hour ? 0 : 1;

		var time = suntime(d, m, y, 90, 50, lngd, lngm, ewi, latd, latm, nsi, adj);

		var sunrise;

		var sunset;

		var sunriseString;
		var sunsetString;

		var sunData = null;

		if (time[1] == 0) 
		{
			sunrise = time[2];
			sunset  = time[3];
			var shaa_zmanit = (sunset - sunrise) / 12;

			sunriseString = timeadj(sunrise, ampm);
			sunsetString = timeadj(sunset, ampm);
			var shemaString = timeadj(sunrise + shaa_zmanit * 3, ampm);
			var minhaGdolaString = timeadj(sunrise + shaa_zmanit * 6.5, ampm);

			sunData = new Object();
			sunData[0] = sunriseString;
			sunData[1] = sunsetString;
			sunData[2] = "";
			sunData[5] = null;
			if (date.getDay() == 5)
			{
				var ampmShabbat = this.language == 1 || this.language == 2 ? 0 : ampm;
				var candleLightingTime = time[3] - beforeShabbatLight/60.0;
				sunData[2] = timeadj(candleLightingTime, ampmShabbat)
				sunData[5] = candleLightingTime;
			}
			sunData[3] = shemaString;
			sunData[4] = minhaGdolaString;

			this.sunSetTime = sunset;
			this.sunRiseTime = sunrise;
		}
		else 
		{
			sunriseString = "";
			sunsetString = "";
			this.sunSetTime = 0;
		}

		//return sunriseString;
		return sunData;
	}
}

window.addEventListener("load", function() { HCalendarChrome.HCalendar.init(); }, false);

window.addEventListener("focus", function() { HCalendarChrome.HCalendar.forceRefresh(); }, false);

window.addEventListener("unload", function() { HCalendarChrome.HCalendar.destruct(); }, false);

function HCalendarTimer() { //safer out here
	HCalendarChrome.HCalendar.smartViewUpdate();
}

function HCalendarRefresh() { HCalendarChrome.HCalendar.load_and_updateView(); }
function HCalendarLocations() { return document.getElementById("hcalendar-locations"); } 
