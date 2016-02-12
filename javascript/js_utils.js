/* function for add event on dragged*/
var addEvent = (function () {
  if (document.addEventListener) {
    return function (el, type, fn) {
      if (el && el.nodeName || el === window) {
        el.addEventListener(type, fn, false);
      } else if (el && el.length) {
        for (var i = 0; i < el.length; i++) {
          addEvent(el[i], type, fn);
        }
      }
    };
  } else {
    return function (el, type, fn) {
      if (el && el.nodeName || el === window) {
        el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
      } else if (el && el.length) {
        for (var i = 0; i < el.length; i++) {
          addEvent(el[i], type, fn);
        }
      }
    };
  }
})();

/*bootstrap function for info alert*/

function bootstrap_alert(elem, message, timeout) {
  $(elem).show().html('<div class="alert"><a href="#" class="close" data-dismiss="alert" aria-hidden="true">&times;</a><strong>Info!</strong><span> '+message+' </span></div>');
	$(".close").click(function(){
        $(elem).hide();
    });
	
  if (timeout || timeout === 0) {
    setTimeout(function() { 
      $(elem + '.alert-info').hide();
    }, timeout);    
  }
};

function modalDialog(title,elem, message,withCancel){
	  var cancel = (withCancel == 1)?'<button type="button" class="btn btn-default" id = "cancel" data-dismiss="modal">Cancel</button>':'';
	  $(elem).html('<div class="modal-dialog">'+
				    '<div class="modal-content">'+
				      '<div class="modal-header">'+
				        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
				        '<h4 class="modal-title" id="dialogLabel">'+title+'</h4>'+
				      '</div>'+
				      '<div class="modal-body">'+
				        message+
				      '</div>'+
				      '<div class="modal-footer">'+
				        '<button type="button" class="btn btn-default" id = "confirm" data-dismiss="modal">OK</button>'+
				        cancel+
				      '</div>'+
				    '</div>'+
				  '</div>'
).modal('show');
};
