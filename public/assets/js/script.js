// FUNCTIONS
function parse(template, data) {
	$.each(data, function(index, value) {
		template = template.replace(new RegExp(index, "g"), value);
	});
	return template;
}

// EVENTS
$(document).ready(function( ) {
	$.get("status", function(data) {	
		$.get("templates/service.txt", function(template) {
			$.each(data.services, function(index, value) {
				$("#services .row").append(parse(template, {"{{ status }}": value.online ? "online" : "offline", "{{ name }}": index, "{{ description }}": value.description, "{{ href }}": value.href}));
			});
		});
		
		$.get("templates/domain.txt", function(template) {
			$.each(data.domains, function(index, value) {
				$("#domains .row").append(parse(template, {"{{ status }}": value.online ? "online" : "offline", "{{ name }}": index}));
			});
		});
	});
});