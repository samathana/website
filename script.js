//where are we? add as many ../s are needed to get to the stylesheet
var url = window.location.href;
var direcNum = url.split("/").length - 4;
var i;
var path = "";
for (i = 0; i < direcNum; i++) {
  path = path + "../";
};

//set theme to localStorage if it exists
if (localStorage.getItem("theme") == null)
  setTheme("frog");
else
  setTheme(localStorage.getItem("theme"));
//load JS after the page is loaded, to avoid issues with selecting elements that don't exist
window.onload = function () {
  
  //change theme when theme buttons are clicked
  var frogBtn = document.getElementById("frogBtn");
  var sheepBtn = document.getElementById("sheepBtn");
  var jellyfishBtn = document.getElementById("jellyfishBtn");
  var snailBtn = document.getElementById("snailBtn");
  frogBtn.onclick = function() {
   setTheme("frog");
  };
  sheepBtn.onclick = function() {
   setTheme("sheep");
  };
  jellyfishBtn.onclick = function() {
   setTheme("jellyfish");
  };
  snailBtn.onclick = function() {
   setTheme("duck");
  };
  //end onload function
};

function setTheme(theme) {
  //remember this theme
    localStorage.setItem("theme", theme);
  //set stylesheet to theme
  var link = document.getElementById("themeSheet");
  link.setAttribute("href", path + "themes/" + theme + ".css");
};
