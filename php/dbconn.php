<?php
  $mysql_db_hostname = "localhost";
  $mysql_db_user = "root";
  $mysql_db_password = "";
  $mysql_db_database = "surveys";
  $tbl_name="users"; // Table name 
  
  $mysqli_conection = new mysqli($mysql_db_hostname, $mysql_db_user, $mysql_db_password, $mysql_db_database);
    if ($mysqli_conection->connect_errno) {
    	echo "Failed to connect to MySQL: (" . $mysqli_conection->connect_errno . ") " . $mysqli_conection->connect_error;
    }
?>