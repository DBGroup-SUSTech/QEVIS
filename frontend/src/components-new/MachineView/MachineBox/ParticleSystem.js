import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
// import * as d3 from 'd3';

class ParticleSystem {
  constructor(container) {
    this.camera = this.scene = this.renderer = undefined
    this.container = container
    this.width = container.clientWidth;
    this.height =  container.clientHeight;
    this.aspect = this.width / this.height;
    this.frustumSize = this.width * 2;
    this.orbitControls;
    this.raycaster, this.intersects, this.particles, this.INTERSECTED;
    this.pointer = new THREE.Vector2();
    this.size = 6

    this.renderer = new THREE.WebGLRenderer();
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points.threshold = 5
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( this.width, this.height );
    this.container.appendChild( this.renderer.domElement );
    document.body.style.touchAction = 'none';

    let onWindowResize = () => {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( this.width, this.height );
    }

    let onPointerMove = ( event ) => {
      if ( event.isPrimary === false ) return;
      this.pointer.x = ( event.layerX / this.width ) * 2 - 1;
      this.pointer.y = - ( event.layerY / this.height ) * 2 + 1;
    }
    this.container.addEventListener( 'pointermove', onPointerMove );
    this.container.addEventListener( 'resize', onWindowResize );
  }

  deteremineScreenCoordinate(x,y,z) {
    let world_vector = new THREE.Vector3(x,y,z);
    let vector = world_vector.project(this.camera);
    let halfWidth = this.width / 2, halfHeight = this.height / 2;
    return {
      x: Math.round(vector.x * halfWidth + halfWidth),
      y: Math.round(-vector.y * halfHeight + halfHeight)
    };
  }

