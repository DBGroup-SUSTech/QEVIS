
/* eslint-disable */

import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import TweenLite from "gsap";

/**
 * @enum {string}
 * @readonly
 */
export const CanvasEventType = {
    ENTER_CANVAS: 'enter_canvas',
    LEAVE_CANVAS: 'leave_canvas',
    ENTER_OBJECT: 'enter_object',
    LEAVE_OBJECT: 'leave_object',
    HOVER_OBJECT: 'hover_object',
    POINTER_MOVE: 'pointer_move',

    ORBIT_CHANGE: 'orbit_change',
}

/**
 * @enum {string}
 * @readonly
 */
export const BufferAttrName = {
    POSITION: 'position',
    COLOR: 'color',
}

/**
 * @enum {string}
 * @readonly
 */
export const MainObjectName = {
    POINTS: 'main-points',
    TRANSFERS: 'main-transfers',
}

/* config */
const POINT_SIZE = 7;
const TRANSFER_SIZE = 7;
const RAYCASTER_THRESHOLD = 7;

export class TaskMatrixSystem {
    /** @type {HTMLElement} */
    container;

    /** @type {THREE.OrthographicCamera} */
    camera;
    /** @type {THREE.Scene} */
    scene;
    /** @type {THREE.WebGLRenderer} */
    renderer;
    /** @type {THREE.Raycaster} */
    raycaster;
    /** @type {OrbitControls} */
    orbitControls;
    /** @type {THREE.Texture} */
    circleTexture;
    /** @type {THREE.Texture} */
    rectTexture;

    frustumSize;

    /** @type {Points} */
    mainPoints;
    pointerGlyph;

    /** @type {Points} */
    mainTransfer;

    // interaction

    /** @type {number | null} */
    intersectIdx = null;
    /** @type {THREE.Vector2} Mouse position in Canvas Coordinates */
    pointerCanvas = new THREE.Vector2();
    /** @type {THREE.Vector2} Mouse position in Normalized Device Coordinates */
    pointerNDC = new THREE.Vector2();

    /** @type {Map<string, Function[]>} */
    eventMap = new Map();

    constructor() {
    }

