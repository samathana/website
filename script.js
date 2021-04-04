document.write(document.cookie); 
//set the theme according to cookie if it exists
  if (document.cookie == "snail=; jellyfish=; sheep=") {
    document.write("get erred");
  } else {
    setTheme(document.cookie);
  };

//load JS after the page is loaded, to avoid issues with selecting elements that don't exist
window.onload = function () {
  
  //change theme when theme buttons are clicked
  var frogBtn = document.getElementById("frogBtn");
  var sheepBtn = document.getElementById("sheepBtn");
  var jellyfishBtn = document.getElementById("jellyfishBtn");
  var snailBtn = document.getElementById("snailBtn");
  frogBtn.onclick = function() {
   setTheme("frog");
   document.cookie = "frog";
  };
  sheepBtn.onclick = function() {
   setTheme("sheep");
   document.cookie = "sheep";
  };
  jellyfishBtn.onclick = function() {
   setTheme("jellyfish");
   document.cookie = "jellyfish";
  };
  snailBtn.onclick = function() {
   setTheme("snail");
   document.cookie = "snail";
  };
  //end onload function
};

function setTheme(theme) {
  //set stylesheet to theme
  var link = document.getElementById("themeSheet");
  link.setAttribute("href", "themes/" + theme + ".css");
  //avoid cursor attribution on mobile (where cursors don't exist)
  if( /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
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
