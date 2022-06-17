class Tile extends THREE.Mesh {

    static boardAllied = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide, // dwustronny
        map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
        opacity: 1, // stopień przezroczystości

    })
    static boardDefault = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        side: THREE.DoubleSide, // dwustronny
        map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
        opacity: 1, // stopień przezroczystości

    })
    static boardShot = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide, // dwustronny
        map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
        opacity: 1, // stopień przezroczystości

    })

    static tileGeometry = new THREE.BoxGeometry(10, 2, 10);

    static getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    constructor(basecolour) {
        super(Tile.tileGeometry, Tile.boardDefault) // wywołanie konstruktora klasy z której dziedziczymy czyli z Meshas
        this.basecolour = basecolour

        this.newboardDefault = new THREE.MeshBasicMaterial({
            color: this.basecolour,
            side: THREE.DoubleSide, // dwustronny
            map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
            opacity: 1, // stopień przezroczystości

        })
        this.material = this.newboardDefault


        this.isHighlighted = false
        console.log("Created Tile.")

        // this.add(
        //     new THREE.LineSegments(
        //         Tile.tileGeometry,
        //         new THREE.LineBasicMaterial({
        //             color: 'red',
        //             transparent: false,
        //             opacity: 0.5
        //         })
        //     )
        //   );

    }

    highlight(state) {
        this.name = state
        switch (state) {
            case "allied": this.material = Tile.boardAllied; break
            case "shot": this.material = Tile.boardShot; break
            default: this.material = this.newboardDefault; break
        }
    }

    //sparkly borders (prototype)
    sparkle(state) {
        if (state == "disabled") {
            //return 0
        }
        setInterval(() => {

            let randomSpreadX = Tile.getRandomIntInclusive(-5, 5)
            let randomSpreadZ = Tile.getRandomIntInclusive(-5, 5)

            let randomSide = Tile.getRandomIntInclusive(0, 3)
            if (randomSide == 0) {
                randomSpreadZ = -5
            }
            if (randomSide == 2) {
                randomSpreadZ = 5
            }
            if (randomSide == 1) {
                randomSpreadX = -5
            }
            if (randomSide == 3) {
                randomSpreadX = 5
            }

            let shade = Tile.getRandomIntInclusive(0, 2)
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
            window.game.scene.add(droplet)
            droplet.position.y = 0
            droplet.position.x = this.position.x + randomSpreadX
            droplet.position.z = this.position.z + randomSpreadZ

            droplet.name = "particle"

            new TWEEN.Tween(droplet.position) // co
                .to({
                    y: 1,
                }, 250) // do jakiej pozycji, w jakim czasie
                .repeat() // liczba powtórzeń
                .easing(TWEEN.Easing.Quartic.Out) // typ easingu (zmiana w czasie)
                .onUpdate(() => {
                })
                .onComplete(() => { moveDownwards() }) // funkcja po zakończeniu animacji
                .start()

            function moveDownwards() {
                new TWEEN.Tween(droplet.position) // co
                    .to({
                        y: 0,
                    }, 250) // do jakiej pozycji, w jakim czasie
                    .repeat() // liczba powtórzeń
                    .easing(TWEEN.Easing.Quartic.In) // typ easingu (zmiana w czasie)
                    .onUpdate(() => {
                    })
                    .onComplete(() => { window.game.scene.remove(droplet); droplet.geometry.dispose(); droplet.material.dispose() }) // funkcja po zakończeniu animacji
                    .start()
            }


        }, Tile.getRandomIntInclusive(document.getElementById("sparkling-select").value, document.getElementById("sparkling-select").value * 3));
    }

    fireworkParticles(position){

        let amount = document.getElementById("explosion-amount").value
        let iteration = 0

        while(iteration < amount){

        //small think cube
        let randomSpreadX = Tile.getRandomIntInclusive(-100, 100) / 100 
        let randomSpreadY = Tile.getRandomIntInclusive(-100, 100) / 100
        let randomSpreadZ = Tile.getRandomIntInclusive(-100, 100) / 100

        //large cube
        let destinationX = randomSpreadX * 20
        let destinationY = randomSpreadY * 20
        let destinationZ = randomSpreadZ * 20

        let randomsparkColor = Math.floor(Math.random() * 16777215).toString(16)
        while(randomsparkColor.length < 6){
            randomsparkColor += "0"
        }

        let fireworksparkmaterial = new THREE.MeshBasicMaterial({
            color: "#" + randomsparkColor,
            side: THREE.DoubleSide, // dwustronny
            opacity: 1, // stopień przezroczystości
        })

        let fireworksparkgeometry = new THREE.BoxGeometry(1,1,1)

        let fireworkspark = new THREE.Mesh(fireworksparkgeometry, fireworksparkmaterial)
        fireworkspark.position.x = position.x + randomSpreadX
        fireworkspark.position.y = position.y + randomSpreadY
        fireworkspark.position.z = position.z + randomSpreadZ

        fireworkspark.name = "particle"

        window.game.scene.add(fireworkspark)

        new TWEEN.Tween(fireworkspark.position).to({
            x: position.x + destinationX,
            y: position.y + destinationY,
            z: position.z + destinationZ
        }, 1000) // do jakiej pozycji, w jakim czasie
        .repeat() // liczba powtórzeń
        .easing(TWEEN.Easing.Quartic.Out) // typ easingu (zmiana w czasie)
        .onUpdate(() => { })
        .onComplete(() => {window.game.scene.remove(fireworkspark)}) // funkcja po zakończeniu animacji
        .start()

        iteration += 1

        }
    }

    playFireworks(rocketcolor, position){
        let randomtime = Tile.getRandomIntInclusive(3000, 5000)
        setInterval(() => {

            let fireworkmaterial = new THREE.MeshBasicMaterial({
                color: rocketcolor,
                side: THREE.DoubleSide, // dwustronny
                opacity: 1, // stopień przezroczystości
            })
            let fireworkgeometry = new THREE.CylinderGeometry(1, 1, 4, 8, 2)
            let firework = new THREE.Mesh(fireworkgeometry, fireworkmaterial)

            firework.position.x = position.x
            firework.position.z = position.z
            firework.position.y = 0

            firework.name = "particle"

            window.game.scene.add(firework)

            new TWEEN.Tween(firework.position) // co
            .to({
                y: 50,
            }, 250) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Quartic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => {this.fireworkParticles(firework.position); window.game.scene.remove(firework)}) // funkcja po zakończeniu animacji
            .start()

        }, randomtime);

    }


}

export default Tile