    /**
     * @param {HTMLElement} container
     */
    init(container) {
        this.container = container;
        this.frustumSize = this.getWidth() * 2;
        const aspect = this.getAspect();
        this.camera = new THREE.OrthographicCamera(
            this.frustumSize * aspect / -2,
            this.frustumSize * aspect / 2,
            this.frustumSize / 2,
            this.frustumSize / -2,
            0,
            50000,
        );
        this.camera.position.z = 250;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f8f8);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.getWidth(), this.getHeight());
        this.container.appendChild(this.renderer.domElement);

        const light = new THREE.AmbientLight(0xcccccc); // soft white light
        this.scene.add(light);

        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = RAYCASTER_THRESHOLD;

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        this.orbitControls.addEventListener('change', () => {
            this.invoke(CanvasEventType.ORBIT_CHANGE, []);
        });

        document.addEventListener('pointermove', this.onPointerMove.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    create() {
        this.circleTexture = this.createCircleTexture();
        this.borderCircleTexture = this.createBorderCircleTexture();
        this.borderCircleTexture2 = this.createBorderCircleTexture2();
        this.rectTexture = this.createRectTexture();
        this.createMainPoints();
        this.createMainTransfers();

        // const circleGeometry = new THREE.CircleGeometry(4, 32);
        // this.pointerGlyph = new THREE.Mesh(circleGeometry, new THREE.MeshPhongMaterial({color: 0xff0000}))
        // this.pointerGlyph.position.z = 1;
        // this.scene.add(this.pointerGlyph);
    }

    createMainPoints() {
        const geometry = new THREE.BufferGeometry();

        const material = new THREE.PointsMaterial( {
            size: POINT_SIZE,
            // map: this.circleTexture,
            map: this.circleTexture,
            opacity: 0.3,
            vertexColors: true,
            // blending: THREE.AdditiveBlending,
            // depthTest: false,
            transparent: true,
        });
        // material.color.setRGB(0, 0, 200)

        this.mainPoints = new THREE.Points(geometry, material);
        this.mainPoints.name = MainObjectName.POINTS;
        this.mainPoints.frustumCulled = false;
        this.scene.add(this.mainPoints);

        const positions = [], colors = [];
        for ( let i = 0; i < 400; i ++ ) {
            const x = this.getWidth() * 2 * (i % 20) / 20 - this.getWidth();
            const y = this.getHeight() * 2 * Math.floor(i / 20) / 20 - this.getHeight();
            const z = 0;

            positions.push(x, y, z);
            colors.push(0, 0, 0);
        }
        this.updateObjectBufferAttribute(MainObjectName.POINTS,
            BufferAttrName.POSITION, positions);
        this.updateObjectBufferAttribute(MainObjectName.POINTS,
            BufferAttrName.COLOR, colors);
    }

    createMainTransfers() {
        const geometry = new THREE.BufferGeometry();

        const material = new THREE.PointsMaterial( {
            size: TRANSFER_SIZE,
            // map: this.rectTexture,
            // map: this.circleTexture,
            map: this.borderCircleTexture,
            vertexColors: true,
            opacity: 0.5,
            // blending: THREE.AdditiveBlending,
            // depthTest: false,
            transparent: true,
        });
        // material.color.setRGB(0, 0, 200)

        this.mainTransfer = new THREE.Points(geometry, material);
        this.mainTransfer.name = MainObjectName.TRANSFERS;
        this.mainTransfer.frustumCulled = false;
        this.scene.add(this.mainTransfer);

        const positions = [], colors = [];
        for ( let i = 0; i < 400; i ++ ) {
            const x = this.getWidth() * 2 * (i % 20) / 20 - this.getWidth();
            const y = this.getHeight() * 2 * Math.floor(i / 20) / 20 - this.getHeight();
            const z = 0;

            positions.push(x, y, z);
            colors.push(0, 0, 0);
        }
        this.updateObjectBufferAttribute(MainObjectName.TRANSFERS,
            BufferAttrName.POSITION, positions);
        this.updateObjectBufferAttribute(MainObjectName.TRANSFERS,
            BufferAttrName.COLOR, colors);
    }

    dispose() {

    }

    createCircleTexture() {
        return new THREE.TextureLoader().load(require('@/assets/circle-xxl.png'));
    }

    createBorderCircleTexture() {
        // let canvas = document.createElement("canvas");
        // canvas.width = 140;
        // canvas.height = 140;
        //
        // let ctx = canvas.getContext("2d");
        // ctx.fillStyle = "#ffffff";
        // ctx.strokeStyle = "purple";
        // ctx.lineWidth = 14;
        // ctx.arc(70,70,50,0,2 * Math.PI);
        // ctx.fill();
        // ctx.stroke();
        //
        // let texture = new THREE.Texture(canvas);
        // texture.needsUpdate = true; // important!
        // return texture;

        return new THREE.TextureLoader().load(require('@/assets/circle-xxl-border.png'));
    }

    createBorderCircleTexture2() {
        return new THREE.TextureLoader().load(require('@/assets/circle-xxl-border-2.png'));
    }

    createRectTexture() {
        let canvas = document.createElement("canvas");
        canvas.width = 120;
        canvas.height = 120;

        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.rect(10,10,50,50);
        ctx.fill();

        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true; // important!
        return texture;
    }

    animate() {
        this.testIntersection(this.mainPoints);

        // const v = this.ndcPosToWorldVector(this.pointerNDC.x, this.pointerNDC.y);
        // this.pointerGlyph.position.x = v.x;
        // this.pointerGlyph.position.y = v.y;
    }

    render() {
        this.animate();
        this.orbitControls.update();
        this.renderer.render(this.scene, this.camera);

        const render = this.render.bind(this);
        requestAnimationFrame(render);
    }

    clearPlaceHolders() {
        this.updateObjectBufferAttribute(MainObjectName.POINTS,
            BufferAttrName.POSITION, []);
        this.updateObjectBufferAttribute(MainObjectName.POINTS,
            BufferAttrName.COLOR, []);

        this.updateObjectBufferAttribute(MainObjectName.TRANSFERS,
            BufferAttrName.POSITION, []);
        this.updateObjectBufferAttribute(MainObjectName.TRANSFERS,
            BufferAttrName.COLOR, []);
    }

    testIntersection(object) {
        this.raycaster.setFromCamera(this.pointerNDC, this.camera);
        const intersectObjects = this.raycaster.intersectObject(object);

        if (intersectObjects.length > 0) {
            if (this.intersectIdx !== intersectObjects[0].index) {
                if (this.intersectIdx !== null) {
                    // leave old object
                    this.invoke(CanvasEventType.LEAVE_OBJECT, []);
                }
                // enter new object
                this.intersectIdx = intersectObjects[0].index;
                this.invoke(CanvasEventType.ENTER_OBJECT, []);
            } else {
                this.invoke(CanvasEventType.HOVER_OBJECT, []);
            }
        } else {
            if (this.intersectIdx !== null) {
                // leave old object
                this.invoke(CanvasEventType.LEAVE_OBJECT, []);
            }
            this.intersectIdx = null;
        }
    }

    haveSameElements(array1, array2) {
        if (array1.length !== array2.length) {
            return false;
        }
        for (let i = 0, iLen = array1.length; i < iLen; i++) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * @param {THREE.BufferGeometry} geometry
     * @param {BufferAttrName} attrName
     * @param {number[]} value
     * @param {number} itemSize
     */
    updateAttribute(geometry, attrName, value, itemSize=3) {
        if (!geometry) {
            return;
        }
        const attr = new THREE.Float32BufferAttribute(value, itemSize);
        // attr.setUsage(THREE.DynamicDrawUsage);
        geometry.setAttribute(attrName, attr);
    }

    onPointerMove(event) {
        const {top, left, width, height} = this.renderer.domElement.getBoundingClientRect();
        this.pointerCanvas.x = event.clientX - left;
        this.pointerCanvas.y = event.clientY - top;
        this.pointerNDC.x = (event.clientX - left) / width * 2 - 1;
        this.pointerNDC.y = -(event.clientY - top) / height * 2 + 1;

        if (this.isNDCPointInCanvas(this.pointerNDC)) {
            this.invoke(CanvasEventType.POINTER_MOVE, []);
            // console.log(Math.round(this.pointerNDC.x * 100), Math.round(this.pointerNDC.y * 100), this.pointerCanvas.x, this.pointerCanvas.y);
        }
    }

    /**
     * @param {Vector2} point
     */
    isNDCPointInCanvas(point) {
        return point.x >= -1 && point.x <= 1
            && point.y >= -1 && point.y <= 1;
    }

    onWindowResize() {
        const aspect = this.getAspect();
        this.camera.left = -this.frustumSize * aspect / 2;
        this.camera.right = this.frustumSize * aspect / 2;
        this.camera.top = this.frustumSize / 2;
        this.camera.bottom = -this.frustumSize / 2;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.getWidth(), this.getHeight());
    }

    /**
     * @param {string} type
     * @param {Function} func
     */
    addEvents(type, func) {
        if (this.eventMap.has(type)) {
            this.eventMap.get(type).push(func);
        } else {
            this.eventMap.set(type, [func])
        }
    }

    /**
     * @param {string} type
     * @return {Function[]}
     */
    getEvents(type) {
        return this.eventMap.get(type) ?? [];
    }

    /**
     * @param {string} type
     * @param {Function} func
     */
    removeEvents(type, func) {
        const events = this.eventMap.get(type);
        events.splice(events.indexOf(func), 1);
        if (events.length === 0) {
            this.eventMap.delete(type);
        }
    }

    /**
     * @param {string} type
     * @param {*[]}param
     */
    invoke(type, param) {
        const funcList = this.eventMap.get(type) ?? [];
        funcList.forEach(func => {
            if (func !== null && typeof func === 'function') {
                try {
                    func.call(this, ...param);
                } catch (e) {
                    console.error(e);
                }
            }
        });
    }

    /**
     * Transform a world position into canvas dom position
     * world position -> NDC -> canvas dom position
     *
     * @param {Vector3} worldVector
     * @return {{x: number, y: number}}
     */
    worldVectorToCanvasPos(worldVector) {
        const vector = worldVector.clone().project(this.camera);
        const halfWidth = this.getWidth() / 2, halfHeight = this.getHeight() / 2;
        return {
            x: vector.x * halfWidth + halfWidth,
            y: -vector.y * halfHeight + halfHeight
        };
    }

    /**
     * Transform a canvas dom position into a world position
     * canvas dom position -> NDC -> world position
     *
     * @param x
     * @param y
     * @return {Vector3}
     */
    canvasPosToWorldVector(x, y) {
        const ndcX = x / this.getWidth() * 2 - 1,
            ndcY = -y / this.getHeight() * 2 + 1;
        return this.ndcPosToWorldVector(ndcX, ndcY);
    }

    /**
     * Transform a position in Normalized Device Coordinates into a world position
     *
     * @param ndcX - X in Normalized Device Coordinates
     * @param ndcY - Y in Normalized Device Coordinates
     * @return {Vector3}
     */
    ndcPosToWorldVector(ndcX, ndcY) {
        const vector = new THREE.Vector3(ndcX, ndcY, 0);
        return vector.unproject(this.camera);
    }

    getWidth() {
        return this.container.clientWidth;
    }

    getHeight() {
        return this.container.clientHeight;
    }

    getAspect() {
        return this.getWidth() / this.getHeight();
    }

    getBoundingClientRect() {
        return this.renderer.domElement.getBoundingClientRect();
    }

    // /**
    //  * @param {number} x - X in canvas
    //  * @param {number} y - y in canvas
    //  * @return {TaskMatrixSystem}
    //  */
    // appendPoint(x, y) {
    //     this.canvasPosToWorldVector(x, y);
    //     this.vertices = vertices;
    //     return this;
    // }

    /**
     * @param {string} objectName
     * @param {string?} colorStyle
     * @param {number[]?} positions
     * @param {"normal" | "segment" | undefined} type
     * @param {boolean} dashed
     */
    addLines(objectName, {colorStyle='#000000', positions = [], type="normal", dashed=false}) {
        const geometry = new THREE.BufferGeometry();
        this.updateAttribute(geometry, BufferAttrName.POSITION, positions);

        const materialParam = {
            // depthTest: false,
            // transparent: true,
        };
        let material;
        if (dashed) {
            materialParam.dashSize = 1000;
            materialParam.gapSize = 1000;
            materialParam.scale=0.1;
            material = new THREE.LineDashedMaterial(materialParam);
        } else {
            material = new THREE.LineBasicMaterial(materialParam);
        }
        material.color.setStyle(colorStyle);

        let lines;
        switch (type) {
            case "segment":
                lines = new THREE.LineSegments(geometry, material);
                break;
            case "normal":
            default:
                lines = new THREE.Line(geometry, material);
        }
        lines.computeLineDistances();
        lines.name = objectName;
        lines.renderOrder = 99;
        lines.frustumCulled = false;

        if (dashed) {
            lines.computeLineDistances();
        }

        this.scene.add(lines);
    }

    /**
     * @param {string} objectName
     * @param {string?} colorStyle
     * @param {number[]} positions
     * @param {'none' | 'black-border' | 'purple-border' | undefined} texture
     * @param {boolean=false} vertexColors
     */
    addPoints(objectName, {colorStyle, positions = [], texture='none', vertexColors=false}) {
        const geometry = new THREE.BufferGeometry();
        this.updateAttribute(geometry, BufferAttrName.POSITION, positions);

        let map;
        switch (texture) {
            case 'black-border': map = this.borderCircleTexture; break;
            case 'purple-border': map = this.borderCircleTexture2; break;
            default: map = this.circleTexture;
        }

        const material = new THREE.PointsMaterial( {
            size: POINT_SIZE,
            map,
            transparent: true,
            vertexColors,
        });
        if (!vertexColors && colorStyle) {
            material.color.setStyle(colorStyle);
        }

        const points = new THREE.Points(geometry, material);
        points.name = objectName;
        points.frustumCulled = false;

        this.scene.add(points);
    }

    addRect(objectName, {color=0x000000, width, height, x, y, z}) {
        const geometry = new THREE.BoxGeometry(width, height, 1);
        const material = new THREE.MeshBasicMaterial({color});
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        this.scene.add(cube);
    }

    updateObjectBufferAttribute(objectName, attrName, value) {
        if (!this.scene) {
            return;
        }
        const object = this.scene.getObjectByName(objectName);
        if (object) {
            this.updateAttribute(object.geometry, attrName, value);
        } else {
            console.warn('Object', objectName, 'not found');
        }
    }

    updateEasingObjectBufferAttribute(objectName, attrName, value, duration) {
        if (!this.scene) {
            return;
        }
        const object = this.scene.getObjectByName(objectName);
        if (object) {
            const oldValue = object.geometry.getAttribute(attrName).array;

            const temp = [];

            if (value.length !== 0) {
                for (let i = 0; i < oldValue.length; i++) {
                    temp.push(oldValue[i]);
                }
                for (let i = oldValue.length; i < value.length; i++) {
                    temp.push(value[i]);
                }
            }

            // console.log('>>>', oldValue, temp, value);

            this.updateAttribute(object.geometry, attrName, temp);

            const onUpdate = () => {
                this.updateAttribute(object.geometry, attrName, temp);
            }
            const tw = TweenLite.to(temp, duration, value);
            tw.vars.onUpdate = onUpdate;
            // if (oldValue.length <= value.length && value.length !== 0) {
            //
            //
            //
            // } else {
            //     this.updateAttribute(object.geometry, attrName, value);
            //     console.log(object.geometry.getAttribute(attrName).array)
            // }

        } else {
            console.warn('Object', objectName, 'not found');
        }
    }

    /**
     * @param {string} objectName
     */
    removeObjects(objectName) {
        const object = this.scene.getObjectByName(objectName);
        this.scene.remove(object);
    }
}
