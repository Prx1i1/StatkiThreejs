import Tile from "./Tile.js"
import Ship from "./Ship.js"
import Shot from "./Shot.js"

class Game {
    constructor() {
        this.selectedPawn = null;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0x29293d);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.raycaster = new THREE.Raycaster(); // obiekt Raycastera symulujący "rzucanie" promieni
        this.mouseVector = new THREE.Vector2() // ten wektor czyli pozycja w przestrzeni 2D na ekranie(x,y) wykorzystany będzie do określenie pozycji myszy na ekranie, a potem przeliczenia na pozycje 3D

        this.camera.position.set(200, 200, 0);
        this.camera.lookAt(this.scene.position);

        //true if white (set onlogin)
        this.hasMove = false;
        this.isMoving = false;
        this.isTaking = false;
        this.isWhite = true;
        this.isPlaying = false;
        this.isWinner = null;

        this.gameIsAlive = true;

        this.tileList = []
        this.tileListWhite = []
        this.tileListBlack = []

        this.pieces = []
        this.shipLengths = [3, 3, 2, 2, 1, 1]
        this.phase = "preparing"

        this.shipsBlack = []
        this.shipsWhite = []
        this.myTableIsFinished = false

        this.shipsDataWhite = []
        this.shipsDataBlack = []

        this.whiteColor;
        this.blackColor;

        this.shotsFired = 0
        this.shotsHit = 0

        this.sortparameter = "wins"
        this.sortparameter2 = "loses"
        this.sortreverse = false

        document.getElementById("root").append(this.renderer.domElement);

