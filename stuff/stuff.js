function openImg(imgNum) {
  document.getElementById("openImg").style.display = "block";
  if (imgNum !== 48) 
    document.getElementById("next").style.display = "block";
  if (imgNum !== 1) 
    document.getElementById("prev").style.display = "block";
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
};

// Next/previous controls
function change(n) {
  //find current img num
  var imgNum = document.getElementById("theImg").src;
  imgNum = imgNum.split("/")[5];
  imgNum = imgNum.split(".")[0];
  //add n (add or subtract 1)
  imgNum = parseInt(imgNum) + n;
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
};

// Close modal
function closeImg() {
    document.getElementById("openImg").style.display = "none";
    document.getElementById("prev").style.display = "none";
    document.getElementById("next").style.display = "none";
};

//go to image page when image is clicked
function leave() {
    location.href = imgPath;
};
