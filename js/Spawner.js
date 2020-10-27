//populate spawner types 
let SpawnTypes = {
    GrindPipe: {
        Frequency: 0.4, // frequency of 1 means that it will 100% show up on this tile
        MinSpacing: 0, //min spacing of 1 means that there must be atleast 1 tile between element
        Obj: new THREE.Object3D(),
        Name: "GrindPipe",
    },
    Cone_1: {
        Frequency: 0.4,
        MinSpacing: 0,
        Obj: new THREE.Object3D(),
        Name: "Cone_1",
    },
}


class EnvController {
    constructor() {
        this.groundTiles = []
        this.tileWidth = 5.3
        this.numTiles = 20;
        this.currentTile = 0;

        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1));
        //Ray helpers
        this.inverseMatrix = new THREE.Matrix4();
        this.tRay = new THREE.Ray();
        this.intersectionPoint = new THREE.Vector3();
    }
    Init(glb) {
        let tileableWorld = new THREE.Object3D();
        glb.scene.children.forEach(node => {
            node.position.y = -1;
            if (node.name.toLowerCase() === 'ground')
                tileableWorld.add(node)
            if (node.name.toLowerCase() === 'ground2')
                tileableWorld.add(node)
            if (node.name.toLowerCase() === 'sideground')
                tileableWorld.add(node)

            let mbSpawnType = this.GetSpawnType(node.name)
            if (mbSpawnType) {
                for (let i = 0; i < Math.round(this.numTiles * mbSpawnType.Frequency); i++) {
                    let nodeClone = node.clone();
                    mbSpawnType.Obj.add(nodeClone)
                }
            }
        })
        for (let i = 0; i < this.numTiles; i++) {
            let tile2 = tileableWorld.clone()
            tile2.position.z = -this.tileWidth * i;
            this.groundTiles.push(tile2);
            scene.add(tile2);
        }
        console.log(SpawnTypes)
        this.InitTilesWithSpawnedObjects();
        console.log('the world', glb.scene.children);
    }
    GetSpawnType(name) {
        let returnType = null;
        Object.keys(SpawnTypes).forEach((key) => {
            let spawnType = SpawnTypes[key];
            if (name == spawnType.Name) {
                returnType = spawnType;
            }
        })
        return returnType;
    }
    InitTilesWithSpawnedObjects() {
        for (let i = 4; i < (this.numTiles - 4); i++) {
            let idx = (this.currentTile + i) % this.numTiles;
            let tile = this.groundTiles[idx];
            this.AddSpawnedObjectsToTile(tile);
        }
    }
    AddSpawnedObjectsToTile(tile) {
        let occupiedLanes = []
        Object.keys(SpawnTypes).forEach((key) => {
            let spawnType = SpawnTypes[key];
            let el = spawnType.Obj.children[0];
            if (Math.random() < spawnType.Frequency && el) {
                tile.add(el);
                //pick a random lane 
                let startIdx = Math.floor(3 * Math.random());
                for (let i = 0; i < 3; i++) {
                    let idx = (startIdx + i) % 3;
                    if (!occupiedLanes.includes(idx)) {
                        el.position.x = Object.entries(lane_positions)[idx][1];
                        occupiedLanes.push(idx)
                        break;
                    }
                }
            }
        })
    }
    ReturnSpawnedObjectsToPool(tile) {
        for (let j = tile.children.length - 1; j >= 0; j--) {
            let child = tile.children[j];
            let spawnType = this.GetSpawnType(child.name);
            if (spawnType) {
                spawnType.Obj.add(child);
            }
        }
    }
    EnvUpdate(dt) {
        for (let i = 0; i < this.groundTiles.length; i++) {
            let tile = this.groundTiles[i];
            tile.position.z += dt;
            if (tile.position.z > this.tileWidth) {
                tile.position.z = -(this.numTiles - 1) * this.tileWidth;
                this.ReturnSpawnedObjectsToPool(tile);
                this.AddSpawnedObjectsToTile(tile);
                this.currentTile = i;
            }
        }
    }
    Reset() {
        //remove objects from the beginning of array 
        for (let i = 0; i < this.numTiles; i++) {
            let idx = (this.currentTile + i) % this.numTiles;
            let tile = this.groundTiles[idx];
            this.ReturnSpawnedObjectsToPool(tile);
        }
    }
    CollisionCheck() {
        // do a raycast from player to spawned objects nearby
        // get spawned objects in the nearby tiles
        let nearbyObjectsToCollide = []
        for (let i = 1; i < 4; i++) {
            let idx = (this.currentTile + i) % this.numTiles;
            let tile = this.groundTiles[idx];

            tile.children.forEach((child) => {
                if (this.GetSpawnType(child.name)) {
                    nearbyObjectsToCollide.push(child);
                }
            })
        }
        this.raycaster.set(new THREE.Vector3(0, 0.5, -0.05).add(avatar.position), new THREE.Vector3(0, 0, -1))
        for (let i = 0; i < nearbyObjectsToCollide.length; i++) {
            let obj = nearbyObjectsToCollide[i];
            this.inverseMatrix.getInverse(obj.matrixWorld);
            this.tRay.copy(this.raycaster.ray).applyMatrix4(this.inverseMatrix);
            let intersect = this.tRay.intersectsBox(obj.geometry.boundingBox, this.intersectionPoint);
            if (intersect) {
                let dist = this.intersectionPoint.distanceTo(this.tRay.origin) / 100
                if (dist < 1.5) {
                    return true;
                }
            }
        }
        return false;
    }
}

