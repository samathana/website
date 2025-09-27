//get canvas
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

//get confettiCanvas
var confettiCanvas = document.getElementById("confettiCanvas");
var confettiCtx = confettiCanvas.getContext("2d");

//get confetti images
var cfti = new Image();
cfti.src = "confetti.png";
var onet = new Image();
onet.src = "confetti2.png";

//add input
var x = document.getElementById("input");
//make input react to the enter key
x.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    GetInput();
  }
});

//font styles
ctx.font = '84pt Calibri';
ctx.fillStyle = 'green';

//initialize variables
var mathType;
var num1;
var num2;
var answer;
var point = 0;
var frogCount = 0;
var posPoint;
var pos = [];
var text;
var gameIsOver = false;
var bkgdPiece = new Image();
bkgdPiece.src = "background.svg"; //get background

//set question type
function setMathType(type) {
  mathType = type;
  document.getElementById("multbtn").style.display = "none";
  document.getElementById("divbtn").style.display = "none";
  createProblem();
}

//create a random multiplication problem
function createProblem() {
  if (mathType == "multiplication") {
    num1 = getRandomInt(13);
    num2 = getRandomInt(13);
    answer = num1 * num2;
    text = num1 + ' x ' + num2 + ' =';
  } else if (mathType == "division") {
    num1 = getRandomInt(12) + 1;
    num2 = getRandomInt(12) + 1;
    answer = num1;
    num1 = num1 * num2;
    text = num1 + ' ÷ ' + num2 + ' =';
  } else{}
  console.log(answer);
  ctx.clearRect(500, 140, 720, 120);
  ctx.fillStyle = 'green';
  ctx.textAlign = "right";
  ctx.fillText(text, 970, 240);
  ctx.textAlign = "left";
  return answer;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

//you get three chances per problem
var chanceNum = 0;

//get input, check answer
function GetInput() {
  ctx.clearRect(1240, 140, 320, 120);
  var input = x.value;
  if (input == answer) { //if it's correct
    point += 1; //add 1 to your score
    posPoint = [Math.random() * 1900 - 100, Math.random() * 800 + 300]
    if (pos.length != 0 && !gameIsOver) {
      personalSpace();
    } else {
      pos.push(posPoint);
    }
    addfrog(point); //add a frog
    frogCount++;
    chanceNum = 0; //reset number of chances
    createProblem();
  } else if (x.value != '') { //if it's wrong (but not empty)
    ctx.fillStyle = 'red';
    ctx.fillText("x", 1300, 240);
    chanceNum++;
    //if you got the same problem wrong 3 times
    if (chanceNum == 3) {
      chanceNum = 0;
      ctx.clearRect(1240, 140, 120, 120);
      ctx.fillText(answer, 1320, 240); //give answer
    }
  }
  x.value = ''; //clear value
}

//add a frog
function addfrog(count) {
  var img = new Image();
  //find image based on frog number (subtract one since arrays start at 0)
  if (!gameIsOver) {
    img.src = "frogs/frog" + (count - 1) + ".png";
    img.onload = function() {
      ctx.drawImage(img, pos[count - 1][0], pos[count - 1][1], 300, 300);
    }
    if (frogCount == 24) 
      finishGame();
  } else {
    img.src = "frogs/frog" + getRandomInt(25) + ".png";
    img.onload = function() {
      ctx.drawImage(img, Math.random() * 1900 - 100, Math.random() * 800 + 300, 300, 300);
    }
  }
}

//remove a frog from the canvas
function hopAway(frogId) {
  if (!gameIsOver) {
    //only actually remove the frog if there's at least one more frog to keep the player company
    if (frogId < frogCount) {
      var bkgdPiece = new Image();
      bkgdPiece.src = "background.svg"; //get background
      //clear frog
      ctx.clearRect(pos[frogId - 1][0], pos[frogId - 1][1], 300, 300);
      for (let i = frogId + 1; i <= frogCount; i++) {
        addfrog(i);
    }
    }
  }
}

//wait, and then call hopAway on the next frog
var hopAwayCounter = 1;
async function impatientFrog() {
hopAwayCounter = 1;
  while (!gameIsOver) {
    let frogRemoval = new Promise(function (wait) {
      setTimeout(function () { wait(hopAway(hopAwayCounter)); }, 30000);
    });
    await frogRemoval;
    //don't try to remove another frog if this one didn't get removed
    if (hopAwayCounter < frogCount)
      hopAwayCounter++;
  }
}

//call async function
impatientFrog();

//personal space function ensures frogs don't get too close
function personalSpace() {
  for (let i = 0; i < pos.length; i++) {
    if ((Math.abs(pos[i][0] - posPoint[0]) < 200) && (Math.abs(pos[i][1] - posPoint[1]) < 200)) {
      posPoint = [Math.random() * 1900 - 100, Math.random() * 800 + 300];
      personalSpace();
      return;
    }
  }
  pos.push(posPoint);
}

//ending sequence
function finishGame() {
  gameIsOver = true;
  x.disabled = true;
  confettiCanvas.style.display = "block";
  confettiPos = -1*confettiCanvas.width;
  confettiPos2 = confettiCanvas.width;
  confetti();
}

//confetti sequence
var confettiPos = -1*confettiCanvas.width;
var confettiPos2 = confettiCanvas.width;
function confetti() {
  confettiPos += 15;
  confettiPos2 -= 15;
  confettiCtx.clearRect(0, 0, 3000, 3000);
  confettiCtx.drawImage(cfti, confettiPos, confettiPos, 2100, 2800);
  confettiCtx.drawImage(onet, confettiPos2, -confettiPos2, 2100, 2800);
  if (confettiPos > confettiCanvas.width) {
    window.cancelAnimationFrame(confetti);
    confettiCanvas.style.display = "none";
    document.getElementById("resetbtn").style.display = "block";
    document.getElementById("continuebtn").style.display = "block";
  } else {
      requestAnimationFrame(confetti);
  }
}

//reset the game when reset button clicked
function resetGame() {
  if (gameIsOver) {
    //call async function
    impatientFrog();
  }
  x.disabled = false;
  document.getElementById("resetbtn").style.display = "none";
  document.getElementById("continuebtn").style.display = "none";
  gameIsOver = false; 
  point = 0;
  frogCount = 0;
  pos = [];
  ctx.clearRect(0, 0, 3000, 3000);
  document.getElementById("multbtn").style.display = "block";
  document.getElementById("divbtn").style.display = "block";
}

//continue game, but gameIsOver = true
function continueGame() {
  x.disabled = false;
  document.getElementById("resetbtn").style.display = "none";
  document.getElementById("continuebtn").style.display = "none";
  createProblem();
}