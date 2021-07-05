var stuffDirec;
var stuffEnd;

function setPathAndLimit(stuffPath, stuffLimit) {
  stuffDirec = stuffPath;
  stuffEnd = stuffLimit;
}

function openImg(imgNum) {
  document.body.ontouchmove = (e) => e.preventDefault();
  document.getElementById("openImg").style.display = "block";
  document.getElementById("theImg").style.display = "block";
  if (imgNum !== 48) 
    document.getElementById("next").style.display = "block";
  if (imgNum !== 1) 
    document.getElementById("prev").style.display = "block";
  var imgPath = stuffDirec + "/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
  document.getElementById("imgLink").setAttribute("href", imgPath);
  //set caption
  document.getElementById("caption").innerHTML = this.innerHTML;
};

// Next/previous controls
function change(n) {
  //find current img num
  var imgNum = document.getElementById("theImg").src;
  imgNum = imgNum.split("/")[5];
  imgNum = imgNum.split(".")[0];
  //add n (add or subtract 1)
  imgNum = parseInt(imgNum) + n;
  var imgPath = stuffDirec + "/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
  document.getElementById("imgLink").setAttribute("href", imgPath);
  if (imgNum !== stuffEnd) 
    document.getElementById("next").style.display = "block";
  else
    document.getElementById("next").style.display = "none";
  if (imgNum !== 1) 
    document.getElementById("prev").style.display = "block";
  else
    document.getElementById("prev").style.display = "none";
};

// Close modal
function closeImg() {
  document.getElementById("openImg").style.display = "none";
  document.getElementById("theImg").style.display = "none";
  document.getElementById("prev").style.display = "none";
  document.getElementById("next").style.display = "none";
  document.body.ontouchmove = (e) => true;
};

//go to image page when image is clicked
function leave() {
    location.href = imgPath;
};
