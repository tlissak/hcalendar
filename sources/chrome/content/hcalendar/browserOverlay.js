// Hebrew Calendar extension for Mozilla Firefox
 // Copyright (C) 2005  Igor Ziselman (hcalendar.blogspot.com)

// For licensing terms, please refer to readme.txt in this extension's XPInstall 

// package or its installation directory on your computer.


function HCalendar_EntityConstants() 
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

}


function HCalendar_TimeFunctions() 
{
	
	arrFunctions = new Array();
	
	arrFunctions[HCalendar.Entities.SECONDS] = new Function("return HCalendar.zeroed(HCalendar.Time.secs)");
	
	arrFunctions[HCalendar.Entities.MINUTES] = new Function("return HCalendar.zeroed(HCalendar.Time.mins)");
	
	arrFunctions[HCalendar.Entities.HOURS_12] = new Function("return HCalendar.twelveHour(HCalendar.Time.hours)");
	
	arrFunctions[HCalendar.Entities.HOURS_12_ZEROED] = new Function("return HCalendar.zeroed(HCalendar.twelveHour(HCalendar.Time.hours))");
	
	arrFunctions[HCalendar.Entities.HOURS_24] = new Function("return HCalendar.Time.hours");
	
	arrFunctions[HCalendar.Entities.HOURS_24_ZEROED] = new Function("return HCalendar.zeroed(HCalendar.Time.hours)");
	
	arrFunctions[HCalendar.Entities.AMPM_LOWER] = new Function("return (HCalendar.Time.hours < 12) ? \"am\" : \"pm\"");
	
	arrFunctions[HCalendar.Entities.AMPM_LOWER_ABBR] = new Function("return (HCalendar.Time.hours < 12) ? \"a.m.\" : \"p.m.\"");
	
	arrFunctions[HCalendar.Entities.AMPM_UPPER] = new Function("return (HCalendar.Time.hours < 12) ? \"AM\" : \"PM\"");
	
	arrFunctions[HCalendar.Entities.AMPM_UPPER_ABBR] = new Function("return (HCalendar.Time.hours < 12) ? \"A.M.\" : \"P.M.\"");
	
	arrFunctions[HCalendar.Entities.GMT_OFFSET] = new Function("if (HCalendar.GMToffset == \"\") { HCalendar.GMToffset = HCalendar.getGMTOffset(); } return HCalendar.GMToffset");

	return arrFunctions;

}

function HCalendar_DateFunctions() 
{
	
	arrFunctions = new Array();
	
	arrFunctions[HCalendar.Entities.YEAR] = new Function("return HCalendar.Time.year");
	
	arrFunctions[HCalendar.Entities.YEAR_ABBR] = new Function("return HCalendar.Time.year.toString().substr(2, 2)");
	
	arrFunctions[HCalendar.Entities.MONTH] = new Function("return HCalendar.Time.month");
	
	arrFunctions[HCalendar.Entities.MONTH_ZEROED] = new Function("return HCalendar.zeroed(HCalendar.Time.month)");
	
	arrFunctions[HCalendar.Entities.DAY] = new Function("return HCalendar.Time.date");
	
	arrFunctions[HCalendar.Entities.DAY_ZEROED] = new Function("return HCalendar.zeroed(HCalendar.Time.date)");
	
	arrFunctions[HCalendar.Entities.DAY_ORDINAL] = new Function("return HCalendar.arrOrdinals[HCalendar.Time.date]");
	
	arrFunctions[HCalendar.Entities.MONTH_NAME] = new Function("return HCalendar.arrMonths[HCalendar.Time.month]");

	arrFunctions[HCalendar.Entities.MONTH_NAME_ABBR] = new Function("return HCalendar.arrMonthsAbbr[HCalendar.Time.month]");
	
	arrFunctions[HCalendar.Entities.WEEKDAY] = new Function("return HCalendar.arrDays[HCalendar.Time.day]");
	
	arrFunctions[HCalendar.Entities.WEEKDAY_ABBR] = new Function("return HCalendar.arrDaysAbbr[HCalendar.Time.day]");
	
	return arrFunctions;

}


