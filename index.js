const Nightmare = require('nightmare')
const pg = require('pg')
const client = new pg.Client({
    user: "fgisysnyzdovpw",
    password: "--------",
    database: "dbqr4e71el54su",
    port: 5432,
    host: "ec2-54-217-235-137.eu-west-1.compute.amazonaws.com",
    ssl: true
}); 
const https = require('https')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
client.connect()

function saveToDb(arr){
    console.log('Saving scraped data to database')
    let adminId = 1
    client.query('INSERT INTO parking_state(parking_node_id, parking_state, user_id) VALUES($1, $2, $3)', [233304898, arr[0], adminId])
    client.query('INSERT INTO parking_state(parking_node_id, parking_state, user_id) VALUES($1, $2, $3)', [279619444, arr[1], adminId])
    client.query('INSERT INTO parking_state(parking_node_id, parking_state, user_id) VALUES($1, $2, $3)', [293169750, arr[2], adminId])
}

function pwrParkingState(){
    let nightmare = Nightmare({ show: false })
    nightmare
    .goto('http://parking.pwr.edu.pl/')
    .wait(5000)
    .evaluate(() => Array.from(document.querySelectorAll('.places')).map(element => element.innerHTML))
    .end()
    .then(arr => {
        if (arr.length != 3) {
            console.log('Failed to scrape pwr parking data')
        }else{
            saveToDb(arr)
        }
    })
    .catch(error => {
        console.log(error)
    })
}

app.get('/awake', function(req, res){
    return res.sendStatus(200)
})

app.listen(process.env.PORT || 3000, function(){});

setInterval(function() {
    https.get("https://parking-state-scraper.herokuapp.com/awake", (res) => {console.log(res.statusCode);});
    https.get("https://parking-finder-spring.herokuapp.com/awake", (res) => {console.log(res.statusCode);});
}, 300000);

setInterval(function() {
    console.log('Scraping data')
    pwrParkingState()
}, 3600000)
