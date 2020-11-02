//populate spawner types 
let ConstructionSpawnTypes = {
    GrindPipe: {
        CollideWith: true,
        Grindable: true,
        Frequency: 0.4, // frequency of 1 means that it will 100% show up on this tile
        MinSpacing: 1, //min spacing of 1 means that there must be atleast 1 tile between element
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "GrindPipe",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0
    },
    Cone_1: {
        CollideWith: true,
        Frequency: 0.8,
        MinSpacing: 0,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Cone_1",
        Rotation: 0,
        RandomizeRot: 0,
        RandomizePos: 0
    },
    Crane: {
        CollideWith: false,
        Frequency: 1,
        MinSpacing: 5,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Crane",
        Rotation: Math.PI / 2,
        RandomizeRot: 0,
        RandomizePos: 0,
        SideOffset: 8
    },
    Sign1: {
        CollideWith: true,
        Frequency: 0.5,
        MinSpacing: 0,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Sign1",
        Rotation: Math.PI / 2,
        RandomizeRot: 1,
        RandomizePos: 1
    },
    Sign2: {
        CollideWith: false,
        Frequency: 0.9,
        MinSpacing: 0,
        LastIdx: 0,
        Obj: new THREE.Object3D(),
        Name: "Sign2",
        Rotation: -Math.PI/2,
        RandomizeRot: Math.PI/2,
        RandomizePos: 3,
        SideOffset: 12
    },
}

let pole;

function InitConstructionEnv(baseSpawner, gltfModel) {
    let tileableWorld = new THREE.Object3D();
    //backwards iterating since the nodes may get removed
    for (let i = gltfModel.scene.children.length - 1; i >= 0; i--) {
        let node = gltfModel.scene.children[i];
        node.position.y = -1;
        
        node.layers.set(1);

        if (node.name.toLowerCase() === 'ground')
            tileableWorld.add(node)
        if (node.name.toLowerCase() === 'ground2')
            tileableWorld.add(node)
        if (node.name.toLowerCase() === 'sideground')
            tileableWorld.add(node)
        if (node.name.toLowerCase() === 'pole1') {
            pole = node;
        }

        let mbSpawnType = baseSpawner.GetSpawnType(node.name)
        if (mbSpawnType) {
            for (let i = 0; i < Math.round(baseSpawner.numTiles * mbSpawnType.Frequency); i++) {
                let nodeClone = node.clone();
                mbSpawnType.Obj.add(nodeClone)
            }
        }
    }

    //TODO global scope.. that's messy
    scene.fog = new THREE.FogExp2('#cce6ff', .002);
    // scene.fog.near = 100;
    renderer.setClearColor(0xcce6ff, 1);

    return tileableWorld;
}

function SetUpStaticConstructionEnv(baseSpawner) {
    for (let i = 0; i < baseSpawner.numTiles; i++) {
        let tile = baseSpawner.groundTiles[i];
        //add poles to both sides 
        let leftPole = pole.clone();
        leftPole.position.x = -8;
        tile.add(leftPole);
        let rightPole = pole.clone();
        rightPole.position.x = 8;
        tile.add(rightPole);
    }
}