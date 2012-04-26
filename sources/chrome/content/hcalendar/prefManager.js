//
//	references:
//		- https://developer.mozilla.org/en/Code_snippets/Preferences
//
function HCalendar_PrefManager() {
	// this.domain = "hcalendar";	
	return this;
}
HCalendar_PrefManager.prototype = {
	getService: function() {
		try { return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		} catch(ex) { dump(ex + "\n"); return null; }
	},
	getInterface: function() {
		try { return this.getService().QueryInterface(Components.interfaces.nsIPrefBranchInternal);
		} catch(ex) { dump(ex + "\n"); return null; }
	},
	rootBranch: null,
	getRootBranch: function() {
		if (!this.rootBranch) { this.rootBranch = this.getService().getBranch("extensions."); }
		return this.rootBranch;
	},
	prefTypes: new Array(),
	getPrefType: function(strName) {
		if (strName in this.prefTypes) { return this.prefTypes[strName]; }
		var strType = "Char";
		var iPB = Components.interfaces.nsIPrefBranch;
		switch (this.getRootBranch().getPrefType(strName)) {
			case iPB.PREF_STRING: strType = "Char"; break;
			case iPB.PREF_INT: strType = "Int"; break;
			case iPB.PREF_BOOL: strType = "Bool"; break;
		}
		this.prefTypes[strName] = strType;
		return strType;
	},
	getPref: function(strName) {
		var strType = this.getPrefType(strName);
		
		try
		{		
			switch (strType)
			{
				case "Char":
					return this.getRootBranch().getCharPref(strName);
					break;
				case "Int":
					return this.getRootBranch().getIntPref(strName);
					break;
				case "Bool":
					return this.getRootBranch().getBoolPref(strName);
					break;
			}		
		}
		catch(ex)
		{
			dump(ex + "\n");
		}
		
		return null;
	},
	setPref: function(strName, varValue) {
		var strType = this.getPrefType(strName);
				
		try
		{
			switch (strType)
			{
				case "Char":
					return this.getRootBranch().setCharPref(strName, varValue);
					break;
				case "Int":
					return this.getRootBranch().setIntPref(strName, varValue);
					break;
				case "Bool":
					return this.getRootBranch().setBoolPref(strName, varValue);
					break;
			}		
		}
		catch(ex)
		{
			dump(ex + "\n");
		}
	},
	migrateToBranchExtensions: function()
	{
		this.convertPrefs();
	},
	convertPrefs: function()  {
		let prefService= Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
		let old=prefService.getBranch('hcalendar.');
		let mew=prefService.getBranch('extensions.hcalendar.');
		if (mew.getPrefType('prefsmigrated')==mew.PREF_BOOL && mew.getBoolPref('prefsmigrated')) return;
		var children=old.getChildList("", {});
		for (var i=0;i<children.length;i++) {
			if (old.prefHasUserValue(children[i])) {
               let type= old.getPrefType(children[i]);
               if (type==old.PREF_BOOL)   mew.setBoolPref(children[i], old.getBoolPref(children[i]));
               if (type==old.PREF_INT)    mew.setIntPref (children[i], old.getIntPref (children[i]));
               if (type==old.PREF_STRING) mew.setCharPref(children[i], old.getCharPref(children[i]));
               old.clearUserPref(children[i]);
			}
		}
	
		mew.setBoolPref('prefsmigrated', true);		
	}
}
