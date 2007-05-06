//
// fom site: http://www.fourmilab.ch/documents/calendar/
//

function mod(X, Y) {
    return X - Math.floor(X / Y) * Y;
}



//  GREGORIAN_TO_JD  --  Determine Julian day number from Gregorian calendar date

var 
GREGORIAN_EPOCH = 1721425.5;

function leap_gregorian(year)

{
    
	return ((year % 4) == 0) &&
            
		(!(((year % 100) == 0) && ((year % 400) != 0)));

}



function gregorian_to_jd(year, month, day)

{
    
	return (GREGORIAN_EPOCH - 1) +
           
		(365 * (year - 1)) +
           
		Math.floor((year - 1) / 4) +
           
		(-Math.floor((year - 1) / 100)) +
           
		Math.floor((year - 1) / 400) +
           
		Math.floor((((367 * month) - 362) / 12) +
           
		((month <= 2) ? 0 :
                               
			(leap_gregorian(year) ? -1 : -2)) + day);

}


//  JD_TO_GREGORIAN  --  Calculate Gregorian calendar date from Julian day


function jd_to_gregorian(jd) 
{
    
	var wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad,
        
		yindex, dyindex, year, yearday, leapadj;

    
	wjd = Math.floor(jd - 0.5) + 0.5;
    
	depoch = wjd - GREGORIAN_EPOCH;
    
	quadricent = Math.floor(depoch / 146097);
    
	dqc = mod(depoch, 146097);
    
	cent = Math.floor(dqc / 36524);
    
	dcent = mod(dqc, 36524);
    
	quad = Math.floor(dcent / 1461);
    
	dquad = mod(dcent, 1461);
    
	yindex = Math.floor(dquad / 365);
    
	year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
    
	if (!((cent == 4) || (yindex == 4))) 
	{
        
		year++;
    
	}
    
	yearday = wjd - gregorian_to_jd(year, 1, 1);
    
	leapadj = ((wjd < gregorian_to_jd(year, 3, 1)) ? 0:
(leap_gregorian(year) ? 1 : 2)
);
    
	month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
    
	day = (wjd - gregorian_to_jd(year, month, 1)) + 1;

    
	return new Array(year, month, day);

}



//  HEBREW_TO_JD  --  Determine Julian day from Hebrew date

var 
HEBREW_EPOCH = 347995.5;


//  Is a given Hebrew year a leap year ?


function hebrew_leap(year)

{
    
	var result = mod(((year * 7) + 1), 19) < 7;
	return result;

}


//  How many months are there in a Hebrew year (12 = normal, 13 = leap)


function hebrew_year_months(year)

{
    
	return hebrew_leap(year) ? 13 : 12;

}


//  Test for delay of start of new year and to avoid

//  Sunday, Wednesday, and Friday as start of the new year.


function hebrew_delay_1(year)

{
    
	var months, days, parts;

	months = Math.floor(((235 * year) - 234) / 19);

	parts = 12084 + (13753 * months);

	day = (months * 29) + Math.floor(parts / 25920);

    
	if (mod((3 * (day + 1)), 7) < 3) 
	{
        
		day++;
    
	}
    
	return day;

}


//  Check for delay in start of new year due to length of adjacent years


function hebrew_delay_2(year)

{
    
	var last, present, next;

    
	last = hebrew_delay_1(year - 1);
    
	present = hebrew_delay_1(year);
    
	next = hebrew_delay_1(year + 1);

    
	return ((next - present) == 356) ? 2 : (((present - last) == 382) ? 1 : 0);

}


//  How many days are in a Hebrew year ?


function hebrew_year_days(year)

{
    
	return hebrew_to_jd(year + 1, 7, 1) - hebrew_to_jd(year, 7, 1);

}


//  How many days are in a given month of a given year


function hebrew_month_days(year, month)

{
    
	//  First of all, dispose of fixed-length 29 day months

    
	if (month == 2 || month == 4 || month == 6 ||
        month == 10 || month == 13) 
	{
        
		return 29;
    
	}

    
	//  If it's not a leap year, Adar has 29 days

    
	if (month == 12 && !hebrew_leap(year)) 
	{
        
		return 29;
    
	}

    
	//  If it's Heshvan, days depend on length of year

    
	if (month == 8 && !(mod(hebrew_year_days(year), 10) == 5)) 
	{
        
		return 29;
    
	}

    
	//  Similarly, Kislev varies with the length of year

    
	if (month == 9 && (mod(hebrew_year_days(year), 10) == 3)) 
	{
        
		return 29;
    
	}

    
	//  Nope, it's a 30 day month

    
	return 30;

}


//  Finally, wrap it all up into...


function hebrew_to_jd(year, month, day)

{
    
	var jd, mon, months;

    
	months = hebrew_year_months(year);
    
	jd = HEBREW_EPOCH + hebrew_delay_1(year) + hebrew_delay_2(year) + day + 1;

    
	if (month < 7) 
	{
        
		for (mon = 7; mon <= months; mon++) 
		{
            
			jd += hebrew_month_days(year, mon);
        	
		}
        
		for (mon = 1; mon < month; mon++) 
		{
            
			jd += hebrew_month_days(year, mon);
        
		}
    
	} else 
	{
        
		for (mon = 7; mon < month; mon++) 
		{
            
			jd += hebrew_month_days(year, mon);
        
		}
    
	}

    
	return jd;

}



//  JD_TO_JULIAN  --  Calculate Julian calendar date from Julian day


function jd_to_julian(td) 
{
    
	var z, a, alpha, b, c, d, e, year, month, day;

    
	td += 0.5;
    
	z = Math.floor(td);

    
	a = z;
    
	b = a + 1524;
    
	c = Math.floor((b - 122.1) / 365.25);
    
	d = Math.floor(365.25 * c);
    
	e = Math.floor((b - d) / 30.6001);

    
	month = Math.floor((e < 14) ? (e - 1) : (e - 13));
    
	year = Math.floor((month > 2) ? (c - 4716) : (c - 4715));
    
	day = b - d - Math.floor(30.6001 * e);

    
	/*  If year is less than 1, subtract one to convert from
        
		a zero based date system to the common era system in
        
		which the year -1 (1 B.C.E) is followed by year 1 (1 C.E.).  
	*/

    
	if (year < 1) 
	{
        
		year--;
    
	}

    
	return new Array(year, month, day);

}
