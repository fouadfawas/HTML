import * as THREE from 'three';

export class GeometryFactory {
  createShipGeometry() {
    // X-wing inspired fighter geometry
    const vertices = new Float32Array([
      // Main fuselage
      0, 0, 2,    // nose
      1, 0, -2,   // rear right
      -1, 0, -2,  // rear left
      0, 0.5, -1, // top fin

      // Wings extended in X formation
      2, 0.5, 0,  // right top wing
      2, -0.5, 0, // right bottom wing
      -2, 0.5, 0, // left top wing
      -2, -0.5, 0, // left bottom wing

      // Connect wings to fuselage
      1, 0, -2,   // rear right
      2, 0.5, 0,  // right top wing
      1, 0, -2,   // rear right
      2, -0.5, 0, // right bottom wing

      -1, 0, -2,  // rear left
      -2, 0.5, 0, // left top wing
      -1, 0, -2,  // rear left
      -2, -0.5, 0 // left bottom wing
    ]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
  }

  createEnemyGeometry(type = 'fighter') {
    if (type === 'fighter') {
      // TIE Fighter inspired geometry
      const vertices = new Float32Array([
        // Main sphere
        0, 0, 0,    // center
        1, 0, 0,    // right
        0, 1, 0,    // top
        0, 0, 1,    // front
        -1, 0, 0,   // left
        0, -1, 0,   // bottom
        0, 0, -1,   // back

        // Wings
        1, 0, 0,    // right
        1, 1, 0,    // right top
        1, -1, 0,   // right bottom
        -1, 0, 0,   // left
        -1, 1, 0,   // left top
        -1, -1, 0,  // left bottom
      ]);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      return geometry;
    } else if (type === 'bomber') {
      // TIE Bomber inspired geometry
      const vertices = new Float32Array([
        // Main body
        0, 0, 2,    // nose
        1, 0, -2,   // rear right
        -1, 0, -2,  // rear left
        0, 1, 0,    // top

        // Wings
        1, 0, -2,   // rear right
        2, 0, -1,   // right wing
        1, 0, -2,   // rear right
        2, -1, -1,  // right bottom wing
        -1, 0, -2,  // rear left
        -2, 0, -1,  // left wing
        -1, 0, -2,  // rear left
        -2, -1, -1, // left bottom wing

        // Engines
        1, 0, -2,   // rear right
        1.5, 0, -3, // right engine
        -1, 0, -2,  // rear left
        -1.5, 0, -3, // left engine
      ]);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      return geometry;
    } else if (type === 'scout') {
      // TIE Interceptor inspired geometry
      const vertices = new Float32Array([
        // Main body
        0, 0, 2,    // nose
        1, 0, -1,   // rear right
        -1, 0, -1,  // rear left
        0, 1, 0,    // top

        // Wings
        1, 0, -1,   // rear right
        2, 0.5, 0,  // right top wing
        1, 0, -1,   // rear right
        2, -0.5, 0, // right bottom wing
        -1, 0, -1,  // rear left
        -2, 0.5, 0, // left top wing
        -1, 0, -1,  // rear left
        -2, -0.5, 0, // left bottom wing
      ]);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      return geometry;
    }
  }
}