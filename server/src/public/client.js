// Importing important divs from the DOM
let stats = document.getElementById("stats");		// Where stats, graphics, cards will be displayed
let userInfo = document.getElementById("userInfo");	// Where user name and other relavent info will be displayed
let messages = document.getElementById("messages");	// Where messages get displayed
let username = "mrniceguy127";	// PLACEHOLDER. Eventually the username will be recieved when user logs in

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
	let URL = `/recentplays/json/${username}`; // XHTTP request will call the /getstats endpoint from the server
							// TODO: Pass any other necessary info via query to server when needed
							// Ex.) Passing the username of the user -->  "./getstats?user=" + userName;
	xhttp.open("GET",URL,true);	// GET Request using
	//request that the content-type returned is in JSON format
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
	xhttp.send(); // Send Request
} 

// getAccuracy() function to plot accuracy over time for specif beat map (ignoring failed maps)
function getMapAccuracy(){
	stats.innerHTML = "";								// Clear stats div
	userInfo.innerHTML = username;						// Show username
	let mapID = document.getElementById("mapID");		// Import mapID field from DOM
	
	if(mapID.value.length === 0){	// If user did not enter a beatmap ID, prompt the user to do so.
		messages.style.display="block";
		messages.innerHTML = "Please enter a osu! beatmap ID!";
		return;
	}
	else{
		messages.style.display="block";
		messages.innerHTML = "Fetching Accuracy Information for user: " + username;
		setTimeout(function(){messages.style.display="none";}, 5000);
	}
	
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(xhttp.readyState == 4 && xhttp.status == 200) {
			let json = JSON.parse(xhttp.responseText);
			messages.innerHTML = username + "'s stats for beatmap ID " + mapID.value + " OBTAINED";
			let accuracyRecord = []; // Y values for plot
			let dateRecord = [];   	 // X vlaues for plot
			
			//PLACEHOLDER until plotting is done: Displaying all stored Dates and Accuracies in single stat card
			let accuracyCard = document.createElement("div"); // A new "statCard" object for holding a game's stats is created 
			accuracyCard.setAttribute('class', 'statCard');	 // Set its class so it gets appropriate styles
			accuracyCard.setAttribute('id', 'accuracyCard');
			
			let mapStatsCard = document.createElement("div"); // A new "statCard" object for holding a game's stats is created 
			mapStatsCard.setAttribute('class', 'statCard');	 // Set its class so it gets appropriate styles
			
			
			for (let i=0; i < json.length; i++){
				let rank = json[i].rank; 
				let beatmapID = json[i].beatmap_id;
                                console.log(beatmapID, mapID.value)
				if(rank !== 'F' && beatmapID === mapID.value){ // If Rank for game is F, do not include in accuracy plot
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
				}
			}
			console.log(accuracyRecord, json);
			if (accuracyRecord.length < 1){
                                console.log('FUCK');
				messages.style.display="block";
				messages.innerHTML = "No accuracy data exists for Beatmap ID '" + mapID.value + "'.";
				setTimeout(function(){messages.style.display="none";}, 5000);
				return;
			}
			// Gathering stats for specific beatmap
			let leastRecentPlay = dateRecord[0];
			let mostRecentPlay = dateRecord[dateRecord.length - 1];
			let timesPlayed = dateRecord.length;
			
			let minAccuracy = Math.min.apply(Math, accuracyRecord);
			let minAccDate = dateRecord[accuracyRecord.indexOf(minAccuracy)];
			let maxAccuracy = Math.max.apply(Math, accuracyRecord);
			let maxAccDate = dateRecord[accuracyRecord.indexOf(maxAccuracy)];
			
			let sum = 0;
			for (let i = 0; i < accuracyRecord.length; i++){
				sum += accuracyRecord[i];
			}
			let averageAccuracy = sum / accuracyRecord.length;
			
			// Using Plotly to plot Accuracy (y-axis) vs. Time (x-axis) as scatter plot
			line = { 
				x: dateRecord,
				y: accuracyRecord,
				name: 'Accuracy Over Time',
				mode: 'markers',
				type: 'scatter'
			};
			
			let data = [line];
			let layout = {
			  title: {
				text:'Accuracy Over Time',
				font: {
				  family: 'Courier New, monospace',
				  size: 18
				},
				xref: 'paper',
				x: 0.05,
			 },
			  xaxis: {
				title: {
				  text: 'Date Played',
				  font: {
					family: 'Courier New, monospace',
					size: 18,
					color: '#7f7f7f'
				  }
				},
			  },
			  yaxis: {
				title: {
				  text: 'Accuracy (%)',
				  font: {
					family: 'Courier New, monospace',
					size: 18,
					color: '#7f7f7f'
				  }
				}
			  }
			};
			
			let config = {responsive: false}
			
			stats.appendChild(accuracyCard);   		// Append stat card to DOM stats div
			Plotly.newPlot('accuracyCard', data, layout, config); // Plotly will insert plot into accuracyCard div
			
			// String variable to hold extra stat information for specific beatmap
			let stat ="<span style='color:#35324C; font-weight:bold;'>Beatmap ID: " + mapID.value + "</span><br><br>" +
				"Most Recent Play: " + mostRecentPlay + "<br>" + 
				"Least Recent Play: " + leastRecentPlay + "<br>" +
				"Times Completed: " + timesPlayed + "<br><br>" +
				"Average Accuracy: " + averageAccuracy + "%<br><br>" +
				"Best Play: " + maxAccuracy + "% on " + maxAccDate + "<br>" +
				"Worst Play: " + minAccuracy + "% on " + minAccDate + "<br>";
				
			mapStatsCard.innerHTML = stat;			// set stat card's innerHTML to the stat text
			stats.appendChild(mapStatsCard);   		// Append stat card to DOM stats div
		}
	}
	let URL = `/recentplays/json/${username}`;
	xhttp.open("GET",URL,true);
	//request that the content-type returned is in JSON format
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
	xhttp.send();
}