  addVertices(vertices, colors) {
    const geometry = new THREE.BufferGeometry();
    const textureLoader = new THREE.TextureLoader();
    const sprite1 = textureLoader.load(require('@/assets/circle-xxl.png'));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      opacity: 0.3,
      map: sprite1,
      size: this.size,
      vertexColors: true,
      // blending: THREE.AdditiveBlending,
      depthTest: false, transparent: true });
    this.particles = new THREE.Points( geometry, material );
    // this.particles.name = "allTask"
    this.scene.add( this.particles );
    // console.log('scene --- ', this.scene)
    // console.log('scene --- ', this.scene.getObjectByName('allTask'))
    // this.scene.remove(this.scene.getObjectByName('allTask'))
  }

  addSrcVertices(vertices, colors) {
    const geometry = new THREE.BufferGeometry();
    const textureLoader = new THREE.TextureLoader();
    const sprite1 = textureLoader.load(require('@/assets/circle-xxl.png'));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      opacity: 0.6,
      map: sprite1,
      size: this.size * 1.5,
      vertexColors: true,
      // blending: THREE.AdditiveBlending,
      depthTest: false, transparent: true });
    let tempParticles = new THREE.Points( geometry, material );
    tempParticles.name = 'src'
    this.scene.add( tempParticles );
  }

  removeSrcVertices(){
    this.scene.remove(this.scene.getObjectByName('src'))
  }

  addDstVertices(vertices, colors) {
    const geometry = new THREE.BufferGeometry();
    const textureLoader = new THREE.TextureLoader();
    const sprite1 = textureLoader.load(require('@/assets/circle-xxl.png'));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      opacity: 0.6,
      map: sprite1,
      size: this.size * 1.5,
      vertexColors: true,
      // blending: THREE.AdditiveBlending,
      depthTest: false, transparent: true });
    let tempParticles = new THREE.Points( geometry, material );
    tempParticles.name = 'dst'
    this.scene.add( tempParticles );
  }

  removeDstVertices(){
    this.scene.remove(this.scene.getObjectByName('dst'))
  }

  addSrcDeps(vertices, colors) {
    this.scene.remove(this.scene.getObjectByName('srcDeps'))

    const geometry = new THREE.BufferGeometry();
    const textureLoader = new THREE.TextureLoader();
    const sprite1 = textureLoader.load(require('@/assets/circle-xxl.png'));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      opacity: 0.6,
      map: sprite1,
      size: this.size * 1.5,
      vertexColors: true,
      // blending: THREE.AdditiveBlending,
      depthTest: false, transparent: true });
    let tempParticles = new THREE.Points( geometry, material );
    tempParticles.name = 'srcDeps'
    this.scene.add( tempParticles );
  }

  removeSrcDeps(){
    this.scene.remove(this.scene.getObjectByName('srcDeps'))
  }

  addDstDeps(vertices, colors) {
    this.scene.remove(this.scene.getObjectByName('dstDeps'))

    const geometry = new THREE.BufferGeometry();
    const textureLoader = new THREE.TextureLoader();
    const sprite1 = textureLoader.load(require('@/assets/circle-xxl.png'));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      opacity: 0.6,
      map: sprite1,
      size: this.size * 1.5,
      vertexColors: true,
      // blending: THREE.AdditiveBlending,
      depthTest: false, transparent: true });
    let tempParticles = new THREE.Points( geometry, material );
    tempParticles.name = 'dstDeps'
    this.scene.add( tempParticles );
  }

  removeDstDeps(){
    this.scene.remove(this.scene.getObjectByName('dstDeps'))
  }

  addSelectedVertices(vertices, colors) {
    this.scene.remove(this.scene.getObjectByName('select'))

    const geometry = new THREE.BufferGeometry();
    const textureLoader = new THREE.TextureLoader();
    const sprite1 = textureLoader.load(require('@/assets/circle-xxl.png'));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      opacity: 0.8,
      map: sprite1,
      size: this.size * 1,
      vertexColors: true,
      // blending: THREE.AdditiveBlending,
      depthTest: false, transparent: true });
    let tempParticles = new THREE.Points( geometry, material );
    tempParticles.name = 'select'
    this.scene.add( tempParticles );
  }

  removeSelectedVertices(){
    this.scene.remove(this.scene.getObjectByName('select'))
  }
  init() {
    this.camera = new THREE.OrthographicCamera( this.frustumSize * this.aspect / - 2, this.frustumSize * this.aspect / 2, this.frustumSize / 2, this.frustumSize / - 2, -0, 50000);
    this.camera.position.z = 250;
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color( 0xf0f0f0 );
    this.scene.background = new THREE.Color( 0xffffff );
    // renderer.domElement
    this.orbitControls = new OrbitControls( this.camera, this.renderer.domElement);
    this.orbitControls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    }
    this.eventFuncs = {}
  }

  on(key, func){
    if(key == 'mouseChange'){
      this.eventFuncs['mouseChange'] = func
      this.orbitControls.addEventListener( 'change', ()=>{
        this.eventFuncs['mouseChange']()
      } );
    }else if(key == 'selectDetect'){
      this.eventFuncs['selectDetect'] = func
    }
  }


  render() {
    this.raycaster.setFromCamera( this.pointer, this.camera );
    this.intersects = this.raycaster.intersectObject( this.particles );
    if ( this.intersects.length > 0 ) {
      if ( this.INTERSECTED != this.intersects[ 0 ].index ) {
        // console.log('this.intersects.length', this.intersects)
        this.INTERSECTED = this.intersects[ 0 ].index;
        if(this.eventFuncs['selectDetect']){
          this.eventFuncs['selectDetect'](this.INTERSECTED, this.intersects[0])
        }
      }
    } else if ( this.INTERSECTED !== null ) {
      this.INTERSECTED = null
      if(this.eventFuncs['selectDetect']){
        this.eventFuncs['selectDetect'](undefined, undefined)
      }
    }
    this.renderer.render( this.scene, this.camera );
  }

  animate() {
    requestAnimationFrame( this.animate );
    this.render();
  }
}

export default ParticleSystem
