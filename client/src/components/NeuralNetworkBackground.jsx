import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const NeuralNetworkBackground = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 40;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create neural network nodes
    const nodes = [];
    const nodeCount = 60;
    const nodeGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.6
    });

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.x = (Math.random() - 0.5) * 100;
      node.position.y = (Math.random() - 0.5) * 100;
      node.position.z = (Math.random() - 0.5) * 100;
      
      // Store velocity for animation
      node.userData.velocity = {
        x: (Math.random() - 0.5) * 0.3,
        y: (Math.random() - 0.5) * 0.3,
        z: (Math.random() - 0.5) * 0.3
      };
      
      scene.add(node);
      nodes.push(node);
    }

    // Create connections between nodes
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x6366f1,
      transparent: true,
      opacity: 0.3,
      linewidth: 2
    });

    const connections = [];
    const maxDistance = 25;

    function updateConnections() {
      // Remove old connections
      connections.forEach(line => scene.remove(line));
      connections.length = 0;

      // Create new connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = nodes[i].position.distanceTo(nodes[j].position);
          
          if (distance < maxDistance) {
            const points = [nodes[i].position, nodes[j].position];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial.clone());
            
            // Fade based on distance
            line.material.opacity = 0.5 * (1 - distance / maxDistance);
            
            scene.add(line);
            connections.push(line);
          }
        }
      }
    }

    // Animation
    let frameCount = 0;
    let rotationAngle = 0;
    
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Rotate the entire scene continuously - MUCH FASTER
      rotationAngle += 0.01;
      scene.rotation.y = rotationAngle;
      scene.rotation.x = Math.sin(rotationAngle * 0.5) * 0.3;

      // Move nodes
      nodes.forEach(node => {
        node.position.x += node.userData.velocity.x;
        node.position.y += node.userData.velocity.y;
        node.position.z += node.userData.velocity.z;

        // Bounce off boundaries
        if (Math.abs(node.position.x) > 50) node.userData.velocity.x *= -1;
        if (Math.abs(node.position.y) > 50) node.userData.velocity.y *= -1;
        if (Math.abs(node.position.z) > 50) node.userData.velocity.z *= -1;

        // Gentle pulsing effect
        const scale = 1 + Math.sin(Date.now() * 0.001 + node.position.x) * 0.2;
        node.scale.set(scale, scale, scale);
      });

      // Update connections every 2 frames for smoother animation
      frameCount++;
      if (frameCount % 2 === 0) {
        updateConnections();
      }

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose of Three.js resources
      nodes.forEach(node => {
        node.geometry.dispose();
        node.material.dispose();
      });
      
      connections.forEach(line => {
        line.geometry.dispose();
        line.material.dispose();
      });
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default NeuralNetworkBackground;
