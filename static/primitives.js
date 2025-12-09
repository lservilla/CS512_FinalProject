

// rectangle block, modified original cube arrays
function buildBlock(width=1, height=1, depth=1, solidColor=[0.66,0.89,0.63]) {
  const hx=width*0.5, hy=height*0.5, hz=depth*0.5;
  const P=[], N=[], C=[];
  const face=(nx,ny,nz, c)=>{ for (const [x,y,z] of c){ P.push(x,y,z); N.push(nx,ny,nz); C.push(...solidColor);}};

  face(0,0,1,  [[-hx,-hy, hz],[ hx,-hy, hz],[ hx, hy, hz],[-hx, hy, hz]]); // +Z
  face(0,0,-1, [[ hx,-hy,-hz],[-hx,-hy,-hz],[-hx, hy,-hz],[ hx, hy,-hz]]); // -Z
  face(0,1,0,  [[-hx, hy,-hz],[ hx, hy,-hz],[ hx, hy, hz],[-hx, hy, hz]]); // +Y
  face(0,-1,0, [[-hx,-hy,-hz],[ hx,-hy,-hz],[ hx,-hy, hz],[-hx,-hy, hz]]); // -Y
  face(1,0,0,  [[ hx,-hy,-hz],[ hx, hy,-hz],[ hx, hy, hz],[ hx,-hy, hz]]); // +X
  face(-1,0,0, [[-hx,-hy,-hz],[-hx,-hy, hz],[-hx, hy, hz],[-hx, hy,-hz]]); // -X

  const indices=new Uint16Array([
     0, 1, 2,  0, 2, 3,   4, 5, 6,  4, 6, 7,
     8, 9,10,  8,10,11,  12,13,14, 12,14,15,
    16,17,18, 16,18,19,  20,21,22, 20,22,23
  ]);
  return {
    positions:  new Float32Array(P),
    normals:    new Float32Array(N),
    colors:     new Float32Array(C),
    indices
  };
}



// Using rings to calculate cylinder space, sides align to rings and caps
// go on the top and bottom to make the cylinder solid
// Used to make cone too by having top or bottom radius smaller 
// Used to make cone too by having top or bottom radius smaller
function buildCylinder(radiusTop, radiusBottom, height, radialSeg = 32) {
  const h    = height;
  const yTop =  h * 0.5;
  const yBot = -h * 0.5;
  const rings = radialSeg + 1;   // Duplicate seam column for texture

  // New layout with duplicated seam:
  // [0 .. rings-1]               : side top ring
  // [rings .. 2*rings-1]         : side bottom ring
  // [2*rings .. 3*rings-1]       : cap top rim (duplicated)
  // [3*rings .. 4*rings-1]       : cap bottom rim (duplicated)
  // [4*rings]                    : top center
  // [4*rings+1]                  : bottom center
  const sideTopOffset   = 0;
  const sideBotOffset   = rings;
  const capTopOffset    = rings * 2;
  const capBotOffset    = rings * 3;
  const topCenterIndex  = rings * 4;
  const botCenterIndex  = rings * 4 + 1;

  const vertCount = rings * 4 + 2;  // 2 rings (sides) + 2 rings (caps) + 2 centers

  const positions = new Float32Array(vertCount * 3);
  const colors    = new Float32Array(vertCount * 3);
  const normals   = new Float32Array(vertCount * 3);

  const rTop = radiusTop, rBot = radiusBottom;

  // Helper to write pos/col/nrm
  function writeVertex(arrOffset, x, y, z, nx, ny, nz, r=0.768, g=0.768, b=0.768) {
    const p = arrOffset * 3;
    positions[p+0] = x; positions[p+1] = y; positions[p+2] = z;
    colors[p+0]    = r; colors[p+1]    = g; colors[p+2]    = b;
    normals[p+0]   = nx; normals[p+1]  = ny; normals[p+2]  = nz;
  }

  // Side normal slope 
  const dR = (rBot - rTop);

  // Build rings 
  for (let i = 0; i <= radialSeg; i++) {
    const t  = (i / radialSeg) * Math.PI * 2.0;
    const ct = Math.cos(t), st = Math.sin(t);

    // Side ring positions
    const xTop = ct * rTop, xBot = ct * rBot;
    const zTop = st * rTop, zBot = st * rBot;

    // Side normals (same for top/bot at this angle)
    let nxU = h * ct;
    let nyU = dR;
    let nzU = h * st;
    const len = Math.hypot(nxU, nyU, nzU) || 1.0;
    const nx = nxU / len, ny = nyU / len, nz = nzU / len;

    // Side top & bottom ring vertices
    writeVertex(sideTopOffset + i, xTop, yTop, zTop, nx, ny, nz);
    writeVertex(sideBotOffset + i, xBot, yBot, zBot, nx, ny, nz);

    // Cap rim duplicates (flat normals)
    writeVertex(capTopOffset + i,  xTop, yTop, zTop,  0,  1, 0);
    writeVertex(capBotOffset + i,  xBot, yBot, zBot,  0, -1, 0);
  }

  // Centers
  writeVertex(topCenterIndex,  0, yTop, 0,  0,  1, 0);
  writeVertex(botCenterIndex,  0, yBot, 0,  0, -1, 0);

  // Indices
  // sides: still radialSeg segments (the extra column is only for seam)
  const sideTriCount = radialSeg * 2;
  const capTriCount  = radialSeg * 2; // top + bottom
  const idxCount = (sideTriCount + capTriCount) * 3;
  const indices = new Uint16Array(idxCount);

  let k = 0;

  // Sides (use iNext = i+1)
  for (let i = 0; i < radialSeg; i++) {
    const iNext = i + 1;
    const a = sideTopOffset + i;      // top_i
    const b = sideBotOffset + i;      // bot_i
    const c = sideTopOffset + iNext;  // top_next
    const d = sideBotOffset + iNext;  // bot_next

    // CCW winding
    indices[k++] = a; indices[k++] = b; indices[k++] = c;
    indices[k++] = c; indices[k++] = b; indices[k++] = d;
  }

  // Top cap fan (use duplicated rim)
  for (let i = 0; i < radialSeg; i++) {
    const iNext = i + 1;
    indices[k++] = topCenterIndex;
    indices[k++] = capTopOffset + i;
    indices[k++] = capTopOffset + iNext;
  }

  // Bottom cap fan (CCW as seen from outside)
  for (let i = 0; i < radialSeg; i++) {
    const iNext = i + 1;
    indices[k++] = botCenterIndex;
    indices[k++] = capBotOffset + iNext;
    indices[k++] = capBotOffset + i;
  }

  return { positions, colors, normals, indices };
}




