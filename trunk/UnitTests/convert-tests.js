test('calcString', function () {
  equals(calcString("0"), '0', 'zero');
  equals(calcString("10"), '10', 'ten');
  equals(calcString("4+5"), '9', '4+5 = 9');
  equals(calcString("14.5"), '14.5', '14.5');
  ok("" === "", 'sample of ok');
  same("", "", 'sample of same()');
});

test('stringConvertToFloat', function () {
  equals(stringConvertToFloat("0"), '0', 'zero');
  equals(stringConvertToFloat("10"), '10', 'ten');
  equals(stringConvertToFloat("4+5"), '4', '4+5 = 9');
  equals(stringConvertToFloat("14.5"), '14.5', '14.5');
  ok("" === "", 'sample of ok');
  same("", "", 'sample of same()');
});


test('stringConvertToInt', function () {
  equals(stringConvertToInt("12,45"), '12', '12,45');
  equals(stringConvertToInt("10,"), '10', 'ten');
  equals(stringConvertToInt("4+5,"), '4', '4+5 = 9');
  equals(stringConvertToInt("14.5,"), '14', '14.5');
  ok("" === "", 'sample of ok');
  same("", "", 'sample of same()');
});

// http://habrahabr.ru/blogs/javascript/83170/