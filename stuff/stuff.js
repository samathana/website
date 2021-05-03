function open() {
  console.log("er");
};

// Close the Modal
function close(imgNum) {
  document.getElementById("openImg").style.display = "none";
};

// Next/previous controls
function changeImg(n) {
  imgNum = imgNum + 1;
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute(src, imgPath);
};
