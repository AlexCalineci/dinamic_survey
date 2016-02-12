<?php
session_start();
if (!isset($_SESSION['myusername'])) {
	header("location:login.php");
}
?>

<!DOCTYPE HTML>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="description" content="">
		<meta name="author" content="">
		<link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
		<link rel="stylesheet" href="./lib/font-awesome-4.1.0/css/font-awesome.min.css">
		<title>Survey prototype</title>

		<!-- Bootstrap core CSS -->
		<link href="./lib/bootstrap/css/bootstrap.min.css" rel="stylesheet">
		<link href="./lib/bootstrap/css/bootstrap-select.min.css" rel="stylesheet">
		<!-- Custom styles for this template -->
		<link href="./css/dashboard.css" rel="stylesheet">

		<!-- Just for debugging purposes. Don't actually copy this line! -->
		<!--[if lt IE 9]><script src="../../assets/js/ie8-responsive-file-warning.js"></script><![endif]-->

		<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
		<!--[if lt IE 9]>
		<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
		<script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
		<![endif]-->

	</head>

	<body>
		<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
			<div class="container-fluid">
				<div class="navbar-header">
					<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
						<span class="sr-only">Toggle navigation</span>

					</button>
					<a class="navbar-brand" href="#">Survey.me</a>
				</div>
				<div class="navbar-collapse collapse">
					<ul class="nav navbar-nav navbar-right"></ul>
					<form  method="post" role = "form" action="logout.php" class="nav navbar-nav navbar-right">
						<button id="logout"  type="submit" name="Submit" class="btn btn-sm">
							Log out
						</button>
					</form>
				</div>
			</div>
		</div>
		<div class="container-fluid">
			<div class="modal-backdrop fade in" id="spinner" style="display:none">
				<div class="alert alert-warning" style="position:absolute;left:40%;top:25%;width:400px"><img src="./img/select2-spinner.gif" /> Please wait...
				</div>
			</div>

			<div class="row">
				<div id="form_message" class="alert-info fade in" style="display:none;"></div>
				<!-- set up the modal to start hidden and fade in and out -->
				<div class="col-sm-3 col-md-3 sidebar">
					<div class="col-lg-9">
						<div class="panel panel-danger dashboard">
							<div class="panel-heading">
								<div class="btn-group">
									<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
										<span class="glyphicon glyphicon-cog"></span>
										<span class="caret"></span>
									</button>
									<ul class="dropdown-menu" role="menu">
										<li>
											<a href="#" id="saveButton">Save</a>
										</li>
										<li>
											<a href="#" id="loadButton">Open</a>
										</li>
										<li>
											<a href="#" id="emptyButton">Clear</a>
										</li>
										<li>
											<a href="#" id="deleteButton">Delete</a>
										</li>
									</ul>
								</div>
								Menu
							</div>
							<div class="panel-body" id="operations">
								<div class="input-group undo">
									<div class="btn-group">
										<button type="button" class="btn btn-default btn-xs" id="undo" href="#" data-toggle="tooltip" data-placement="top" title="Undo">
											<i class="fa fa-undo fa-lg"></i>
										</button>
										<button type="button" class="btn btn-default btn-xs " id="redo"  href="#" data-toggle="tooltip" data-placement="top" title="Redo">
											<i class="fa fa-undo fa-lg  fa-flip-horizontal"></i>
										</button>
									</div>
								</div><!-- /input-group -->
								<input type="text" class="form-control search" placeholder="Enter title here!" id="survey_name">
							</div>
						</div>
					</div><!-- /.col-lg-6 -->
					<div class="col-lg-9">
						<div class="panel panel-info but" id="container0" draggable="true">
							<div class="panel-heading">
								Create a New Question
							</div>
							<div class="panel-body">
								<div align="center">
									Drag and drop me to create a New Question/Survey
								</div>
							</div>
						</div>
					</div><!-- /.col-lg-6 -->
					<div class="col-lg-9">
						<div class="panel panel-success edit">
							<div class="panel-heading" id="editQ">
								Question & Answer Edit
							</div>
							<div class="panel-body" id="editoperations">
								<div class="input-group">
									<div class="input-group-btn">
										<button type="button" class="btn btn-default btn-xs" id="addTitle" data-toggle="tooltip" data-placement="top" title="Save">
											<span class="glyphicon glyphicon-ok"></span>
										</button>
										<button type="button" class="btn btn-default btn-xs" id="removeTitle" data-toggle="tooltip" data-placement="top" title="Delete">
											<span class="glyphicon glyphicon-remove"></span>
										</button>

									</div><!-- /btn-group -->

								</div><!-- /input-group -->
								<textarea class="form-control inputEdits" placeholder="Enter the Question here!" id="surveyQT"></textarea>
								<div class="input-group">
									<div class="input-group-btn">
										<button type="button" class="btn btn-default btn-xs" id="addList" data-toggle="tooltip" data-placement="top" title="Save">
											<span class="glyphicon glyphicon-ok"></span>
										</button>
										<button type="button" class="btn btn-default btn-xs" id="removeList" data-toggle="tooltip" data-placement="top" title="Delete">
											<span class="glyphicon glyphicon-remove"></span>
										</button>

									</div><!-- /btn-group -->

								</div><!-- /input-group -->
								<textarea class="form-control inputEdits" placeholder="Enter possible Answers!" id="surveyQV"></textarea>
							</div>
						</div>
					</div><!-- /.col-lg-6 -->
				</div>
				<!-- Modal -->
				<div class="modal fade" id="dialogBox" tabindex="-1" role="dialog" aria-labelledby="dialogLabel" aria-hidden="true"></div>
				<div class="col-md-8 col-md-offset-3 main" id='main'>
					<div class="col-md-10 col-md-9 placeholder" id="drop"></div>
				</div>
			</div>
		</div>

		<!-- Bootstrap core JavaScript
		================================================== -->
		<!-- Placed at the end of the document so the pages load faster -->
		<script src="http://code.jquery.com/jquery-2.0.3.min.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
		<script src="./javascript/jquery.jsPlumb-1.5.5-min.js"></script>
		<script src="./lib/bootstrap/js/bootstrap.min.js"></script>
		<script src="./lib/bootstrap/js/bootstrap-select.min.js"></script>
		<script src="//code.jquery.com/ui/1.10.4/jquery-ui.js"></script>
		<script src="./javascript/js_utils.js"></script>
		<script src="./javascript/jplumb_survey.js"></script>

	</body>

</html>
