<?php
if ($_SERVER["REQUEST_METHOD"] == "GET") {
	$path = "results";
	# poisci sliko z najvecjo stevilko
	if ($handle = opendir($path)) {
		while (false !== ($entry = readdir($handle))) {
			if ($entry != "." && $entry != "..") {
				if(!is_dir($entry)){
					$myFile[] = substr($entry,0,strrpos($entry, "."));
				}
			}
		}
		closedir($handle);
	}
	rsort($myFile,SORT_NUMERIC);
	$nextFileNumber = $myFile[0];
	echo $nextFileNumber;
}

?>