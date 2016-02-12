<?php
require ("dbconn.php");
?>

<?PHP
  if (!isset($_SESSION)){
  	session_start();
  }
  error_reporting(E_ALL ^ E_NOTICE);
  $db = $mysqli_conection;
  $errorMessage = "";
  $user_id = $_SESSION['user_id'];
  $survey_json = $_POST['survey_json'];
  $survey_name = $_POST['survey_name'];

  $clean_user_id = mysqli_real_escape_string($db, $user_id);
  $clean_survey_json = mysqli_real_escape_string($db, $survey_json);
  $clean_survey_name = mysqli_real_escape_string($db, $survey_name);
  $is_u = 0;
  $is_i = 0;
  
  if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    //current id for survey
    $curridsql = "Select id from surveys where survey_name = '" . $clean_survey_name . "' and user_id=" . $clean_user_id . "  limit 1;";
    $curr = mysqli_query($db, $curridsql);
    if (!$curr) {
    	echo $curridsql;
      exit();
    } else {
      $curr_id = mysqli_fetch_assoc($curr);
      $curr_idx = $curr_id['id'];
    }

	 /*insert/update into survey table*/
    if (!isset($_POST['retrieve']) && !isset($_POST['search']) && !isset($_POST['del']) && !isset($_POST['load'])) {

      $verify_name = "Select * from surveys where survey_name = '" . $clean_survey_name . "' and user_id=" . $clean_user_id;
      $res = mysqli_query($db, $verify_name);
      $count = mysqli_num_rows($res);


      if ($count > 0) {
        $usql = "Update surveys set updated_at = NOW(),survey_json = '" . $clean_survey_json . "' where user_id=" . $clean_user_id . " and survey_name='" . $clean_survey_name . "'";

        $uresult = mysqli_query($db, $usql);
		
		 /*workaround - when update the surveys - delete the corespondent values from survey_details and insert new ones*/
		$udel_survey_det = "Delete from survey_details where user_id=" . $clean_user_id . " and survey_id = ".$curr_idx.";";
      	$uret_del_survey_det = mysqli_query($db, $udel_survey_det);
        
        $is_u = 1;
		echo 'Succesfuly saved!';

      } else {
        $isql = "INSERT INTO surveys (id, user_id, survey_name, survey_json,created_at) VALUES (null,".$clean_user_id.",'".$clean_survey_name."','".$clean_survey_json."',now())";
        $iresult = mysqli_query($db, $isql);
        $survey_id = mysqli_insert_id($db);
        $is_i = 1;
        echo 'Succesfuly saved!';

      }
	}
      /*decode the json send within ajax for survey_details*/
      if (isset($_POST['survey_json'])) {
      $parse_result = json_decode($survey_json, true);
      foreach ($parse_result['connections'] as $connections) {
        $source = $connections['pageSourceId'];
        $target = $connections['pageTargetId'];
		$label =  $connections['label'];
        foreach ($parse_result['nodes'] as $nodes) {
          if ($nodes['blockId'] == $source) {
          	$ptext  = $nodes['qText'];
          	if (sizeof($nodes['elements'],0)>=1){
	            foreach ($nodes['elements'] as $pelements) {
	               if($pelements['selected']=='Y'){
		               $pValue = $pelements['elemValue'];
		               $pchecked = $pelements['selected'];
				   }
				   if($pelements['elemValue']==$label){
				   	 	$pno = $pelements['qNr'];
				   }
	            }
			}else {
				$pValue = null;
				$pchecked = null;
			}
          }
          if ($nodes['blockId'] == $target) {
          	$ctext  = $nodes['qText'];         	
			if (sizeof($nodes['elements'],0)>=1){
	            foreach ($nodes['elements'] as $celements) {
	            	if($celements['selected']=='Y'){
	              		$cValue = $celements['elemValue'];
				  		$cchecked = $celements['selected'];
						$cno = $celements['qNr'];
					}
	            }
			}else {
				$cValue = null;
		    	$cchecked = null;
			}
          }

        }
		
		/*update survey details with corespondent values*/
        if ($is_u == 1 && $is_i == 0) {
	      	   	 $usql_det = "insert into survey_details(survey_id,user_id,parentid,parentText,parentckVal,parentck,childId,childText,childckVal,childck,relation_detail,ans_no)
	          					values(". $curr_idx .
	          						  "," . $clean_user_id . 
	          						  ",'" . $source . 
	          						   "','" . $ptext . 
	          						  "','" . $pValue . 
	          						  "','" . $pchecked . 
	          						  "','" . $target . 
	          						   "','" . $ctext . 
	          						  "','" . $cValue . 
	          						  "','" . $cchecked . 
	          						  "','" . $label .
	          						  "','" . $pno . "');";
	         	 $uresult_det = mysqli_query($db, $usql_det);
				  if (!$uresult_det) {
		            echo $usql_det;
		            echo mysqli_error($db);
		            exit();
	          	  }
			  	
        }
		/*insert into survey details with corespondent values*/
        if ($is_u == 0 && $is_i == 1) {
          $isql_det = "insert into survey_details(survey_id,user_id,parentid,parentText,parentckVal,parentck,childId,childText,childckVal,childck,relation_detail,ans_no)
          					values(". $survey_id .
          						  "," . $clean_user_id . 
          						  ",'" . $source . 
          						  "','" . $ptext . 
          						  "','" . $pValue . 
          						  "','" . $pchecked . 
          						  "','" . $target . 
          						  "','" . $ctext . 
          						  "','" . $cValue . 
          						  "','" . $cchecked . 
          						  "','" . $label . 
          						  "','" . $pno ."');";
          						  
          $iresult_det = mysqli_query($db, $isql_det);
          if (!$iresult_det) {
            echo $isql_det;
            echo mysqli_error($db);
            //exit();
          }
        }
      }

	/*retrieve again de curidx for details insert*/
	$curridsql = "Select id from surveys where survey_name = '" . $clean_survey_name . "' and user_id=" . $clean_user_id . "  limit 1;";
    $curr = mysqli_query($db, $curridsql);
    if (!$curr) {
    	echo $curridsql;
      exit();
    } else {
      $curr_id = mysqli_fetch_assoc($curr);
      $curr_idx = $curr_id['id'];
    }
    /*empty survey_qa_det*/
	$del_survey_log = "Delete from survey_qa_det where user_id =" . $clean_user_id . " and survey_id = ".$curr_idx.";";
	$ret_del_survey_log = mysqli_query($db, $del_survey_log);
	echo $mysqli_insert_id;
      if (!$ret_del_survey_log) {
       // exit(); 
      }else {
      	
      }
			      
	/*parse json for survey_qa_det insert*/
	   foreach ($parse_result['nodes'] as $nodes) {
          $blockId = $nodes['blockId'];
          $questionText = $nodes['qText'];
		  $uniqueId = $nodes['uniqueId'];
		  
	       foreach ($nodes['elements'] as $answers) {
	       	if($answers['tagNode']=='OPTION'){
	              $lastSelected = $answers['selected'];
		          $answertext = $answers['elemValue'];
				  $answerNr = $answers['qNr'];
				/*insert values to survey_qa_det */
		          $isql_sqa = "insert into survey_qa_det(survey_id,user_id,survey_name,uniqueId,blockId,questionText,answerNr,answertext,lastSelected)
		          					values(". $curr_idx .
		          						  "," . $clean_user_id . 
		          						  ",'" . $clean_survey_name . 
		          						  "'," . $uniqueId . 
		          						  ",'" . $blockId . 
		          						  "','" . $questionText . 
		          						  "'," .  $answerNr . 
		          						  ",'" . $answertext . 
		          						  "','" . $lastSelected . 
		          						  "');";
		          						  
		          $isql_sqares = mysqli_query($db, $isql_sqa);
		          if (!$isql_sqares) {
		            echo $isql_sqa;
		            echo mysqli_error($db);
		          }
			/*end insert values to survey_qa_det */
			}
		}
				
	
	  }

	}
	/*retrive values for input*/
    if (isset($_POST['retrieve'])) {
      $rsql = "Select survey_json from surveys where survey_name = '" . $clean_survey_name . "' and user_id=" . $clean_user_id . "  limit 1";

      $ret = mysqli_query($db, $rsql);
	    $counter = mysqli_num_rows($ret);
      if (!$ret) {
        exit();
      } else {
      	 if ($counter>0){
      	   while ($row = $ret->fetch_assoc()) {
              $retData[]=$row["survey_json"];
              echo json_encode($retData);
           }
        }else{
        	echo 0;
        }
      }
     
    }

    /*delete the survey , survey_details and survey_qa_det*/
    if (isset($_POST['del'])) {
     
	  $del_survey = "Delete from surveys where survey_name = '" . $clean_survey_name . "' and user_id=" . $clean_user_id.";";
	  //echo $del_survey;
	  $del_survey_det = "Delete from survey_details where user_id=" . $clean_user_id . " and survey_id = ".$curr_idx.";";
	  $del_survey_qa = "Delete from survey_qa_det where user_id=" . $clean_user_id . " and survey_id = ".$curr_idx.";";
	  //echo $del_survey_det;
	  
      $ret_del_survey_det = mysqli_query($db, $del_survey_det);
      if (!$ret_del_survey_det) {
      	echo 'Nothig to delete!';
        exit(); 
      }else {
      	
      }
	  
	  $ret_del_survey = mysqli_query($db, $del_survey);
      if (!$ret_del_survey) {
      	echo 'Nothig to delete!';
        exit(); 
		  
      }
	  
	  $ret_del_qa = mysqli_query($db, $del_survey_qa);
      if (!$ret_del_qa) {
      	echo 'Nothig to delete!';
        exit(); 
		  
      }
      else { echo 'Succesfuly deleted!';}
    }
	
    
	if (isset($_POST['load'])) {
      $search_sql = "select * from surveys where  user_id=" . $clean_user_id . " order by created_at desc";
      $sql_res = mysqli_query($db, $search_sql);
        while ($row = mysqli_fetch_array($sql_res)) {
          $survey_name = $row['survey_name'];
          $id  = $row['id'];
          $created_at = $row['created_at'];
          
          $f_result = '
          <tr>
            '.'<td>'.$id.'</td>'.'<td class="survey_val">'.$survey_name.'</td>'.'<td>'.$created_at.'</td>'.'
          </tr>';
          echo $f_result;
          }
    }
  }

  mysqli_close($db);
?>