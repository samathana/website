function openImg(imgNum) {
  document.getElementById("openImg").style.display = "block";
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
};

// Close the Modal
function closeImg() {
  closeImg.stopPropagation();
  document.getElementById("openImg").style.display = "none";
};

// Next/previous controls
function changeImg(n) {
  changeImg.stopPropagation();
  //find current img num
  imgNum = document.getElementById("theImg").src;
  imgNum = imgNum.split("/")[1];
  imgNum = imgNum.split(".")[0];
  //add n (add or subtract 1)
  imgNum = imgNum + n;
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
};
