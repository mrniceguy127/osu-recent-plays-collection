let express = require("express");
let request = require("request");
let test_db = require("../db.json"); // SAMPLE DATA in JSON format provided by Matt K. for testing

// Setting up server
let app = express();
app.use(express.static("."));
app.listen(8080);
console.log("Server running...");

// getStats: Endpoint returns the sample JSON data
// The actual endpoint will interact with the osu! API and request for data
app.get('/getstats', function(req,res){
	res.type("appliation/json");
	res.send(test_db);
});