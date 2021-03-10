// "CINEMA_4D_Editor", type: "Object3D", parent: Gb, children: Array(0), …}
// 7: T {uuid: "08F70BC1-E8B5-4B75-9837-EC586DBB889A", name: "Obstical", type: "Mesh", parent: Gb, children: Array(0), …}


//populate spawner types 
let HoldSpawnTypes = {
    // good
    // Truck: {
    //     CollideWith: true,
    //     Frequency: 0.6, // frequency of 1 means that it will 100% show up on this tile
    //     MinSpacing: 3, //min spacing of 1 means that there must be atleast 1 tile between element
    //     LastIdx: 0,
    //     Obj: new THREE.Object3D(),
    //     Name: "Truck",
    //     Rotation: Math.PI,
    //     RandomizeRot: 0,
    //     RandomizePos: 0,
    //     Type: "Vehicle"
    // },

    VroomVroom: {
        CollideWith: true,
        Frequency: 0.6, // frequency of 1 means that it will 100% show up on this tile
        MinSpacing: 3, //min spacing of 1 means that there must be atleast 1 tile between element
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "VroomVroom",
        Rotation: Math.PI,
        RandomizeRot: 0,
        RandomizePos: 0,
        Type: "Vehicle"
    },

    Obstical: {
        CollideWith: true,
        Frequency: 0.6, // frequency of 1 means that it will 100% show up on this tile
        MinSpacing: 3, //min spacing of 1 means that there must be atleast 1 tile between element
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Obstical",
        Rotation: Math.PI,
        RandomizeRot: 0,
        RandomizePos: 0,
        Type: "Vehicle"
    },

    OverBridge: {
        CollideWith: false,
        Frequency: 0.8,
        MinSpacing: 8,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "OverBridge",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 0
    },

    Building1: {
        CollideWith: false,
        Frequency: .5,
        MinSpacing: 0,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Building1",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 16
    },

    Building2: {
        CollideWith: false,
        Frequency: 0.5,
        MinSpacing: 0,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Building2",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 16
    },

    // Bench: {
    //     CollideWith: true,
    //     Grindable: true,
    //     Frequency: 0.7,
    //     MinSpacing: 2,
    //     LastIdx: 0,
    //     Obj: new THREE.Object3D(),
    //     Name: "Bench",
    //     Rotation: -Math.PI / 2 ,
    //     RandomizeRot: 0,
    //     RandomizePos: 0,
    //     SideOffset: 0
    // },

    // good
    GrindPipeE2: {
        CollideWith: true,
        Grindable: true,
        Frequency: 0.5,
        MinSpacing: 1,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "GrindPipeE2",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 0
    },

    // good
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

    Building3: {
        CollideWith: false,
        Frequency: 0.6,
        MinSpacing: 0,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Building3",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 1,
        SideOffset: 16
    },
    Building4: {
        CollideWith: false,
        Frequency: 0.5,
        MinSpacing: 0,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Building4",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 1,
        SideOffset: 16
    },

    // good
    LightPole: {
        CollideWith: false,
        Frequency: 0.7,
        MinSpacing: 1,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "LightPole",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: -5
    },

    Coin: {
        CollideWith: true,
        Frequency: 2,
        MinSpacing: 0,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Coin",
        Rotation: Math.PI / 2,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 0
    },
}

// let tree;
// let lightpole;
// let highWaySign;

function InitHoldEnv(baseSpawner, gltfModel) {
    let tileableWorld = new THREE.Object3D();

    console.log('hold on scene',gltfModel.scene)
    //backwards iterating since the nodes may get removed
    for (let i = gltfModel.scene.children.length - 1; i >= 0; i--) {
        let node = gltfModel.scene.children[i];

        node.position.y = -1;
        node.traverse((o) => {
            if (o.isMesh) {
                o.material.emissiveIntensity = 10;
                o.receiveShadow = true;
                o.castShadow = true

                o.material.metalness = 1;
                o.material.roughness = 0.4;
            }
        });

        if (node.name.toLowerCase() === 'trash')
            node.scale.set(0.009,0.009,0.009)
        if (node.name.toLowerCase() === 'ground')
            tileableWorld.add(node)
        if (node.name.toLowerCase() === 'sidewalk') {
            let rightsidewalk = node.clone()
            tileableWorld.add(rightsidewalk);
            tileableWorld.add(node)
            node.position.y = -1.38;
            node.position.x = -9;
            rightsidewalk.position.y = -1.38;
            rightsidewalk.position.x = 9;
        }
        // if (node.name.toLowerCase() === 'lightpole') {
        //     lightpole = node; 
        //     lightpole.scale.x = -0.01;
        // }
        // if (node.name.toLowerCase() === 'palmtree') {
        //     tree = node;
        // }
        // if (node.name.toLowerCase() === 'highwaysign') {
        //     highWaySign = node;
        // }
        // if (node.name.toLowerCase() === 'siderailing') {
        //     tileableWorld.add(node)
        //     node.position.y = -1.38
        // }
        // if (node.name.toLowerCase() === 'lightpole') {
            
        //     }
        

        let mbSpawnType = baseSpawner.GetSpawnType(node.name)
        if (mbSpawnType) {
            for (let i = 0; i < Math.round(baseSpawner.numTiles * mbSpawnType.Frequency); i++) {
                let nodeClone = node.clone();
                mbSpawnType.Obj.add(nodeClone)
            }
        }
    }

    //add a plane geometry 
    // let groundGeo = new THREE.PlaneGeometry(100, 200)
    // let planeMesh = new THREE.Mesh(groundGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color("#9803fc") }));
    // planeMesh.rotation.x = -Math.PI / 2;
    // planeMesh.position.y = -1;
    // baseSpawner.rootObj.add(planeMesh);
    // baseSpawner.initSkybox(new THREE.Color('#dfa6fb'));

    return tileableWorld;
}

function SetUpHoldEnvProps(baseSpawner) {
    scene.fog = new THREE.FogExp2('#f0d3fd', 0.02);
    scene.fog.far = 200;
    materialArray.forEach(mat => {
        mat.color = new THREE.Color('#dfa6fb');
    });
}

function SetUpStaticHoldEnv(baseSpawner) {
    for (let i = 0; i < baseSpawner.numTiles; i++) {
        let tile = baseSpawner.groundTiles[i];
        //add poles to both sides 

        //add trees to both sides
        // let leftTree = tree.clone();
        // leftTree.position.x = -8;
        // leftTree.rotation.z = Math.PI;
        // tile.add(leftTree);
        // let rightTree = tree.clone();
        // rightTree.position.x = 8;
        // tile.add(rightTree);
        // if (i % 4 == 0) {
        //     highWaySignClone = highWaySign.clone();
        //     tile.add(highWaySignClone);
        // }
    }
}