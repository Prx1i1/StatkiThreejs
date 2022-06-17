class Net {
    constructor() {
        this.playerWhiteLoggedIn = false;
        this.playerBlackLoggedIn = false;

        this.intervalid = 0;
    }

    getLeaderboard(sortparameter, sortparameter2, sortreverse) {
        const login = document.getElementById("login-input").value
        const body = JSON.stringify({ login: login })
        const headers = { "Content-Type": "application/json" }

        fetch("/getLeaderboard", { method: "post", body, headers }).then(response => response.json()).then(data => {

            if(sortparameter == "wins"){
                sortparameter = "wr"
            }


            data.forEach((element) => {
                element.wr = (element.wins / element.loses == 0 ? 1 : element.loses) * 100
                element.accuracy = (element.shotshit / (element.shotsfired == 0 ? 1 : element.shotsfired)) * 100
            })

            const sort_by = (field, field2, reverse, primer) => {

                const key = primer ?
                    function (x) {
                        return primer(x[field])
                    } :
                    function (x) {
                        return x[field]
                    };

                reverse = !reverse ? 1 : -1;

                return function (a, b) {
                    return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
                }
            }

            console.log("=-=-=-=-=-=-=-\n\n")
            console.log(data)
            let format = parseFloat
            if (sortparameter == "nickname") {
                format = toString
            }

            data = data.sort(sort_by(sortparameter, sortparameter2, sortreverse, format));
            console.log(data)

            document.getElementById("players-table").innerHTML = "<tr><th>Nr.</th><th id='sortNickname'>Nickname</th><th id='sortWins'>W/L</th><th id='sortAccuracy'>Accuracy</th></tr>"
            let rowname = ""
            let rowwins = ""
            let rowaccuracy = ""
            let rownumber = 0

            console.log("writing leaderboard", data)
            data.forEach((item, i) => {

                rowname = document.createElement("td")
                rowname.innerText = (item.nickname)
                rowwins = document.createElement("td")
                rowwins.innerText = (item.wins + "/" + item.loses)
                rowaccuracy = document.createElement('td')
                rowaccuracy.innerText = (Math.floor(item.shotshit / item.shotsfired * 100) + "%")
                rownumber = document.createElement("td")
                rownumber.innerText = (i + 1)

                let row = document.createElement("tr");
                row.appendChild(rownumber)
                row.appendChild(rowname)
                row.appendChild(rowwins)
                row.appendChild(rowaccuracy)
                document.getElementById("players-table").appendChild(row)
            });
            if (data.length >= 15) {
                document.getElementById("leaderboard").style["overflow-y"] = "scroll";
            }

            window.ui.connectButtons()

        })
    }

    addLeaderboard(win, lose, shotsfired, shotshit) {
        let body = {
            nickname: document.getElementById("login-input").value,
            wins: win,
            loses: lose,
            shotsfired: shotsfired,
            shotshit: shotshit
        }
        body = JSON.stringify(body)
        const headers = { "Content-Type": "application/json" }

        fetch("/addLeaderboard", { method: "post", body, headers }).then(
            window.ui.gameEnded(window.game.isWinner)
        )
    }

    login(onLogin) {
        const login = document.getElementById("login-input").value
        fetch("/timereset", { method: "post" }).then(response => response.json())
        console.log("login");

        if (login != "") {
            const body = JSON.stringify({ login: login })

            const headers = { "Content-Type": "application/json" }

            fetch("/login", { method: "post", body, headers })
                .then(response => response.json())
                .then(
                    data => {
                        if (data.isPlayer) {
                            onLogin(login, data.color)
                            window.game.isWhite = data.color == 0
                            document.getElementById("login-errors").innerHTML = ""
                        } else {
                            switch (data.error) {
                                case 0:
                                    document.getElementById("login-errors").innerHTML = "two players already in game"
                                    break;
                                case 1:
                                    document.getElementById("login-errors").innerHTML = "user with that name is already in the game"
                                    break;
                                default:
                                    document.getElementById("login-errors").innerHTML = "unknown error"
                            }
                        }
                    }
                )
        }

        clearInterval(this.intervalid)
        this.intervalid = setInterval(this.update, 1000);
    }

    shoot(position) {
        fetch("/timereset", { method: "post" })

        const body = JSON.stringify({
            isWhite: window.game.isWhite,
            position: position
        })

        const headers = { "Content-Type": "application/json" }

        fetch("/shoot", { method: "post", body, headers })
            .then(response => response.json())
            .then(data => {

            }
            )
    }

    update() {
        let body = null

        if (!window.game.isPlaying) {
            body = JSON.stringify({
                isPlaying: window.game.isPlaying,
                isWhite: window.game.isWhite,
            })
        }
        else {
            body = JSON.stringify({
                isPlaying: window.game.isPlaying,
                isWhite: window.game.isWhite,
            })
        }


        const headers = { "Content-Type": "application/json" }

        fetch("/update", { method: "post", body, headers })
            .then(response => response.json())
            .then(
                data => {

                    if (data.state == 3) {
                        console.log("move data from server:", data)
                        window.game.hasMove = true
                        console.log("sending to player")
                        // window.game.enemyMove(data.move.from, data.move.to)
                        window.game.enemyShot(data.move.position)
                        window.game.shipsDataWhite = data.shipsdata[0]
                        window.game.shipsDataBlack = data.shipsdata[1]

                    } else if (data.state == 2) {

                    } else if (data.state == 1) {
                        console.log("game start")
                        fetch("/timereset", { method: "post" })

                        document.getElementById("display").style.display = "none"
                        window.game.load()
                    } else {

                    }
                    window.ui.updateTimer(window.game.gameIsAlive ? data.time : 30)
                    let player = window.game.hasMove ? window.game.isWhite : !window.game.isWhite
                    window.ui.updateTurns(player)
                    if (data.time >= 30 && this.playerBlackLoggedIn && this.playerWhiteLoggedIn) {
                        window.game.gameIsAlive = false

                        if (window.game.hasMove) {
                            console.log("gameover lose")
                            document.getElementById("display").style.display = "block"
                            document.getElementById("display").innerText = "YOU LOST!"
                            window.game.gameIsAlive = false
                        } else {
                            console.log("gameover win")
                            document.getElementById("display").style.display = "block"
                            document.getElementById("display").innerText = "YOU WON!"
                            window.game.gameIsAlive = false
                        }
                    } else {
                    }

                    //both players sent data

                    if (data.ready[0] == true && data.ready[1] == true) {
                        if (window.game.phase == "awaitGaming") {
                            window.game.moveCamera()
                            window.game.phase = "gaming"
                            
                            fetch("/getBothTables", { method: "post" }).then(res => res.json()).then(data => {

                                if (!window.game.isWhite) {
                                    window.game.shipsWhite = data.ships[0]
                                    window.game.whiteColor = data.colors[0]
                                    window.game.shipsDataBlack = data.shipsdata[0]
                                } else {
                                    window.game.shipsBlack = data.ships[1]
                                    window.game.blackColor = data.colors[1]
                                    window.game.shipsDataBlack = data.shipsdata[1]
                                }
                                window.ui.startgame()
                                
                            })
                        }

                    }

                }
            )
    }


    move(from, to, taking) {
        console.log("sent move")
        fetch("/timereset", { method: "post" })

        const body = JSON.stringify({
            isWhite: window.game.isWhite,
            isTaking: taking,
            from: from,
            to: to,
        })

        const headers = { "Content-Type": "application/json" }

        fetch("/move", { method: "post", body, headers })
            .then(response => response.json())
            .then(data => {

            }
            )
    }

    reset() {
        window.game.gameIsAlive = true
        const body = JSON.stringify({ reset: "reset" })
        const headers = { "Content-Type": "application/json" }

        document.getElementById("login-errors").innerHTML = "players reset"

        fetch("/reset", { method: "post", body, headers })
            .then(response => response.json())
            .then(
                data => {
                    clearInterval(this.intervalid)
                    console.log("Reset")
                }
            )
    }

    sendShips() {
        //and colors!!
        let shipstable = window.game.isWhite == true ? window.game.shipsWhite : window.game.shipsBlack
        let shipscolors = window.game.isWhite == true ? window.game.whiteColor : window.game.blackColor
        let shipsdata = window.game.isWhite == true ? window.game.shipsDataWhite : window.game.shipsDataBlack

        const body = JSON.stringify({ check: true, color: window.game.isWhite ? "white" : "black", ships: shipstable, shipscolors: shipscolors, shipsdata: shipsdata })
        const headers = { "Content-Type": "application/json" }

        window.game.deselectAll()

        fetch("/endplacing", { method: "post", body, headers })
            .then(response => response.json())
            .then(
                data => {
                    console.log("Commit the ships")
                }
            )
    }
}

export default Net