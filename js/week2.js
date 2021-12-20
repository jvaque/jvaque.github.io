var fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"];
document.write(fruits + "<br>");
console.log(fruits);

var boolTest = false;
variableCondition = (boolTest)? "It was true": "It was false";
console.log(variableCondition);

var cars = ["Saab", "Volvo", "BMW"];
for (var i=0, len=cars.length; i<len; i++) {
  document.write(cars[i] + "<br>");
}

// var person = {fname: "John", lname: "Doe", age: 25};
// var txt = "";
// for (var x in person) {
//   txt = txt + person[x];
// }
// console.log(txt);

Array.prototype.ucase = function () {
  for (i=0; i<this.length; i++) {
    this[i] = this[i].toUpperCase();
  }
};

console.log(cars);
cars.ucase();
console.log(cars);


console.log(fruits);
function myFunction1() {
  fruits.push("Kiwi");
  var x = document.getElementById("demo1");
  x.innerHTML = fruits;
  console.log(fruits);
}

function myFunction2() {
  var fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"];
  fruits.unshift("Lemmon", "Pineapple");
  var x = document.getElementById("demo2");
  x.innerHTML = fruits;
  console.log(fruits);
}

function myFunction3() {
  var fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"];
  fruits.pop();
  var x = document.getElementById("demo3");
  x.innerHTML = fruits;
  console.log(fruits);
}

function myFunction4() {
  var fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"];
  fruits.shift();
  var x = document.getElementById("demo4");
  x.innerHTML = fruits;
  console.log(fruits);
}

function myFunction5() {
  var fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"];
  var citrus = fruits.slice(1, 3);
  var x = document.getElementById("demo5");
  x.innerHTML = citrus;
  console.log(citrus);
}

function myFunction6() {
  var fruits = ["Banana", "Orange", "Apple", "Mango"];
  fruits.splice(2, 0, "Lemmon", "Kiwi");
  var x = document.getElementById("demo6");
  x.innerHTML = fruits;
  console.log(fruits);
}

function myFunction7() {
  var fruits = ["Banana", "Orange", "Apple", "Mango"];
  fruits.sort();
  var x = document.getElementById("demo7");
  x.innerHTML = fruits;
  console.log(fruits);
}

function person(fname, lname, age, eyecolour) {
  this.fname = fname;
  this.lname = lname;
  this.age = age;
  this.eyecolour = eyecolour;

  this.changeName = changeName;
  function changeName(name) {
    this.lname = name;
  }
}
var myMother = new person("Sally", "Rally", 48, "green");
document.write(myMother.lname);
myMother.changeName("Doe");
document.write(myMother.lname);
