function hebOt(val){
    if(val>400){
        if(val>800){return hebOt(400)+hebOt(400)+hebOt(val-800)}
        else{return hebOt(400)+hebOt(val-400)}
        }
    var retVal=false;
    if (val >= 1 && val<=10){retVal=(0x05D0-1) + val;}// Alef - Yud
    else if (val == 20){retVal=0x05DB;}// Kaf
    else if (val == 30){retVal=0x05DC;}// Lamed   
    else if (val == 40){retVal=0x05DE;}// Mem   
    else if (val == 50){retVal=0x05E0;}// Nun   
    else if (val == 60){retVal=0x05E1;}// Sameh
    else if (val == 70){retVal=0x05E2;}// Ayin   
    else if (val == 80){retVal=0x05E4;}// Pe   
    else if (val == 90){retVal=0x05E6;}// Tsadik   
    else if (val >= 100 && val <= 400){retVal=(0x05E7-1)+(val/100)}// Kuf - Tav
    if(retVal){return String.fromCharCode(retVal)}
    }
function hebYearHex(val){
    if(!val){return '';}
    var currYear=new Number(val);
    var currThousands=parseInt(currYear/1000); currYear-=(currThousands*1000);
    var currHundreds=parseInt(currYear/100)*100; currYear-=currHundreds;
    var currDozens=parseInt(currYear/10)*10; currYear-=currDozens;
    var currUnits=currYear;
    return(
            (
            currThousands?hebOt(currThousands)+'\'':'')
            +(currHundreds?hebOt(currHundreds):'')+(currDozens&&!currUnits?'"':'')
            +(currDozens?hebOt(currDozens):'')
            +(currUnits?'"'+hebOt(currUnits):'')
            );   
    }
