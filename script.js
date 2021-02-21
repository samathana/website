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
