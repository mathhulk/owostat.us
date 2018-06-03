//
//	EVENTS
//
$(document).ready(function() {
	$.get("/templates/status.txt", function(template) {
		$.getJSON("/status", function(status) {
			$.each(status.domains, function(index, value) {
				$(".domains").append(template.replace("{{ domain }}", index).replace("{{ status }}", value));
			});
			$.each(status.services, function(index, value) {
				$(".services").append(template.replace("{{ domain }}", index).replace("{{ status }}", value));
			});
		});
	});
	
	$(document).on("click", ".sort .select", function() {
		if($(this).attr("data-sort") === "all") {
			$(".status, h2, .services, .domains").show();
		} else {
			$(".status").hide();
			$(".services, .domains, h2:first, h2:last, .status." + $(this).attr("data-sort")).show();
			if($(".services").children(":visible").length === 0) $("h2:first, .services").hide();
			if($(".domains").children(":visible").length === 0) $("h2:last, .domains").hide();
		}
	});
});