
//load JS after the page is loaded, to avoid issues with selecting elements that don't exist
window.onload = function () {
  
//are we on mobile?
var isMobile = "";
var cookieSet = "";
if( /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  isMobile = true;
  cookieSet = document.cookie.split("=")[0];
} else {
  isMobile = false;
  cookieSet = document.cookie.split(";")[0];
};

//where are we? add as many ../s are needed to get to the stylesheet
var url = window.location.href;
var direcNum = url.split("/").length - 4;
var i;
var path = "";
if (isMobile == false) {
  for (i = 0; i < direcNum; i++) {
    path = path + "../";
  };
}

//set theme to cookie if it exists
if (document.cookie == "") {
    setTheme("frog");
} else {
    setTheme(cookieSet);
};
  
  //change theme when theme buttons are clicked
  var frogBtn = document.getElementById("frogBtn");
  var sheepBtn = document.getElementById("sheepBtn");
  var jellyfishBtn = document.getElementById("jellyfishBtn");
  var snailBtn = document.getElementById("snailBtn");
  frogBtn.onclick = function() {
   setTheme("frog", path);
   document.cookie = "frog";
  };
  sheepBtn.onclick = function() {
   setTheme("sheep", path);
   document.cookie = "sheep";
  };
  jellyfishBtn.onclick = function() {
   setTheme("jellyfish", path);
   document.cookie = "jellyfish";
  };
  snailBtn.onclick = function() {
   setTheme("snail", path);
   document.cookie = "snail";
  };
  console.log(document.cookie);
  //end onload function
};

function setTheme(theme, path) {
  //set stylesheet to theme
  var link = document.getElementById("themeSheet");
  link.setAttribute("href", path + "themes/" + theme + ".css");
  //avoid cursor attribution on mobile (where cursors don't exist)
  if (isMobile == true) {
  theme = "mobile";
  };
  
  //set attribution in footer
  switch (theme) {
    case "mobile":
     document.getElementById("attrib").innerHTML = ", but it's better on desktop"
      break;
    case "frog":
      document.getElementById("attrib").innerHTML = ", cursor by <a href='http://www.rw-designer.com/user/90488'>dingdongdie</a>"
      break;
    case "snail":
    case "jellyfish":
    case "sheep":
      document.getElementById("attrib").innerHTML = ""
      break;
  };
};