// Latitude/longitude sphere
// radius: sphere radius
// latSeg: number of horizontal bands           >= 2
// lonSeg: number of vertical slices around     >= 3
function buildSphere(radius = 1, latSeg = 24, lonSeg = 32) {
  const vertsAcross = lonSeg + 1;
  const vertsDown   = latSeg + 1;
  const vertCount   = vertsAcross * vertsDown;

  const positions = new Float32Array(vertCount * 3);
  const normals   = new Float32Array(vertCount * 3);
  const colors    = new Float32Array(vertCount * 3);

  const rCol = 0.8, gCol = 0.6, bCol = 0.4;

  let p = 0;
  for (let y = 0; y < vertsDown; y++) {
    const v = y / latSeg;
    const theta = v * Math.PI;          // polar
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const ringR = sinT * radius;
    const yPos = cosT * radius;

    for (let x = 0; x < vertsAcross; x++) {
      const u = x / lonSeg;
      const phi = u * Math.PI * 2.0;    // azimuth
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      const X = ringR * cosP;
      const Y = yPos;
      const Z = ringR * sinP;

      positions[p]   = X;
      positions[p+1] = Y;
      positions[p+2] = Z;

      // normal = normalized position for a perfect sphere
      const len = Math.sqrt(X*X + Y*Y + Z*Z);
      normals[p]   = X / len;
      normals[p+1] = Y / len;
      normals[p+2] = Z / len;

      colors[p]   = rCol;
      colors[p+1] = gCol;
      colors[p+2] = bCol;

      p += 3;
    }
  }

  const quadCount = latSeg * lonSeg;
  const idxCount  = quadCount * 6;
  const indices   = (vertCount > 65535)
    ? new Uint32Array(idxCount)
    : new Uint16Array(idxCount);

  let k = 0;
  for (let y = 0; y < latSeg; y++) {
    const rowA = y * vertsAcross;
    const rowB = (y + 1) * vertsAcross;

    for (let x = 0; x < lonSeg; x++) {
      const a = rowA + x;
      const b = rowB + x;
      const c = rowB + x + 1;
      const d = rowA + x + 1;

      indices[k++] = a; indices[k++] = b; indices[k++] = d;
      indices[k++] = b; indices[k++] = c; indices[k++] = d;
    }
  }

  return { positions, normals, colors, indices };
}


