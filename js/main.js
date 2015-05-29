var user = [
	{ "name" : "Cracker" , "id" : "76561197978275774" },
	{ "name" : "Dortan" , "id" : "18230281" },
	{ "name" : "sPawn" , "id" : "17985037" },
	{ "name" : "Secret" , "id" : "37098248" },
	{ "name" : "Xam" , "id" : "37390991" }, 
	{ "name" : "Isi" , "id" : "166796443" }
];

var records = {
	"gold" : {"v": 0, "name" : "" },
	"gold_per_min" : {"v": 0, "name" : "" },
	"gold_spent" : {"v": 0, "name" : "" },
	"hero_damage" : {"v": 0, "name" : "" },
	"hero_healing" : {"v": 0, "name" : "" },
	"kills" : {"v": 0, "name" : "" },
	"deaths" : {"v": 0, "name" : "" },
	"assists" : {"v": 0, "name" : "" },
	"kda_ration" : {"v": 0, "name" : "" },
	"denies" : {"v": 0, "name" : "" },
	"last_hits" : {"v": 0, "name" : "" },
	"leaver_status" : {"v": 0, "name" : "" },
	"level" : {"v": 0, "name" : "" },
	"tower_damage" : {"v": 0, "name" : "" },
	"xp_per_min" : {"v": 0, "name" : "" }
}

var heroes = null;
var schnitt = {};

$(document).ready(function() {
	ajax({ "request" : "getAllheroes" }, 
		function(data) {
			heroes = data["result"]["heroes"];

			for(var i = 0;i<user.length; i++) {
				(function() {
					var name = user[i]["name"];
					var id = user[i]["id"];

					if(id.length >= 15) {
						var heeigh = new BigNumber(id);
						var low = heeigh.minus("76561197960265728");
						id = low.toJSON(); //Get 32Bit id!
					}
					$("#content").append('<h2>'+name+'</h2>');
					$("#content").append('<table>'+
						'<thead>'+
							'<tr>'+
								'<th>hero_id</th>'+
								'<th>gold_per_min</th>'+
								'<th>kills</th>'+
								'<th>deaths</th>'+
								'<th>assists</th>'+
								'<th>KDA</th>'+
								'<th>LH</th>'+
								'<th>denies</th>'+
								'<th>GPM</th>'+
								'<th>XPM</th>'+
							'</tr>'+
						'</thead>'+
						'<tbody class="result" id="'+id+'">'+
						'</tbody>'+
					'</table>');
					
					ajax({ "request" : "getAllgames", account_id : id }, 
						function(data) {
							var matches = data.result.matches;
							var matchCnt = 0;
				        	for(var k=0;k<matches.length;k++) {
				        		var match = matches[k];
				        		if(match["lobby_type"] == 7 || match["lobby_type"] == 0 || match["lobby_type"] == 2) {
			        				ajax({ "request" : "getMatchInfos", "match_id" : match["match_id"] }, 
			        					function(data) {
			        						var game = data.result;
			        						if(game["duration"] > 500) {
			        							matchCnt++;
			        							var players = game["players"];
				        						for(var j=0;j<players.length;j++) {
				        							var player = players[j];
				        							if(player["account_id"] == id) {
				        								player["name"] = name;
				        								player["kda_ration"] = getKDARation(player["kills"], player["deaths"], player["assists"]);
				        								refreshRecords(player);
				        								refreshSchnitt(player, matchCnt);
				        								$("#"+player["account_id"]).append('<tr id="'+game["match_id"]+'">'+
									        				'<td><img src="'+getHeroImgById(player["hero_id"])+'"></td>'+
									        				'<td>'+player["gold_per_min"]+'</td>'+
									        				'<td>'+player["kills"]+'</td>'+
									        				'<td>'+player["deaths"]+'</td>'+
									        				'<td>'+player["assists"]+'</td>'+
									        				'<td>'+player["kda_ration"]+'</td>'+
									        				'<td>'+player["last_hits"]+'</td>'+
									        				'<td>'+player["denies"]+'</td>'+
									        				'<td>'+player["gold_per_min"]+'</td>'+
									        				'<td>'+player["xp_per_min"]+'</td>'+
									        			'</tr>');
									        			break;
				        							}
				        						}
			        						}
			        					}
			        				);     			
				        		}
				        	}
						}
					);
				})();
			}
		}
	);
});

