<template>
  <div id="app">
    <div id="chart_div"></div>
      <h2>Average Sentiment (Last 5 Minutes): {{ avg_sent_min }}</h2>
      <input type="text" v-model="term" />
      <button @click="openSocket">Start</button>
      <button @click="closeSocket">Stop</button>
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
      socket: {},
      term: '',
      score: 0,
      chart: '',
      chart_data: '',
      chart_options: '',
      avg_sent_min: '',
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

  },
  methods: {
    openSocket() {
      let data = {term: this.term}
      this.$http.post('/', data).then((response) => {
        // connect to socket endpoint
        this.socket = io.connect('http://localhost:3001');

        this.socket.on('score', (data) => {
          // console.log(data);
          this.score = data.score;

          this.chart.draw(google.visualization.arrayToDataTable([
              ['Label', 'Value'],
              ['Sentiment', this.score]
          ]), this.chart_options)
        })

        this.socket.on('average', (data) => {
          // console.log(data)
          this.avg_sent_min = data
        })

      }, (response) => { });

    },
    closeSocket () {
      this.socket.disconnect()
    }
  }
}
</script>

<style>
body {
  font-family: Helvetica, sans-serif;
}
</style>