function buildMaze(){
  const maze = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,3,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,3,0],
      [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
      [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
      [0,0,0,0,1,0,0,0,2,0,2,0,0,0,1,0,0,0,0],
      [0,0,0,0,1,0,2,2,2,2,2,2,2,0,1,0,0,0,0],
      [0,0,0,0,1,2,2,0,0,2,0,0,2,2,1,0,0,0,0],
      [2,2,2,2,1,2,2,0,2,2,2,0,2,2,1,2,2,2,2],
      [0,0,0,0,1,2,2,0,0,0,0,0,2,2,1,0,0,0,0],
      [0,0,0,0,1,0,2,2,2,2,2,2,2,0,1,0,0,0,0],
      [0,0,0,0,1,0,2,0,0,0,0,0,2,0,1,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
      [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
      [0,3,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,3,0],
      [0,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0],
      [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
      [0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ];
  return maze;
}

//pac-man robot geometry

function createRobot(size) {
    const pos=[], nrm=[], tex=[];
    
    // Helper to add a cube
    function addCube(cx, cy, cz, sx, sy, sz) {
        const faces = [
            // Front
            [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],
            // Back
            [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]],
            // Top
            [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]],
            // Bottom
            [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]],
            // Right
            [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]],
            // Left
            [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]]
        ];
        
        faces.forEach(face => {
            const [v0,v1,v2,v3,n] = face;
            // Triangle 1
            pos.push(cx+v0[0]*sx*0.5, cy+v0[1]*sy*0.5, cz+v0[2]*sz*0.5);
            pos.push(cx+v1[0]*sx*0.5, cy+v1[1]*sy*0.5, cz+v1[2]*sz*0.5);
            pos.push(cx+v2[0]*sx*0.5, cy+v2[1]*sy*0.5, cz+v2[2]*sz*0.5);
            // Triangle 2
            pos.push(cx+v0[0]*sx*0.5, cy+v0[1]*sy*0.5, cz+v0[2]*sz*0.5);
            pos.push(cx+v2[0]*sx*0.5, cy+v2[1]*sy*0.5, cz+v2[2]*sz*0.5);
            pos.push(cx+v3[0]*sx*0.5, cy+v3[1]*sy*0.5, cz+v3[2]*sz*0.5);
            
            for(let i=0;i<6;i++) {
                nrm.push(n[0], n[1], n[2]);
                tex.push(0.5, 0.5);
            }
        });
    }
    
    // Body (main cube)
    addCube(0, 0, 0, size*0.8, size*0.9, size*0.6);
    
    // Head (smaller cube on top)
    addCube(0, size*0.55, 0, size*0.6, size*0.5, size*0.5);
    
    // Eyes 
    addCube(-size*0.15, size*0.6, size*0.26, size*0.15, size*0.15, size*0.1);
    addCube(size*0.15, size*0.6, size*0.26, size*0.15, size*0.15, size*0.1);
    
    // Arms
    addCube(-size*0.5, 0, 0, size*0.25, size*0.7, size*0.25);
    addCube(size*0.5, 0, 0, size*0.25, size*0.7, size*0.25);
    
    // Legs
    addCube(-size*0.2, -size*0.6, 0, size*0.25, size*0.5, size*0.25);
    addCube(size*0.2, -size*0.6, 0, size*0.25, size*0.5, size*0.25);
    
    // Antenna
    addCube(0, size*0.9, 0, size*0.08, size*0.2, size*0.08);
    addCube(0, size*1.05, 0, size*0.15, size*0.1, size*0.15);
    
    return {pos:new Float32Array(pos), nrm:new Float32Array(nrm), tex:new Float32Array(tex), cnt:pos.length/3};
}


function createSphere(r, seg) {
    const pos=[], nrm=[], tex=[], idx=[];
    for(let lat=0;lat<=seg;lat++) {
        const theta=lat*Math.PI/seg, st=Math.sin(theta), ct=Math.cos(theta);
        for(let lon=0;lon<=seg;lon++) {
            const phi=lon*2*Math.PI/seg, sp=Math.sin(phi), cp=Math.cos(phi);
            const x=cp*st, y=ct, z=sp*st;
            pos.push(r*x, r*y, r*z);
            nrm.push(x, y, z);
            tex.push(lon/seg, lat/seg);
        }
    }
    for(let lat=0;lat<seg;lat++) {
        for(let lon=0;lon<seg;lon++) {
            const f=lat*(seg+1)+lon, s=f+seg+1;
            idx.push(f,s,f+1, s,s+1,f+1);
        }
    }
    const ePos=[], eNrm=[], eTex=[];
    for(let i of idx) {
        ePos.push(pos[i*3], pos[i*3+1], pos[i*3+2]);
        eNrm.push(nrm[i*3], nrm[i*3+1], nrm[i*3+2]);
        eTex.push(tex[i*2], tex[i*2+1]);
    }
    return {pos:new Float32Array(ePos), nrm:new Float32Array(eNrm), tex:new Float32Array(eTex), cnt:idx.length};
}


function createCube() {
    const p = [-0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5, -0.5,0.5,-0.5,
               -0.5,-0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,0.5];
    const idx = [0,1,2,0,2,3, 4,6,5,4,7,6, 4,5,1,4,1,0, 3,2,6,3,6,7, 1,5,6,1,6,2, 4,0,3,4,3,7];
    const pos=[], nrm=[], tex=[];
    for(let i=0;i<idx.length;i+=3) {
        const i0=idx[i]*3, i1=idx[i+1]*3, i2=idx[i+2]*3;
        const v1=[p[i1]-p[i0], p[i1+1]-p[i0+1], p[i1+2]-p[i0+2]];
        const v2=[p[i2]-p[i0], p[i2+1]-p[i0+1], p[i2+2]-p[i0+2]];
        const n=norm(cross(v1,v2));
        for(let j=0;j<3;j++) {
            const vi=idx[i+j]*3;
            pos.push(p[vi], p[vi+1], p[vi+2]);
            nrm.push(n[0], n[1], n[2]);
            // Texture coordinates based on position
            tex.push(p[vi]+0.5, p[vi+2]+0.5);
        }
    }
    return {pos:new Float32Array(pos), nrm:new Float32Array(nrm), tex:new Float32Array(tex), cnt:idx.length};
}
