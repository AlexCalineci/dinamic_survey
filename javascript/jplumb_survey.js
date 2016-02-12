;(function() {

jsPlumb.ready(function() {
		
	/*undo/redo variables*/	
	var all = null; //undo
	var allRedo = null; //redo
	var hasUndo = false;
	var hasRedo = false;
	
	/*global variables*/
	var numberOfElements = 0;
	var currid=0;
	//var existentConnNr=0;
	var existingAnswers=0;
	var selAnswer=[];
	var currAnswer;
	
	
	/*global variables used for undo-redo*/
	
	/*used for level algoritm*/
	var existentDragged = [];
	var currentElemDraged = [];
	var existentConns = [];
	var existentParents =[];
	var existentChilds =[];
	
	
	/*used for set drop area size*/
	var maxDropHeight=[];
	var maxDropWidth=[];
	
	/* used for plumbing*/
	
	var color = "gray";
	var arrowCommon = {
		foldback : 0.7,
		fillStyle : color,
		width : 14
	};
	
	overlays = [["Arrow", {
		location : 0.7
	}, arrowCommon], ["Arrow", {
		location : 0.3,
		direction : -1
	}, arrowCommon]]; 

		
   /*top endpoint destination config*/
	var TopEndpointDestination = {
		isSource : false,
		isTarget : true,
		detachable : true,
		anchors : ["Top"],
		overlays : overlays,
		endpoint : ["Dot", {
			radius : 6
		}],
		connectorStyle : {
			lineWidth : 3,
			strokeStyle : '#666'
		},
		maxConnections : 1,
		connectorOverlays : [["Arrow", {
			width : 15,
			length : 20
		}]],
		Container : "drop",
		Connector : ["Bezier", {
			curviness : 50
		}],
		DragOptions : {
			cursor : "pointer",
			zIndex : 2000
		},
		PaintStyle : {
			strokeStyle : color,
			lineWidth : 2
		},
		EndpointStyle : {
			radius : 9,
			fillStyle : color
		},
		HoverPaintStyle : {
			strokeStyle : "#ec9f2e"
		},
		EndpointHoverStyle : {
			fillStyle : "#ec9f2e"
		},

	};

	/*bottom endpoint config*/
	var BottomEndpointDestination = {
		isSource : true,
		isTarget : false,
		overlays : overlays,
		anchors : ["Bottom"],
		detachable : true,
		endpoint : ["Dot", {
			radius : 6
		}],
		connectorStyle : {
			lineWidth : 3,
			strokeStyle : '#666'
		},
		maxConnections : -1,
		connectorOverlays : [["Arrow", {
			width : 15,
			length : 20
		}]],
		Container : "drop",
		Connector : ["Bezier", {
			curviness : 50
		}],
		DragOptions : {
			cursor : "pointer",
			zIndex : 2000
		},
		PaintStyle : {
			strokeStyle : color,
			lineWidth : 2
		},
		EndpointStyle : {
			radius : 9,
			fillStyle : color
		},
		HoverPaintStyle : {
			strokeStyle : "#ec9f2e"
		},
		EndpointHoverStyle : {
			fillStyle : "#ec9f2e"
		},
	};

	
	/*edit events */
	
	//change curent edit q title
	$('#addTitle').on('click', function() {
		all = memUR();
		hasUndo = true;
		updateUI(hasUndo,hasRedo,all,allRedo);
		var text = $('#surveyQT').val();
		$('#' + currid).find('.panel-heading > b').html(text);
		jsPlumb.repaintEverything();
	}); 

	//remove title
	$('#removeTitle').on('click', function() {
		all = memUR();
		hasUndo = true;
		updateUI(hasUndo,hasRedo,all,allRedo);
		var text = '';
		$('#' + currid).find('.panel-heading > b').html(text);
		jsPlumb.repaintEverything();
	});
	
	//add to list values
	$('#addList').on('click', function() {
		all = memUR();
		hasUndo = true;
		hasRedo = false;
		updateUI(hasUndo,hasRedo,all,allRedo);
		var allexText = [];
		$('.selectpicker').selectpicker('show');
		var text = $('#surveyQV').val();
		$('#' + currid).find($("select option")).each(function() {
			allexText.push($(this).text());
		});

		if ($.inArray(text, allexText) !== -1) {
			modalDialog('<b>Info!</b>', '#dialogBox', 'The answer to be saved allready exists in the current answers list!', 0);
		} else if (text == '') {
			modalDialog('<b>Info!</b>', '#dialogBox', 'Please enter the answer to be saved!', 0);
		} else {
			$('#' + currid).find(".selectpicker").append('<option>' + text + '</option>');
			$('#' + currid).find(".selectpicker").selectpicker('val', text);
			$('#' + currid).find(".selectpicker").selectpicker('refresh');
			$('#' + currid).find(".selectpicker").selectpicker('render');
			jsPlumb.repaintEverything();
		}
	});

	//remove entered list val	
 
	$('#removeList').on('click', function() {
		all = memUR();
		hasUndo = true;
		hasRedo = false;
		updateUI(hasUndo,hasRedo,all,allRedo);
		var allexText = [];
		var text = $('#surveyQV').val();
		
		var exText = $('#' + currid).find('option:selected').val();
		$('#' + currid).find($("select option")).each(function() {
			allexText.push($(this).text());
		});
	    
		if ($.inArray(text, allexText) == -1) {
			modalDialog('<b>Info!</b>', '#dialogBox', 'The answer to be deleted does not exists in the current answers list!', 0);
		};
		if (text == '') {
			modalDialog('<b>Info!</b>', '#dialogBox', 'Please enter the answer to be deleted!', 0);
		}
		if (text == exText && text != 'Any answer') {
			modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to delete this answer: ' + '<b>' + text + '</b> ? <br> Removing this answer will also delete all the child questions!', 1);
			$('#confirm').on('click', function() {
					all = memUR();
					hasUndo = true;
					updateUI(hasUndo,hasRedo,all,allRedo);
				var existentConnObj = jsPlumb.getConnections({
					source : currid
				});
				$.each(existentConnObj, function(idx, connection) {
					var label = connection.getOverlay("label").getLabel();
					if (label == exText) {
						var parent = connection.targetId;
						all = memUR();
						remRec(parent);
						updateUI(hasUndo,hasRedo,all,allRedo);
					}
				});

				$('#' + currid).find('option:selected').remove();
				$('#' + currid).find(".selectpicker").selectpicker('refresh');
				jsPlumb.repaintEverything();
				$('#surveyQV').val($('#' + currid).find('option:selected').val());
			});
		}else if(text == 'Any answer'){
			modalDialog('<b>Info!</b>', '#dialogBox', 'The default <b>"Any answer"</b> cannot be deleted!', 0);
		};
		
	}); 

		
	 /*end edit events */
	
  /*undo-redo functions*/ 		
 
	function setUndo(d) {
		var flowChartJson = d;
		var drop = document.querySelector('#drop');
		var flowChart = JSON.parse(flowChartJson);
		var nodes = flowChart.nodes; 
	
		$.each(nodes, function(index, elem) {		
			maxDropHeight.push(elem.positionY);
			maxDropWidth.push(elem.positionX);
			if (elem.nodetype === 'startpoint') {
				repositionElement('startpoint', elem.positionX, elem.positionY);
			} else if (elem.nodetype === 'endpoint') {
				repositionElement('endpoint', elem.positionX, elem.positionY);
			} else if (elem.nodetype === 'task') {
				var id = addTask(elem.blockId);
				repositionElement(id, elem.positionX, elem.positionY);
			} else if (elem.nodetype === 'decision') {
						var id = addDecision(elem.blockId);
						repositionElement(id, elem.positionX, elem.positionY);
			} else {

			}
	  
		    $('#drop').css("height",Math.max.apply(Math,maxDropHeight)+100+'px');
	        $('#drop').css("width",Math.max.apply(Math,maxDropWidth)+150+'px');  
	
			var str = '';
			var sel='';
			var qnumber  = parseInt(elem.uniqueId);
			
			for (var prop in elem.elements) {
				var value = elem.elements[prop];
			    sel = (value.selected == 'Y') ? ' selected' : '';
				str += '<' + value.tagNode + sel+' >' +value.elemValue+'</' + value.tagNode +'>';
			}
			drop.innerHTML += 
			'<div class="panel panel-info window dragged" id="' + elem.blockId + '" style="left:' + elem.positionX + 'px; top:' + elem.positionY + 'px;" >' 
				+'<div class="panel-heading overflow">' 
				+'<button type="button" class="btn btn-default btn-xs opp" id="button_'+elem.uniqueId+'" data-toggle="tooltip" data-placement="top" title="Remove this Question">'
				+'<span class="glyphicon glyphicon-remove"></span>'
				+'</button><b>'+elem.qText+'</b>'+
				'</div>' + 
				'<div class="panel-body">' + 
					'<div style="text-align:left;margin: 2px;"><b>Answers</b></div>'+
					'<select class = "selectpicker show-tick" data-width="185px" id="' + elem.inputId + '">' +
						 +'<option>Any answer</option>'
	     				 +str +
					'</select>' + 
				'</div>' + 
			'</div>';
			
		});
	
		$('select').selectpicker({
				noneSelectedText : 'Select an Answer before link'
		}); 
		
		var dragged = $('.dragged');
		$.each(dragged, function (index, item) {
			existentDragged.push($(item).attr('id'));
		});
		       
		var connections = flowChart.connections;
			$.each(connections, function(index, elem) {
				/*begin- used for soring existing conns*/
				existentConns.push(elem.pageTargetId);
				existentConns.push(elem.pageSourceId);
				existentConns = jQuery.unique(existentConns);
				/*end*/
		
				var parentEndpoint = jsPlumb.addEndpoint(elem.pageSourceId, BottomEndpointDestination);
				
				var childEndpoint = jsPlumb.addEndpoint(elem.pageTargetId, TopEndpointDestination, {
	
					beforeDrop : function(component) {
						var existentConnObj = jsPlumb.getConnections({
							source : component.sourceId
						});
						if (uniqueAnswer(component.sourceId) == 'insuficient' || uniqueAnswer(component.sourceId) == 'equal') {
							return false;
						} else {
							return true;
						}
					}
				});
	
				jsPlumb.addEndpoint(elem.pageTargetId, BottomEndpointDestination);
				var connection1 = jsPlumb.connect({
					source : parentEndpoint,
					target : childEndpoint
				});
	
				connection1.setLabel({
					label : elem.label,
					location : 0.5,
					id : "label",
					cssClass : "aLabel"
				});
				
				$('#' + elem.pageSourceId).on('click', function(e) {
					$("#" + currid).removeClass("selectedDiv");
					var text = $('#' + elem.pageSourceId).find('.panel-heading > b').text();
					$('#surveyQT').val(text);
					$('#surveyQT').focus();
					$('#surveyQV').val($("#" + elem.pageSourceId).find('option:selected').val());
					currid = elem.pageSourceId;
					$("#" + elem.pageSourceId).addClass("selectedDiv");
				});
	
				$('#' + elem.pageSourceId).find('.opp').on("click", function() {
	
					modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to delete this question?<br> Removing this question will also delete all the child questions!', 1);
					$('#confirm').on('click', function() {
						all = memUR();
						remRec(elem.pageSourceId);
						updateUI(hasUndo,hasRedo,all,allRedo);
					});
	
				}); 
	
				$('#' + elem.pageTargetId).on('click', function(e) {
					$("#" + currid).removeClass("selectedDiv");
					var text = $('#' + elem.pageTargetId).find('.panel-heading > b').text();
					$('#surveyQT').val(text);
					$('#surveyQT').focus();
					$('#surveyQV').val($("#" + elem.pageTargetId).find('option:selected').val());
					currid = elem.pageTargetId;
					$("#" + elem.pageTargetId).addClass("selectedDiv");
				}); 
	
	
				$('#' + elem.pageTargetId).find('.opp').on("click", function() {
					modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to delete this question?<br> Removing this question will also delete all the child questions!', 1);
					$('#confirm').on('click', function() {
						all = memUR();
						remRec(elem.pageTargetId);
						updateUI(hasUndo,hasRedo,all,allRedo);
					});
	
				}); 
	
			});
	
		var remaindIds = $(existentDragged).not(existentConns).get();  
		$.each(remaindIds, function(index, val) {
			jsPlumb.addEndpoint(val, BottomEndpointDestination);
			jsPlumb.addEndpoint(val, TopEndpointDestination, {
				beforeDrop : function(component) {
					all = memUR();
					hasUndo = true;
					updateUI(hasUndo,hasRedo,all,allRedo);
					var existentConnObj = jsPlumb.getConnections({
						source : component.sourceId
					});
					existentConnNr = existentConnObj.length + 1;
					existingAnswers = $('#' + component.sourceId).find("option").length;
					if (existentConnNr > existingAnswers) {
						modalDialog('<b>Info!</b>', '#dialogBox', 'Please add another <b>Answer</b> before this link is created!', 0);
						return false;
					} else {
						return true;
					}
				}
			});
	
			$('#' + val).on('click', function(e) {
				$("#" + currid).removeClass("selectedDiv");
				var text = $('#' + val).find('.panel-heading > b').text();
				$('#surveyQT').val(text);
				$('#surveyQT').focus();
				$('#surveyQV').val($("#" + val).find('option:selected').val());
				currid = val;
				$("#" +val).addClass("selectedDiv");
			});
	
			$('#' + val).find('.opp').on("click", function() {
				modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to delete this question?<br> Removing this question will also delete all the child questions!', 1);
				$('#confirm').on('click', function() {
					all = memUR();
					remRec(val);
					updateUI(hasUndo,hasRedo,all,allRedo);
				});
			});
		}); 
	
		numberOfElements = flowChart.numberOfElements;
		
		jsPlumb.draggable($('.dragged'));
		
	};

	function setRedo(d) {
		setUndo(d);
		hasUndo = true;
	};

	function memUR() {
		var nodes = [];
			//parse dragged elements
			$(".dragged").each(function(idx, elem) {
				var $elem = $(elem);
				var endpoints = jsPlumb.getEndpoints($elem.attr('id'));
				var qtext =  $elem.find('.panel-heading > b').text();
				
				//parse inputs
				var $ei = $(elem).find('.selectpicker');
				$ei.each(function(i, e) {
					var $e = $(e);
					var elements = [];
					
					if ($e[i].childElementCount > 0) {
						for (var ix = 0; ix < $e[i].childNodes.length; ix++) {
							node = $e[i].childNodes[ix];
							var sel = (node.value == $e.find('option:selected').val()) ? 'Y' : 'N';
							var childofElement = [];
							if (node.childElementCount > 0) {
								for (var ic = 0; ic < node.childNodes.length; ic++) {
									child = node.childNodes[ic];
	
									if (child.nodeType === 1) {
										childofElement.push({
											tagNode : child.tagName,
											tagtype : child.type,
											checked : child.checked
										});
									}
								}
							}
								elements.push({
								tagNode : node.tagName,
								className : node.className,
								elemType : node.type,
								elemValue : node.value,
								selected:sel,
								childofElement:childofElement
							});
						}
					}
					nodes.push({
							uniqueId : $elem.attr('id').substring($elem.attr('id').indexOf('_') + 1),
							blockId : $elem.attr('id'),
							inputId : $ei[0].id,
							qText : qtext,
							nodetype : $elem.attr('data-nodetype'),
							positionX : parseInt($elem.css("left"), 10),
							positionY : parseInt($elem.css("top"), 10),
							elements : elements
						});
				});

		});

		var connections = [];
		$.each(jsPlumb.getConnections(), function(idx, connection) {
			label = connection.getOverlay("label");
			connections.push({
				connectionId : connection.id,
				pageSourceId : connection.sourceId,
				pageTargetId : connection.targetId,
				label : label.getLabel()
			});
		});

		var flowChart = {};
		flowChart.nodes = nodes;
		flowChart.connections = connections;
		flowChart.numberOfElements = numberOfElements;

		return JSON.stringify(flowChart);
	}

	
	
	function updateUI(hasUndo,hasRedo,all,allRedo) {
		if (all != null) {
			$('#undo').prop('disabled', false);
		}else{
			$('#undo').prop('disabled', true);
		}
		if (allRedo != null) {
			$('#redo').prop('disabled', false);
		} else {
			$('#redo').prop('disabled', true);
		}
		if(hasUndo){
			$('#undo').prop('disabled', false);
			$('#redo').prop('disabled', true);
		}
		if (hasRedo){
			$('#redo').prop('disabled', false);
			$('#undo').prop('disabled', true);
		}
	}
	
	$('#undo').on('click',function(){
			allRedo = memUR();
			emptySurvey();
			setUndo(all);
			hasRedo = true;
			hasUndo = false;
			updateUI(hasUndo,hasRedo,all,allRedo);
			
	});
	
	$('#redo').on('click',function(){
			emptySurvey();
			setRedo(allRedo);
			hasUndo = true;
			hasRedo = false;
			updateUI(hasUndo,hasRedo,all,allRedo);
			
	});
	
	updateUI(hasUndo,hasRedo,all,allRedo);
	
  /*end undo-redo functions*/
  
  //remove recursevly
	function remRec(parentConnId) {		
		var existentConnObj = jsPlumb.getConnections({
			source : parentConnId
		});
		
		$.each(existentConnObj, function(idx, connection) {
			remRec(connection.targetId);
			
		});
		remove($('#' + parentConnId));
	}


  //unique Answer verification
	function uniqueAnswer(curentQId) {
		var exconArray = [];
		var suficientVal;
		var existentVal;
		var existentConnObj = jsPlumb.getConnections({
			source : curentQId
		});
		var existentConnNr = existentConnObj.length + 1;
		existingAnswers = $('#' + curentQId).find("option").length;
		if (existentConnNr > existingAnswers) {
			modalDialog('<b>Info!</b>', '#dialogBox', 'Please add another <b>Answer</b> before this link is created!', 0);
			suficientVal = 'insuficient';
		} else {
			suficientVal = '';
			$.each(existentConnObj, function(idx, connection) {
				var label = connection.getOverlay("label").getLabel();
				exconArray.push(label);
			});
			var curval = $('#' + curentQId).find('option:selected').val();
			if ($.inArray(curval, exconArray) !== -1) {
				modalDialog('<b>Info!</b>', '#dialogBox', 'One Answer link to only One Question!', 0);
				existentVal = 'equal';
			} else {
				existentVal = 'not equal';
			}
		}
		if (suficientVal != '') {
			return suficientVal;
		} else if (existentVal != '') {
			return existentVal;
		}
	}



   function labelSet(component){
     var curVal = $('#'+component.sourceId).find('option:selected').val();
     component.setLabel({
        label : curVal,
        location : 0.5,
        id : "label",
        cssClass : "aLabel"
      });
   }
   
	 //Remove question
	function remove(e) {
		var parentnode = $(e)[0];
		id = $(e).attr('id');

		//get list of current endpoints
		var endpoints = jsPlumb.getEndpoints(parentnode);

		if (endpoints) {
			for (var i = 0; i < endpoints.length; i++) {
				jsPlumb.detach(id);
				jsPlumb.deleteEndpoint(endpoints[i]);
				$('#' + id).remove();
			}
		} else {
			$('#' + id).remove();

		}
		jsPlumb.recalculateOffsets();
		jsPlumb.repaintEverything();

		existentDragged.splice($.inArray(id, existentDragged), 1);
		existentParents.splice($.inArray(id, existentParents), 1);
		existentChilds.splice($.inArray(id, existentChilds), 1);

		/* -unused - old functionality
		 $.each(jsPlumb.getConnections(), function(idx, connection) {
		 connection.removeOverlay("label");
		 setLevel(connection);
		 });
		 */
	}

		
	function cancel(e) {
		if (e.preventDefault) {
			e.preventDefault();
		}
	}

	var dragItems = document.querySelectorAll('[draggable=true]');

	for (var i = 0; i < dragItems.length; i++) {
		addEvent(dragItems[i], 'dragstart', function(event) {
			// store the ID of the element, and collect it on the drop later on
			event.dataTransfer.setData('Text', this.id);
		});
	}

    
	var drop = document.querySelector('#drop');
	
	// Tells the browser that we *can* drop on this target
	addEvent(drop, 'dragover', cancel);
	addEvent(drop, 'dragenter', cancel);
	
	addEvent(drop, 'drop', function(e) {
		if (e.preventDefault) e.preventDefault(); // stops the browser from redirecting off to the text.
		all = memUR();
		updateUI(hasUndo, hasRedo, all, allRedo);		
		$('#surveyQT').focus();
		var win = Math.floor((Math.random()*1000)+1);
		var id = "dynamic_" + win;
		var inputId = "input_" + win;
		
		
		//create new window and add it to the body

		$('<div class="panel panel-info window dragged" id="' + id + '" >').appendTo('#drop')
		.html(
		'<div class="panel-heading overflow" id="pan_'+ win +'">' 
			+'<button type="button" class="btn btn-default btn-xs opp" id="button_'+win+'" data-toggle="tooltip" data-placement="top" title="Remove this Question">'
			+'<span class="glyphicon glyphicon-remove"></span>'
			+'</button> <b></b>'
			+ '</div>' 
			+ '<div class="panel-body">'
				+'<div style="text-align:left;margin: 2px;"><b>Answers</b></div>'
				    +'<select class="selectpicker show-tick" data-width="185px" id="'+inputId+'">'
				      +'<option>Any answer</option>'
					 +'</select>'
			+ '</div>'
		+ '</div>');

		/*enlarge drop area depends on dragged item position*/
		if(e.pageY >= $('#drop').height()){
		  $('#drop').css("height",$('#drop').height()+200+'px');
		}
		if(e.pageX >= $('#drop').width()){
		   $('#drop').css("width",$('#drop').width()+200+'px');
		}
		

		existentDragged.push(id);
		currentElemDraged.push(id);
		  $('#drop').mousemove(function(e) {
             var offset = $(this).offset();
             $('#drop').unbind('mousemove');
             repositionElement(id, e.pageX - offset.left,e.pageY - offset.top);
            
             jsPlumb.recalculateOffsets();
             jsPlumb.repaintEverything();
             
      	 });
      	
		
		$('#' + id).find('#button_' + win).on("click", function(e) {
			modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to delete this question?<br> Removing this question will also delete all the child questions!', 1);
			$('#confirm').on('click', function() {
				all = memUR();
				remRec(id);
				updateUI(hasUndo,hasRedo,all,allRedo);
			});
			
		}); 

		$("#" + currid).removeClass("selectedDiv");
		$('#surveyQT').val('');
		$('#surveyQT').focus();
		$('#surveyQV').val('');
		currid = id;
		$("#" + id).addClass("selectedDiv"); 

		//on div click event
	    $('#' + id).on('click', function(e) {
	      var text = $('#' + id).find('.panel-heading > b').text();
	      $("#" + currid).removeClass("selectedDiv");
	      $('#surveyQT').val(text);
	      $('#surveyQT').focus();
	      $('#surveyQV').val($("#" + id).find('option:selected').val());
	      currid = id;
	      $("#" + id).addClass("selectedDiv");
	    }); 

	  
		
		//enables bootstrap-select
		$('select').selectpicker({
			noneSelectedText : 'Select an Answer before link'
		}); 
		
		//set jsplumb properties
			jsPlumb.addEndpoint(id, BottomEndpointDestination);

			jsPlumb.addEndpoint(id, TopEndpointDestination, {
				beforeDrop : function(component) {
					all = memUR();
					hasUndo = true;
					updateUI(hasUndo,hasRedo,all,allRedo);
					var existentConnObj = jsPlumb.getConnections({
						source : component.sourceId
					});
					if(uniqueAnswer(component.sourceId)=='insuficient' || uniqueAnswer(component.sourceId)=='equal'){
						return false;
					}else{
						return true;
					}
				}
			}); 
		jsPlumb.draggable($('#' + id));
		
		hasUndo = true;
		hasRedo = false;
		updateUI(hasUndo,hasRedo,all,allRedo);
	}); 
	

	/* jsplumb event handlers for details on connection - it show an alert on page c jsplumbtoolkit.com*/

	/* double click on any connection - not used*/
	// jsPlumb.bind("dblclick", function(connection, originalEvent) {
		// alert("double click on connection from " + connection.sourceId + " to " + connection.targetId);
	// });
	
	/* single click on any endpoint - not used */
	// jsPlumb.bind("endpointClick", function(endpoint, originalEvent) {
		// alert("click on endpoint on element " + endpoint.elementId);
	// });
	
	/*context menu (right click) on any component. - not used*/
	// jsPlumb.bind("contextmenu", function(component, originalEvent) {
		// alert("context menu on component " + component.id);
		// originalEvent.preventDefault();
		// //return false;
	// });
	
	
	//on plumbing event - calculates autamaticaly -level & qnumber 


	jsPlumb.bind("beforeDrop", function(component, originalEvent) {
		var existentConnObj = jsPlumb.getConnections({
			source : component.sourceId
		});
		existentConnNr = existentConnObj.length + 1;
		existingAnswers = $('#' + component.sourceId).find("option").length;
		if (existentConnNr > existingAnswers) {
			modalDialog('<b>Info!</b>', '#dialogBox', 'Please add another <b>Answer</b> before this link is created!', 0);
			return false;
		} else {
			return true;
		}
		all = memUR();
		hasUndo = true;
		updateUI(hasUndo, hasRedo, all, allRedo);

	});


	
	jsPlumb.bind("connectionDragStop",function(component, originalEvent){
		labelSet(component);  
		jsPlumb.recalculateOffsets();
    	jsPlumb.repaintEverything();
    	hasUndo = true;
		hasRedo = false;
		updateUI(hasUndo,hasRedo,all,allRedo);
	});
	
 
   
	//get array position - not used
	function getPosition(arrayName, arrayItem) {
		for (var i = 0; i < arrayName.length; i++) {
			if (arrayName[i] == arrayItem)
				return i;
		}
	}
	
	//parse qnr pos
	function parseQnr(component) {
		var exconArray = [];
		var excon = jsPlumb.getConnections({
			source : component.sourceId
		});
		for (var ix = 0; ix < excon.length; ix++) {
			var exconVal = excon[ix];
			exconArray.push(exconVal.targetId);
		}
		pos = getPosition(exconArray, component.targetId) + 1;
		return pos;

	}

	//set the lvl function
	function setLevel(component) {
		$.each(jsPlumb.getConnections(), function(idx, connection) {
			existentChilds.push(connection.targetId);
			existentParents.push(connection.sourceId);
		});

		var existentConnObj = jsPlumb.getConnections({
			source : component.sourceId
		});
		var existentConnNr = existentConnObj.length;
	
		existentChilds = jQuery.unique(existentChilds);
		existentParents = jQuery.unique(existentParents);

		var curLevel = getPosition(existentParents, component.sourceId);

		var level = curLevel + 1;
		var Qnr = parseQnr(component);
		
			component.setLabel({
				label : 'Level'+level+'->Q'+Qnr,
				location : 0.5,
				id : "label",
				cssClass : "aLabel"
			});
			
	}

	//delete conection
  jsPlumb.bind("click", function(conn, originalEvent) {
  	all = memUR();
    modalDialog('Confirm!', '#dialogBox', 'Are you sure you want to delete this connection?', 1);
    $('#confirm').on('click', function() {
      jsPlumb.detach(conn);
      existentChilds.splice($.inArray(conn.targetId, existentChilds), 1);
    });

    /*--unused - old functionality
     $.each(jsPlumb.getConnections(), function(idx, connection) {
     connection.removeOverlay("label");
     setLevel(connection);
     });
     */
    jsPlumb.recalculateOffsets();
    jsPlumb.repaintEverything();
    
    hasUndo = true;
	hasRedo = false;
	updateUI(hasUndo,hasRedo,all,allRedo);
  }); 

			
	//delete survey function
	function deleteSurvey(){
			$.ajax({
			url : "php/crud_survey.php",
			type : 'POST',
			data : {
				survey_name : $("#survey_name").val(),
				del: 1
			},
			beforeSend : function() {
				$('#spinner').show();
			},
			success : function(d) {
				bootstrap_alert('#form_message',d, 5000);
			},
			complete : function() {
				$('#spinner').hide();
			}
		}); 
		
	}

	/*save survey - if the survey title doesn't it insert it else update it*/
	function saveSurvey() {
		var nodes = [];
		var qx;
		//parse dragged elements
		$(".dragged").each(function(idx, elem) {
			var $elem = $(elem);
			var endpoints = jsPlumb.getEndpoints($elem.attr('id'));
			var qtext =  $elem.find('.panel-heading > b').text();
			
			//parse inputs
			var $ei = $(elem).find('.selectpicker');
			$ei.each(function(i, e) {
				var $e = $(e);
				var elements = [];
				
				if ($e[i].childElementCount > 0) {
					for (var ix = 0; ix < $e[i].childNodes.length; ix++) {
						node = $e[i].childNodes[ix];
						
						var sel = (node.value == $e.find('option:selected').val()) ? 'Y' : 'N';
						var childofElement = [];
						if (node.childElementCount > 0) {
							for (var ic = 0; ic < node.childNodes.length; ic++) {
								child = node.childNodes[ic];

								if (child.nodeType === 1) {
									childofElement.push({
										tagNode : child.tagName,
										tagtype : child.type,
										checked : child.checked
									});
								}
							}
						}
						if (node.value=='Any answer'){
							qx = 0;
						}else{
							qx = qx+1;
						}
							elements.push({
							tagNode : node.tagName,
							qNr : qx,
							className : node.className,
							elemType : node.type,
							elemValue : node.value,
							selected:sel,
							childofElement:childofElement
						});
					}
				}
				nodes.push({
						uniqueId : $elem.attr('id').substring($elem.attr('id').indexOf('_') + 1),
						blockId : $elem.attr('id'),
						inputId : $ei[0].id,
						qText : qtext,
						nodetype : $elem.attr('data-nodetype'),
						positionX : parseInt($elem.css("left"), 10),
						positionY : parseInt($elem.css("top"), 10),
						elements : elements
					});
			});

		});

		var connections = [];
		$.each(jsPlumb.getConnections(), function(idx, connection) {
			label = connection.getOverlay("label");
			connections.push({
				connectionId : connection.id,
				pageSourceId : connection.sourceId,
				pageTargetId : connection.targetId,
				label : label.getLabel()
			});
		});

		var flowChart = {};
		flowChart.nodes = nodes;
		flowChart.connections = connections;
		flowChart.numberOfElements = numberOfElements;

		var flowChartJson = JSON.stringify(flowChart);
		
		$.ajax({
			url : "php/crud_survey.php",
			type : 'POST',
			data : {
				survey_json : flowChartJson,
				survey_name : $("#survey_name").val()
			},
			beforeSend : function() {
				// Code to display spinner
				$('#spinner').show();
			},
			success : function(d) {
				bootstrap_alert('#form_message',d, 5000);
			},
			complete : function() {
				// Code to hide spinner.
				$('#spinner').hide();
			}
		}); 

	}

	/*loads the survey from DB - survey table*/
	function loadSurvey(name) {
		$.ajax({
		    url: "php/crud_survey.php",
		    type: 'POST',
		    data: {
		    	survey_name:name,
		    	retrieve:1
		    },
			beforeSend : function() {
				// Code to display spinner
				$('#spinner').show();
			},
		    success: function(d) {
		    	if (d != 0){
		    		//alert(d);
					var flowChartJson = $.parseJSON(d);
					var drop = document.querySelector('#drop');
					var flowChart = JSON.parse(flowChartJson);
					var nodes = flowChart.nodes; 
		
					$.each(nodes, function(index, elem) {		
						maxDropHeight.push(elem.positionY);
	            		maxDropWidth.push(elem.positionX);
						if (elem.nodetype === 'startpoint') {
							repositionElement('startpoint', elem.positionX, elem.positionY);
						} else if (elem.nodetype === 'endpoint') {
							repositionElement('endpoint', elem.positionX, elem.positionY);
						} else if (elem.nodetype === 'task') {
							var id = addTask(elem.blockId);
							repositionElement(id, elem.positionX, elem.positionY);
						} else if (elem.nodetype === 'decision') {
							var id = addDecision(elem.blockId);
							repositionElement(id, elem.positionX, elem.positionY);
						} else {
	
						}
          
			            $('#drop').css("height",Math.max.apply(Math,maxDropHeight)+100+'px');
			            $('#drop').css("width",Math.max.apply(Math,maxDropWidth)+150+'px');  
            
						var str = '';
						var sel='';
						var qnumber  = parseInt(elem.uniqueId);
						
						for (var prop in elem.elements) {
							var value = elem.elements[prop];
						    sel = (value.selected == 'Y') ? ' selected' : '';
							str += '<' + value.tagNode + sel+' >' +value.elemValue+'</' + value.tagNode +'>';
						}
						drop.innerHTML += 
						'<div class="panel panel-info window dragged" id="' + elem.blockId + '" style="left:' + elem.positionX + 'px; top:' + elem.positionY + 'px;" >' 
							+'<div class="panel-heading overflow">' 
							+'<button type="button" class="btn btn-default btn-xs opp" id="button_'+elem.uniqueId+'" data-toggle="tooltip" data-placement="top" title="Remove this Question">'
							+'<span class="glyphicon glyphicon-remove"></span>'
							+'</button><b>'+elem.qText+'</b>'+
							'</div>' + 
							'<div class="panel-body">' + 
								'<div style="text-align:left;margin: 2px;"><b>Answers</b></div>'+
								'<select class = "selectpicker show-tick" data-width="185px" id="' + elem.inputId + '">' +
									 +'<option>Any answer</option>'
				     				 +str +
								'</select>' + 
							'</div>' + 
						'</div>';
						
					});
				
					$('select').selectpicker({
							noneSelectedText : 'Select an Answer before link'
					}); 
					
					var dragged = $('.dragged');
					$.each(dragged, function (index, item) {
						existentDragged.push($(item).attr('id'));
					});
					       
					var connections = flowChart.connections;
						$.each(connections, function(index, elem) {
							/*begin- used for soring existing conns*/
							existentConns.push(elem.pageTargetId);
							existentConns.push(elem.pageSourceId);
							existentConns = jQuery.unique(existentConns);
							/*end*/
					
							var parentEndpoint = jsPlumb.addEndpoint(elem.pageSourceId, BottomEndpointDestination);
							
							var childEndpoint = jsPlumb.addEndpoint(elem.pageTargetId, TopEndpointDestination, {

								beforeDrop : function(component) {
									var existentConnObj = jsPlumb.getConnections({
										source : component.sourceId
									});
									if (uniqueAnswer(component.sourceId) == 'insuficient' || uniqueAnswer(component.sourceId) == 'equal') {
										return false;
									} else {
										return true;
									}
								}
							});

							jsPlumb.addEndpoint(elem.pageTargetId, BottomEndpointDestination);
							var connection1 = jsPlumb.connect({
								source : parentEndpoint,
								target : childEndpoint
							});

							connection1.setLabel({
								label : elem.label,
								location : 0.5,
								id : "label",
								cssClass : "aLabel"
							});
							
							$('#' + elem.pageSourceId).on('click', function(e) {
								$("#" + currid).removeClass("selectedDiv");
								var text = $('#' + elem.pageSourceId).find('.panel-heading > b').text();
								$('#surveyQT').val(text);
								$('#surveyQT').focus();
								$('#surveyQV').val($("#" + elem.pageSourceId).find('option:selected').val());
								currid = elem.pageSourceId;
								$("#" + elem.pageSourceId).addClass("selectedDiv");
							});

							$('#' + elem.pageSourceId).find('.opp').on("click", function() {

								modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to delete this question?<br> Removing this question will also delete all the child questions!', 1);
								$('#confirm').on('click', function() {
									all = memUR();
									remRec(elem.pageSourceId);
									updateUI(hasUndo,hasRedo,all,allRedo);
								});

							}); 

							$('#' + elem.pageTargetId).on('click', function(e) {
								$("#" + currid).removeClass("selectedDiv");
								var text = $('#' + elem.pageTargetId).find('.panel-heading > b').text();
								$('#surveyQT').val(text);
								$('#surveyQT').focus();
								$('#surveyQV').val($("#" + elem.pageTargetId).find('option:selected').val());
								currid = elem.pageTargetId;
								$("#" + elem.pageTargetId).addClass("selectedDiv");
							}); 


							$('#' + elem.pageTargetId).find('.opp').on("click", function() {
								modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to delete this question?<br> Removing this question will also delete all the child questions!', 1);
								$('#confirm').on('click', function() {
									all = memUR();
									remRec(elem.pageTargetId);
									updateUI(hasUndo,hasRedo,all,allRedo);
								});

							}); 

						});

					var remaindIds = $(existentDragged).not(existentConns).get();  
					$.each(remaindIds, function(index, val) {
						jsPlumb.addEndpoint(val, BottomEndpointDestination);
						jsPlumb.addEndpoint(val, TopEndpointDestination, {
							beforeDrop : function(component) {
								var existentConnObj = jsPlumb.getConnections({
									source : component.sourceId
								});
								existentConnNr = existentConnObj.length + 1;
								existingAnswers = $('#' + component.sourceId).find("option").length;
								if (existentConnNr > existingAnswers) {
									modalDialog('<b>Info!</b>', '#dialogBox', 'Please add another <b>Answer</b> before this link is created!', 0);
									return false;
								} else {
									return true;
								}
							}
						});

						$('#' + val).on('click', function(e) {
							$("#" + currid).removeClass("selectedDiv");
							var text = $('#' + val).find('.panel-heading > b').text();
							$('#surveyQT').val(text);
							$('#surveyQT').focus();
							$('#surveyQV').val($("#" + val).find('option:selected').val());
							currid = val;
							$("#" +val).addClass("selectedDiv");
						});

						$('#' + val).find('.opp').on("click", function() {
							modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to delete this question?<br> Removing this question will also delete all the child questions!', 1);
							$('#confirm').on('click', function() {
								all = memUR();
								remRec(val);
								updateUI(hasUndo,hasRedo,all,allRedo);
							});
						});
					}); 

					numberOfElements = flowChart.numberOfElements;
					
					jsPlumb.draggable($('.dragged'));
						} else {
							bootstrap_alert('#form_message','There is no saved survey to open!', 5000);
							$('#spinner').hide();
						}

				},

				complete: function() {
					// Code to hide spinner.
					$('#spinner').hide();
				}, error: function() {
					$('#spinner').hide();
					modalDialog('<b>Info!</b>', '#dialogBox', 'You have an error on DB or WebServer! The records could not be retrieved!', 0);
				}
			});
			
	}

	
	function repositionElement(id, posX, posY) {
		$('#' + id).css('left', posX);
		$('#' + id).css('top', posY);
	}



	function emptySurvey() {
		if (currentElemDraged.length != '') {
			for (var i = 0; i < currentElemDraged.length; i++) {
				remove(currentElemDraged[i]);
			}
		}
		jsPlumb.detachEveryConnection();
		jsPlumb.deleteEveryEndpoint();

		/*empty all arrays*/
		currentElemDraged = [];
		existentDragged = [];
		existentConns = [];
		existentParents = [];
		existentChilds = [];

		/*empty drop area*/
		$('#drop').empty();
		/*reset to min-widt&height*/
		$('#drop').css("height", '500px');
		$('#drop').css("width", '900px');
	}


	//save survey

	$('#saveButton').click(function() {
		if ($("#survey_name").val() == '') {
			modalDialog('<b>Info!</b>', '#dialogBox', 'Please enter Survey Title for save!', 0);
		} else {
			if ($('#drop').html() == '') {
				modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to save the Survey <b>' + $("#survey_name").val() + '</b> ? <br>The drop area is empty and if the Survey already exists it will be overwriten!', 1);
				$('#confirm').on('click', function() {
					all = null;
					allRedo = null;
					hasUndo = false;
					hasRedo = false;
					updateUI(hasUndo,hasRedo,all,allRedo);
					saveSurvey();
				});
			} else {
				modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to save the Survey <b>' + $("#survey_name").val() + '</b> ?', 1);
				$('#confirm').on('click', function() {
					all = null;
					allRedo = null;
					hasUndo = false;
					hasRedo = false;
					updateUI(hasUndo,hasRedo,all,allRedo);
					saveSurvey();
				});
			}
		}

	}); 


	//load survey
	$('#loadButton').click(function() {
		if (hasUndo || hasRedo){
			modalDialog('<b>Info!</b>', '#dialogBox', 'Changes are made and Proceed Without Saving!', 1);
				$('#confirm').on('click', function() {
					emptySurvey();
					$.ajax({
					type : "POST",
					url : "php/crud_survey.php",
					data : {
						load : 1,
					},
					cache : false,
					success : function(html) {
						var content = '<div class="panel panel-default">'
	                          +'<div class="panel-body">'
	                            +'<table class="table table-bordered">'
	                            +'<thead>'
	                                +'<th>Survey ID</th>'
	                                +'<th>Survey Title</th>'
	                                +'<th>Created at</th>'
	                          +'</thead>'
	                            +html
	                          +'</table>'
	                         +'</div>'
	                     +'</div>';
					 modalDialog('<h4>Open Saved Survey</h4><br>Choose by clicking on desired survey title and then press <b>"OK"</b>','#dialogBox',content,1);
					 
					 var survey_name;
						$('table').on('click', 'tbody tr', function() {
							var state = $(this).hasClass('animatedColor');
							$('.animatedColor').removeClass('animatedColor');
							if (!state) {
								$(this).addClass('animatedColor');
							}
							survey_name = $(this).find('.survey_val').text();
						});
	
						$('#confirm').on('click', function() {
							emptySurvey();
							loadSurvey(survey_name);
							$("#survey_name").val(survey_name);
							all = null;
							allRedo = null;
							hasUndo = false;
							hasRedo = false;
							updateUI(hasUndo,hasRedo,all,allRedo);
						}); 
						
						
					},
					
					error : function() {
						modalDialog('<b>Info!</b>', '#dialogBox', 'You have an error on DB or WevServer! The records could not be retrieved!', 0);
					}
	
				});
		}); 
		}else{
		$.ajax({
				type : "POST",
				url : "php/crud_survey.php",
				data : {
					load : 1,
				},
				cache : false,
				success : function(html) {
					var content = '<div class="panel panel-default">'
                          +'<div class="panel-body">'
                            +'<table class="table table-bordered">'
                            +'<thead>'
                                +'<th>Survey ID</th>'
                                +'<th>Survey Title</th>'
                                +'<th>Created at</th>'
                          +'</thead>'
                            +html
                          +'</table>'
                         +'</div>'
                     +'</div>';
				 modalDialog('<h4>Open Saved Survey</h4><br>Choose by clicking on desired survey title and then press <b>"OK"</b>','#dialogBox',content,1);
				 
				 var survey_name;
					$('table').on('click', 'tbody tr', function() {
						var state = $(this).hasClass('animatedColor');
						$('.animatedColor').removeClass('animatedColor');
						if (!state) {
							$(this).addClass('animatedColor');
						}
						survey_name = $(this).find('.survey_val').text();
					});

					$('#confirm').on('click', function() {
						emptySurvey();
						loadSurvey(survey_name);
						$("#survey_name").val(survey_name);
						all = null;
						allRedo = null;
						hasUndo = false;
						hasRedo = false;
						updateUI(hasUndo,hasRedo,all,allRedo);
					}); 
				},
				
				error : function() {
					modalDialog('<b>Info!</b>', '#dialogBox', 'You have an error on DB or WevServer! The records could not be retrieved!', 0);
				}

			});
		}
	});

	//empty drop area
	$('#emptyButton').click(function() {
		if ($('#drop').html() != '') {
			modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to clear all content?', 1);
			$('#confirm').on('click', function() {
				all = null;
				allRedo = null;
				hasUndo = false;
				hasRedo = false;
				updateUI(hasUndo,hasRedo,all,allRedo);
				emptySurvey();
				$("#survey_name").val('');
				$("#surveyQT").val('');
				$("#surveyQV").val('');
			});
		} else {
			$("#survey_name").val('');
		}

	});


	//delete survey
	$('#deleteButton').click(function() {
		if ($("#survey_name").val() == '') {
			modalDialog('<b>Info!</b>', '#dialogBox', 'Please enter Survey Title for delete!', 0);
		} else {
			modalDialog('<b>Confirm!</b>', '#dialogBox', 'Are you sure you want to delete the Survey <b>' + $("#survey_name").val() + '</b> ?', 1);
			$('#confirm').on('click', function() {
				emptySurvey();
				deleteSurvey();
				all = null;
				allRedo = null;
				hasUndo = false;
				hasRedo = false;
				$("#survey_name").val('');
			});
		}
	});

	
});

})();