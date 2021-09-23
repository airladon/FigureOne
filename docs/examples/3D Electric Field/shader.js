const vertexShader = `
attribute vec3 a_vertex;
attribute vec3 a_center;
attribute vec3 a_normal;
varying vec3 v_normal;
uniform mat4 u_worldInverseTranspose;
uniform mat4 u_vertexTransform;
uniform mat4 u_worldViewProjectionMatrix;
uniform float u_norm;
uniform float u_scaleArrow;
uniform vec4 u_charge1;
uniform vec4 u_charge2;
uniform vec4 u_charge3;
uniform vec4 u_charge4;
uniform vec4 u_charge5;
uniform vec4 u_charge6;
uniform vec4 u_charge7;
uniform vec4 u_charge8;
uniform vec4 u_charge9;
uniform vec4 u_charge10;
uniform vec4 u_charge11;
uniform vec4 u_charge12;
uniform vec4 u_charge13;
uniform vec4 u_charge14;
uniform vec4 u_charge15;
uniform vec4 u_charge16;
uniform vec4 u_charge17;
uniform vec4 u_charge18;
uniform vec4 u_charge19;
uniform vec4 u_charge20;
varying vec4 v_color;


vec4 directionToAxisAngle(vec3 vector) {
  if (abs(vector.x) / length(vector) > 0.999999) {
    if (vector.x > 0.0) {
      return vec4(0, 0, 1, 0);
    }
    return vec4(0, 0, 1, 3.141592);
  }
  vec3 axis = normalize(cross(vec3(1.0, 0.0, 0.0), vector));
  float d = dot(vec3(1.0, 0.0, 0.0), vector);
  float angle = acos(d / length(vector));
  return vec4(axis.xyz, angle);
}

mat4 rotationMatrixAngleAxis(float angle, vec3 axis) {
  float c = cos(angle);
  float s = sin(angle);
  float x = axis.x;
  float y = axis.y;
  float z = axis.z;
  float C = 1.0 - c;
  return mat4(x * x * C + c, y * x * C + z * s, z * x * C - y * s, 0, x * y * C - z * s, y * y * C + c, z * y * C + x * s, 0, x * z * C + y * s, y * z * C - x * s, z * z * C + c, 0, 0, 0, 0, 1);
}

vec3 fromCharge(vec4 charge, vec4 center) {
  vec3 direction = normalize(charge.xyz - center.xyz);
  float dist = distance(charge.xyz, center.xyz);
  float q1 = -charge.w / pow(dist, 2.0);
  return q1 * direction;
}

void main() {
  vec4 center = u_vertexTransform * vec4(a_center.xyz, 1.0);
  mat4 originToCenter = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, center.x, center.y, center.z, 1);

  // Calculate the x and y charge magnitude from each charge at this vertex
  vec3 c1 = fromCharge(u_charge1, center);
  vec3 c2 = fromCharge(u_charge2, center);
  vec3 c3 = fromCharge(u_charge3, center);
  vec3 c4 = fromCharge(u_charge4, center);
  vec3 c5 = fromCharge(u_charge5, center);
  vec3 c6 = fromCharge(u_charge6, center);
  vec3 c7 = fromCharge(u_charge7, center);
  vec3 c8 = fromCharge(u_charge8, center);
  vec3 c9 = fromCharge(u_charge9, center);
  vec3 c10 = fromCharge(u_charge10, center);
  vec3 c11 = fromCharge(u_charge11, center);
  vec3 c12 = fromCharge(u_charge12, center);
  vec3 c13 = fromCharge(u_charge13, center);
  vec3 c14 = fromCharge(u_charge14, center);
  vec3 c15 = fromCharge(u_charge15, center);
  vec3 c16 = fromCharge(u_charge16, center);
  vec3 c17 = fromCharge(u_charge17, center);
  vec3 c18 = fromCharge(u_charge18, center);
  vec3 c19 = fromCharge(u_charge19, center);
  vec3 c20 = fromCharge(u_charge20, center);

  // Total x and y charge magnitude
  vec3 sum = c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8 + c9 + c10 + c11 + c12 + c13 + c14 + c15 + c16 + c17 + c18 + c19 + c20;

  // Total charge magnitude and direction
  float mag = length(sum);

  // Normalize the charge magnitude for visualization
  float normCharge = min(sqrt(mag), u_norm)/ u_norm;

  // Arrow scaling factor - will only be scaled if uniform u_scaleArrow is 1
  float scale = 1.0;
  if (u_scaleArrow == 1.0) {
    scale = min(normCharge * 1.5 + 0.25, 1.0);
  }

  // Calculate the scale and rotation matrix for the arrow
  mat4 scaleMatrix = mat4(min(scale, 1.0), 0, 0, 0, 0, min(scale, 1.0), 0, 0, 0, 0,min(scale, 1.0), 0, 0, 0, 0, 1.0);
  vec4 axisAngle = directionToAxisAngle(normalize(sum));
  mat4 rotationMatrix = rotationMatrixAngleAxis(axisAngle.w, axisAngle.xyz);
  mat4 scaleRotation = rotationMatrix * scaleMatrix;

  // Offset the vertex relative to the center, scale and rotate, then reverse
  // the offset
  vec4 final = originToCenter * scaleRotation * vec4(a_vertex.xyz, 1);

  // Final position
  gl_Position = u_worldViewProjectionMatrix * final;

  // Set the color based on the normalized charge between red (high charge
  // magnitude) and blue (low charge magnitude)
  v_color = vec4(normCharge, normCharge, 1.0 - normCharge, 1);
  v_normal = mat3(u_worldInverseTranspose) * a_normal;
}`;
