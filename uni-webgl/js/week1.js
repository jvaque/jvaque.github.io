var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.fillStyle = "#FF0000";
ctx.fillRect(0,0,155,75);

ctx.moveTo(0,0);
ctx.lineTo(200,100);
ctx.stroke();

ctx.beginPath();
ctx.arc(95, 50, 40, 0, 2*Math.PI);
ctx.stroke();

ctx.fillStyle = "#fc642b"
ctx.font = "30px Arial";
ctx.fillText("Hello World", 10, 35);
ctx.rotate(20*Math.PI/180);
ctx.strokeText("Hello World", 10, 35);


c = document.getElementById("myCanvasV2");
ctx = c.getContext("2d");
var grd = ctx.createLinearGradient(0, 0, 200, 0);
// var grd = ctx.createRadialGradient(75, 50, 5, 90, 60, 100);

grd.addColorStop(0, "red");
grd.addColorStop(1, "white");

ctx.fillStyle = grd;
ctx.fillRect(10, 10, 150, 80);

c = document.getElementById("myCanvasImg");
ctx = c.getContext("2d");
var image = new Image();
image.onload = function() {
  ctx.drawImage(image, 0, 0);
}
image.src = "/img/scream.png";
