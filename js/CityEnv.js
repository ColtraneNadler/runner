//populate spawner types 
let CitySpawnTypes = {
    Truck: {
        CollideWith: true,
        Frequency: 0.4, // frequency of 1 means that it will 100% show up on this tile
        MinSpacing: 6, //min spacing of 1 means that there must be atleast 1 tile between element
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Truck",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0
    },
    MovieTheater: {
        CollideWith: false,
        Frequency: 0.4,
        MinSpacing: 5,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "MovieTheater",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 16
    },
    Bench: {
        CollideWith: true,
        Grindable: true,
        Frequency: 0.7,
        MinSpacing: 1,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Bench",
        Rotation: Math.PI / 2,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 0
    },
    Trash: {
        CollideWith: true,
        Frequency: 0.5,
        MinSpacing: 1,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Trash",
        Rotation: Math.PI / 2,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 0
    },
    TallBuilding: {
        CollideWith: false,
        Frequency: 0.7,
        MinSpacing: 3,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "TallBuilding",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 1,
        SideOffset: 16
    },
    ShortBuilding: {
        CollideWith: false,
        Frequency: 0.5,
        MinSpacing: 2,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "ShortBuilding",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 1,
        SideOffset: 16
    },
}

let tree;
let highWaySign;

function InitCityEnv(baseSpawner, gltfModel) {
    let tileableWorld = new THREE.Object3D();
    
    //backwards iterating since the nodes may get removed
    for (let i = gltfModel.scene.children.length - 1; i >= 0; i--) {
        let node = gltfModel.scene.children[i];
        node.position.y = -1;
        node.traverse((o) => {
            if (o.isMesh) {
            // o.material.emissive = new THREE.Color( 0x00ffff );
            o.material.encoding = THREE.sRGBEncoding;
            // o.material.emissive = new THREE.Color("rgb(1, 1, 1)");
            o.material.emissiveIntensity = 1;
            
            o.material.metalness = 1;
            o.material.roughness = 0.4;
            o.material.wireframe = false;
            }
          });


        if (node.name.toLowerCase() === 'highway')
            tileableWorld.add(node)
        if (node.name.toLowerCase() === 'palmtree') {
            tree = node;
        }
        if (node.name.toLowerCase() === 'highwaysign') {
            highWaySign = node;
        }
        let mbSpawnType = baseSpawner.GetSpawnType(node.name)
        if (mbSpawnType) {
            for (let i = 0; i < Math.round(baseSpawner.numTiles * mbSpawnType.Frequency); i++) {
                let nodeClone = node.clone();
                mbSpawnType.Obj.add(nodeClone)
            }
        }
    }

    //add a plane geometry 
    let groundGeo = new THREE.PlaneGeometry(100, 100)
    let planeMesh = new THREE.Mesh(groundGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color("#9803fc") }));
    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.position.y = -1;
    scene.add(planeMesh);

    //TODO global scope.. that's messy
    // scene.fog = new THREE.FogExp2('#984ec7', 0.2);
    // scene.fog.near = 50;
    // scene.fog.far = -400;
    baseSpawner.initSkybox(new THREE.Color('#984ec7'));
    return tileableWorld;
}

function SetUpStaticCityEnv(baseSpawner) {
    for (let i = 0; i < baseSpawner.numTiles; i++) {
        let tile = baseSpawner.groundTiles[i];
        //add poles to both sides 
        let leftTree = tree.clone();
        leftTree.position.x = -8;
        leftTree.rotation.z = Math.PI;
        tile.add(leftTree);
        let rightTree = tree.clone();
        rightTree.position.x = 8;
        tile.add(rightTree);
        if (i % 4 == 0) {
            highWaySignClone = highWaySign.clone();
            tile.add(highWaySignClone);
        }
    }
}