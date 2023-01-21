import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
// import * as d3 from 'd3';

class ParticleSystem {
  constructor(container) {
    this.container = container
    this.camera = undefined;
    this.scene = undefined;
    this.render = undefined;
    this.width = this.container.clientWidth
    this.height =  this.container.clientHeight
    console.log('size', this.width, this.height)
    this.aspect = this.width / this.height;
    this.pointer = new THREE.Vector2();
    this.particleSize = 12;
    this.frustumSize = this.width * 2
    this.vertices = [];
    this.INTERSECTED;
    this.init()
  }
  init() {
    this.camera = new THREE.OrthographicCamera(
        this. frustumSize * this.aspect / - 2,
        this. frustumSize * this.aspect / 2,
        this. frustumSize / 2,
        this. frustumSize / - 2,
        -0,
        50000);
    this.camera.position.z = 250;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xf0f0f0 );
    this.orbitControls = new OrbitControls( this.camera, this.container);
    this.orbitControls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    }

    this.geometry = new THREE.BufferGeometry();
    this.vertices = [];
    this.textureLoader = new THREE.TextureLoader();
    this.sprite1 = this.textureLoader.load( 'assets/circle-xxl.png' );

    const color = new THREE.Color();
    let colors = []
    let sizes = []

    this.vertices.push(0, 0, 0)
    this.vertices.push(0, 200, 0)
    this.vertices.push(200, 200, 0)
    this.vertices.push(200, 0, 0)

    for ( let i = 0; i < this.vertices.length; i ++ ) {
      color.setRGB( 1, 0, 0 );
      colors.push( color.r, color.g, color.b );
      sizes.push(6)
    }
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );
    this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    this.sprite = this.sprite1;
    this.material = new THREE.PointsMaterial( {
      opacity: 0.2,
      map: this.sprite,
      size: this.size,
      vertexColors: true,
      blending: THREE.CustomBlending,
      depthTest: false, transparent: true } );

    this.particles = new THREE.Points( this.geometry, this.material );
    this.scene.add( this.particles );

    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points.threshold = 5
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( this.width, this.height );
    this.container.appendChild( this.renderer.domElement );



    document.body.style.touchAction = 'none';
    document.body.addEventListener( 'pointermove', (event)=>{
      if ( event.isPrimary === false ) return;
      this.pointer.x = ( event.layerX / this.width ) * 2 - 1;
      this.pointer.y = - ( event.layerY / this.height ) * 2 + 1;
    });
    window.addEventListener( 'resize', this.onWindowResize );
  }

  onWindowResize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( this.width, this.height );
  }
  animate() {
    requestAnimationFrame( this.animate );
    this.render();
  }
  render() {
    this.raycaster.setFromCamera( this.pointer, this.camera );
    this.intersects = this.raycaster.intersectObject( this.particles );
    if ( this.intersects.length > 0 ) {
      if ( this.INTERSECTED != this.intersects[ 0 ].index ) {
        this.INTERSECTED = this.intersects[ 0 ].index;
      }
    } else if ( this.INTERSECTED !== null ) {
      this.INTERSECTED = null

    }
    this.renderer.render( this.scene, this.camera );

  }
}



export default ParticleSystem