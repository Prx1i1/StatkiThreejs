class UI {
    constructor() {
        window.addEventListener("visibilitychange", (e) => {
            console.log("left page")
            window.game.killparticles()
        })
        window.addEventListener("resize", (e) => {
            window.game.resize()
        }, false);

        window.addEventListener("mousedown", (e) => {
            window.game.raycast(e);
        });

        window.addEventListener("keydown", (e) => {
            return "there is no check there gork, dont do bad code"
            console.log(e)
            if (e.key != "Enter") return "lol"

            if (document.getElementById("login-input").value == "") return document.getElementById("login-errors").innerHTML = "nickname can't be empty"


            let colorglobal = 0
            let onlogin = (name, color) => {
                colorglobal = color
                console.log(document.getElementById("user-color").value)
                if (color == 0) {
                    window.game.whiteColor = document.getElementById("user-color").value
                }
                else {
                    window.game.blackColor = document.getElementById("user-color").value
                }

                document.getElementById("login-holder").style.visibility = "hidden";
                document.getElementById("customization").style.visibility = "hidden";
                document.getElementById("leaderboard").style.visibility = "hidden";

                if (color == 0) {
                    document.getElementById("display").innerHTML = "Awaiting second player...";
                }
                window.ui.getLogins(colorglobal)
            }
            window.net.login(onlogin)
        })

        document.getElementById("login-play-btn").onclick = () => {

            if (document.getElementById("login-input").value == "") {

                return document.getElementById("login-errors").innerHTML = "nickname can't be empty"
            }

            let colorglobal = 0
            let onlogin = (name, color) => {
                colorglobal = color
                console.log(document.getElementById("user-color").value)
                if (color == 0) {
                    window.game.whiteColor = document.getElementById("user-color").value
                }
                else {
                    window.game.blackColor = document.getElementById("user-color").value
                }

                document.getElementById("login-holder").style.visibility = "hidden";
                document.getElementById("customization").style.visibility = "hidden";
                document.getElementById("leaderboard").style.visibility = "hidden";

                if (color == 0) {
                    document.getElementById("display").innerHTML = "Awaiting second player...";
                }
                window.ui.getLogins(colorglobal)
            }
            window.net.login(onlogin)
        }

        document.getElementById("login-reset-btn").onclick = () => {
            console.log("resetting")
            window.net.reset()
        }

        //when table is correct
        document.getElementById("confirm").setAttribute("disabled", true)

        document.getElementById("random-color").onclick = () => {
            let randomColor = Math.floor(Math.random() * 16777215).toString(16)
            console.log("#" + randomColor)
            if(randomColor.length < 6){
                randomColor = Math.floor(Math.random() * 16777215).toString(16)
            }
            document.getElementById("user-color").value = "#" + randomColor
        }

        document.getElementById("confirm").onclick = () => {
            console.log("sending ships")
            window.game.makeSink()
            window.net.sendShips()
            
            window.game.phase = "awaitGaming"
            document.getElementById("confirm").style.visibility = "hidden"

            //banner mid
            document.getElementById("display").innerHTML = "Awaiting second player...";
            document.getElementById("display").style.visibility = "visible"
            document.getElementById("display").style.display = "block"

        }

        this.loader()

    }

    connectButtons() {
        // document.getElementById("sortNickname").onclick = () => {
        //     window.game.sortparameter = "nickname"
        //     this.loader()
        // }
        document.getElementById("sortWins").onclick = () => {
            if(window.game.sortparameter == "wins"){window.game.sortreverse = !window.game.sortreverse
            }else{ window.game.sortparameter = "wins"
                   window.game.sortparameter2 = "loses"}
            
            this.loader()
        }
        document.getElementById("sortAccuracy").onclick = () => {
            if(window.game.sortparameter == "accuracy"){window.game.sortreverse = !window.game.sortreverse
            }else{ window.game.sortparameter = "accuracy"}
            
            this.loader()
        }
        
    }

    loader() {
        let sortparameter = window.game.sortparameter
        let sortparameter2 = window.game.sortparameter2
        let sortreverse = window.game.sortreverse
        //load leaderboard
        console.log("loaded leaderboard")
        window.net.getLeaderboard(sortparameter, sortparameter2, sortreverse)
    }

    updateTable() {
        // document.getElementById("debug").innerHTML = window.game.shipLengths.map(r => r.map(i => i == 0 ? ` ${i} `
        //     : i == 1 ? `<span class="white"> ${i} </span>`
        //         : `<span class="black"> ${i} </span>`).join('')).join("</br>");
    }
    updateTimer(time) {
        return "xd"
        if (window.game.phase == "gaming") {
            document.getElementById("timer").innerHTML = "Time left: " + (30 - time)
        } else {
            document.getElementById("timer").innerHTML = ""
        }
    }
    updateTurns(player) {
        if (window.game.phase == "gaming") {
            document.getElementById("currentturn").innerHTML = window.game.isWhite ? (player ? "Now its your turn!" : "Enemy turn") : (!player ? "Now its your turn!" : "Enemy turn")
        } else {
            document.getElementById("currentturn").innerHTML = ""
        }
    }

    gameEnded(isWinner) {
        document.getElementById("display").innerHTML = `You ${isWinner ? "won!" : "lost!"}<button style="margin:auto" id="fullreset" class="btn">Play Again</button>`;
        document.getElementById("display").style.visibility = "visible"
        document.getElementById("display").style.display = "block"
        this.loader()
        document.getElementById("leaderboard").style.visibility = "hidden";
        document.getElementById("fullreset").onclick = () => {
            window.net.reset()
            window.location.reload()
        }
    }


    controlButton(parameter) {
        parameter ?
            document.getElementById("confirm").removeAttribute("disabled") :
            document.getElementById("confirm").setAttribute("disabled", true)
    }
    getLogins(color) {

        fetch("/getlogins", { method: "post" }).then(response => response.json()).then(
            data => { document.getElementById("status").innerHTML = "Your nickname: " + (data.login[color].name); console.log(data) }
        )

    }
    startgame() {
        document.getElementById("display").style.visibility = "hidden"
        document.getElementById("display").style.display = "none"
    }
}

export default UI