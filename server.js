const express = require("express");
const { is } = require("express/lib/request");
const app = express()
const fs = require("fs")
const path = require('path')

const Datastore = require('nedb')

const leaderboard = new Datastore({
    filename: 'leaderboard.db',
    autoload: true
});

//format danych
/*
    {
        id: int,
        nickname : string,
        wins: int,
        loses: int,
        shotshit: int,
        shotsfired: int
    }
*/

var PORT = process.env.PORT || 3000;
app.use(express.static("static"))

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

let players = [],
    playing = -1,
    time = 0

let shipsPlaced = [false, false]
let shipsTables = []
let shipsColors = []
let shipsData = []

// Player state
// 0 - awaiting players
// 1 - ready to play
// 2 - playing
// 3 - awaiting move confirm
// 4 - move sync pending

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})

app.route("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
})

app.post("/endplacing", function (req, res) {
    let placedships = req.body.check
    let color = req.body.color
    let ships = req.body.ships
    let shipcolor = req.body.shipscolor
    let shipsdata = req.body.shipsdata
    //boolean, string
    shipsPlaced[color == "white" ? 0 : 1] = placedships
    shipsTables[color == "white" ? 0 : 1] = ships
    shipsColors[color == "white" ? 0 : 1] = shipcolor
    shipsData[color == "white" ? 0 : 1] = shipsdata

    console.log(shipsData)
})

app.post("/login", function (req, res) {
    let color = players.length
    let name = req.body.login

    if (players.map(p => p.name).includes(name)) {
        // check if user exists
        res.send(JSON.stringify({ isPlayer: false, error: 1 }));
    } else if (color < 2) {
        // add player, assign color
        players.push(
            // player creation
            { name: name, color: color, state: 0, time: -1, move: null }
        )
        console.log(name, "joined")

        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({ isPlayer: true, color: color }));

        if (color == 1) {
            players.forEach(p => p.state = 1);
            playing = 0;
        }
    }
    else {
        // already have 2 players
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({ isPlayer: false, error: 0 }));
    }

})

app.post("/addLeaderboard", function (req, res) {
    console.log(req.body)
    leaderboard.find({ nickname: req.body.nickname }, function (err, data) {
        if (data.length < 1) {
            console.log("RECORD DOESNT EXIST")

            let doc = {
                nickname: req.body.nickname,
                wins: req.body.wins,
                loses: req.body.loses,
                shotshit: req.body.shotshit,
                shotsfired: req.body.shotsfired
            }
            leaderboard.insert(doc, function (err, newDoc) {
                console.log("dodano dokument (obiekt):")
                console.log(newDoc)
                console.log("losowe id dokumentu: " + newDoc._id)
            });
        } else {
            data = data[0]
            console.log("olddata", data)
            console.log("newdata", req.body)

            let doc = {
                nickname: req.body.nickname,
                wins: (parseInt(req.body.wins) + parseInt(data.wins)),
                loses: (parseInt(req.body.loses) + parseInt(data.loses)),
                shotshit: (parseInt(req.body.shotshit) + parseInt(data.shotshit)),
                shotsfired: (parseInt(req.body.shotsfired) + parseInt(data.shotsfired))
            }
            leaderboard.remove({ nickname: req.body.nickname }, {}, function (err, numRemoved) {
                console.log("usunięto dokumentów: ", numRemoved)

                leaderboard.insert(doc, function (err, newDoc) {
                    console.log("dodano dokument (obiekt):")
                    console.log(newDoc)
                    console.log("losowe id dokumentu: " + newDoc._id)
                });
            });
        }


    })
})

app.post("/getLeaderboard", function (req, res) {
    leaderboard.find({}, function (err, docs) {
        //zwracam dane w postaci JSON
        console.log("----- tablica obiektów pobrana z bazy: \n")
        console.log(docs)
        console.log("----------------")

        res.end(JSON.stringify(docs))
    });
})

app.post("/getlogins", function (req, res) {
    res.send(JSON.stringify({ login: players }))
})

app.post("/reset", function (req, res) {
    console.log("Reset players")
    players = []
    playing = -1;
    shipsPlaced = [false, false]
    shipsTables = []
    shipsColors = []

    res.setHeader("content-type", 'application/json')
    res.send(JSON.stringify({}));
})

app.post("/update", function (req, res) {
    let p = players[req.body.isWhite ? 0 : 1];

    //console.log(req.body, p)
    if (p.state == 3) {
        // send move to sync
        console.log("Synced move with player", req.body.isWhite ? 0 : 1)

        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 3,
            move: (p.move),
            hasMove: playing == (!req.body.isWhite ? 0 : 1),
            time: time,
            ready: shipsPlaced,
            shipsdata: shipsData
        }));

        p.state = 2
    } else if (p.state == 2) {
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 2,
            time: time,
            ready: shipsPlaced,
            shipsdata: shipsData
        }));
    } else if (p.state == 1) {
        console.log("loaded player", req.body.isWhite ? 1 : 2)

        p.state = 2
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 1,
            time: time,
            ready: shipsPlaced,
            shipsdata: shipsData
        }));
    } else {
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 0,
            time: time,
            ready: shipsPlaced,
            shipsdata: shipsData
        }));
    }
})

app.post("/getBothTables", function (req, res) {
    res.send(JSON.stringify({ "ships": shipsTables, "colors": shipsColors, "shipsdata" : shipsData }))
})

app.post("/shoot", function (req, res) {
    console.log("Recieved shot", req.body)

    let player = players[!req.body.isWhite ? 0 : 1];

    player.state = 3;
    player.move = req.body;

    playing = req.body.isWhite ?
        1 : 0

    res.setHeader("content-type", 'application/json')
    res.send(JSON.stringify({

    }));
})

app.post("/move", function (req, res) {
    console.log("Recieved move", req.body)

    let e = players[!req.body.isWhite ? 0 : 1];

    e.state = 3;
    e.move = req.body;

    playing = req.body.isWhite ?
        1 : 0

    res.setHeader("content-type", 'application/json')
    res.send(JSON.stringify({

    }));
})

app.post("/timereset", function (req, res) {
    time = 0
    res.send(JSON.stringify({}))
})

setInterval(() => {
    time++
}, 1000)