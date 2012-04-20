// package constants
const DISPLAY_NAME   = "Hebrew Calendar";
const NAME           = "hcalendar";
const KEY            = "/ZC/hcalendar";
const VERSION        = "1.0.5.14";
const LOCALE_LIST    = ["en-US"];
const JAR_FILE       = NAME + ".jar";
const PREFS_FILE     = "defaults/preferences/" + NAME + "-defaults.js"; 
const AUTOREG_FILE   = "defaults/.autoreg";

const CONTENT_FOLDER = "content/" + NAME + "/";

var err = null;

// begin the install
initInstall(NAME, KEY, VERSION);
  
var mainDir = getFolder("Profile", "extensions/" + "{C4A22BA1-6D61-45F1-82A9-140FD33F1110}");
var chromeDir = getFolder(mainDir, "chrome");

addFile(KEY, VERSION, "chrome/"+JAR_FILE, chromeDir, null);

// Add the defaults folder
var defaultDir = getFolder(mainDir, "defaults");
addDirectory(KEY, VERSION, "defaults", defaultDir, null);
defaultDir = getFolder(getFolder("Program", "defaults"),"pref");
addFile(KEY, VERSION, PREFS_FILE, defaultDir, null);

//hack to make sure we register the component
var pgmDir = getFolder("Program");
addFile(KEY, VERSION, AUTOREG_FILE, pgmDir, null);
 
// Register the chrome URLs
registerChrome(Install.CONTENT | PROFILE_CHROME, getFolder(chromeDir, JAR_FILE), "content/"+NAME+"/");
//registerChrome(Install.SKIN | PROFILE_CHROME, getFolder(chromeDir, JAR_FILE), "skin/classic/"+NAME+"/");

for (var x = 0; x < LOCALE_LIST.length; x++)
  registerChrome(Install.LOCALE | PROFILE_CHROME, getFolder(chromeDir, JAR_FILE), "locale/"+LOCALE_LIST[x]+"/"+NAME+"/");

// Now install..
if (getLastError() == SUCCESS) {
  err = performInstall();
  if ((err == SUCCESS) || (err == 999))
    alert(DISPLAY_NAME + " " + VERSION + " has been installed successfully!\nPlease restart to enable the extension.");
}
else
  cancelInstall();


//// initialize the installation first
//initInstall("Hebrew Calendar Installation", "hcalendar", "1.0.2.10", 1);
//// add files to the installation
//f = getFolder("Program");
//setPackageFolder(f);
//addFile("hcalendar.xpi")
//// perform the installation
//performInstall( );
