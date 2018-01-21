<?php
/**
 * Rename subdirectories to their XWS-compatible canonicalized name
 *
 * Usage:   php ../../util/canonicalize.php     (only immediate descendants)
 *          php ../../util/canonicalize.php -r  (all descendants)
 *
 * @todo Bugfix: Sometimes falls over and needs to be run several times. Something to do with spaces in folder names?
 */

if( PHP_SAPI !== 'cli' )
{
	die( 'CLI script only' );
}

$is_recursive = !empty( $argv[1] ) && in_array( $argv[1], [ '-r', '--recursive' ] );

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

function canonicalizeSubdirectories( $base_path, $is_recursive, $subdirectory = null )
{
	$current_path = !is_null( $subdirectory ) ? $base_path . DIRECTORY_SEPARATOR . $subdirectory : $base_path;

	echo 'Entering folder ' . $current_path . PHP_EOL;

	$dir = new DirectoryIterator( $current_path );
	foreach( $dir as $fileinfo )
	{
		if( !$fileinfo->isDot() )
		{
			$filename = $fileinfo->getFilename();
			$is_file = $fileinfo->isFile();
			
			// skip hidden files
			if( $filename[0] == '.' )
			{
				echo 'Skipping ' . $filename . PHP_EOL;
				continue;
			}

			$old_name = $filename;

			if( !$fileinfo->isWritable() )
			{
				echo 'Permission denied' . PHP_EOL;
				continue;
			}

			if( $is_file )
			{
				$extension = $fileinfo->getExtension();
				$name_part = preg_replace( '#\.' . $extension . '$#', '', $filename );
				$canonicalized = canonicalize( $name_part );
				$new_name = $canonicalized . '.' . $extension;
			}
			else
			{
				$new_name = canonicalize( $filename );
			}

			if( $new_name == $old_name )
			{
				echo 'Skipping ' . ($is_file ? 'file' : 'folder') . ' ' . (!is_null( $subdirectory ) ? $subdirectory . '/' . $old_name : $old_name) . PHP_EOL;
			}
			else
			{
				echo 'Renaming ' . ($is_file ? 'file' : 'folder') . ' ' . (!is_null( $subdirectory ) ? $subdirectory . '/' . $old_name : $old_name) . ' to ' . $new_name . PHP_EOL;
				rename($fileinfo->getPathname(), $fileinfo->getPath() . DIRECTORY_SEPARATOR . $new_name);
			}

			// recurse?
			if( $is_recursive && $fileinfo->isDir() )
			{
				$new_subdirectory = !is_null( $subdirectory ) ? $subdirectory . DIRECTORY_SEPARATOR . $new_name : $new_name;
				canonicalizeSubdirectories( $base_path, true, $new_subdirectory );
			}
		}
	}
};


// run
canonicalizeSubdirectories( getcwd(), $is_recursive );
