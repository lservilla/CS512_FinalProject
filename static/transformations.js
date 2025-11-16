// Matrix functions
// Perspective matrix
function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}

// Orthographic matrix
function ortho(left, right, bottom, top, near, far) {
    const lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
    return [-2*lr,0,0,0, 0,-2*bt,0,0, 0,0,2*nf,0, (left+right)*lr,(top+bottom)*bt,(far+near)*nf,1];
}

// Identity matrix
function mat4Identity() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

// Matrix translation
function mat4Translate(matrix, translation) {
    const result = new Float32Array(matrix);
    result[12] = matrix[0] * translation[0] + matrix[4] * translation[1] + matrix[8] * translation[2] + matrix[12];
    result[13] = matrix[1] * translation[0] + matrix[5] * translation[1] + matrix[9] * translation[2] + matrix[13];
    result[14] = matrix[2] * translation[0] + matrix[6] * translation[1] + matrix[10] * translation[2] + matrix[14];
    result[15] = matrix[3] * translation[0] + matrix[7] * translation[1] + matrix[11] * translation[2] + matrix[15];
    return result;
}

// Returns M * Rx(angle)
function mat4RotateX(M, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);

  const m00=M[0],  m01=M[1],  m02=M[2],  m03=M[3];
  const m10=M[4],  m11=M[5],  m12=M[6],  m13=M[7];
  const m20=M[8],  m21=M[9],  m22=M[10], m23=M[11];
  const m30=M[12], m31=M[13], m32=M[14], m33=M[15];

  const out = new Float32Array(16);
  out[0]=m00; out[1]=m01; out[2]=m02; out[3]=m03;
  out[4] = m10*c + m20*(-s);
  out[5] = m11*c + m21*(-s);
  out[6] = m12*c + m22*(-s);
  out[7] = m13*c + m23*(-s);
  out[8]  = m10*s + m20*c;
  out[9]  = m11*s + m21*c;
  out[10] = m12*s + m22*c;
  out[11] = m13*s + m23*c;
  out[12]=m30; out[13]=m31; out[14]=m32; out[15]=m33;

  return out;
}

// Returns M * Ry(angle)
function mat4RotateY(M, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);

  const m00=M[0],  m01=M[1],  m02=M[2],  m03=M[3];
  const m10=M[4],  m11=M[5],  m12=M[6],  m13=M[7];
  const m20=M[8],  m21=M[9],  m22=M[10], m23=M[11];
  const m30=M[12], m31=M[13], m32=M[14], m33=M[15];

  const out = new Float32Array(16);
  out[0] = m00*c + m20*s;
  out[1] = m01*c + m21*s;
  out[2] = m02*c + m22*s;
  out[3] = m03*c + m23*s;
  out[4]=m10; out[5]=m11; out[6]=m12; out[7]=m13;
  out[8]  = m00*(-s) + m20*c;
  out[9]  = m01*(-s) + m21*c;
  out[10] = m02*(-s) + m22*c;
  out[11] = m03*(-s) + m23*c;
  out[12]=m30; out[13]=m31; out[14]=m32; out[15]=m33;

  return out;
}

// Returns M * Rz(angle)
function mat4RotateZ(M, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);

  const m00=M[0],  m01=M[1],  m02=M[2],  m03=M[3];
  const m10=M[4],  m11=M[5],  m12=M[6],  m13=M[7];
  const m20=M[8],  m21=M[9],  m22=M[10], m23=M[11];
  const m30=M[12], m31=M[13], m32=M[14], m33=M[15];

  const out = new Float32Array(16);

  out[0] = m00*c + m10*(-s);
  out[1] = m01*c + m11*(-s);
  out[2] = m02*c + m12*(-s);
  out[3] = m03*c + m13*(-s);
  out[4] = m00*s + m10*c;
  out[5] = m01*s + m11*c;
  out[6] = m02*s + m12*c;
  out[7] = m03*s + m13*c;
  out[8]=m20; out[9]=m21; out[10]=m22; out[11]=m23;
  out[12]=m30; out[13]=m31; out[14]=m32; out[15]=m33;

  return out;
}

