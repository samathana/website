function init() {
  //are we on mobile?
  let isMobile = /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  //get text color
  let textColor = window.getComputedStyle(document.querySelector('main')).color;
  let c = document.getElementById("canvas");
  let ctx = c.getContext("2d");
  c.setAttribute("tabindex", 0);
  let main = document.getElementById("main");
  if (main.offsetWidth < main.offsetHeight) {
    c.height = main.offsetWidth-30;
    c.width = c.height;
  } else {
    c.width = main.offsetHeight-30;
    c.height = c.width;
  }

  //click to reload text
  ctx.font = "10px Times New Roman";
  if (isMobile)
    ctx.font = "50px Times New Roman";
  ctx.fillStyle = textColor;
  ctx.fillText("click for new sheep", 10, canvas.height-10);
  
  //weirdness
  let randomlimit = 0.5;
  
  //sheep variables
  let height = (controlRandom(randomlimit)+1) * c.height*0.4; //in pixels
  let width = (controlRandom(randomlimit)+1) * c.width*0.4;  //in pixels
  let floofpoints = 400; //number of edge points calculated
  let floofnum = Math.floor(controlRandom(randomlimit)*15)+15; //number of floofs
  let floofheight = (controlRandom(randomlimit)+0.4)*Math.hypot(height, width)*0.03; //pixel height of each floof
  let floofprogress = controlRandom(randomlimit); //progress for the floof (from 0 to 1)
  let headaltitude;
  let headheight;
  let headwidth;
  if (height < width) {
    headaltitude = controlRandom(randomlimit) * height/10;  //above center
    headheight = (controlRandom(randomlimit)+1)*height/4;
    headwidth = (controlRandom(randomlimit)+1)*headheight;
  } else {
    headaltitude = controlRandom(randomlimit) * height/5 + height*0.8 - width;  //above center
    headwidth = (controlRandom(randomlimit)+1)*width/4;
    headheight = (controlRandom(randomlimit)/2+1/2)*headwidth;
    
  }
  let headpoints = 100;
  let backfoot = (controlRandom(randomlimit)+1)*0.11;  //in revolutions
  let frontfoot = (controlRandom(randomlimit)+0.4)*backfoot/1.8; //in revolutions
  let footwidth = (controlRandom(randomlimit)+1)*0.03; //in revolutions
  let footlength = (controlRandom(randomlimit)+0.4)*Math.hypot(height, width)*0.07; //in pixels
  let footpoints = 20; 
  let eardist = controlRandom(randomlimit)*0.1+0.13; //in revolutions
  let earwidth = (controlRandom(randomlimit)+1)*0.04; //in revolutions
  let earlength = (controlRandom(randomlimit)+0.4)*Math.hypot(headheight, headwidth)*0.2; //in pixels
  let earpoints = 20;
  let eyeheight = controlRandom(randomlimit)*headheight*0.2; //above center of head
  let eyedist = (controlRandom(randomlimit)+0.3)*headwidth*0.3; //off center
  let eyesize = (controlRandom(randomlimit)+0.3)*0.01*headwidth; //radius
  let mouthlow = controlRandom(randomlimit)*headheight*0.2 - eyeheight; //pixels down from center of head
  let mouthwidth = (controlRandom(randomlimit)+1)*headwidth*0.2; //from left to right in pixels
  let mouthheight = controlRandom(randomlimit)*mouthwidth/4; //cannot be more than 1/4 the width

  //outer floof
  let floofinfo = drawfloof(0, height, width, floofpoints, floofnum, floofheight, floofprogress, c, ctx, textColor);
  //head
  let headinfo = drawfloof(headaltitude, headheight, headwidth, headpoints, 20, 0, 0, c, ctx, textColor);
  //feet
  drawfoot(frontfoot, footwidth, footlength, footpoints, floofinfo, c, ctx);
  drawfoot(frontfoot*-1 - footwidth, footwidth, footlength, footpoints, floofinfo, c, ctx, textColor);
  drawfoot(backfoot, footwidth, footlength, footpoints, floofinfo, c, ctx);
  drawfoot(backfoot*-1 - footwidth, footwidth, footlength, footpoints, floofinfo, c, ctx, textColor);
  //ears
  drawfoot(eardist+0.5, earwidth, earlength, earpoints, headinfo, c, ctx);
  drawfoot(0.5-eardist-earwidth, earwidth, earlength, earpoints, headinfo, c, ctx, textColor);
  //eyes
  draweye(eyedist, eyeheight + headaltitude, eyesize, c, ctx, textColor);
  draweye(-eyedist, eyeheight + headaltitude, eyesize, c, ctx, textColor);
  //mouth
  drawmouth(headaltitude - mouthlow, mouthwidth, mouthheight, c, ctx, textColor);

  //reload button
  c.onclick = init;
}

function drawmouth(y, width, height, c, ctx, textColor) {
  //find radius of circles
  let radius = (width**2/16/height + height)/2;

  //find angle of arc between the bottom of the mouth and the nose
  let angle = Math.asin(width/4/radius);

  //draw the two things

  ctx.beginPath();
  ctx.strokeStyle = textColor;
  ctx.arc(c.width/2 + width/4, c.height/2-y+height-radius, radius, Math.PI/2 - angle, Math.PI/2 + angle);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = textColor;
  ctx.arc(c.width/2 - width/4, c.height/2-y+height-radius, radius, Math.PI/2 - angle, Math.PI/2 + angle);
  ctx.stroke();


}



