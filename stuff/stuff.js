function openImg(imgNum) {
  document.getElementById("openImg").style.display = "block";
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
};

// Close the Modal
function close(imgNum) {
  document.getElementById("openImg").style.display = "none";
};

// Next/previous controls
function changeImg(n) {
  imgNum = imgNum + 1;
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
};
