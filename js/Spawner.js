class EnvController {
    constructor(initFunc, staticInitFunc, spawnTypes, tileWidth, numTiles) {
        this.groundTiles = []
        this.tileWidth = tileWidth;
        this.numTiles = numTiles;
        this.currentTile = -1;
        this.initialEmptyTileCount = 2;
        this.SpawnTypes = spawnTypes;
        this.allCoinObjs = []

        this.initFunc = initFunc;
        this.staticInitFunc = staticInitFunc;

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
        scene.add(line);
        // scene.remove(line);
    }

    Init(gltfModel) {
        let tileableWorld = this.initFunc(this, gltfModel);
        for (let i = 0; i < this.numTiles; i++) {
            let tile2 = tileableWorld.clone()
            tile2.position.z = -this.tileWidth * i;
            this.groundTiles.push(tile2);
            scene.add(tile2);
            // debug bounding box visualization
            // let bbox = new THREE.BoxHelper( tile2, 0xffff00 );
            // bbox.update();
            // scene.add( bbox );
        }
        this.staticInitFunc(this);
        this.InitializeCoinPool();
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
                el.rotation.z = spawnType.Rotation + spawnType.RandomizeRot * (Math.random() - 0.5);
                //pick a random lane 
                if (spawnType.CollideWith) {
                    let startIdx = Math.floor(3 * Math.random());
                    for (let i = 0; i < 3; i++) {
                        let idx = (startIdx + i) % 3;
                        if (!this.ArrayIncludesIdx(occupiedLanes, idx)) {
                            this.SetPos(Object.entries(lane_positions)[idx][1], spawnType.RandomizePos, el)
                            occupiedLanes.push({ "idx": idx, "height": el.geometry.boundingBox.max.z - el.geometry.boundingBox.min.z })
                            spawnType.LastIdx = tIdx;
                            // let bbox = new THREE.BoxHelper( el, 0xffff00 );
                            tile.add(el);
                            break;
                        }
                    }
                } else {
                    //pick a side : 
                    let startIdx = Math.random() > 0.5 ? -spawnType.SideOffset : spawnType.SideOffset;
                    if (!this.ArrayIncludesIdx(occupiedLanes, startIdx)) {
                        this.SetPos(startIdx, spawnType.RandomizePos, el)
                        el.rotation.z += (startIdx > 0 ? 0 : Math.PI);
                        occupiedLanes.push({ "idx": startIdx })
                        // let bbox = new THREE.BoxHelper( el, 0xffff00 );
                        tile.add(el);
                        spawnType.LastIdx = tIdx;
                    } else if (!this.ArrayIncludesIdx(occupiedLanes, -startIdx)) {
                        this.SetPos(-startIdx, spawnType.RandomizePos, el)
                        el.rotation.z += (startIdx > 0 ? 0 : Math.PI);
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
                    el.position.y = Math.random();
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
            tile.position.z += dt;
            if (tile.position.z > this.tileWidth) {
                tile.position.z = -(this.numTiles - 1) * this.tileWidth;
                this.ReturnSpawnedObjectsToPool(tile);
                this.AddSpawnedObjectsToTile(tile, i);
                this.currentTile = i;
            }
        }
        this.allCoinObjs.forEach(coin => {
            coin.rotation.y += 0.1*dt;
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
    CollisionCheck(collisionType, dir) {
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
        this.raycaster.set(new THREE.Vector3(0, 0.1, -0.2).add(avatar.position), dir)
        for (let i = 0; i < nearbyObjectsToCollide.length; i++) {
            let obj = nearbyObjectsToCollide[i];
            this.inverseMatrix.getInverse(obj.matrixWorld);
            this.tRay.copy(this.raycaster.ray).applyMatrix4(this.inverseMatrix);
            let intersect = this.tRay.intersectBox(obj.geometry.boundingBox, this.intersectionPoint);
            if (intersect) {
                let dist = this.intersectionPoint.distanceTo(this.tRay.origin) / 100;
                if (collisionType=="Coin") {
                    if (dist < 0.01) {
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
    // skybox
    createPathStrings(filename) {
        const basePath = "/assets/cSkybox_small/";
        const baseFilename = basePath + filename;
        const fileType = ".jpg";
        const sides = ["ft", "bk", "up", "dn", "lf", "rt"];
        const pathStings = sides.map(side => {
            return baseFilename + "_" + side + fileType;
        });

        return pathStings;
    }

    createMaterialArray(filename, tintColor) {
        const skyboxImagepaths = this.createPathStrings(filename);
        const materialArray = skyboxImagepaths.map(image => {
            let texture = new THREE.TextureLoader().load(image);
            return new THREE.MeshBasicMaterial({ color: tintColor, map: texture, side: THREE.BackSide, fog: false });
        });
        return materialArray;
    }

    initSkybox(color) {
        const materialArray = this.createMaterialArray("cartoon", color);
        let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
        let skybox = new THREE.Mesh(skyboxGeo, materialArray);
        skybox.position.set(200, 0, 0);
        scene.add(skybox);
    }
}

