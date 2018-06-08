/*
 *	FUNCTIONS
 */
function showStatus() {
	$(".status, h2:not(:eq(2)), .services, .domains").show();
	$("h2:eq(2)").hide();
}

function toggleTitle() {
	if($(".services").children(":visible").length === 0) $("h2:first, .services").hide();
	if($(".domains").children(":visible").length === 0) $("h2:eq(1), .domains").hide();
	if($("h2:visible").length === 0) $("h2:eq(2)").show();
}

/*
 *	EVENTS
 */
$(document).ready(function() {
	$(".sort").show();
	$("h2:first-of-type").css("padding-top", "30px");
	
	$(document).on("focus", ".sort .search", function() {
		$(this).removeAttr("placeholder");
	});
	
	$(document).on("blur", ".sort .search", function() {
		$(this).attr("placeholder", "Find");
	});
	
	$(document).on("click", ".sort .select", function() {
		showStatus();
		if($(this).attr("data-sort") !== "all") {
			$(".status:not(." + $(this).attr("data-sort") + ")").hide();
			toggleTitle();
		}
	});
	
	$(document).on("keyup", ".sort .search", function() {
		var search = $(this).val().toLowerCase();
		showStatus();
		if(search !== "") {
			$(".status").each(function() {
				if(!$(this).text().toLowerCase().includes(search)) $(this).hide();
			});
			toggleTitle();
		}
	});
});