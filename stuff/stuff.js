function openImg(imgNum) {
  document.getElementById("openImg").style.display = "block";
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
};

// Next/previous controls
document.getElementById("prev").addEventListener("click", function( e ){
    e = window.event || e; 
    if(this === e.target) {
        changeImg(-1);
    }
});

document.getElementById("next").addEventListener("click", function( e ){
    e = window.event || e; 
    if(this === e.target) {
        changeImg(1);
    }
});

function changeImg(n) {
  //find current img num
  var imgNum = document.getElementById("theImg").src;
  imgNum = imgNum.split("/")[5];
  imgNum = imgNum.split(".")[0];
  //add n (add or subtract 1)
  imgNum = imgNum + n;
  var imgPath = "proof/" + imgNum + ".jpeg";
  document.getElementById("theImg").setAttribute("src", imgPath);
};

// Close modal
function closeImg() {
    document.getElementById("openImg").style.display = "none";
};
