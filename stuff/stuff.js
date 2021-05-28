function openImg(imgNum) {
  document.getElementById("openImg").style.display = "block";
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
  var aroClicked = 0;
};

// Close the Modal
function closeImg(event) {
  if (aroClicked == 0) {
    document.getElementById("openImg").style.display = "none";
  }
};

// Next/previous controls
function changeImg(n) {
  aroClicked = 1;
  //find current img num
  var imgNum = document.getElementById("theImg").src;
  imgNum = imgNum.split("/")[1];
  imgNum = imgNum.split(".")[0];
  //add n (add or subtract 1)
  imgNum = imgNum + n;
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
  aroClicked = 0;
};
