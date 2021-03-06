class EnvController {
    constructor(initFunc, staticInitFunc, spawnTypes, envPropFunc, tileWidth, numTiles) {
        this.rootObj = new THREE.Object3D()
        this.groundTiles = []
        this.tileWidth = tileWidth;
        this.numTiles = numTiles;
        this.currentTile = -1;
        this.initialEmptyTileCount = 2;
        this.SpawnTypes = spawnTypes;
        this.allCoinObjs = []

        this.initFunc = initFunc;
        this.staticInitFunc = staticInitFunc;
        this.envPropFunc = envPropFunc;

        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1));
        //Ray helpers
        this.inverseMatrix = new THREE.Matrix4();
        this.tRay = new THREE.Ray();
        this.intersectionPoint = new THREE.Vector3();
    }

    drawRaycastLine(raycaster) {
        let material = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 10
        });
        let geometry = new THREE.Geometry();
        let startVec = new THREE.Vector3(
            raycaster.ray.origin.x,
            raycaster.ray.origin.y,
            raycaster.ray.origin.z);

        let endVec = new THREE.Vector3(
            raycaster.ray.direction.x,
            raycaster.ray.direction.y,
            raycaster.ray.direction.z);

        // could be any number
        endVec.multiplyScalar(5000);

        // get the point in the middle
        let midVec = new THREE.Vector3();
        midVec.lerpVectors(startVec, endVec, 0.5);

        geometry.vertices.push(startVec);
        geometry.vertices.push(midVec);
        geometry.vertices.push(endVec);

        // console.log('vec start', startVec);
        // console.log('vec mid', midVec);
        // console.log('vec end', endVec);

        let line = new THREE.Line(geometry, material);
        this.rootObj.add(line);
        // scene.remove(line);
    }

    Init(gltfModel) {
        let tileableWorld = this.initFunc(this, gltfModel);
        for (let i = 0; i < this.numTiles; i++) {
            let tile2 = tileableWorld.clone()
            tile2.position.z = -this.tileWidth * i;
            this.groundTiles.push(tile2);
            this.rootObj.add(tile2);
            // debug bounding box visualization
            // let bbox = new THREE.BoxHelper( tile2, 0xffff00 );
            // bbox.update();
            // this.rootObj.add( bbox );
        }
        this.staticInitFunc(this);
        this.InitializeCoinPool();
        // console.log('the world', gltfModel.scene.children);
        scene.add(this.rootObj);
        this.rootObj.visible = false;
    }
    SetVisibility(visibility) {
        this.rootObj.visible = visibility;
        if (visibility) {
            this.envPropFunc(this);
        } else {
            const cleanMaterial = material => {
                material.dispose()
                // dispose textures
                for (const key of Object.keys(material)) {
                    const value = material[key]
                    if (value && typeof value === 'object' && 'minFilter' in value) {
                        value.dispose()
                    }
                }
            }
            this.rootObj.traverse(object => {
                if (!object.isMesh) return
                object.geometry.dispose()
                if (object.material.isMaterial) {
                    cleanMaterial(object.material)
                } else {
                    for (const material of object.material) cleanMaterial(material)
                }
            })


        }

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
    ArrayIncludesIdx(arr, val) {
        return arr.filter(e => e.idx === val).length > 0
    }
    InitTilesWithSpawnedObjects() {
        for (let i = this.initialEmptyTileCount; i < this.numTiles; i++) {
            let idx = (this.currentTile + i + 1) % this.numTiles;
            let tile = this.groundTiles[idx];
            this.AddSpawnedObjectsToTile(tile, idx);
        }
    }
    AddSpawnedObjectsToTile(tile, tIdx) {
        let occupiedLanes = []
        let occupiedLaneHeights = {}
        Object.keys(this.SpawnTypes).forEach((key) => {
            if (key == "Coin") return;
            let spawnType = this.SpawnTypes[key];
            let el = spawnType.Obj.children[0];
            let distToLast = tIdx - spawnType.LastIdx;
            distToLast = distToLast >= 0 ? distToLast : tIdx + (this.numTiles - spawnType.LastIdx);
            if (Math.random() < spawnType.Frequency && el && distToLast >= spawnType.MinSpacing) {

                //pick a random lane for objects we can collide with
                if (spawnType.CollideWith) {
                    let startIdx = Math.floor(3 * Math.random());
                    for (let i = 0; i < 3; i++) {
                        let idx = (startIdx + i) % 3;
                        if (!this.ArrayIncludesIdx(occupiedLanes, idx)) {

                            if (spawnType.Type != "Vehicle") {
                                this.SetPos(Object.entries(lane_positions)[idx][1], spawnType.RandomizePos, el)
                            }
                            if (spawnType.Type == "Vehicle") { // for vehicles we're excluding the middle lane so I (Ian) re-ordered the lane_position array to make it easy to exclude the 0 element
                                if (idx == 0) {
                                    //cannot change idx here , otherwise there could be collisions, just break instead
                                    break;
                                }
                                this.SetPos(Object.entries(lane_positions)[idx][1], spawnType.RandomizePos, el)
                            }
                            occupiedLanes.push({ "idx": idx, "height": el.geometry.boundingBox.max.z - el.geometry.boundingBox.min.z })
                            spawnType.LastIdx = tIdx;
                            // let bbox = new THREE.BoxHelper( el, 0xffff00 );
                            tile.add(el);
                            break;
                        }
                    }
                }

                // apply object rotations
                if (spawnType.Type != "Vehicle") {   // if the object is not a vehicle
                    el.rotation.z = spawnType.Rotation + spawnType.RandomizeRot * (Math.random() - 0.5);
                }
                if (spawnType.Type == "Vehicle") { // vehicles only

                    if (lane_positions.RIGHT == el.position.x) {
                        el.rotation.z = (spawnType.Rotation * 0) + (spawnType.RandomizeRot * (Math.random() - 0.5));
                    }
                    if (lane_positions.LEFT == el.position.x) {
                        el.rotation.z = spawnType.Rotation + (spawnType.RandomizeRot * (Math.random() - 0.5));
                    }

                }

                // set position and rotation of objects to the side of the road that we cannot collide with
                if (!spawnType.CollideWith) {
                    //pick a side :
                    let startIdx = Math.random() > 0.5 ? -spawnType.SideOffset : spawnType.SideOffset;
                    if (!this.ArrayIncludesIdx(occupiedLanes, startIdx)) {
                        this.SetPos(startIdx, spawnType.RandomizePos, el)
                        el.rotation.z = (spawnType.StartingRot ? spawnType.StartingRot : 0) + (startIdx > 0 ? 0 : Math.PI);
                        occupiedLanes.push({ "idx": startIdx })
                        // let bbox = new THREE.BoxHelper( el, 0xffff00 );
                        tile.add(el);
                        spawnType.LastIdx = tIdx;
                    } else if (!this.ArrayIncludesIdx(occupiedLanes, -startIdx)) {
                        this.SetPos(-startIdx, spawnType.RandomizePos, el)
                        el.rotation.z = (spawnType.StartingRot ? spawnType.StartingRot : 0) + (-startIdx > 0 ? 0 : Math.PI);
                        occupiedLanes.push({ "idx": -startIdx })
                        spawnType.LastIdx = tIdx;
                        // let bbox = new THREE.BoxHelper( el, 0xffff00 );
                        tile.add(el);
                    }
                }
            }
        })
        // add coins to tile later
        let numCoins = Math.floor(2 * Math.random());
        let occupiedCoinLanes = [];
        let coinSpawn = this.SpawnTypes["Coin"];
        for (let i = 0; i < numCoins; i++) {
            let lanePos = Math.floor(3 * Math.random());
            let el = coinSpawn.Obj.children[0];
            let p = occupiedLanes.filter(e => e.idx === lanePos);
            if (el && !occupiedCoinLanes.includes[lanePos]) {
                occupiedCoinLanes.push(lanePos);
                if (p.length > 0) {
                    el.position.y = p[0].height * 0.01;
                } else {
                    el.position.y = 0.75 + 0.5 * Math.random();
                }
                this.SetPos(Object.entries(lane_positions)[lanePos][1], coinSpawn.RandomizePos, el)
                tile.add(el)
            }
        }
    }
    InitializeCoinPool() {
        //add coins to pool
        let coinSpawn = this.GetSpawnType("Coin");
        let coinNode = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.1, 8, 50), new THREE.MeshStandardMaterial({ color: new THREE.Color("#FFED3A") }));
        coinNode.material.metalness = 1;
        coinNode.material.roughness = 0.2;
        coinNode.name = "Coin";
        coinNode.geometry.computeBoundingBox();
        for (let i = 0; i < Math.round(this.numTiles * coinSpawn.Frequency); i++) {
            let coinClone = coinNode.clone();
            coinClone.rotation.y = Math.random() * 2 * Math.PI;
            coinSpawn.Obj.add(coinClone);
            this.allCoinObjs.push(coinClone);
        }
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
        // skybox.rotation.y += 0.0001;
        for (let i = 0; i < this.groundTiles.length; i++) {
            let tile = this.groundTiles[i];
            if (tile.position.z > this.tileWidth) {
                let prevTile = (i + this.numTiles - 1) % this.numTiles;
                tile.position.z = this.groundTiles[prevTile].position.z - this.tileWidth;
                this.ReturnSpawnedObjectsToPool(tile);
                this.AddSpawnedObjectsToTile(tile, i);
                this.currentTile = i;
            }
            tile.position.z += dt;
        }
        this.allCoinObjs.forEach(coin => {
            coin.rotation.y += (Math.random() * 0.2) * 0.1;
        })
    }
    Reset() {
        //remove objects from the beginning of array
        for (let i = 0; i < this.numTiles; i++) {
            let idx = (this.currentTile + i) % this.numTiles;
            let tile = this.groundTiles[idx];
            this.ReturnSpawnedObjectsToPool(tile);
        }

    }
    CollisionCheck(collisionType, dir, offset) {
        // do a raycast from player to spawned objects nearby
        // get spawned objects in the nearby tiles
        let nearbyObjectsToCollide = []
        for (let i = 1; i < 3; i++) {
            let idx = (this.currentTile + i) % this.numTiles;
            let tile = this.groundTiles[idx];
            tile.children.forEach((child) => {
                let spawnType = this.GetSpawnType(child.name);
                if (spawnType && spawnType.CollideWith) {
                    let addObj = false;

                    switch (collisionType) {
                        case "Coin": {
                            if (child.name == "Coin") {
                                addObj = true;
                            }
                            break;
                        }
                        case "Jump": {
                            if (spawnType.Grindable) {
                                addObj = true;
                            }
                            break;
                        }
                        case "Obstacle": {
                            if (child.name !== "Coin") {
                                addObj = true;
                            }
                            break;
                        }
                    }
                    if (addObj) {
                        nearbyObjectsToCollide.push(child);
                    }
                }
            })
        }
        this.raycaster.set(offset.add(avatar.position), dir)
        for (let i = 0; i < nearbyObjectsToCollide.length; i++) {
            let obj = nearbyObjectsToCollide[i];
            this.inverseMatrix.getInverse(obj.matrixWorld);
            this.tRay.copy(this.raycaster.ray).applyMatrix4(this.inverseMatrix);
            let intersect = this.tRay.intersectBox(obj.geometry.boundingBox, this.intersectionPoint);
            if (intersect) {
                let dist = this.intersectionPoint.distanceTo(this.tRay.origin) / 100;
                if (collisionType == "Coin") {
                    if (dist < 0.075) {
                        // return coin to object pool
                        this.GetSpawnType(obj.name).Obj.add(obj);
                        return [true, 0];
                    }
                } else {
                    return [true, dist]
                }
            }
        }
        return [false, 0];
    }
}
