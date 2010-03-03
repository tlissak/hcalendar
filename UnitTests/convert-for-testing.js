function calcString(text)
{	
	return eval(text)
}

function stringConvertToFloat(text)
{
	 return parseFloat(text)
}

function stringConvertToInt(text)
{
	var i = text.indexOf(",");
	var intNumber = parseInt(text.substring(0, i));
	return intNumber
}

// http://habrahabr.ru/blogs/javascript/83170/