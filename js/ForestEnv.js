//populate spawner types 
let ForestSpawnTypes = {
    Enviroment3Car: {
        CollideWith: true,
        Frequency: 0.4, // frequency of 1 means that it will 100% show up on this tile
        MinSpacing: 5, //min spacing of 1 means that there must be atleast 1 tile between element
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Enviroment3Car",
        Rotation: Math.PI,
        RandomizeRot: 0,
        RandomizePos: 0
    },
    Tree1: {
        CollideWith: false,
        Frequency: 0.9,
        MinSpacing: 3,
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
        MinSpacing: 2,
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
        Frequency: 0.7,
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
        Frequency: 0.8,
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
        RandomizeRot: 2,
        RandomizePos: 0,
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
        RandomizeRot: 3,
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
        Rotation: Math.PI,
        RandomizeRot: 0,
        RandomizePos: 0,
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
        RandomizeRot: 1,
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

        if (node.name.toLowerCase() === 'tree2') {
            node.scale.set(0.08,0.08,0.08);
        }

        if (node.name.toLowerCase() === 'tree3') {
            node.scale.set(0.04,0.04,0.04);
        }

        node.traverse((o) => {
            if (o.isMesh && o.name == "Ground") {
                // o.material.emissive = new THREE.Color( 0x00ffff );
                // o.material.encoding = THREE.sRGBEncoding;
                // o.material.emissive = new THREE.Color("rgb(1, 1, 1)");
                // o.material.emissiveIntensity = 1;
                o.receiveShadow = false;
                o.castShadow = false

                o.material.metalness = 0;
                o.material.roughness = 0.4;
                // o.material.wireframe = false;
            }
            else if (o.isMesh && o.name == "Enviroment3Car") {
                o.material.metalness = 1;
                o.material.roughness = 0.3;

            }
            else if (o.isMesh && o.name == "SideRailing") {
            
                o.material.metalness = 0;
                o.material.roughness = 0.5;
            }
            else if (o.isMesh) {
            
                o.material.metalness = 0;
                o.material.roughness = 1;
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
   

    
    
    // const pointLightHelper =  new THREE.PointLightHelper( plight, 4 );
    // scene.add( pointLightHelper );
    let moon = new THREE.Object3D();
    let loader = new THREE.GLTFLoader();
    loader.load(
        '/assets/moon/moon_v2.gltf',
        function ( glb ) {

            let models = glb.scene;
            models.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    // child.material.roughness = 0.3;
                    // child.material.metalness = 1;  
                    // child.material.emissiveIntensity = 100;
                    
                }
            });
            moon = glb.scene;
            moon.name = 'moon';
            moon.scale.set(15,15,15);
            moon.position.set(0,20,-80);
            moon.rotation.set(0,-Math.PI / 2,0);
            // baseSpawner.rootObj.add(moon);

            let plight = new THREE.SpotLight( 0xffffff , 3000);
            // plight.angle = Math.PI;
            plight.position.set( 0,20,-75 );
            plight.target = moon;
            // scene.add(plight.target);
            // scene.add( plight );

            baseSpawner.rootObj.add(plight.target)
            baseSpawner.rootObj.add(plight);
        
            // let helper = new THREE.SpotLightHelper( plight);
            //  scene.add(helper);
            
        })  ;

    // baseSpawner.initSkybox(new THREE.Color('#304e78'));



    // const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    // light.position.set(15,20,-80);
    // light.intensity = 2;
    // baseSpawner.rootObj.add( light );

    return tileableWorld;
}

function SetUpStaticForestEnv(baseSpawner) {
    for (let i = 0; i < baseSpawner.numTiles; i++) {
        let tile = baseSpawner.groundTiles[i];
        // add cornbushes to both sides 
        let leftcornbush = cornbush.clone();
        leftcornbush.position.x = -25;
        leftcornbush.position.y = 0.1;
        leftcornbush.rotation.z = Math.PI;
        tile.add(leftcornbush);
        let rightcornbush = cornbush.clone();
        rightcornbush.position.x = 25;
        rightcornbush.position.y = 0.1;
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
    materialArray.forEach(mat => {
        mat.color = new THREE.Color('#304e78');
    });
}