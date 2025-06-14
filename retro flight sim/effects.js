import * as THREE from 'three';

export function createExplosion(scene, position, color, scale = 1.0) {
  const explosion = new THREE.Group();
  for (let k = 0; k < 10; k++) {
    const line = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(0.5 * scale)),
      new THREE.LineBasicMaterial({ color })
    );
    line.position.set(
      (Math.random() - 0.5) * 2 * scale,
      (Math.random() - 0.5) * 2 * scale,
      (Math.random() - 0.5) * 2 * scale
    );
    line.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2 * scale,
      (Math.random() - 0.5) * 0.2 * scale,
      (Math.random() - 0.5) * 0.2 * scale
    );
    explosion.add(line);
  }
  explosion.position.copy(position);
  explosion.lifetime = 30; // frames
  explosion.isExplosion = true; // Mark as explosion for cleanup
  scene.add(explosion);
  
  // Set timeout to remove explosion after lifetime
  setTimeout(() => {
    scene.remove(explosion);
  }, explosion.lifetime * (1000/60)); // Convert frames to ms
  
  return explosion;
}