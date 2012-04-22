//
// Example is prepared by Igor ZC (hcalendar@gmail.com), 2006.
// Should be work under IE6, Firefox 1.5.
// web Service Hebrew Holidays can be found in page http://services.quicsolutions.com/JewishChrononomy/
//

var req;
var resultRequestHandler;
function ifNetscape()
{
	var app=navigator.appName.substring(0, 1);
	if (app=='N')
		return true;
	return false;
}
function loadXMLDoc(url) {
	if (window.XMLHttpRequest) {
//		if (ifNetscape())
//			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		req = new XMLHttpRequest();
	        req.onreadystatechange = processReqChange;
	        req.open("GET", url, true);
	        req.send(null);
	}
	else
	{
		if (window.ActiveXObject) 
		{
			req = new ActiveXObject("Microsoft.XMLHTTP");
			if (req) 
			{
				req.onreadystatechange = processReqChange;
				req.open("GET", url, true);
				req.send();
			}
		}
	}
	return 0;
}
function processReqChange() 
{
	// only if req shows "complete"
	if (req.readyState == 4) 
	{
		// only if "OK"
		if (req.status == 200) {
			try
			{
				//alert(req.responseText)
//				if (ifNetscape())
//					netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				// ...processing statements go here...
				var response = req.responseXML.documentElement;

				var parashaName = "N/A";				
				var holidayName = response.getElementsByTagName('holidayName')[0].firstChild;
				parashaName = holidayName.data;

				if (resultRequestHandler != null)
					resultRequestHandler(0, parashaName);
			}
			catch (e)
			{
				//alert(e);
				if (resultRequestHandler != null)
					resultRequestHandler(-1, "");
			}

		} else 
		{
			if (resultRequestHandler != null)
				resultRequestHandler(-2, "");
			alert("There was a problem retrieving the XML data:\n" + req.statusText);
		}
	}
}

function showHebrewHolidays(fromDate, toDate, resultRequest) {
	resultRequestHandler = resultRequest;
	//var url ="http://services.quicsolutions.com/JewishChrononomy/JewishChrononomy.asmx/JewishCalendar_findHolidays?fromDate=2/18/2006&toDate=2/18/2006&findOnlyTheseLevels=0";
	var url ="http://services.quicsolutions.com/JewishChrononomy/JewishChrononomy.asmx/JewishCalendar_findHolidays?fromDate=" +
		fromDate +
		"&toDate=" + 
		toDate + 
		"&findOnlyTheseLevels=0";
	loadXMLDoc(url);
	return 0;
}
function FindShabbat(uDate)
{
	//var sDate = new Date();
	var sDate = uDate;

	if (uDate.getDay() != 6)
	{
		var offs = 6 - uDate.getDay();
		sDate.setDate(uDate.getDate() + offs);
	}
	return sDate;
}
function showParashaForDay(forDate, resultRequest) {
	var shabbatDate = FindShabbat(forDate);
	var shabbatDateMonth = shabbatDate.getMonth() + 1;
	var shabbatDateDate = shabbatDate.getDate();
	var shabbatDateYear = shabbatDate.getFullYear();

	var shabbatDateStr = shabbatDateMonth + "/" + shabbatDateDate + "/" + shabbatDateYear;

	var url ="http://services.quicsolutions.com/JewishChrononomy/JewishChrononomy.asmx/JewishCalendar_findHolidays?fromDate=" +
		shabbatDateStr +
		"&toDate=" + 
		shabbatDateStr + 
		"&findOnlyTheseLevels=0";
	loadXMLDoc(url);
	return 0;
}
function showParashaForDay_Local(forDate, resultRequest) {
	var shabbatDate = FindShabbat(forDate);
	var shabbatDateMonth = shabbatDate.getMonth() + 1;
	var shabbatDateDate = shabbatDate.getDate();
	var shabbatDateYear = shabbatDate.getFullYear();

	var parashaName = "";
	var parashaCode = -1;
	if (shabbatDateYear == 2006 && shabbatDateMonth == 6)
	{
		if (shabbatDateDate == 10)
			parashaName = "Behaalotecha";
		if (shabbatDateDate == 17)
			parashaName = "Shlach";
		if (shabbatDateDate == 24)
			parashaName = "Korach";
	}
	if (shabbatDateYear == 2006 && shabbatDateMonth == 7)
	{
		if (shabbatDateDate == 1)
			parashaName = "Chukat";
		if (shabbatDateDate == 8)
			parashaName = "Balak";
		if (shabbatDateDate == 15)
			parashaName = "Pinchas";
		if (shabbatDateDate == 22)
			parashaName = "Matot-Massei";
	}

	if (parashaName != "")
		parashaCode = 0;
	resultRequestHandler(parashaCode, parashaName);
}
function showParashaForDay_calj(forDate, resultRequest, bIsrael, bHebrewLanguage)
{
	var parashaName = "";
	var parashaCode = -1;

	var shabbatDate = FindShabbat(forDate);
	var shabbatDateDate = shabbatDate.getDate();
	var shabbatDateMonth = shabbatDate.getMonth() + 1;
	var shabbatDateYear = shabbatDate.getFullYear();

	try
	{
		var gdate = new GDate();
		gdate.setDate(shabbatDateDate, shabbatDateMonth, shabbatDateYear);
		//var defaultCity = new City("Paris, France", "", "", '48n52', '2e20', 1, "-1,1,0,3|-1,1,0,10" );
		//var oZmanim = computeZmanim(new GDate(), defaultCity);
		//var bIsrael = true;
		//var bHebrew = false;
		parashaName = gdate.getParashaName(bIsrael, bHebrewLanguage);
	}
	catch(e)
	{
		//alert(e);
		parashaName = "";
	}

	if (parashaName != "")
		parashaCode = 0;

	resultRequestHandler(parashaCode, parashaName);
}
function showParashaForDay_factory(forDate, resultRequest, bIsrael, bHebrewLanguage)
{
	//alert("forDate: " + forDate + ", bIsrael: " + bIsrael);

	resultRequestHandler = resultRequest;
	//showParashaForDay(forDate, resultRequest);
	//showParashaForDay_Local(forDate, resultRequest);
	showParashaForDay_calj(forDate, resultRequest, bIsrael, bHebrewLanguage);
}