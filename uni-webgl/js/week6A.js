function testglMatrixJsLibrary() {
  var u = vec3.create([1, 2, 3]);
  var v = vec3.create([4, 5, 6]);
  var r = vec3.create();
  var t = vec3.create([1, 2, 3]);
  console.log("Initialized vectors:");
  console.log("\tu:" + vec3.str(u));
  console.log("\tv:" + vec3.str(v));
  console.log("\tr:" + vec3.str(r));
  console.log("\tt:" + vec3.str(t));

/* In the add below the optional receiver vec3 is specified as 3:rd
argument so the first two arguments are not modified */
  var s = vec3.add(u, v, r);
  console.log("Result from the addition of u and v into r:");
  console.log("var s = vec3.add(u, v, r);");
  console.log("\tu:" + vec3.str(u));
  console.log("\tv:" + vec3.str(v));
  console.log("\tr:" + vec3.str(r));
  console.log("\ts:" + vec3.str(s));

  // In the add below the optional receiver vec3 is not specified
  // so the result is written to the first argument u in
  // addition to s2
  var s2 = vec3.add(u, v);      // s2 = [5, 7, 9] as expected but also u = [5, 7, 9]
  console.log("Result from the addition of u and v:");
  console.log("var s2 = vec3.add(u, v);");
  console.log("\tu:" + vec3.str(u));
  console.log("\tv:" + vec3.str(v));
  console.log("\ts2:" + vec3.str(s2));

  var d = vec3.dot(t, v);       // d = 1*4+2*5+3*6 = 32
  console.log("Result from the dot product of t and v:");
  console.log("var d = vec3.dot(t, v);");
  console.log("\tt:" + vec3.str(t));
  console.log("\tv:" + vec3.str(v));
  console.log("\td:" + d);

  var c = vec3.cross(t, v, r);   // c = r = [-3,6,-3]
  console.log("Result from the cross product of t and v into r:");
  console.log("var c = vec.cross(t, v, r);");
  console.log("\tt:" + vec3.str(t));
  console.log("\tv:" + vec3.str(v));
  console.log("\tr:" + vec3.str(r));
  console.log("\tc:" + vec3.str(c));



  var I = mat4.create([1,0,0,0,    // first column
                       0,1,0,0,    // second column
                       0,0,1,0,    // third column
                       0,0,0,1]);  // fourth column

  var M = mat4.create([1,0,0,0,    // first column
                       0,1,0,0,    // second column
                       0,0,1,0,    // third column
                       2,3,4,1]);  // fourth column

  var IM = mat4.create();

  console.log("Initialized matrices:");
  console.log("\tI:" + mat4.str(I));
  console.log("\tM:" + mat4.str(M));
  console.log("\tIM:" + mat4.str(IM));

  mat4.multiply(I, M, IM);
  console.log("Result from the matrix multiplication of I and M into IM:");
  console.log("mat4.multiply(I, M, IM);");
  console.log("\tI:" + mat4.str(I));
  console.log("\tM:" + mat4.str(M));
  console.log("\tIM:" + mat4.str(IM));

  var T = mat4.create();
  mat4.translate(I, [2, 3, 4], T);
  console.log("Result from the matrix translation of I and M into IM:");
  console.log("mat4.translate(I, [2, 3, 4], T);");
  console.log("\tI:" + mat4.str(I));
  console.log("\tT:" + mat4.str(T));
}
