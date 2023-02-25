//import logo from './logo.svg';
import  React from 'react';
import ForceGraph3D from 'react-force-graph-3d';
// import data from './assets/graph_data_poc.json';
import './App.css';

class NetflixViz extends React.Component{
 
  render(){
    const data = require('./assets/nodes_only.json');
    
    //data = JSON.parse(JSON.stringify(data))
    //.then(json => console.log(JSON.stringify(json)));
    //console.log(x.json())
    // console.log(data)
    // console.log(JSON.parse(JSON.stringify(data)))
    return (<ForceGraph3D graphData={data}
      nodeLabel="node"
      nodeAutoColorBy="group"
      // warmupTicks={100}
      // cooldownTicks = {0}
      />)

    //document.getElementById('graph')

  }
};

export default NetflixViz;

