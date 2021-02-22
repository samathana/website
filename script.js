//load JS after the page is loaded, to avoid issues with selecting elements that don't exist
window.onload = function () {
  
//set theme to frog by default
var theme = "frog";

//set stylesheet to theme
var link = document.getElementById("themeSheet");
link.setAttribute("href", "themes/" + theme + ".css");

//set attribution in footer
switch (theme) {
  case "frog":
    document.getElementById("attrib").innerHTML = ", cursor by <a href='http://www.rw-designer.com/user/90488'>dingdongdie</a>"
    break;
}

//end onload function
}