function mat4RotateYAboutPoint(M, angle, pivot) {
  const [px, py, pz] = pivot;
  const I   = mat4Identity();
  const Tn  = mat4Translate(I, [-px, -py, -pz]);      // move pivot to origin
  const Ry  = mat4RotateY(I, angle);                  // rotate around Y
  const Tp  = mat4Translate(I, [ px,  py,  pz]);      // move back
  // Pre-multiply so this acts in world space on the current M
  return multiplyMat4(Tp, multiplyMat4(Ry, multiplyMat4(Tn, M)));
}

// original provided matrixes 
// // Matrix rotation around X axis
// function mat4RotateX(matrix, angle) {
//     const c = Math.cos(angle);
//     const s = Math.sin(angle);
//     const result = new Float32Array(matrix);

//     const mv1 = matrix[4], mv5 = matrix[5], mv9 = matrix[6], mv13 = matrix[7];
//     const mv2 = matrix[8], mv6 = matrix[9], mv10 = matrix[10], mv14 = matrix[11];

//     result[4] = mv1 * c + mv2 * s;
//     result[5] = mv5 * c + mv6 * s;
//     result[6] = mv9 * c + mv10 * s;
//     result[7] = mv13 * c + mv14 * s;
//     result[8] = mv2 * c - mv1 * s;
//     result[9] = mv6 * c - mv5 * s;
//     result[10] = mv10 * c - mv9 * s;
//     result[11] = mv14 * c - mv13 * s;

//     return result;
// }

// // Matrix rotation around Y axis
// function mat4RotateY(matrix, angle) {
//     const c = Math.cos(angle);
//     const s = Math.sin(angle);
//     const result = new Float32Array(matrix);

//     const mv0 = matrix[0], mv4 = matrix[1], mv8 = matrix[2], mv12 = matrix[3];
//     const mv2 = matrix[8], mv6 = matrix[9], mv10 = matrix[10], mv14 = matrix[11];

//     result[0] = mv0 * c - mv2 * s;
//     result[1] = mv4 * c - mv6 * s;
//     result[2] = mv8 * c - mv10 * s;
//     result[3] = mv12 * c - mv14 * s;
//     result[8] = mv0 * s + mv2 * c;
//     result[9] = mv4 * s + mv6 * c;
//     result[10] = mv8 * s + mv10 * c;
//     result[11] = mv12 * s + mv14 * c;

//     return result;
// }

// Matrix multiplication
function multiplyMat4(a, b) {
    let r = new Float32Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
            sum += a[k * 4 + i] * b[j * 4 + k]; 
        }
        r[j * 4 + i] = sum;
    }
    return r;
}

// Matrix scale 
function mat4Scale(matrix, s) {
  const [sx,sy,sz] = s;
  matrix[0]  *= sx; matrix[1]  *= sx; matrix[2]  *= sx; matrix[3]  *= sx;
  matrix[4]  *= sy; matrix[5]  *= sy; matrix[6]  *= sy; matrix[7]  *= sy;
  matrix[8]  *= sz; matrix[9]  *= sz; matrix[10] *= sz; matrix[11] *= sz;
  return matrix;
}


function normalMatrixFromMV(MV){
  const a00=MV[0], a01=MV[1], a02=MV[2],
        a10=MV[4], a11=MV[5], a12=MV[6],
        a20=MV[8], a21=MV[9], a22=MV[10];
  const b01 =  a22*a11 - a12*a21;
  const b11 = -a22*a10 + a12*a20;
  const b21 =  a21*a10 - a11*a20;
  let det = a00*b01 + a01*b11 + a02*b21; if (Math.abs(det)<1e-8) det=1e-8;
  const id = 1.0/det;
  const i00=(a22*a11 - a12*a21)*id, i01=-(a22*a01 - a02*a21)*id, i02=(a12*a01 - a02*a11)*id;
  const i10=-(a22*a10 - a12*a20)*id, i11=(a22*a00 - a02*a20)*id,  i12=-(a12*a00 - a02*a10)*id;
  const i20=(a21*a10 - a11*a20)*id,  i21=-(a21*a00 - a01*a20)*id,  i22=(a11*a00 - a01*a10)*id;
  return new Float32Array([ i00,i10,i20, i01,i11,i21, i02,i12,i22 ]);
}