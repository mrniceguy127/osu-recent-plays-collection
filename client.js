// Importing important divs from the DOM
let stats = document.getElementById("stats");		// Where stats, graphics, cards will be displayed
let userInfo = document.getElementById("userInfo");	// Where user name and other relavent info will be displayed
let messages = document.getElementById("messages");	// Where messages get displayed
let username = "TestUser123"	// PLACEHOLDER. Eventually the username will be recieved when user logs in

// Function for getting stats from most recent games 
function getRecent(){
	let numGames = document.getElementById("numGames"); // number input filed from DOM
	stats.innerHTML = "";			// Clear the stats div to restet it
	userInfo.innerHTML = username;	// Display user name in userInfo div
	messages.style.display="block";	// Set messages to "display:block" to make it appear
	messages.innerHTML = "Fetching Stat Information for user: " + username;	// Display fetching message
	setTimeout(function(){messages.style.display="none";}, 5000);	// Messages div will disappear after 5 secs
	let xhttp = new XMLHttpRequest();	
	xhttp.onreadystatechange = function() {
		if(xhttp.readyState == 4 && xhttp.status == 200) {						// When HTML request is complete and status OK (200)
			let json = JSON.parse(xhttp.responseText);							// Get response JSON text from request and parse 
			messages.innerHTML = "Stats for user " + username + " OBTAINED";	// Display success message
			for (let i=0; i < numGames.value; i++){		// Iterate through the the # of most recent games requested 
				// Access parsed JSON to get important info 
				let date = json[i].date;
				let rank = json[i].rank;
				let beatmapID = json[i].beatmap_id;
				let score = json[i].score;
				let maxcombo = parseInt(json[i].maxcombo);
				let count50 = parseInt(json[i].count50);
				let count100 = parseInt(json[i].count100);
				let count300 = parseInt(json[i].count300);
				let countmiss = parseInt(json[i].countmiss);
				let accuracy = Math.round((((50*count50) + (100*count100) 
				+ (300*count300))/(300 * (countmiss + count50 + count100 + count300)))*100); // Calculation as done by osu! itself
				
				let newStatCard = document.createElement("div"); // A new "statCard" object for holding a game's stats is created 
				newStatCard.setAttribute('class', 'statCard');	 // Set its class so it gets appropriate styles
				
				// Create variable for containing the collected stat info as a single  string
				let stat = "<span style='color:#35324C; font-weight:bold;'>Game "+ (i + 1) +":</span><br>" +
				"Date: "+ date +"<br>" +
				"Beatmap ID: " + beatmapID + "<br><br>" +
				"Score: " + score + "<br>" +
				"Max Combo: " + maxcombo + "<br>" +
				"Bad Hits: " + count50 + "<br>" +
				"Good Hits: " + count100 + "<br>" +
				"Perfect Hits: " + count300 + "<br>" +
				"Misses: " + countmiss + "<br>" + 
				"Accuracy: " + accuracy + "%<br>";
				
				newStatCard.innerHTML = stat;			// set stat card's innerHTML to the stat text
				
				var br = document.createElement("br");	// Create a line break object
				stats.appendChild(br);					// Append the line break after the stats text
				
				newRank = document.createElement("div"); // Create  new div to show that rank earned from the game
				let rank_big = "Rank: <span style='font-size:40px; '>"+ rank +"</span><br>"; // Rank text
				newRank.innerHTML = rank_big; 			// set rank's innerHTML to the rank text
				
				newStatCard.appendChild(newRank); // Append the rank to the end of the stat card
				stats.appendChild(newStatCard);   // Append stat card to DOM stats div
				
			}
		}
	}
	let URL = "./getstats"; // XHTTP request will call the /getstats endpoint from the server
							// TODO: Pass any other necessary info via query to server when needed
							// Ex.) Passing the username of the user -->  "./getstats?user=" + userName;
	xhttp.open("GET",URL,true);	// GET Request using
	//request that the content-type returned is in JSON format
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
	xhttp.send(); // Send Request
} 

// TODO: Complete  getAccuracy() function to plot accuracy over time over all provided data 
function getAccuracy(){
	stats.innerHTML = "";
	userInfo.innerHTML = username;
	messages.style.display="block";
	messages.innerHTML = "Fetching Accuracy Information for user: " + username;
	setTimeout(function(){messages.style.display="none";}, 5000);
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(xhttp.readyState == 4 && xhttp.status == 200) {
			let json = JSON.parse(xhttp.responseText);
			messages.innerHTML = "Stats for user " + username + " OBTAINED";
			let accuracyRecord = []; // Y
			let dateRecord = [];   // X
			
			//PLACEHOLDER until plotting is done: Displaying all stored Dates and Accuracies in single stat card
			let accuracyCard = document.createElement("div"); // A new "statCard" object for holding a game's stats is created 
			accuracyCard.setAttribute('class', 'statCard');	 // Set its class so it gets appropriate styles
			
			for (let i=0; i < json.length; i++){
				let rank = json[i].rank; 
				if(rank !== 'F'){ // If Rank for game is F, do not include in accuracy plot
					console.log("got it!");
					let count50 = parseInt(json[i].count50);
					let count100 = parseInt(json[i].count100);
					let count300 = parseInt(json[i].count300);
					let countmiss = parseInt(json[i].countmiss);
					let accuracy = Math.round((((50*count50) + (100*count100) 
					+ (300*count300))/(300 * (countmiss + count50 + count100 + count300)))*100);
					// PLAN: Plot Accuracies on the y-axis
					accuracyRecord.push(accuracy); 
					let date = json[i].date; 	   // PLAN: Plot Dates on x-axis
					dateRecord.push(date);
						
					// PLACEHOLDER until plotting is done: store all dates and accuracies as text in card
					accuracyCard.innerHTML += date + ": " + accuracy + "%<br>";
				}
			}
			
			stats.appendChild(accuracyCard);   		// Append stat card to DOM stats div
		}
	}
	let URL = "./getstats";
	xhttp.open("GET",URL,true);
	//request that the content-type returned is in JSON format
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
	xhttp.send();
}