//basically just circle drawing but with centered coords
function draweye(x, y, radius, c, ctx, textColor) {
  ctx.beginPath();
  ctx.strokeStyle = textColor;
  ctx.arc(c.width/2 + x, c.height/2 - y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = textColor;
  ctx.fill();
}



function drawfoot(pos, width, length, points, floof, c, ctx, textColor) {
  //find how many floofs there are in the floof
  let numfloofs = Math.ceil(floof[floof.length-1][2]);
  
  //find point 1, the point where the right line of leg comes out
  let lastpoint = -1; //point in the floof we tested
  let lastdistance = -1; //the amount of floofs away we were
  let currentdistance = -1; //the amount of floofs away we are
  //we cycle around the floof until the distance increases
  while (currentdistance < lastdistance || lastdistance == -1) {
    lastdistance = currentdistance;
    lastpoint = (lastpoint + 1)%floof.length;
    currentdistance = Math.abs(floof[lastpoint][2] - (pos + 0.25)%1 *numfloofs);
  }
  let point1 = lastpoint;

  //find point 2, the left side
  lastdistance = -1; //the amount of floofs away we were
  currentdistance = -1; //the amount of floofs away we are
  //we cycle around the floof until the distance increases again
  while (currentdistance < lastdistance || lastdistance == -1) {
    lastdistance = currentdistance;
    lastpoint = (lastpoint + 1)%floof.length;
    currentdistance = Math.abs(floof[lastpoint][2] - (pos + width +  0.25)%1*numfloofs);
  }
  let point2 = lastpoint;

  //middle of the foot ellipse
  let midx = (floof[point1][0] + floof[point2][0])/2;
  let midy = (floof[point1][1] + floof[point2][1])/2;

  //vector of pushing out the foot
  let kickvector = [floof[point2][1] - floof[point1][1], floof[point1][0] - floof[point2][0]];
  //convert it into its max length
  let kickmag = Math.hypot(kickvector[0], kickvector[1]);
  kickvector = [kickvector[0] * length/kickmag, kickvector[1] * length/kickmag];

  //points in the foot
  let footpoints = [];
  for (let i=0; i<points; i++) {
    let progress = i/(points-1); //how far along the line we are
    
    footpoints.push([
      floof[point1][0]*progress + floof[point2][0]*(1-progress) + kickvector[0] * 2*(0.25-(progress-0.5)**2)**0.5, 
      floof[point1][1]*progress + floof[point2][1]*(1-progress) + kickvector[1] * 2*(0.25-(progress-0.5)**2)**0.5]);
  }

  //draw the foot
  for (let i=0; i<points-1; i++) {
    connect(ctx, footpoints[i][0], footpoints[i][1], footpoints[i+1][0], footpoints[i+1][1], textColor);
  }
  
}



function drawfloof(alt, height, width, numpoints, floofnum, floofheight, floofprogress, c, ctx, textColor) {
  //sheep calculations
  let floofpoints = [];   //points in the sheep floof
  for (let i=0; i<numpoints; i++) {
    let angle = i * 2 * Math.PI/numpoints;  //angle of polar coordinates if the sheep is a circle
    floofpoints.push([(c.width+width*Math.cos(angle))/2, (c.height-alt*2+height*Math.sin(angle))/2]);
  }

  let perimeter = 0; //for uniform floofage
  for (let i=0; i<numpoints-1; i++) {
    //for each point calculate the distance because we want to have the same distance for each floof
    perimeter += Math.hypot(floofpoints[i+1][0]-floofpoints[i][0], floofpoints[i+1][1]-floofpoints[i][1]);
  }  
  perimeter += Math.hypot(floofpoints[0][0]-floofpoints[numpoints-1][0], floofpoints[0][1]-floofpoints[numpoints-1][1])
  let perfloof = perimeter/floofnum;  //pixels per floof

  perimeter = 0;    //reset counter for floof drawing
  for (let i=0; i<numpoints; i++) {
    //FLOOF IT UP
    //vector to floof = normal to the ellipse
    let angle = i * 2 * Math.PI/numpoints;  //angle of polar 
    let floofvector = [height*Math.cos(angle), width*Math.sin(angle)];
    //unitize floofvector
    floofvector = [floofvector[0]/Math.hypot(floofvector[0],floofvector[1]), floofvector[1]/Math.hypot(floofvector[0],floofvector[1])];


    if (i !== 0) {    //update perimeter
      perimeter += Math.hypot(floofpoints[i][0]-floofpoints[i-1][0], floofpoints[i][1]-floofpoints[i-1][1]);
    }
    
    //how many floofs this point is, pushed into index 2
    floofpoints[i].push(perimeter/perfloof);
    //push floofvector into index 3
    floofpoints[i].push(floofvector);
  }


  //actually floof it
  for (let i=0; i<numpoints; i++) {
    let floof = (1-(((floofpoints[i][2]+floofprogress)%1)*2-1)**2)**0.5 * floofheight
    floofpoints[i][0] += floof*floofpoints[i][3][0];
    floofpoints[i][1] += floof*floofpoints[i][3][1];
  }

  //draw sheep floof
  for (let i=0; i<numpoints-1; i++) {
    connect(ctx, floofpoints[i][0], floofpoints[i][1], floofpoints[i+1][0], floofpoints[i+1][1], textColor);
  }
  connect(ctx, floofpoints[0][0], floofpoints[0][1], floofpoints[numpoints-1][0], floofpoints[numpoints-1][1], textColor);

  return floofpoints;
}


function connect(ctx,x1,y1,x2,y2, textColor) {           //draw line between two points
  ctx.beginPath();
  ctx.strokeStyle = textColor;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke(); 
}


//1 is math.random, 0 is 0.5
function controlRandom(input) {
  return 0.5 + (Math.random()-0.5)*input;
}
