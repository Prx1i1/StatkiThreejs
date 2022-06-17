class Shot extends THREE.Mesh {

    static getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static material = new THREE.MeshBasicMaterial({
        color: 0x333333,
        side: THREE.DoubleSide, // dwustronny
        map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
        opacity: 1, // stopień przezroczystości

    })
    static geometry = new THREE.CylinderGeometry(3, 3, 10)
    constructor(position) {
        super(Shot.geometry, Shot.material)
        this.position.x = position.x
        this.position.z = position.z
        this.position.y = 500
    }
    fall() {
        let LineBasicMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000
        });
        let points = []
        points.push(new THREE.Vector3(this.position.x, 100, this.position.z));
        points.push(new THREE.Vector3(this.position.x, 0, this.position.z));

        let LineBasicGeometry = new THREE.BufferGeometry().setFromPoints(points);

        let laserpointer = new THREE.Line(LineBasicGeometry, LineBasicMaterial)
        // laserpointer.position.x = this.position.x
        // laserpointer.position.z = this.position.x
        window.game.scene.add(laserpointer)

        new TWEEN.Tween(this.position) // co
            .to({
                x: this.position.x,
                y: 0,
                z: this.position.z
            }, 1300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Linear.None) // typ easingu (zmiana w czasie)
            .onUpdate(() => { this.firetrail() })
            .onComplete(() => {
                window.game.scene.remove(this); this.geometry.dispose(); this.material.dispose();
                window.game.scene.remove(laserpointer); laserpointer.geometry.dispose(); laserpointer.material.dispose()
            }) // funkcja po zakończeniu animacji
            .start()
    }
    firetrail() {

        let shade = Shot.getRandomIntInclusive(0, 2)
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
        window.game.scene.add(ember)
        ember.name = "particle"
        ember.position.y = this.position.y
        ember.position.x = this.position.x + Shot.getRandomIntInclusive(-1, 1)
        ember.position.z = this.position.z + Shot.getRandomIntInclusive(-1, 1)

        new TWEEN.Tween(ember.position) // co
            .to({
                y: 15,
            }, 1500) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Linear.None) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => { window.game.scene.remove(ember); ember.geometry.dispose(); ember.material.dispose() }) // funkcja po zakończeniu animacji
            .start()
    }
}
export default Shot