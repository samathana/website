function openImg(imgNum) {
  document.getElementById("openImg").style.display = "block";
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
};

// Next/previous controls
function change(e, direc) {
    e = window.event || e; 
    if(this === e.target) {
        //find current img num
        var imgNum = document.getElementById("theImg").src;
        imgNum = imgNum.split("/")[5];
        imgNum = imgNum.split(".")[0];
        //add n (add or subtract 1)
        imgNum = imgNum + direc;
        var imgPath = "proof/" + imgNum + ".jpeg";
        document.getElementById("theImg").setAttribute("src", imgPath);
    }
};

// Close modal
function closeImg() {
    document.getElementById("openImg").style.display = "none";
};