        this.render() // wywołanie metody render
    }

    playSinkAnimation(position, rotation, length, color){

        let ship = new Ship(!this.isWhite, color, length, rotation)
        let realposition = Game.GetPosition(position.x, position.z)
        console.log(realposition)
        ship.position.x = realposition.x + (this.isWhite? -50 : 50)
        ship.position.z = realposition.z
        ship.position.y = 5
        console.log("SUNKEN SHIP", ship.position)
        while(ship.rotationValue != rotation){
            ship.rotate()
        }
        this.scene.add(ship)

        new TWEEN.Tween(ship.position) // co
            .to({
                y: 0,
            }, 1000) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => { }) // funkcja po zakończeniu animacji
            .start()
    }

    makeSink(){
        if(this.isWhite){
            this.pieces.forEach((ship,i) => {
                let temp = []
                temp.push([ship.position.x, ship.position.z], ship.rotationValue ,ship.name)
                this.shipsDataWhite.push(temp)
            })
            console.log("data ships structure")
            console.log(this.shipsDataWhite)
        }else{
            this.pieces.forEach((ship,i) => {
                let temp = []
                temp.push([ship.position.x, ship.position.z], ship.rotationValue ,ship.name)
                this.shipsDataBlack.push(temp)
            })
            console.log("data ships structure")
            console.log(this.shipsDataBlack)
        }
    }

    load() {

        //p1
        this.checkerboardTemplate = [];
        for (let r = 0; r < 8; r++) {
            let row = [];
            let row2 = [];
            let tilerow = [];
            for (let c = 0; c < 8; c++) {
                row.push((c + r) % 2);
                row2.push(0)

                let tile = new Tile(Game.getStartingColour())
                tilerow.push(tile)

                let pos = Game.GetPosition(r, c)
                tile.position.set(pos.x + 50, -2, pos.z)
                tile.sparkle("disabled")
                this.scene.add(tile);
            }

            this.tileListWhite.push(tilerow)
            this.checkerboardTemplate.push(row);
            this.shipsWhite.push(row2)
        }

        //p2
        this.checkerboardTemplate = [];
        for (let r = 0; r < 8; r++) {
            let row = [];
            let row2 = [];
            let tilerow = [];
            for (let c = 0; c < 8; c++) {
                row.push((c + r) % 2);
                row2.push(0)

                let tile = new Tile(Game.getStartingColour())
                tilerow.push(tile)


                let pos = Game.GetPosition(r, c)
                tile.position.set(pos.x - 50, -2, pos.z)
                tile.sparkle("disabled")
                this.scene.add(tile);
            }

            this.tileListBlack.push(tilerow)
            this.checkerboardTemplate.push(row);
            this.shipsBlack.push(row2)
        }

        let shipcolor = 0x000000
        if (this.isWhite) {
            shipcolor = this.whiteColor
        } else {
            shipcolor = this.blackColor
        }

        this.shipLengths.forEach((ship, i) => {
            let piece = new Ship(this.isWhite, shipcolor, ship, 0) //0 is rotation 90-180-270-360
            piece.position.x = (this.isWhite ? 15 : -15) * i + 10 * (this.isWhite ? 1 : -1)
            piece.position.y = 0
            piece.position.z = (this.isWhite ? 60 : -60) /* + (ship == 2 ? 5 : (ship==3 ? 10 : 0)) //+5 for rotational (2) +10 (3) */
            piece.name = ship
            this.pieces.push(piece)

            this.scene.add(piece)
            console.log(piece.position, piece.name)
        })

        this.hasMove = true;
        if (!this.isWhite) {
            this.camera.position.set(-200, 200, 0);
            this.camera.lookAt(this.scene.position);
            this.hasMove = false;
        }

        window.ui.updateTable()
    }

    render = () => {
        this.camera.lookAt(this.scene.position)
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
        TWEEN.update();
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    deselectAll() {
        this.pieces.forEach(element => {
            element.deselect()
        });
    }
    killparticles() {
        let deleted = 0
        this.scene.children.forEach((element, i) => {
            if (element.name == "particle") {
                this.scene.remove(element)
            }
            deleted += 1
        })
        console.log("cleaning up particles:", deleted)
    }

    tilesHighlight() {
        if (this.isWhite) {
            this.shipsWhite.forEach((row, i) => {
                row.forEach((number, j) => {
                    try {
                        if (this.shipsWhite[i][j] == 1 || this.shipsWhite[i][j] == 5) {
                            if (this.shipsWhite[i][j] == 1) {
                                this.tileListWhite[i][j].highlight("allied")
                            } else {
                                this.tileListWhite[i][j].highlight("shot")
                            }
                        } else {
                            this.tileListWhite[i][j].highlight("neutral")
                        }
                    } catch { }
                })
            })

            this.shipsBlack.forEach((row, i) => {
                row.forEach((number, j) => {
                    try {
                        if (this.shipsBlack[i][j] == 6) {
                            this.tileListBlack[i][j].highlight("shot")
                        }
                    } catch { }
                })
            })

        } else {
            this.shipsBlack.forEach((row, i) => {
                row.forEach((number, j) => {
                    try {
                        if (this.shipsBlack[i][j] == 2 || this.shipsBlack[i][j] == 6) {
                            if (this.shipsBlack[i][j] == 2) {
                                this.tileListBlack[i][j].highlight("allied")
                            } else {
                                this.tileListBlack[i][j].highlight("shot")
                            }
                        } else {
                            this.tileListBlack[i][j].highlight("neutral")
                        }
                    } catch { }
                })
            })


            this.shipsWhite.forEach((row, i) => {
                row.forEach((number, j) => {
                    try {
                        if (this.shipsWhite[i][j] == 5) {
                            this.tileListWhite[i][j].highlight("shot")
                        }
                    } catch { }
                })
            })
        }
    }
    moveCamera() {
        console.log("adjusting camera upwards")
        new TWEEN.Tween(this.camera.position) // co
            .to({
                x: this.isWhite ? 50 : -50,
                y: 300,
                z: 0,
            }, 500) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => { }) // funkcja po zakończeniu animacji
            .start()
    }

    getLegalMoves(from) {
        let possibleMoves = [],
            proto = []
        proto.push({ x: from.x + (this.isWhite ? -1 : 1), z: from.z - 1 })
        proto.push({ x: from.x + (this.isWhite ? -1 : 1), z: from.z + 1 })

        proto.forEach(pos => {
            console.log(pos)
            if (pos.x >= 0 && pos.x <= 7 && pos.z >= 0 && pos.z <= 7) {
                if (this.pawnsTable[pos.x][pos.z] == 0) {
                    possibleMoves.push({ x: pos.x, z: pos.z, isTaking: false })
                }
                if (this.isWhite == true) {
                    if (this.pawnsTable[pos.x][pos.z] == 2 && this.pawnsTable[pos.x + (pos.x - from.x)][pos.z + (pos.z - from.z)] == 0) {
                        possibleMoves.push({ x: pos.x + (pos.x - from.x), z: pos.z + (pos.z - from.z), isTaking: true })
                    }
                } else {

                    if (this.pawnsTable[pos.x][pos.z] == 1 && this.pawnsTable[pos.x + (pos.x - from.x)][pos.z + (pos.z - from.z)] == 0) {
                        possibleMoves.push({ x: pos.x + (pos.x - from.x), z: pos.z + (pos.z - from.z), isTaking: true })
                    }
                }
            }
        })

        return possibleMoves
    }

    validateFullTable() {
        let expecteclength = 0
        this.shipLengths.forEach(element => {
            expecteclength += element
        })
        let actuallength = 0
        if (this.isWhite) {
            this.shipsWhite.forEach(row => {
                row.forEach(value => {
                    actuallength += value
                })
            });
        } else {
            this.shipsBlack.forEach(row => {
                row.forEach(value => {
                    actuallength += value / 2
                })
            });
        }

        console.log("IS TABLE FULL", expecteclength, actuallength)
        if (actuallength == expecteclength) {
            return true
        } else {
            return false
        }

    }

    backupTiles(originalpos, originaltiles, replaceold, offsetX, offsetZ) {
        console.log("REPLACE TILES FUNCTION", replaceold)
        for (let i = 0; i < this.selectedShip.name; i++) {
            if (this.isWhite) {
                if (replaceold) {
                    this.shipsWhite[originalpos.x + offsetX * i][originalpos.z + offsetZ * i] = 0
                } else {
                    try {
                        this.shipsWhite[originalpos.x + offsetX * i][originalpos.z + offsetZ * i] = originaltiles[i]
                    } catch {
                        //border
                    }
                }
            } else {
                if (replaceold) {
                    this.shipsBlack[originalpos.x + offsetX * i][originalpos.z + offsetZ * i] = 0
                } else {
                    try {
                        this.shipsBlack[originalpos.x + offsetX * i][originalpos.z + offsetZ * i] = originaltiles[i]
                    } catch {
                        //border
                    }
                }
            }
        }
    }

    startRotation(obj) {
        let originalpos = Game.FindOnGrid(this.selectedShip.position.x + (this.isWhite ? -50 : 50), this.selectedShip.position.z)
        if (originalpos.x % 1 != 0 || originalpos.z % 1 != 0) {
            console.log("Out of bounds")
            obj.rotate()
            return 0
        }
        let offsetX = 0
        let offsetZ = 0

        if (this.selectedShip.rotationValue == 0) {
            offsetZ = 1
        }
        if (this.selectedShip.rotationValue == 1) {
            offsetX = 1
        }
        if (this.selectedShip.rotationValue == 2) {
            offsetZ = -1
        }
        if (this.selectedShip.rotationValue == 3) {
            offsetX = -1
        }

        let checkborderline = true

        //new rotation integer
        obj.rotate()

        let newoffsetX = 0
        let newoffsetZ = 0

        if (this.selectedShip.rotationValue == 0) {
            newoffsetZ = 1
        }
        if (this.selectedShip.rotationValue == 2) {
            newoffsetZ = -1
        }
        if (this.selectedShip.rotationValue == 1) {
            newoffsetX = 1
        }
        if (this.selectedShip.rotationValue == 3) {
            newoffsetX = -1
        }

        //make it better
        //for 3long x > 5 x < 2 z > 5 z < 2
        console.log("CHECKING ROTATION BORDERS")

        if (originalpos.x > 7 - (this.selectedShip.name - 1) && newoffsetX == 1) { checkborderline = false; console.log("Failed check at +X") }
        if (originalpos.x < 0 + (this.selectedShip.name - 1) && newoffsetX == -1) { checkborderline = false; console.log("Failed check at -X") }
        if (originalpos.z > 7 - (this.selectedShip.name - 1) && newoffsetZ == 1) { checkborderline = false; console.log("Failed check at +Z") }
        if (originalpos.z < 0 + (this.selectedShip.name - 1) && newoffsetZ == -1) { checkborderline = false; console.log("Failed check at -Z") }

        //havent done that yet
        if (checkborderline) {

            let success = false
            let originaltiles = []

            //first: record old tiles and temp them
            try {
                for (let i = 0; i < this.selectedShip.name; i++) {
                    //original tiles

                    if (this.isWhite) {
                        originaltiles.push(this.shipsWhite[originalpos.x + offsetX * i][originalpos.z + offsetZ * i])
                        this.shipsWhite[originalpos.x + offsetX * i][originalpos.z + offsetZ * i] = 3
                    } else {
                        originaltiles.push(this.shipsBlack[originalpos.x + offsetX * i][originalpos.z + offsetZ * i])
                        this.shipsBlack[originalpos.x + offsetX * i][originalpos.z + offsetZ * i] = 4
                    }
                }
            } catch { }

            console.log("OLD TILES BEFORE TEMP", originaltiles)

            let replaceold = true

            originaltiles.forEach(element => {
                element == 0 ? replaceold = false : replaceold = replaceold
            });
            console.log(replaceold, "replace old tiles")


            //second: check if new tiles are empty
            for (let i = 0; i < this.selectedShip.name; i++) {
                if (this.isWhite) {
                    if (this.shipsWhite[originalpos.x + newoffsetX * i][originalpos.z + newoffsetZ * i] == 1) {

                        this.backupTiles(originalpos, originaltiles, replaceold, offsetX, offsetZ)

                        this.startRotation(obj)
                        return 0
                    }
                } else {
                    if (this.shipsBlack[originalpos.x + newoffsetX * i][originalpos.z + newoffsetZ * i] == 2) {

                        this.backupTiles(originalpos, originaltiles, replaceold, offsetX, offsetZ)

                        this.startRotation(obj)
                        return 1
                    }
                }
            }

            //third: check new tiles for adjacency
            for (let i = 0; i < this.selectedShip.name; i++) {
                //new tiles
                if (this.isWhite) {
                    if (Game.CheckAdjacent({ x: originalpos.x + newoffsetX * i, z: originalpos.z + newoffsetZ * i }, this.isWhite, this.shipsWhite, this.shipsBlack, 1, 2)) {
                        //all passed => proceed with full rotation
                    } else {
                        //return old tiles

                        for (let j = 0; j < i; j++) {
                            try {
                                this.shipsWhite[originalpos.x + newoffsetX * j][originalpos.z + newoffsetZ * j] = originaltiles[j]
                            } catch {
                                //border
                            }
                        }

                        this.startRotation(obj)
                        return 0
                    }
                } else {
                    if (Game.CheckAdjacent({ x: originalpos.x + newoffsetX * i, z: originalpos.z + newoffsetZ * i }, this.isWhite, this.shipsWhite, this.shipsBlack, 1, 2)) {
                        //all passed => proceed with full rotation
                    } else {
                        //return old tiles
                        for (let j = 0; j < i; j++) {
                            try {
                                this.shipsBlack[originalpos.x + newoffsetX * j][originalpos.z + newoffsetZ * j] = originaltiles[j]
                            } catch {
                                //border
                            }
                        }

                        this.startRotation(obj)
                        return 0
                    }
                }
            }

            this.backupTiles(originalpos, originaltiles, replaceold, offsetX, offsetZ)

            //fifth: place new tiles
            for (let i = 0; i < this.selectedShip.name; i++) {
                if (this.isWhite) {
                    this.shipsWhite[originalpos.x + newoffsetX * i][originalpos.z + newoffsetZ * i] = 1
                } else {
                    this.shipsBlack[originalpos.x + newoffsetX * i][originalpos.z + newoffsetZ * i] = 2
                }
            }

        } else {
            console.log("failed to rotate at border")

            let originaltiles = []

            try {
                for (let i = 0; i < this.selectedShip.name; i++) {
                    //original tiles

                    if (this.isWhite) {
                        originaltiles.push(this.shipsWhite[originalpos.x + offsetX * i][originalpos.z + offsetZ * i])
                        this.shipsWhite[originalpos.x + offsetX * i][originalpos.z + offsetZ * i] = 3
                    } else {
                        originaltiles.push(this.shipsBlack[originalpos.x + offsetX * i][originalpos.z + offsetZ * i])
                        this.shipsBlack[originalpos.x + offsetX * i][originalpos.z + offsetZ * i] = 4
                    }
                }
            } catch { }

            console.log("TESING OLD TILES", originaltiles)


            try {
                if (this.isWhite) {
                    for (let i = 0; i < this.selectedShip.name; i++) {
                        this.shipsWhite[originalpos.x + i * offsetX][originalpos.z + i * offsetZ] = 0
                    }
                } else {
                    for (let i = 0; i < this.selectedShip.name; i++) {
                        this.shipsBlack[originalpos.x + i * offsetX][originalpos.z + i * offsetZ] = 0
                    }
                }
            } catch { }

            let noTemp = true
            originaltiles.forEach(element => {
                if (element == 3 || element == 4) {
                    noTemp = false
                }
            })

            if (originaltiles.length == this.selectedShip.name && noTemp) {
                if (this.isWhite) {
                    for (let i = 0; i < originaltiles.length; i++) {
                        this.shipsWhite[originalpos.x + i * offsetX][originalpos.z + i * offsetZ] = originaltiles[i]
                    }
                } else {
                    for (let i = 0; i < originaltiles.length; i++) {
                        this.shipsBlack[originalpos.x + i * offsetX][originalpos.z + i * offsetZ] = originaltiles[i]
                    }
                }
            }

            this.startRotation(obj)
        }
    }

    spawnember(position) {
        //randomized within one tile
        let randomSpreadX = Game.getRandomIntInclusive(-4, 4)
        let randomSpreadZ = Game.getRandomIntInclusive(-4, 4)

        let shade = Game.getRandomIntInclusive(0, 2)
        switch (shade) {
            case 0: shade = 0xff0000; break
            case 1: shade = 0xff8800; break
            default: shade = 0xffff00; break
        }

        let embergeometry = new THREE.BoxGeometry(1, 1, 1)
        let embermaterial = new THREE.MeshBasicMaterial({
            color: shade,
            side: THREE.DoubleSide, // dwustronny
            opacity: 1, // stopień przezroczystości
        })

        let ember = new THREE.Mesh(embergeometry, embermaterial)
        this.scene.add(ember)
        ember.name = "particle"
        ember.position.y = 0
        ember.position.x = position.x + randomSpreadX
        ember.position.z = position.z + randomSpreadZ

        new TWEEN.Tween(ember.position) // co
            .to({
                x: ember.position.x,
                y: 15,
                z: ember.position.z
            }, 1500) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Quartic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => { window.game.scene.remove(ember); ember.geometry.dispose(); ember.material.dispose() }) // funkcja po zakończeniu animacji
            .start()

    }

    fireAnimation(position) {
        setInterval(() => {
            this.spawnember(position)
        }, document.getElementById("sparkling-select").value * 0.7)
    }

    hitAnimation(position) {

        let iteration = 0
        let amount = document.getElementById("explosion-amount").value

        setInterval(() => {
            if (iteration > amount) { return 0 }

            let randomSpreadX = Game.getRandomIntInclusive(-4, 4)
            let randomSpreadZ = Game.getRandomIntInclusive(-4, 4)

            let shade = Game.getRandomIntInclusive(0, 2)
            switch (shade) {
                case 0: shade = 0xff0000; break
                case 1: shade = 0xff8800; break
                default: shade = 0xffff00; break
            }

            let dropletgeometry = new THREE.BoxGeometry(1, 1, 1)
            let dropletmaterial = new THREE.MeshBasicMaterial({
                color: shade,
                side: THREE.DoubleSide, // dwustronny
                opacity: 1, // stopień przezroczystości
            })


            let droplet = new THREE.Mesh(dropletgeometry, dropletmaterial)
            this.scene.add(droplet)
            droplet.name = "particle"
            droplet.position.y = 0
            droplet.position.x = position.x + randomSpreadX
            droplet.position.z = position.z + randomSpreadZ


            //move upwards
            new TWEEN.Tween(droplet.position) // co
                .to({
                    y: 15,
                }, 500) // do jakiej pozycji, w jakim czasie
                .repeat() // liczba powtórzeń
                .easing(TWEEN.Easing.Quartic.Out) // typ easingu (zmiana w czasie)
                .onUpdate(() => {
                    droplet.position.x += randomSpreadX / 20
                    droplet.position.z += randomSpreadZ / 20
                })
                .onComplete(() => { moveDownwards() }) // funkcja po zakończeniu animacji
                .start()

            function moveDownwards() {
                new TWEEN.Tween(droplet.position) // co
                    .to({
                        y: 0,
                    }, 500) // do jakiej pozycji, w jakim czasie
                    .repeat() // liczba powtórzeń
                    .easing(TWEEN.Easing.Quartic.In) // typ easingu (zmiana w czasie)
                    .onUpdate(() => {
                        droplet.position.x += randomSpreadX / 20
                        droplet.position.z += randomSpreadZ / 20
                    })
                    .onComplete(() => { window.game.scene.remove(droplet); droplet.geometry.dispose(); droplet.material.dispose() }) // funkcja po zakończeniu animacji
                    .start()
            }
            iteration += 1;
        }, 5);

    }


    waterAnimation(position) {

        let iteration = 0
        let amount = document.getElementById("explosion-amount").value

        setInterval(() => {
            if (iteration > amount) { return 0 }

            let randomSpreadX = Game.getRandomIntInclusive(-4, 4)
            let randomSpreadZ = Game.getRandomIntInclusive(-4, 4)

            let shade = Game.getRandomIntInclusive(0, 2)
            switch (shade) {
                case 0: shade = 0x0000ff; break
                case 1: shade = 0x0044ff; break
                default: shade = 0x00f88ff; break
            }

            let dropletgeometry = new THREE.BoxGeometry(1, 1, 1)
            let dropletmaterial = new THREE.MeshBasicMaterial({
                color: shade,
                side: THREE.DoubleSide, // dwustronny
                opacity: 1, // stopień przezroczystości
            })


            let droplet = new THREE.Mesh(dropletgeometry, dropletmaterial)
            this.scene.add(droplet)
            droplet.name = "particle"
            droplet.position.y = 0
            droplet.position.x = position.x + randomSpreadX
            droplet.position.z = position.z + randomSpreadZ




            //move upwards
            new TWEEN.Tween(droplet.position) // co
                .to({
                    y: 15,
                }, 500) // do jakiej pozycji, w jakim czasie
                .repeat() // liczba powtórzeń
                .easing(TWEEN.Easing.Quartic.Out) // typ easingu (zmiana w czasie)
                .onUpdate(() => {
                    droplet.position.x += randomSpreadX / 20
                    droplet.position.z += randomSpreadZ / 20
                })
                .onComplete(() => { moveDownwards() }) // funkcja po zakończeniu animacji
                .start()

            function moveDownwards() {
                new TWEEN.Tween(droplet.position) // co
                    .to({
                        y: 0,
                    }, 500) // do jakiej pozycji, w jakim czasie
                    .repeat() // liczba powtórzeń
                    .easing(TWEEN.Easing.Quartic.In) // typ easingu (zmiana w czasie)
                    .onUpdate(() => {
                        droplet.position.x += randomSpreadX / 20
                        droplet.position.z += randomSpreadZ / 20
                    })
                    .onComplete(() => { window.game.scene.remove(droplet); droplet.geometry.dispose(); droplet.material.dispose() }) // funkcja po zakończeniu animacji
                    .start()
            }
            iteration += 1;
        }, 5);

    }

    raycast(e) {
        if (this.gameIsAlive) {
            //place ships

            this.mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouseVector, this.camera);

            const intersects = this.raycaster.intersectObjects(this.scene.children);

            if (this.phase == "preparing") {

                if (intersects.length == 0 && this.selectedPawn != null && !this.isMoving && this.hasMove) {
                    //anim
                    this.selectedShip.deselect()
                    this.selectedShip = null
                    // this.tileList.forEach(element => {
                    //     element.highlight(false)
                    // })
                }

                if (intersects.length > 0) {
                    const obj = intersects[0].object;

                    //select / reselect pawn
                    if (obj instanceof Ship && obj != this.selectedShip && obj.isWhite == this.isWhite) {
                        if (this.selectedShip != null) {
                            this.selectedShip.deselect()
                        }

                        // select new piece
                        this.selectedShip = obj
                        obj.select();

                    }
                    //obrót
                    else if (obj instanceof Ship && obj == this.selectedShip && obj.isWhite == this.isWhite) {
                        console.log("MANUAL START ROTATION")
                        this.startRotation(obj)
                    }
                    //kliknięcie na planszę
                    else if (this.selectedShip != null && obj instanceof Tile &&
                        (this.isWhite ? obj.position.x > 0 : obj.position.x < 0)) {

                        console.log("place a ship")
                        let success = false

                        //base values
                        let originalpos = Game.FindOnGrid(this.selectedShip.position.x + (this.isWhite ? -50 : 50), this.selectedShip.position.z)
                        let newpos = Game.FindOnGrid(obj.position.x + (this.isWhite ? -50 : 50), obj.position.z)
                        let offsetX = 0
                        let offsetZ = 0

                        if (this.selectedShip.rotationValue == 0) {
                            offsetZ = 1
                        }
                        if (this.selectedShip.rotationValue == 1) {
                            offsetX = 1
                        }
                        if (this.selectedShip.rotationValue == 2) {
                            offsetZ = -1
                        }
                        if (this.selectedShip.rotationValue == 3) {
                            offsetX = -1
                        }

                        let oldtiles = []

                        //foreach length point check old tiles and make them temp
                        for (let i = 0; i < this.selectedShip.name; i++) {
                            if (this.isWhite) {
                                //if checking tiles fails
                                try {
                                    //new tile is not obstructed

                                    oldtiles.push(this.shipsWhite[newpos.x + offsetX * i][newpos.z + offsetZ * i]) //bring back data
                                    if (this.shipsWhite[newpos.x + offsetX * i][newpos.z + offsetZ * i] != 1 &&
                                        this.shipsWhite[newpos.x + offsetX * i][newpos.z + offsetZ * i] != undefined) {
                                        //temp values
                                        this.shipsWhite[newpos.x + offsetX * i][newpos.z + offsetZ * i] = 3
                                    } else {
                                        //close down
                                        console.log("error: cleaning old")
                                        for (let j = 0; j < i; j++) {
                                            this.shipsWhite[originalpos.x + offsetX * j][originalpos.z + offsetZ * j] = 0
                                        }
                                        break
                                    }


                                } catch {
                                    break
                                }

                            } else {
                                try {
                                    //new tile is not obstructed
                                    if (this.shipsBlack[newpos.x + offsetX * i][newpos.z + offsetZ * i] != 2 &&
                                        this.shipsBlack[newpos.x + offsetX * i][newpos.z + offsetZ * i] != undefined) {
                                        //temp values
                                        this.shipsBlack[newpos.x + offsetX * i][newpos.z + offsetZ * i] = 4
                                    } else {
                                        //close down
                                        console.log("error: cleaning old")
                                        for (let j = 0; j < i; j++) {
                                            this.shipsBlack[originalpos.x + offsetX * j][originalpos.z + offsetZ * j] = 0
                                        }
                                        break
                                    }


                                } catch {
                                    break
                                }
                            }

                            if (i + 1 === this.selectedShip.name) {
                                success = true
                                console.log("Success")
                            }
                        }
                        //check new tiles if oldcheck is true
                        if (success) {
                            for (let i = 0; i < this.selectedShip.name; i++) {
                                if (Game.CheckAdjacent({ x: newpos.x + offsetX * i, z: newpos.z + offsetZ * i }, this.isWhite, this.shipsWhite, this.shipsBlack, 1, 2)) {
                                    console.log("CHECK NEW TILES", true)
                                } else {
                                    success = false
                                }
                            }
                        }


                        if (success) {
                            try {
                                for (let j = 0; j < this.selectedShip.name; j++) {
                                    if (this.isWhite) {
                                        this.shipsWhite[originalpos.x + offsetX * j][originalpos.z + offsetZ * j] = 0
                                    } else {
                                        this.shipsBlack[originalpos.x + offsetX * j][originalpos.z + offsetZ * j] = 0
                                    }
                                }
                            } catch { }

                            //change temp to values
                            if (this.isWhite) {
                                this.shipsWhite.forEach((row, i) => {
                                    row.forEach((item, j) => {
                                        if (this.shipsWhite[i][j] == 3) {
                                            this.shipsWhite[i][j] = 1
                                        } else {
                                            //nothing?
                                        }
                                    })
                                })
                            } else {
                                this.shipsBlack.forEach((row, i) => {
                                    row.forEach((item, j) => {
                                        if (this.shipsBlack[i][j] == 4) {
                                            this.shipsBlack[i][j] = 2
                                        } else {
                                            //nothing?
                                        }
                                    })
                                })
                            }

                            //change ship position
                            this.selectedShip.position.x = obj.position.x
                            this.selectedShip.position.z = obj.position.z
                        } else {
                            console.log("bring back old data")
                            try {
                                if (this.isWhite) {
                                    for (let j = 0; j < this.selectedShip.name; j++) {
                                        if (this.shipsWhite[newpos.x + offsetX * j][newpos.z + offsetZ * j] == 3) {
                                            this.shipsWhite[newpos.x + offsetX * j][newpos.z + offsetZ * j] = 0
                                        }
                                    }
                                    for (let j = 0; j < this.selectedShip.name; j++) {
                                        this.shipsWhite[originalpos.x + offsetX * j][originalpos.z + offsetZ * j] = 1
                                    }
                                } else {
                                    for (let j = 0; j < this.selectedShip.name; j++) {
                                        if (this.shipsBlack[newpos.x + offsetX * j][newpos.z + offsetZ * j] == 4) {
                                            this.shipsBlack[newpos.x + offsetX * j][newpos.z + offsetZ * j] = 0
                                        }
                                    }
                                    for (let j = 0; j < this.selectedShip.name; j++) {
                                        this.shipsBlack[originalpos.x + offsetX * j][originalpos.z + offsetZ * j] = 2
                                    }
                                }
                            } catch { }
                        }

                    }

                    console.log("Table after move:")
                    console.log(this.isWhite ? this.shipsWhite : this.shipsBlack)

                    this.tilesHighlight()

                    if (this.validateFullTable()) {
                        this.myTableIsFinished = true
                    } else {
                        this.myTableIsFinished = false
                    }
                    window.ui.controlButton(this.myTableIsFinished)
                    console.log(this.myTableIsFinished)
                }

            }
            if (this.phase == "awaitGaming") {
                //you sent move && enemy has not sent it yet
                //really almost nothing happens here
            }
            if (this.phase == "gaming") {
                if (intersects.length > 0) {
                    const obj = intersects[0].object;
                    //shot
                    if (this.hasMove) {
                        if (this.selectedShip != null && obj instanceof Tile &&
                            (this.isWhite ? obj.position.x < 0 : obj.position.x > 0)) {

                            this.shotsFired += 1

                            //shoot enemy board
                            this.hasMove = false
                            window.net.shoot({ x: obj.position.x, z: obj.position.z })
                            let tilepos = Game.FindOnGrid(obj.position.x + (this.isWhite ? 50 : -50), obj.position.z)
                                console.log(tilepos)
                            //animation (bomb)
                            let projectile = new Shot({ x: obj.position.x, z: obj.position.z })
                            this.scene.add(projectile)
                            projectile.fall()

                            console.log(tilepos, this.shipsWhite, this.shipsBlack)
                            if (this.isWhite) {
                                if (this.shipsBlack[tilepos.x][tilepos.z] == 2) {
                                    this.shotsHit += 1
                                    this.shipsBlack[tilepos.x][tilepos.z] = 6
                                    setTimeout(() => { this.fireAnimation({ x: obj.position.x, z: obj.position.z }) }, 1200)
                                    setTimeout(() => { this.hitAnimation({ x: obj.position.x, z: obj.position.z }) }, 1200)
                                    //hit = fire animation
                                } else {
                                    //miss = animation (short)
                                    setTimeout(() => { this.waterAnimation({ x: obj.position.x, z: obj.position.z }) }, 1200)
                                }
                            } else {
                                if (this.shipsWhite[tilepos.x][tilepos.z] == 1) {
                                    this.shotsHit += 1
                                    this.shipsWhite[tilepos.x][tilepos.z] = 5
                                    setTimeout(() => { this.fireAnimation({ x: obj.position.x, z: obj.position.z }) }, 1200)
                                    setTimeout(() => { this.hitAnimation({ x: obj.position.x, z: obj.position.z }) }, 1200)
                                    //hit = fire animation
                                } else {
                                    //miss = animaton (short)

                                    setTimeout(() => { this.waterAnimation({ x: obj.position.x, z: obj.position.z }) }, 1200)
                                }
                            }
                            this.tilesHighlight()
                        }
                        
                        if(!this.isWhite){
                            this.shipsDataWhite.forEach((element, i) => {
                                let initialpos = element[0]
                                let processedpos = Game.FindOnGrid(initialpos[0] + (!this.isWhite? -50 : 50), initialpos[1])
                                let rotation = element[1]
                                let length = element[2]

                                let shotoffsetX = 0
                                let shotoffsetZ = 0

                                if (rotation == 0) {
                                    shotoffsetZ = 1
                                }
                                if (rotation == 1) {
                                    shotoffsetX = 1
                                }
                                if (rotation == 2) {
                                    shotoffsetZ = -1
                                }
                                if (rotation == 3) {
                                    shotoffsetX = -1
                                }

                                let success = true

                                //all tiles shot
                                for(let i = 0; i < length; i++){
                                    if(this.shipsWhite[processedpos.x + i * shotoffsetX][processedpos.z + i * shotoffsetZ] != "5"){
                                        success = false
                                        break
                                    }else{
                                        success = true
                                    }
                                }
                                console.log("succes \n\n\n\n\n\n",success)

                                if(success){
                                    console.log("DETECTED SHOT SHIP")
                                    for(let i = 0; i < length; i++){
                                        this.shipsWhite[processedpos.x + i * shotoffsetX][processedpos.z + i * shotoffsetZ] = 7      
                                    }
                                    this.playSinkAnimation(processedpos, rotation, length, this.whiteColor)
                                }

                            })
                        }else{
                            this.shipsDataBlack.forEach((element, i) => {
                                let initialpos = element[0]
                                let processedpos = Game.FindOnGrid(initialpos[0] + (!this.isWhite? -50 : 50), initialpos[1])
                                let rotation = element[1]
                                let length = element[2]

                                let shotoffsetX = 0
                                let shotoffsetZ = 0

                                if (rotation == 0) {
                                    shotoffsetZ = 1
                                }
                                if (rotation == 1) {
                                    shotoffsetX = 1
                                }
                                if (rotation == 2) {
                                    shotoffsetZ = -1
                                }
                                if (rotation == 3) {
                                    shotoffsetX = -1
                                }

                                //all tiles shot
                                let success = true

                                for(let i = 0; i < length; i++){
                                    if(this.shipsBlack[processedpos.x + i * shotoffsetX][processedpos.z + i * shotoffsetZ] != "6"){
                                        success = false
                                        break
                                    }else{
                                        success = true
                                    }
                                }
                                console.log("succes \n\n\n\n\n\n", success)

                                if(success){
                                    console.log("DETECTED SHOT SHIP")
                                    for(let i = 0; i < length; i++){
                                        this.shipsBlack[processedpos.x + i * shotoffsetX][processedpos.z + i * shotoffsetZ] = 8      
                                    }
                                    this.playSinkAnimation(processedpos, rotation, length, this.blackColor)
                                }

                            })
                        }

                        let gameEnded = true

                        if (!this.isWhite) {
                            this.shipsWhite.forEach((row) => {
                                if (row.includes(1)) gameEnded = false; return
                            })
                        } else {
                            this.shipsBlack.forEach((row) => {
                                if (row.includes(2)) gameEnded = false; return
                            })
                        }

                        console.log("End of game:", gameEnded)
                        if (gameEnded) {
                            window.game.phase = "end"
                            window.net.addLeaderboard(1, 0, this.shotsFired, this.shotsHit)
                            this.isWinner = true
                            window.ui.gameEnded(true)

                            if (this.isWhite) {
                                this.tileListWhite.forEach((row, i) => {
                                    row.forEach((element, j) => {
                                        if (element.name == "allied") {
                                            element.playFireworks(this.whiteColor, element.position)
                                        }
                                    })
                                })
                            } else {
                                this.tileListBlack.forEach((row, i) => {
                                    row.forEach((element, j) => {
                                        if (element.name == "allied") {
                                            element.playFireworks(this.blackColor, element.position)
                                        }
                                    })
                                })
                            }

                        }

                    } else {
                        console.log("no clickin")
                    }

                }

            }



            if (this.phase == "end") {

            }
        }
    }

    enemyShot(position) {
        let tilepos = Game.FindOnGrid(position.x + (this.isWhite ? -50 : 50), position.z)

        console.log("received move", tilepos)

        //animation (bomb)
        let projectile = new Shot(position)
        this.scene.add(projectile)
        projectile.fall()

        if (this.isWhite) {
            console.log(this.shipsWhite[tilepos.x][tilepos.z])
            if (this.shipsWhite[tilepos.x][tilepos.z] == 1) {
                this.shipsWhite[tilepos.x][tilepos.z] = 5
                setTimeout(() => { this.fireAnimation({ x: position.x, z: position.z }); this.tilesHighlight() }, 1200)
                setTimeout(() => { this.hitAnimation({ x: position.x, z: position.z }) }, 1200)
            } else if (this.shipsWhite[tilepos.x][tilepos.z] == 0) {
                setTimeout(() => { this.waterAnimation(position) }, 1200)
            }
        } else {
            if (this.shipsBlack[tilepos.x][tilepos.z] == 2) {
                this.shipsBlack[tilepos.x][tilepos.z] = 6
                setTimeout(() => { this.fireAnimation({ x: position.x, z: position.z }); this.tilesHighlight() }, 1200)
                setTimeout(() => { this.hitAnimation({ x: position.x, z: position.z }) }, 1200)
            } else if (this.shipsBlack[tilepos.x][tilepos.z] == 0) {
                setTimeout(() => { this.waterAnimation(position) }, 1200)
            }
        }
        let gameEnded = true

        if (this.isWhite) {
            this.shipsWhite.forEach((row) => {
                if (row.includes(1)) gameEnded = false; return
            })
        } else {
            this.shipsBlack.forEach((row) => {
                if (row.includes(2)) gameEnded = false; return
            })
        }

        console.log("End of game:", gameEnded)
        if (gameEnded) {

            if (!this.isWhite) {
                this.tileListWhite.forEach((row, i) => {
                    row.forEach((element, j) => {
                        if (element.name == "allied") {
                            element.playFireworks(this.whiteColor, element.position)
                        }
                    })
                })
            } else {
                this.tileListBlack.forEach((row, i) => {
                    row.forEach((element, j) => {
                        if (element.name == "allied") {
                            element.playFireworks(this.blackColor, element.position)
                        }
                    })
                })
            }

            window.game.phase = "end"
            window.net.addLeaderboard(0, 1, this.shotsFired, this.shotsHit)
            this.isWinner = false
            window.ui.gameEnded(false)
        }



    }

    static getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getStartingColour() {
        let colour = Game.getRandomIntInclusive(1, 9)
        switch (colour) {
            case 1:
                return 0x0033ff
            case 2:
                return 0x0044ff
            case 3:
                return 0x0055ff
            case 4:
                return 0x0066ff
            case 5:
                return 0x0077ff
            case 6:
                return 0x0088ff
            case 7:
                return 0x0099ff
            case 8:
                return 0x00aaff
            case 9:
                return 0x00ccff
        }
    }

    static FindOnGrid(x, z) {
        return {
            x: (35 + x) / 10,
            z: (35 - z) / 10,
        }
    }

    static GetPosition(x, z) {
        return {
            x: (x - 3.5) * 10,
            z: (3.5 - z) * 10,
        }
    }
    static massCheck(isWhite, shipsWhite, shipsBlack) {

        let successresult = true

        if (isWhite) {
            shipsWhite.forEach((element, i) => {
                element.forEach((ship, j) => {
                    if (shipsWhite[i][j] == 3) {
                        if (this.CheckAdjacent({ x: i, z: j }, isWhite, shipsWhite, shipsBlack, 1, 2) == false) {
                            successresult = false
                        }
                    }
                })
            });
        } else {
            shipsBlack.forEach((element, i) => {
                element.forEach((ship, j) => {
                    if (shipsBlack[i][j] == 4) {
                        if (this.CheckAdjacent({ x: i, z: j }, isWhite, shipsWhite, shipsBlack, 1, 2) == false) {
                            successresult = false
                        }
                    }
                })
            });
        }

        console.log("Mass check result:", successresult)
        return successresult
    }

    static CheckAdjacent(tablewrite, isWhite, shipsWhite, shipsBlack, whiteIndicator, blackIndicator) {
        //modify for border tiles

        //ommiters
        let Xvalue = 0
        let Zvalue = 0

        console.log(tablewrite)
        //border x (pion) if any == true ommit any at check
        if (tablewrite.x >= 7) {
            Xvalue = 1
        }
        if (tablewrite.x <= 0) {
            Xvalue = -1
        }

        //border y (poziom)
        if (tablewrite.z >= 7) {
            Zvalue = 1
        }
        if (tablewrite.z <= 0) {
            Zvalue = -1
        }

        console.log("Omitting offset", Xvalue, Zvalue)

        console.log("adjacents spaces:")
        try {
            console.log(shipsWhite[tablewrite.x + 1][tablewrite.z],
                shipsWhite[tablewrite.x][tablewrite.z + 1],
                shipsWhite[tablewrite.x - 1][tablewrite.z],
                shipsWhite[tablewrite.x][tablewrite.z - 1])
        } catch { }


        let endresult = true

        try {

            if (isWhite) {

                if (Xvalue != 1) {
                    if (shipsWhite[tablewrite.x + 1][tablewrite.z] == whiteIndicator) {
                        endresult = false
                    }
                }
                if (Xvalue != -1) {
                    if (shipsWhite[tablewrite.x - 1][tablewrite.z] == whiteIndicator) {
                        endresult = false
                    }
                }
                if (Zvalue != 1) {
                    if (shipsWhite[tablewrite.x][tablewrite.z + 1] == whiteIndicator) {
                        endresult = false
                    }
                }
                if (Zvalue != -1) {
                    if (shipsWhite[tablewrite.x][tablewrite.z - 1] == whiteIndicator) {
                        endresult = false
                    }
                }
            }
            else {
                if (Xvalue != 1) {
                    if (shipsBlack[tablewrite.x + 1][tablewrite.z] == blackIndicator) {
                        endresult = false
                    }
                }
                if (Xvalue != -1) {
                    if (shipsBlack[tablewrite.x - 1][tablewrite.z] == blackIndicator) {
                        endresult = false
                    }
                }
                if (Zvalue != 1) {
                    if (shipsBlack[tablewrite.x][tablewrite.z + 1] == blackIndicator) {
                        endresult = false
                    }
                }
                if (Zvalue != -1) {
                    if (shipsBlack[tablewrite.x][tablewrite.z - 1] == blackIndicator) {
                        endresult = false
                    }
                }

            }

        } catch { endresult = false }

        if (endresult) {
            //checked all adjacent tiles (empty)
            console.log("checked correctly - CheckAdjacent")
            return (true)
        }
        else {
            console.log("failed check - CheckAdjacent")
            return (false)
        }
    }
}

export default Game