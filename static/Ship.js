class Ship extends THREE.Mesh {

    // static shipGeometry = new THREE.CylinderGeometry(5, 5, 2, 24);

    constructor(white, color, length, rotation, creator) {

        let shipWhite = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide, // dwustronny
            map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
            opacity: 1, // stopień przezroczystości

        })

        let shipBlack = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide, // dwustronny
            map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
            opacity: 1, // stopień przezroczystości

        })
        //let sus2 = new THREE.CapsuleGeometry()
        //let shipGeometry = new THREE.CapsuleGeometry(5, 10 * length - 5, 10, 10)
        let shipGeometry = new THREE.BoxGeometry(5, 5, 10 * length - 5)
        //let shipGeometry = new THREE.CapsuleGeometry(5, 10 * length - 5, 5)
        //let shipGeometry = new THREE.CapsuleGeometry(5, 10 * length - 5, 10, 10);
        //let shipGeometry = new THREE.CylinderGeometry(5, 5, 10 * length - 5, 200, 20);



        super(shipGeometry, white ? shipWhite : shipBlack) // wywołanie konstruktora klasy z której dziedziczymy czyli z Meshas

        this.geometry.translate(0, 0, -5 * (length - 1));

        this.color = color
        this.isWhite = white
        this.rotationValue = rotation
        this.lengthValue = length

        this.game = creator
        console.log("Created Ship.")
    }

    rotate() {
        this.rotationValue += 1
        this.rotationValue = this.rotationValue % 4
        //this.geometry = new THREE.BoxGeometry(this.rotationValue % 2 == 1 ? 10 * this.lengthValue - 5 : 5, 5, this.rotationValue % 2 == 0 ? 10 * this.lengthValue - 5 : 5)
        this.rotateY(-Math.PI / 2);
    }

    select() {
        this.material.color.setHex(0xffff00)

        new TWEEN.Tween(this.position) // co
            .to({
                y: 5
            }, 300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => { }) // funkcja po zakończeniu animacji
            .start()
    }

    deselect() {
        console.log(this.color)
        this.material.color.set(this.color)

        new TWEEN.Tween(this.position) // co
            .to({
                y: 0,
            }, 300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => { }) // funkcja po zakończeniu animacji
            .start()
    }
}

export default Ship