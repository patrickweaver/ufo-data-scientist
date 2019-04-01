const React = require('react')
//const ReactDOM = require('react-dom')
//const uuidv4 = require('uuid/v4')

const data = require('../newData')
const dataLength = data.length

/* Helpers */
const extractDataForSelectedProperty = require('../helpers/extractDataForSelectedProperty')
const vectorsFromSetAndValues = require('../helpers/vectorsFromSetAndValues')
const groupData = require('../helpers/groupData')

const settings = require('../helpers/settings')
const maxNumberZoom = settings.maxNumberZoom
const defaultDataProperty = settings.defaultDataProperty
const defaultSecondaryDataProperty = settings.defaultSecondaryDataProperty
const defaultNumberZoom = require('../helpers/defaultNumberZoom')

/* Components */
const DatasetControls = require('./DatasetControls')
const ChartTypeControls = require('./ChartTypeControls')
const BarChart = require('./charts/BarChart')
const LineChart = require('./charts/LineChart')

const datePartOptions = require('../helpers/datePartOptions')
const dataStructures = require('../helpers/dataStructures')

class App extends React.Component {
  constructor(props) {
    super(props);
    this.processDataForChart = this.processDataForChart.bind(this)
    this.onChartTypeChanged = this.onChartTypeChanged.bind(this)
    this.onDataPropertyChanged = this.onDataPropertyChanged.bind(this)
    this.onSecondaryDataPropertyChanged = this.onSecondaryDataPropertyChanged.bind(this)
    this.onRangeMaxChanged = this.onRangeMaxChanged.bind(this)
    this.onRangeMinChanged = this.onRangeMinChanged.bind(this)
    this.onNumberZoomChanged = this.onNumberZoomChanged.bind(this)
    this.onDatePartChanged = this.onDatePartChanged.bind(this)
    console.log("DATA PROPERTY INDEX:", defaultDataProperty)
    this.state = {
      title: "UFO Data Scientist",
      chartType: 'bar',
      dataPropertyIndex: defaultDataProperty,
      secondaryDataPropertyIndex: defaultSecondaryDataProperty,
      datePartIndex: 0,
      datasetSettings: {
        [defaultDataProperty]: {
          min: false,
          max: false,
          absMin: 0,
          absMax: 50,
          numberZoom: defaultNumberZoom(dataLength, maxNumberZoom),
        }
      },
      /*numberZoom: data.length > 10 ?
                    10 :
                    (
                      data.length > maxNumberZoom ?
                      maxNumberZoom :
                      data.length
                    ),
                    */
      chartData: []
    }
  }

  componentDidMount() {
    
    this.processDataForChart()
  }

  dataType(dataPropertyIndex) {
    return dataStructures[dataPropertyIndex].type
  }

  datePart(datePartIndex) {
    return datePartOptions[datePartIndex]
  }


  processDataForChart() {
    const dataPropertyIndex = this.state.dataPropertyIndex
    const dataType = this.dataType(dataPropertyIndex)
    const datePartIndex = this.state.datePartIndex
    const datePart = this.datePart(datePartIndex)
    const datasetSettings = this.state.datasetSettings[dataPropertyIndex]
    const numberZoom = datasetSettings.numberZoom
    console.log("NUMBER ZOOM:", numberZoom)
    var rangeMin = datasetSettings.min
    var rangeMax = datasetSettings.max

    const selectedData = extractDataForSelectedProperty(data, dataPropertyIndex, dataType, datePart)

    // Unique values from selectedData
    //console.log("DP")
    //console.log(dataStructures[dataPropertyIndex])
    const excludedValue = dataStructures[dataPropertyIndex].exclude
    //console.log("APP: EV: ", excludedValue, typeof excludedValue)
    var selectedSet = [...new Set(selectedData)]

    //console.log("SS:", selectedSet)

    // Turn array of values into vectors with values and frequency
    const vectors = vectorsFromSetAndValues(
      selectedData, selectedSet, excludedValue, dataType, datePart.name
    )

    //console.log("V:", vectors)

    // If excludedValue is included in vectors then remove it:
    var groupableVectors = vectors
    var excluded = null
    if (vectors[0] && vectors[0].name === excludedValue) {
      groupableVectors = vectors.slice(1, vectors.length)
      excluded = vectors.slice(0, 1)[0].value
    }

    //console.log("GV:", groupableVectors)

    var chartData
    var absMin = groupableVectors[0].name
    var absMax = groupableVectors[groupableVectors.length - 1].name
    if (dataType === 'number') {
      absMin = Math.floor(absMin)
      absMax = Math.ceil(absMax)

      if (!rangeMin) { rangeMin = absMin }
      if (!rangeMax) { rangeMax = absMax }

      chartData = groupData(
        groupableVectors, numberZoom, rangeMin, rangeMax
      );
    //} else if (dataType === 'datetime') {
      // 🚸 Maybe in the future will group date data
      // Date/Time Data Sets: date_time)
     //return this.groupData(sortedData, 'string', groups)
    } else {
      chartData = groupableVectors
    }

    //console.log("Abs MINMAX:", absMin, absMax)   

    // Need to extract value above and add in 'Unknown'
    // here because of different excluded values in data
    if (excluded) {
      chartData.push({name: 'Unknown', value: excluded})
    }

    //console.log("CHART DATA:", chartData)

    var newState = {
      chartData: chartData
    }

    this.setState((state, props) => {
      
      var newDatasetSettings = state.datasetSettings
      newDatasetSettings[dataPropertyIndex] = {
        min: rangeMin,
        max: rangeMax,
        absMin: absMin,
        absMax: absMax,
        numberZoom: numberZoom
      }
      newState.datasetSettings = newDatasetSettings

      return newState
    })
  }

