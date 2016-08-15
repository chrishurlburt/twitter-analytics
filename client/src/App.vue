<template>
  <div id="app">
    <div id="chart_div"></div>
    <h1>{{ score }}</h1>

    <h3>Positive</h3>
    <ul>
      <li v-for="tweet in positive">{{ tweet }}</li>
    </ul>

    <h3>negative</h3>
    <ul>
      <li v-for="tweet in negative">{{ tweet }}</li>
    </ul>

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
      positive: [],
      negative: [],
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
        min: -5, max: 5,
        majorTicks: ['Neg', 'Neutral', 'Pos'],
        redFrom: -5, redTo: -.5,
        greenFrom: .5, greenTo: 5,
        minorTicks: 20,
      }

      this.chart = new google.visualization.Gauge(document.getElementById('chart_div'))

      this.chart.draw(this.chart_data, this.chart_options)

    })

    // connect to socket endpoint
    const socket = io.connect('http://localhost:3001');

    socket.on('score', (data) => {
      console.log(data);
      this.score = data.score;

      this.chart.draw(google.visualization.arrayToDataTable([
          ['Label', 'Value'],
          ['Sentiment', this.score]
        ]), this.chart_options)

      if (data.score > 0) this.positive.unshift(data.tweet + ' !! '+data.score+' !!')
      if (data.score < 0) this.negative.unshift(data.tweet + ' !! '+data.score+' !!')


    });

  }
}
</script>

<style>
body {
  font-family: Helvetica, sans-serif;
}
</style>
