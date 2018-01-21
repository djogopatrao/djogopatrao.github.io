<?php

/**
função copiada do xwing-images 
**/
function canonicalize( $name )
{
	$special_cases =  [
		
		// xws
		'Astromech Droid' => 'amd',
		'Elite Pilot Talent' => 'ept',
		'Modification' => 'mod',
		'Salvaged Astromech Droid' => 'samd',
		
		// xwing data
		'Astromech' => 'amd',
		'Elite' => 'ept',
		'Salvaged Astromech' => 'samd'
	];

	if( array_key_exists( $name, $special_cases ) )
	{
		return $special_cases[ $name ];
	}

	$name = strtolower( $name );
	$name = iconv( 'UTF-8', 'ASCII', $name );
	$name = preg_replace( '#[^a-z0-9]#', '', $name );

	return $name;
}

$pilot_dir = "bower_components/xwing-card-images/images/pilots";
$upgrade_dir = "bower_components/xwing-card-images/images/upgrades";
$ship_csv_file = "bower_components/xwing-csv/archives/20160212-ships.csv";

// le todos os pilotos
$d = opendir($pilot_dir);
$data = null;
while( $faction = readdir($d) ) {
    if ( $faction != "." && $faction != ".." ) {
        $fd = opendir( $pilot_dir."/".$faction );
        while( $ship = readdir($fd) ) {
            if ( $ship != "." && $ship != ".." ) {
                $sd = opendir( $pilot_dir."/".$faction."/".$ship );
                while( $file = readdir( $sd ) ) {
                    if ( $file != "." && $file != ".." ) {
                        list($pilot, $term) = explode(".",$file);
                        $data[$pilot] = array(
                            'faction' => $faction,
                            'ship' => $ship,
                            'pilot' => $pilot,
                            'file' => $pilot_dir."/".$faction."/".$ship."/".$file
                        );
                    }
                }
                closedir($sd);
            }
        }
        closedir($fd);
    }
}
closedir( $d );

// le todos upgrades
$d = opendir( $upgrade_dir );
$data_u = null;
while( $type = readdir( $d ) ) {
    if ( $type != "." && $type != ".." ) {
        $ud = opendir( $upgrade_dir."/".$type );
        while( $file = readdir( $ud ) ) {
            if ( $file != "." && $file != ".." ) {
                list($upgrade,$term) = explode(".",$file);
                $data_u[$upgrade] = array (
                    'type' => $type,
                    'upgrade' => $upgrade,
                    'file' => $upgrade_dir."/".$type."/".$file
                );
            }
        } 
    }
}
closedir( $d );

// le stats das naves
$ships = null;
$f = fopen($ship_csv_file,"r");
$header = fgetcsv($f); // ignore
while( $l = fgetcsv($f) ) {
    list($ship,$rebel,$imperial,$scum,$size,$attack,$agility,$hull,$shields,$focus,$tl,$br,$ev,$boost,$cloak,$slam,$rotate,$xws)=$l;
    $ships[ canonicalize($ship) ] = array(
        'name' => $ship,
        'att' => $attack,
        'agi' => $agility,
        'hul' => $hull,
        'shi' => $shields
    );
}

echo json_encode(['pilots'=>$data,'upgrades'=>$data_u,'ships'=>$ships]);
