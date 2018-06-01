// variables
var application = new Vue({
	el: ".application",
	data: {
		status: {}
	}
});

// api request events
$(document).ready(function() {
	$.getJSON("/status", function(data) {
		application.status = data;
	});
	
	$(document).on("click", ".sort .select", function() {
		if($(this).attr("data-sort") === "all") {
			$(".status").show();
		} else {
			$(".status").hide();
			$(".status." + $(this).attr("data-sort")).show();
		}
	});
});