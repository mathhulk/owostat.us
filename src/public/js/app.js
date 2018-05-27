var app = new Vue({
  el: '#app',
  data: {
    status: {}
  }
})

window.fetch('/status').then(function(response) {
  return response.json();
}).then(function(status) {
  app.status = status;
})