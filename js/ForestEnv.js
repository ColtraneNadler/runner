//populate spawner types 
let ForestSpawnTypes = {
    Enviroment3Car: {
        CollideWith: true,
        Frequency: 0.4, // frequency of 1 means that it will 100% show up on this tile
        MinSpacing: 6, //min spacing of 1 means that there must be atleast 1 tile between element
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Enviroment3Car",
        Rotation: Math.PI,
        RandomizeRot: 0,
        RandomizePos: 0
    },
    Tree1: {
        CollideWith: false,
        Frequency: 1,
        MinSpacing: 5,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Tree`",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 13
    },
    Tree2: {
        CollideWith: false,
        Grindable: true,
        Frequency: 0.7,
        MinSpacing: 1,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Tree2",
        Rotation: -Math.PI / 2 ,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 16
    },
    Tree3: {
        CollideWith: false,
        Frequency: 0.5,
        MinSpacing: 1,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Tree3",
        Rotation: Math.PI / 2,
        RandomizeRot: 1,
        RandomizePos: 0,
        SideOffset: 12
    },
    Tree4: {
        CollideWith: false,
        Frequency: 0.7,
        MinSpacing: 2,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Tree4",
        Rotation: 0,
        RandomizeRot: 1,
        RandomizePos: 0,
        SideOffset: 10
    },
    Sign: {
        CollideWith: true,
        Frequency: 0.5,
        MinSpacing: 2,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Sign",
        Rotation: Math.PI,
        RandomizeRot: 0,
        RandomizePos: 1,
        SideOffset: 0
    },
    GrindLog: {
        CollideWith: true,
        Grindable: true,
        Frequency: 0.5,
        MinSpacing: 2,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "GrindLog",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 0
    },
    HjayBail: {
        CollideWith: true,
        Frequency: 0.5,
        MinSpacing: 2,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "HjayBail",
        Rotation: Math.PI / 2,
        RandomizeRot: 0,
        RandomizePos: 1,
        SideOffset: 0
    },
    Grass: {
        CollideWith: true,
        Frequency: 0.5,
        MinSpacing: 2,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Grass",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 1,
        SideOffset: 0
    },
    Branch: {
        CollideWith: true,
        Frequency: 0.5,
        MinSpacing: 2,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Branch",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 1,
        SideOffset: 0
    },
    MailBox: {
        CollideWith: true,
        Frequency: 0.5,
        MinSpacing: 2,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "MailBox",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 1,
        SideOffset: 0
    },
    // CornBushes: {
    //     CollideWith: false,
    //     Frequency: 0.5,
    //     MinSpacing: 2,
    //     LastIdx: 0,
    //     Obj: new THREE.Object3D(),
    //     Name: "CornBushes",
    //     Rotation: 0,
    //     RandomizeRot: 0,
    //     RandomizePos: 0,
    //     SideOffset: 16
    // },
    
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

let cornbush;

function InitForestEnv(baseSpawner, gltfModel) {
    let tileableWorld = new THREE.Object3D();

    //backwards iterating since the nodes may get removed
    for (let i = gltfModel.scene.children.length - 1; i >= 0; i--) {
        let node = gltfModel.scene.children[i];
        node.position.y = -1;
        node.traverse((o) => {
            if (o.isMesh) {
                // o.material.emissive = new THREE.Color( 0x00ffff );
                // o.material.encoding = THREE.sRGBEncoding;
                // o.material.emissive = new THREE.Color("rgb(1, 1, 1)");
                o.material.emissiveIntensity = 10;
                o.receiveShadow = true;
                o.castShadow = true

                o.material.metalness = 1;
                o.material.roughness = 0.4;
                // o.material.wireframe = false;
            }
        });

        if (node.name.toLowerCase() === 'ground') 
        tileableWorld.add(node)
        if (node.name.toLowerCase() === 'siderailing') 
        tileableWorld.add(node)   
        if (node.name.toLowerCase() === 'cornbushes') {
            cornbush = node;
        }
        if (node.name.toLowerCase() === 'fence') {
            fence = node;
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
    // let groundGeo = new THREE.PlaneGeometry(100, 100)
    // let planeMesh = new THREE.Mesh(groundGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color("#9803fc") }));
    // planeMesh.rotation.x = -Math.PI / 2;
    // planeMesh.position.y = -1;
    // scene.add(planeMesh);

    //TODO global scope.. that's messy
    baseSpawner.initSkybox(new THREE.Color('#304e78'));
        return tileableWorld;
}

function SetUpStaticForestEnv(baseSpawner) {
    for (let i = 0; i < baseSpawner.numTiles; i++) {
        let tile = baseSpawner.groundTiles[i];
        // add cornbushes to both sides 
        let leftcornbush = cornbush.clone();
        leftcornbush.position.x = -25;
        leftcornbush.position.y = 0.4;
        leftcornbush.rotation.z = Math.PI;
        tile.add(leftcornbush);
        let rightcornbush = cornbush.clone();
        rightcornbush.position.x = 25;
        rightcornbush.position.y = 0.4;
        tile.add(rightcornbush);
        // add fence
        let leftfence = fence.clone();
        leftfence.position.x = -6.7;
        leftfence.rotation.z = Math.PI;
        tile.add(leftfence);
        let rightfence = fence.clone();
        rightfence.position.x = 6.7;
        tile.add(rightfence);

        // if (i % 4 == 0) {
        //     cornbushClone = cornbush.clone();
        //     tile.add(cornbushClone);
        // }
    }
}

function SetUpForestEnvProps(baseSpawner) {
    scene.fog = new THREE.FogExp2('#7896b6', 0.02);
    scene.fog.far = 200;
}