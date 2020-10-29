class EnvController {
    constructor(initFunc, staticInitFunc, spawnTypes, tileWidth, numTiles) {
        this.groundTiles = []
        this.tileWidth = tileWidth;
        this.numTiles = numTiles;
        this.currentTile = 0;
        this.initialEmptyTileCount = 2;
        this.SpawnTypes = spawnTypes;

        this.initFunc = initFunc;
        this.staticInitFunc = staticInitFunc;

        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1));
        //Ray helpers
        this.inverseMatrix = new THREE.Matrix4();
        this.tRay = new THREE.Ray();
        this.intersectionPoint = new THREE.Vector3();
    }
    Init(gltfModel) {
        let tileableWorld = this.initFunc(this, gltfModel);
        for (let i = 0; i < this.numTiles; i++) {
            let tile2 = tileableWorld.clone()
            tile2.position.z = -this.tileWidth * i;
            this.groundTiles.push(tile2);
            scene.add(tile2);
        }
        this.staticInitFunc(this);
        this.InitTilesWithSpawnedObjects();
        console.log('the world', gltfModel.scene.children);
    }
    GetSpawnType(name) {
        let returnType = null;
        Object.keys(this.SpawnTypes).forEach((key) => {
            let spawnType = this.SpawnTypes[key];
            if (name == spawnType.Name) {
                returnType = spawnType;
            }
        })
        return returnType;
    }
    InitTilesWithSpawnedObjects() {
        for (let i = this.initialEmptyTileCount; i < this.numTiles; i++) {
            let idx = (this.currentTile + i) % this.numTiles;
            let tile = this.groundTiles[idx];
            this.AddSpawnedObjectsToTile(tile, idx);
        }
    }
    AddSpawnedObjectsToTile(tile, tIdx) {
        let occupiedLanes = []
        Object.keys(this.SpawnTypes).forEach((key) => {
            let spawnType = this.SpawnTypes[key];
            let el = spawnType.Obj.children[0];
            let distToLast = tIdx - spawnType.LastIdx;
            distToLast = distToLast >= 0 ? distToLast : tIdx + (this.numTiles - spawnType.LastIdx);
            if (Math.random() < spawnType.Frequency && el && distToLast >= spawnType.MinSpacing) {
                el.rotation.z = spawnType.Rotation + spawnType.RandomizeRot * (Math.random() - 0.5);
                tile.add(el);
                //pick a random lane 
                if (spawnType.CollideWith) {
                    let startIdx = Math.floor(3 * Math.random());
                    for (let i = 0; i < 3; i++) {
                        let idx = (startIdx + i) % 3;
                        if (!occupiedLanes.includes(idx)) {
                            this.SetPos(Object.entries(lane_positions)[idx][1], spawnType.RandomizePos, el)
                            occupiedLanes.push(idx)
                            spawnType.LastIdx = tIdx;
                            break;
                        }
                    }
                } else {
                    //pick a side : 
                    let startIdx = Math.random() > 0.5 ? -spawnType.SideOffset : spawnType.SideOffset;
                    if (!occupiedLanes.includes(startIdx)) {
                        this.SetPos(startIdx, spawnType.RandomizePos, el)
                        el.rotation.z = spawnType.Rotation + (startIdx > 0 ? 0 : Math.PI);
                        occupiedLanes.push(startIdx)
                        spawnType.LastIdx = tIdx;
                    } else if (!occupiedLanes.includes(-startIdx)) {
                        this.SetPos(-startIdx, spawnType.RandomizePos, el)
                        el.rotation.z = spawnType.Rotation + (startIdx > 0 ? 0 : Math.PI);
                        occupiedLanes.push(-startIdx)
                        spawnType.LastIdx = tIdx;
                    }
                }
            }
        })
    }
    SetPos(base, random, el) {
        el.position.x = base + random * (Math.random() - 0.5);
        el.position.z = random * (Math.random() - 0.5);
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
                this.AddSpawnedObjectsToTile(tile, i);
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
        for (let i = 1; i < 3; i++) {
            let idx = (this.currentTile + i) % this.numTiles;
            let tile = this.groundTiles[idx];
            tile.children.forEach((child) => {
                let spawnType = this.GetSpawnType(child.name);
                if (spawnType && spawnType.CollideWith) {
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