  onChartTypeChanged(newChartType) {
    this.setState({
        chartType: newChartType
      }, this.processDataForChart)
  }

  onDataPropertyChanged(event) {
    const newDataPropertyIndex = event.currentTarget.value
    this.setState((state, props) => {
      var newRanges = state.datasetSettings
      if (!newRanges[newDataPropertyIndex]) {
        newRanges[newDataPropertyIndex] = {
          min: false,
          max: false,
          numberZoom: defaultNumberZoom(dataLength, maxNumberZoom)
        }
      }

      const newState = {
        dataPropertyIndex: newDataPropertyIndex,
        datasetSettings: newRanges
      }

      return newState
    }, this.processDataForChart)
  }

  onSecondaryDataPropertyChanged(event) {
    const newDataPropertyIndex = event.currentTarget.value
    this.setState((state, props) => {

      const newState = {
        secondaryDataPropertyIndex: newDataPropertyIndex
      }

      return newState
    }, this.processDataForChart)
  }

  onRangeMaxChanged(e) {
    const updatedMax = parseFloat(e.target.value)
    this.setState((state, props) => {
      var newRanges = state.datasetSettings
      if (updatedMax <= newRanges[state.dataPropertyIndex].min) {
        return {}
      } else {
        newRanges[state.dataPropertyIndex].max = updatedMax
        return { datasetSettings: newRanges }
      }
    }, this.processDataForChart)
  }

  onRangeMinChanged(e) {
    const updatedMin = parseFloat(e.target.value)
    this.setState((state, props) => {
      var newRanges = state.datasetSettings
      if (updatedMin >= newRanges[state.dataPropertyIndex].max) {
        return {}
      } else {
        newRanges[state.dataPropertyIndex].min = updatedMin
        return { datasetSettings: newRanges }
      }
      
    }, this.processDataForChart)
  }

  onNumberZoomChanged(e) {
    var zoom = e.target.value;
    zoom = zoom > maxNumberZoom ? maxNumberZoom : zoom;
    this.setState((state, props) => {

      var newDatasetSettings = state.datasetSettings
      newDatasetSettings[state.dataPropertyIndex].numberZoom = zoom

      return {
        datasetSettings: newDatasetSettings
      }
    }, this.processDataForChart)
  }

  onDatePartChanged(e) {
    const index = e.currentTarget.value
    this.setState({
      datePartIndex: index
    }, this.processDataForChart)
  }

  render() {

    var chart = <div><h3>Error: No Chart</h3></div>

    if (this.state.chartType === 'bar') {
      chart = (
        <BarChart
          data={this.state.chartData}
        />
      )
    } else if (this.state.chartType === 'line') {
      chart = (
        <LineChart
          data={this.state.chartData}
        />
      )
    }

    return (
      <div id="app">
        <h1>{this.state.title}</h1>

        <p>Chart Type: {this.state.chartType}</p>

        <ChartTypeControls
          chartType={this.state.chartType}
          onChartTypeChanged={this.onChartTypeChanged}
        />

        <DatasetControls
          index={0}
          dataPropertyIndex={this.state.dataPropertyIndex /* 🦄 */}
          dataType={this.dataType(this.state.dataPropertyIndex) /* 🦄 */}
          onDataPropertyChanged={this.onDataPropertyChanged /* 🦄 */}

          // Number
          datasetSettings={this.state.datasetSettings}
          onRangeMaxChanged={this.onRangeMaxChanged}
          onRangeMinChanged={this.onRangeMinChanged}
          dataLength={dataLength}
          //numberZoom={this.state.numberZoom}
          onNumberZoomChanged={this.onNumberZoomChanged}

          // DateTime
          datePart = {this.datePart(this.state.datePartIndex).name}
          onDatePartChanged={this.onDatePartChanged}
        />

        <h3>Data:</h3>

        <div id="chart-container">
          {chart}
        </div>

      </div>
    )
  }

}

module.exports = App