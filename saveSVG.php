<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
	// collect value of input field
	$SVGdatoteka = $_POST['svgFile'];
	if (empty($SVGdatoteka)) {
		echo "Name is empty";
	} else {
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
		$nextFileNumber = $myFile[0]+1;
		
		# zapisi datoteko
		$pathNewFile = $path.'/'.$nextFileNumber.'.svg';
		$newFile = fopen($pathNewFile, "w") or die("Unable to open file!");
		fwrite($newFile, $SVGdatoteka);
		fclose($newFile);
	}
	
}

?>