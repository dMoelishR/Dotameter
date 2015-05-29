<?php
	include 'config.php';
	$account_id = @$_GET["account_id"];
	$request = @$_GET["request"];
	$match_id = @$_GET["match_id"];

	if($request == "getAllgames")
		$url = "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?key=".$key."&account_id=".$account_id;
	else if($request == "getMatchInfos")
		$url = "https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/?key=".$key."&match_id=".$match_id;
	else if($request == "getAllheroes")
		$url = "https://api.steampowered.com/IEconDOTA2_570/GetHeroes/v0001/?key=8ABF1CCD515A522661D7AF5B4D0BCADB&language=de";
	$filename = "./db/".md5($url);
	if(file_exists($filename) && $request != "getAllgames") {
		$myfile = fopen($filename, "r") or die("Unable to open file!");
		echo fread($myfile,filesize($filename));
	} else {
		$content = file_get_contents($url);
		if( $content !== FALSE ) {
		  	// add your JS into $content
		  	$content = str_replace("	", "", $content);
		  	$content = str_replace(" ", "", $content);
			$myfile = fopen($filename, "w") or die("Unable to open file!");
			fwrite($myfile, $content);
			fclose($myfile);
		  	echo $content;
		}
	}
	
?>