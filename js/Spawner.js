//populate spawner types 
let SpawnTypes = {
    GrindPipe: {
        CollideWith: true,
        Frequency: 0.4, // frequency of 1 means that it will 100% show up on this tile
        MinSpacing: 0, //min spacing of 1 means that there must be atleast 1 tile between element
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "GrindPipe",
    },
    Cone_1: {
        CollideWith: true,
        Frequency: 0.4,
        MinSpacing: 0,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Cone_1",
    },
    Crane: {
        CollideWith: false,
        Frequency: 1,
        MinSpacing: 5,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Crane",
    },
}


class EnvController {
    constructor() {
        this.groundTiles = []
        this.tileWidth = 13.2
        this.numTiles = 20;
        this.currentTile = 0;
        this.initialEmptyTileCount = 2;

        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1));
        //Ray helpers
        this.inverseMatrix = new THREE.Matrix4();
        this.tRay = new THREE.Ray();
        this.intersectionPoint = new THREE.Vector3();
    }
    Init(gltfModel) {
        let tileableWorld = new THREE.Object3D();
        gltfModel.scene.children.forEach(node => {
            console.log(node)
            node.position.y = -1;
            if (node.name.toLowerCase() === 'ground')
                tileableWorld.add(node)
            if (node.name.toLowerCase() === 'ground2')
                tileableWorld.add(node)
            if (node.name.toLowerCase() === 'sideground')
                tileableWorld.add(node)
            if (node.name.toLowerCase() === 'pole1') {
                this.pole = node;
            }

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
        this.InitTilesWithSpawnedObjects(true);
        console.log('the world', gltfModel.scene.children);
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
    InitTilesWithSpawnedObjects(firstInit) {
        for (let i = this.initialEmptyTileCount; i < (this.numTiles - this.initialEmptyTileCount); i++) {
            let idx = (this.currentTile + i) % this.numTiles;
            let tile = this.groundTiles[idx];
            this.AddSpawnedObjectsToTile(tile, idx);
        }
        if (firstInit) {
            for (let i = 0; i < this.numTiles; i++) {
                let tile = this.groundTiles[i];
                //add poles to both sides 
                let leftPole = this.pole.clone();
                leftPole.position.x = -8;
                tile.add(leftPole);
                let rightPole = this.pole.clone();
                rightPole.position.x = 8;
                tile.add(rightPole);
            }
        }
    }
    AddSpawnedObjectsToTile(tile, tIdx) {
        let occupiedLanes = []
        Object.keys(SpawnTypes).forEach((key) => {
            let spawnType = SpawnTypes[key];
            let el = spawnType.Obj.children[0];
            let distToLast = tIdx - spawnType.LastIdx;
            distToLast = distToLast >= 0 ? distToLast : tIdx + (this.numTiles - spawnType.LastIdx);
            if (Math.random() < spawnType.Frequency && el && distToLast >= spawnType.MinSpacing) {
                tile.add(el);
                //pick a random lane 
                if (spawnType.CollideWith) {
                    let startIdx = Math.floor(3 * Math.random());
                    for (let i = 0; i < 3; i++) {
                        let idx = (startIdx + i) % 3;
                        if (!occupiedLanes.includes(idx)) {
                            el.position.x = Object.entries(lane_positions)[idx][1];
                            occupiedLanes.push(idx)
                            spawnType.LastIdx = tIdx;
                            break;
                        }
                    }
                } else {
                    //pick a side : 
                    let startIdx = Math.random() > 0.5 ? -12 : 12;
                    if (!occupiedLanes.includes(startIdx)) {
                        el.position.x = startIdx;
                        occupiedLanes.push(startIdx)
                        spawnType.LastIdx = tIdx;
                    } else if (!occupiedLanes.includes(-startIdx)) {
                        el.position.x = -startIdx;
                        occupiedLanes.push(-startIdx)
                        spawnType.LastIdx = tIdx;
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