var HCalendar = 
{
	
	arrDays: new Array(""),

	arrDaysAbbr: new Array(""),
	
	arrMonths: new Array(""),
	
	arrMonthsAbbr: new Array(""),
	
	arrOrdinals: new Array(""),
 
	positioned: false, 
	Time: new Object(), 
	Timer: null,
	
	
	init: function() 
	{
		this.language = 0;
		this.location = 0;
		this.textColor = 0;
		this.holidayColor = 0;
		this.fontSize = 11;
		this.enabledHint = true;
		this.dst = 0;
		this.daySwitchBySunSet = true;

		this.hintShowCivilianDate = false;
		this.hintShowNumberDaysBeforeShabbat = true;
		this.hintShowSunRise = false;
		this.hintShowSunSet = false;
		this.hintShowParasha = true;
		this.format24Hour = true;

		this.ShabbatStartsTime = "";
		this.sunSetTime = 0;
		this.sunRiseTime = 0;
		this.currentParashaName = "";
		this.Entities = new HCalendar_EntityConstants();

		
var hBundle = document.getElementById("hcalendar-bundle");

		this.arrDays = this.arrDays.concat(hBundle.getString("listWeekdays").split(","));

		this.arrDaysAbbr = this.arrDaysAbbr.concat(hBundle.getString("listWeekdaysAbbr").split(","));

		this.arrMonths = this.arrMonths.concat(hBundle.getString("listMonths").split(","));

		this.arrMonthsAbbr = this.arrMonthsAbbr.concat(hBundle.getString("listMonthsAbbr").split(","));

		this.arrOrdinals = this.arrOrdinals.concat(hBundle.getString("listOrdinals").split(","));
	
		this.hHCalendar = document.getElementById("statusbar-hcalendar-display");

		this.hToolTip = document.getElementById("hcalendar-tooltip-value");

		this.hToolTipCCalendar = document.getElementById("hcalendar-ccalendar-value");
		this.hToolTipZmanim = document.getElementById("hcalendar-zmanim-value");
		this.Prefs = new HCalendar_PrefManager();

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
			window.setTimeout(function() { HCalendar.setPanelPosition(); }, 1000); 
		}

		//this.upDateMenu();
		this.upDateParasha();
	},
	
	destruct: function() 
	{
		
		try { window.clearInterval(this.Timer); } catch(ex) {}
		
	},
	
	forceRefresh: function() 
	{
		
		window.clearInterval(this.Timer);
		
		this.GMToffset = "";
		
		var uDate = new Date();

		this.Time.secs = uDate.getSeconds();
		
		this.Time.mins = uDate.getMinutes();
		
		this.Time.hours = uDate.getHours();
		
		this.updateDate(uDate);
		
		this.updateView();
		
		this.Timer = window.setInterval(HCalendarTimer, this.timerInterval);
	
	},

	upDateParasha: function()
	{
		var uDate = new Date();
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
		//window.setTimeout(function() { HCalendar.showParashaForDayImpl(); }, 5000); 
		//showParashaForDay(uDate, this.upDateParashaAnswer);
	},
	showParashaForDayImpl: function()
	{
		var uDate = new Date();
		//var bHebrewLanguage = (this.language == 1 || this.language == 2);
		var bHebrewLanguage = false;
		showParashaForDay_factory(uDate, this.upDateParashaAnswer, this.bIsrael, bHebrewLanguage);
	},
	upDateParashaAnswer: function(status, parashaName)
	{
		if (status == 0)
		{
			HCalendar.currentParashaName = parashaName;

			var uDate = new Date();
			var uShabbatDate = FindShabbat(uDate);
			var parashaDateKey = HCalendar.dateToStr(uShabbatDate);

			HCalendar.setPref("hcalendar.parashaDate", parashaDateKey);
			HCalendar.setPref("hcalendar.parashaName", HCalendar.currentParashaName);

			HCalendar.showParasha();
			HCalendar.forceRefresh();
		}
		
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
		var uDate = new Date();		
		
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

		var beforeShabbatMessage = "Shabbat";
		var daysBefore = 7 - this.Time.day;
		//if (daysBefore != 0 && this.hintShowNumberDaysBeforeShabbat)
		
		if (this.daySwitchBySunSet && this.isLocation && this.sunSetTime>0)
		{
			var u_now_time = uDate.getHours() + uDate.getMinutes()/60;
			if (u_now_time >= this.sunSetTime)
			{
				if (daysBefore > 0)
					daysBefore--;
				else
					daysBefore = 6;
			}
		}		
		
		
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
			if (this.isLocation())
			{
				var sunData = this.calculateSunRaise();
				if (sunData != null)
				{
					var sunRise = sunData[0];
					var sunSet = sunData[1];
					civilDate += ", sunrise: " + sunRise;
					civilDate += ", sunset: " + sunSet;

					this.ShabbatStartsTime = sunData[2];
					var zmanShema = sunData[3];
					var zmanMinhaGdola = sunData[4];

					toolTipZmanimMessage = "Sof zman shema: " + zmanShema;
					toolTipZmanimMessage += "; Mincha  gedolah: " + zmanMinhaGdola;
				}				
			}


			if (this.enabledHint)
			{
				if (this.currentParashaName != "")
					toolTipMessage += ", Parsha: " + this.currentParashaName;
				this.hToolTipCCalendar.setAttribute("value", civilDate);

				this.hToolTipZmanim.setAttribute("value", toolTipZmanimMessage);

				this.hToolTip.setAttribute("value", toolTipMessage);

			}
		}
	},
	
	updateView: function() 
	{
	
		var isHoliday = 0;
		var now = new Date;
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
		var dayOmerId = this.getOmerDay(hnow);

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
			var hebDayOmerId = FormatDay(dayOmerId) + "(" + this.getHebDayOnEnglish(dayOmerId) + ")";
			if (isEvening || isNight)
			{
				if (this.language == 1) // Hebrew
				{
					showCalendarText = showCalendarText + ", " + this.getHebDayOnHebrew(dayOmerId) + " \u05D9\u05DE\u05D9\u05DD\u0020\u05DC\u05E2\u05D5\u05DE\u05E8";
				}
				else
				if (this.language == 2) // Hebrew + numbers
				{
					showCalendarText = showCalendarText + ", " + this.getHebDayOnHebrew(dayOmerId) + " " + dayOmerId + " \u05D9\u05DE\u05D9\u05DD\u0020\u05DC\u05E2\u05D5\u05DE\u05E8";
				}
				else
				if (this.language == 3) // Heblish
				{
					showCalendarText = showCalendarText + ", " + FormatDay(dayOmerId) + "(" + this.getHebDayOnEnglish(dayOmerId) + ")" + " Omer Day";
				}
				else // English
				{
					showCalendarText = showCalendarText + ", " + FormatDay(dayOmerId) + " Omer Tonight";
				}
			}
			else
			{
				if (this.language == 1) // Hebrew
				{
					showCalendarText = showCalendarText + ", " + this.getHebDayOnHebrew(dayOmerId) + " \u05D9\u05DE\u05D9\u05DD\u0020\u05DC\u05E2\u05D5\u05DE\u05E8";
				}
				else
				if (this.language == 2) // Hebrew + numbers
				{
					showCalendarText = showCalendarText + ", " + this.getHebDayOnHebrew(dayOmerId) + " " + dayOmerId + " \u05D9\u05DE\u05D9\u05DD\u0020\u05DC\u05E2\u05D5\u05DE\u05E8";
				}
				else
				if (this.language == 3) // Heblish
				{
					showCalendarText = showCalendarText + ", " + FormatDay(dayOmerId) + "(" + this.getHebDayOnEnglish(dayOmerId) + ")" + " Omer Day";
				}
				else // English
				{
					showCalendarText = showCalendarText + ", " + FormatDay(dayOmerId) + " Omer Day";
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
			if (this.language == 1 || this.language == 2)
				showCalendarText = "\u05DB\u05E0\u05D9\u05E1\u05EA \u05E9\u05D1\u05EA " + this.ShabbatStartsTime + ", " + showCalendarText;
			else
				showCalendarText = "Shabbat begins: " + this.ShabbatStartsTime + ", " + showCalendarText;
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

		this.daySwitchBySunSet = this.getPref("hcalendar.daySwitchBySunSet");

		this.hintShowCivilianDate = this.getPref("hcalendar.hint.show.CivilianDate");
		this.hintShowNumberDaysBeforeShabbat = this.getPref("hcalendar.hint.show.NumberDaysBeforeShabbat");
		this.hintShowSunRise = this.getPref("hcalendar.hint.show.SunRise");
		this.hintShowSunSet = this.getPref("hcalendar.hint.show.SunSet");
		this.hintShowParasha = this.getPref("hcalendar.hint.show.Parasha");
		this.format24Hour = this.getPref("hcalendar.24HourFormat");

		this.locationType = this.getPref("hcalendar.locationType");
		this.bIsrael = this.getPref("hcalendar.hint.showParashaInIsrael");

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
				parseInt(locationDataStr[7]), parseInt(locationDataStr[8]));

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
					parseInt(timeZoneByZIP), 18);
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
				parseInt(timeZoneByCOORD), 18);
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
		var hDay = eval(hebDate.substring(0, hebDate.indexOf(' ')));
		var hMonth = eval(hmS.substring(0, hmS.indexOf(' ')));
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
		var hday = eval(hdate.substring(0, hdate.indexOf(' ')));
		var hm = hdate.substring(hdate.indexOf(' ')+1, hdate.length);
		var hmonth = eval(hm.substring(0, hm.indexOf(' ')));

		//var hebrewHolidayName = moadim(cday, cmonth, cyear, hday, hmonth, dow);
		var hebrewHolidayInt;
		if (this.bIsrael)
			hebrewHolidayInt = moadimInt(cday, cmonth, cyear, hday, hmonth, dow);
		else
			hebrewHolidayInt = moadimIntInDiaspora(cday, cmonth, cyear, hday, hmonth, dow);
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
		var hday = eval(hdate.substring(0, hdate.indexOf(' ')));
		var hm = hdate.substring(hdate.indexOf(' ')+1, hdate.length);
		var hmonth = eval(hm.substring(0, hm.indexOf(' ')));

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


	popupOpenKaluach: function()
	{
		//open("chrome://hcalendar/content/KaluachJS.htm");
		this.openUrl("chrome://hcalendar/content/KaluachJS.htm");
		return ;
	},
	popupOpenBlog: function()
	{
		//open("http://hcalendar.blogspot.com");
		this.openUrl("http://hcalendar.blogspot.com");
		return ;
	},
	openUrl: function(url)
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
	
		if (!opened)
			open(url);
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
	calculateSunRaise: function()
	{
		var latd = this.locationData[1];
		var latm = this.locationData[2];
		var nsi = this.locationData[3];
		var lngd = this.locationData[4];
		var lngm = this.locationData[5];
		var ewi = this.locationData[6];
		var adj = this.locationData[7];
		var beforeShabbatLight = this.locationData[8];

		var now = new Date();
		var d = now.getDate();
   		var m = now.getMonth() + 1;
		var y = now.getYear();

		//adj = - adj;
		adj += this.dst;	// var dst = 0;	// winter time
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
			if (now.getDay() == 5)
			{
				var ampmShabbat = this.language == 1 || this.language == 2 ? 0 : ampm;
				sunData[2] = timeadj(time[3] - beforeShabbatLight/60.0, ampmShabbat)
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


window.addEventListener("load", function() { HCalendar.init(); }, false);

window.addEventListener("focus", function() { 	HCalendar.forceRefresh(); }, false);

window.addEventListener("unload", function() { HCalendar.destruct(); }, false);


function HCalendarTimer() { //safer out here
	HCalendar.smartViewUpdate();
}

function HCalendarRefresh() { HCalendar.load_and_updateView();
}
function HCalendarLocations() { return document.getElementById("hcalendar-locations"); } 