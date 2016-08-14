<template>
  <div id="app">
    <div id="chart_div"></div>
    <h1>{{ score }}</h1>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      msg: 'Hello Vue!',
      score: '',
      chart: '',
      chart_data: '',
      chart_options: ''
    }
  },
  created () {
    // init gauge
    google.charts.load('current', {'packages':['gauge']})

    google.charts.setOnLoadCallback(() => {

      this.chart_data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Sentiment', this.score]
      ])

      this.chart_options = {
        width: 16000, height: 480,
        min: -1, max: 1,
        majorTicks: ['Neg', 'Neutral', 'Pos'],
        redFrom: -1, redTo: -.1,
        greenFrom: .1, greenTo:1,
        yellowFrom:75, yellowTo: 90,
        minorTicks: 10,
      }

      this.chart = new google.visualization.Gauge(document.getElementById('chart_div'))

      this.chart.draw(this.chart_data, this.chart_options)

    })

    // connect to socket endpoint
    const socket = io.connect('http://localhost:3001');
    socket.on('score', (data) => {
      console.log(data);
      this.score = data;

      this.chart.draw(google.visualization.arrayToDataTable([
          ['Label', 'Value'],
          ['Sentiment', this.score]
        ]), this.chart_options)
    });

  }
}
</script>

<style>
body {
  font-family: Helvetica, sans-serif;
}
</style>
