class Pawn extends THREE.Mesh {

    static pawnGeometry = new THREE.CylinderGeometry(5, 5, 2, 24);

    constructor(white, creator) {
        let pawnWhite = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide, // dwustronny
            map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
            opacity: 1, // stopień przezroczystości

        })

        let pawnBlack = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide, // dwustronny
            map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
            opacity: 1, // stopień przezroczystości

        })

        super(Pawn.pawnGeometry, white ? pawnWhite : pawnBlack) // wywołanie konstruktora klasy z której dziedziczymy czyli z Meshas
        this.isWhite = white
        this.isPromoted = false
        this.game = creator
        console.log("Created Pawn.")
    }

    select() {
        this.material.color.setHex(0xffff00)

        new TWEEN.Tween(this.position) // co
            .to({
                x: this.position.x,
                y: 5,
                z: this.position.z
            }, 300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => {this.game.isMoving = false}) // funkcja po zakończeniu animacji
            .start()
    }

    deselect() {
        this.material.color.setHex(this.isWhite ? 0xffffff : 0xff0000)

        new TWEEN.Tween(this.position) // co
            .to({
                x: this.position.x,
                y: 0,
                z: this.position.z
            }, 300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => {this.game.isMoving = false}) // funkcja po zakończeniu animacji
            .start()
    }

    moveTo(pos, taking) {
        let original = {x: this.position.x, z: this.position.z}
        console.log("moving across")
        new TWEEN.Tween(this.position) // co
            .to({
                x: pos.x,
                z: pos.z
            }, 300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => {
                window.game.isMoving = false
                this.deselect();
                console.log("moving across finished, moved to:")
                if(taking){
                    window.game.pawnsObjTable.forEach(element => {
                        if(element.position.x == ((original.x + pos.x) /2) && element.position.z == ((original.z + pos.z) /2)){
                            console.log("REMOVE THE PAWN")
                            element.geometry.dispose()
                            element.material.dispose()
                            window.game.scene.remove(element)
                        }
                    });
                }
                window.game.pawnsObjTable.forEach(element => {
                    if(element.position.x == original.x && element.position.z == original.z){
                        element.position.x = pos.x
                        element.position.z = pos.z
                    }
                })

            }) // funkcja po zakończeniu animacji
            .start()
    }

    fullMove(pos, taking) {
        console.log("moving up (start)")
        new TWEEN.Tween(this.position) // co
            .to({
                x: this.position.x,
                y: 5,
                z: this.position.z
            }, 300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => this.moveTo(pos,taking)) // funkcja po zakończeniu animacji
            .start()
    }
}

export default Pawn