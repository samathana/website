//set theme to frog by default
var theme = "frog";

//set stylesheet to theme
var link = document.getElementById("themeSheet");
link.setAttribute(href, "frog.css");

//set attribution in footer
switch (theme) {
  case "frog":
    document.footer.span.innerHTML = ", cursor by <a href='http://www.rw-designer.com/user/90488'>dingdongdie</a>"
    break;
}