function refreshSchnitt(player, matchCnt) {
	if(typeof(schnitt[player["name"]]) == "undefined") {
		schnitt[player["name"]] = {};
	}
	var pSchnitt = schnitt[player["name"]];
	for(var i in records) {
		if(typeof(pSchnitt[i]) == "undefined") {
			pSchnitt[i] = player[i];
		} else {
			pSchnitt[i] = (pSchnitt[i]*(matchCnt-1)+player[i])/(matchCnt);
		}
	}
}

function refreshRecords(player) {
	$("#records").empty();
	for(var i in records) {
		if(player[i] > records[i]["v"]) {
			records[i]["v"] = player[i];
			records[i]["name"] = player["name"];
		}
		$("#records").append('<tr><td>'+records[i]["name"]+'</td><td>'+i+'</td><td>'+records[i]["v"]+'</td></tr>');
	}
}

function getHeroNameById(id) {
	for(var i=0;i<heroes.length;i++) {
		if(heroes[i]["id"] == id) {
			var locName = heroes[i]["localized_name"];
			return locName;
		}
	}
}

function getHeroImgById(id) {
	for(var i=0;i<heroes.length;i++) {
		if(heroes[i]["id"] == id) {
			var img = "http://cdn.dota2.com/apps/dota2/images/heroes/"+heroes[i]["name"].replace("npc_dota_hero_", "")+"_sb.png";
			return img;
		}
	}
}

var req = 0;
function ajax(request, callback) {
	req++;
	$("#loading").show();
	$("#loading").text("Loading... remaining requests: "+req);

	var ident = JSON.stringify(request).replace("{","").replace("}","").replace(":","").replace(" ","").replace('"',"").replace(',',"");
	var data = JSON.parse(localStorage.getItem(ident));
	if(data!=null) {
		req--;
		$("#loading").text("Loading... remaining requests: "+req);
		callback(data);
		return;
	}

	$.ajax({
	    url : "ajax.php",
	    data:request,
		dataType:'json',
		type: 'GET',
	    success:function(data)
        {
        	callback(data);
        	if(request["request"] != "getAllgames") {
        		localStorage.setItem(ident, JSON.stringify(data));
        	}
        	req--;
			$("#loading").text("Loading... remaining requests: "+req);
        	if(req==0) {
        		finishAjax();
        	}
        }, error:function(e) {
        	console.log("error", e);
        	req--;
        	if(req==0) {
        		finishAjax();
        	}
        }
	});
}

function finishAjax() {
	$("#loading").hide();
	//Render Median
	$("#medHeader").append('<th>Name</th>');
	var best = {};
	for(var i in records) {
		$("#medHeader").append('<th>'+i+'</th>');
		for(var k in schnitt) {
			if(typeof(best[i])=="undefined") {
				best[i] = {"v":schnitt[k][i], "name":k};
			} else {
				if(best[i]["v"] < schnitt[k][i])
					best[i] = {"v":schnitt[k][i], "name":k};
			}
		}
	}

	for(var i in schnitt) {
		var tr = $('<tr></tr>');
		tr.append('<td>'+i+'</td>');
		for(var k in records) {
			if(best[k]["name"] == i)
				tr.append('<td style="background:rgba(6, 255, 0, 0.1);">'+Math.round(schnitt[i][k]*100)/100+'</td>');
			else
				tr.append('<td>'+Math.round(schnitt[i][k]*100)/100+'</td>');
		}
		$("#medContent").append(tr);
	}
	$('table').addClass("display");
	$('table').DataTable();
}

function getKDARation(k, d, a) {
	if(d == 0)
		d = 1;
	return Math.round(((k+a)/d)*100)/100;
}
