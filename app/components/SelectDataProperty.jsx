const React = require('react');
const dataStructures = require('../helpers/dataStructures')

module.exports = function SelectDataProperty(props) {

    function inputFromDataStructure(currentIndex, onChanged, name, ds, index) {
      return (
        <li key={ds.name}>
          <span>
            <input
            type="radio"
            name={name}
            value={index}
            onChange={(e) => onChanged('primary', e)}
            checked={parseInt(currentIndex) === index}
            />
            {ds.name}
          </span>
          <br/>
        </li>
      )
    }

    const dSMap = inputFromDataStructure.bind(
      this,
      props.dataPropertyIndex,
      props.onDataPropertyChanged,
      'data-property'
    )
    const dataPropertyList = dataStructures.map(dSMap)

    const selectDataProperty = <div><ul>{dataPropertyList}</ul></div>

    /*
    var dataStructuresAndSightings = dataStructures.slice(0, dataStructures.length)
    dataStructuresAndSightings.push({name: "sightings"})

    const dS2Map = inputFromDataStructure.bind(
      this,
      props.secondaryDataPropertyIndex,
      props.onSecondaryDataPropertyChanged,
      'secondary-data-property'
    )
    const secondaryDataPropertyList = dataStructuresAndSightings.map(dS2Map)

    const selectSecondaryDataProperty = <div><ul>{secondaryDataPropertyList}</ul></div>
    */

    return (
      <div>
        <h3>Data Property {props.index}</h3>
        {selectDataProperty}
        <h3>Dataset Index: {props.dataPropertyIndex}</h3>
        {/*
        <hr/>
        {selectSecondaryDataProperty}
        <h3>Secondary Dataset: {props.secondaryDataPropertyIndex}</h3>
        */}
      </div>
    );
  }