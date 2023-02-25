import logo from './logo.svg';
import React from 'react';
import './App.css';
import { Graph, GraphConfigInterface } from "@cosmograph/cosmos";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    const config = {
      simulation: {
        repulsion: 0.5,
      },
      renderLinks: true,
      linkColor: (link) => link.color,
      nodeColor: (node) => {if(node.group>1){
        return "#f54e42"
      }
      },
      nodeSize: 0.5,
      linkWidth: 0.1,
      linkArrows: false,
      events: {
        onClick: (node) => {
          console.log('Clicked node: ', node);
        },
      },
      /* ... */
    };
    const data = require("./assets/graph_data_poc.json")
    console.log(data)
    const graph = new Graph(canvas, config);
    graph.setData(data.nodes, data.links);
  }

  render() {
    return <canvas ref={this.canvasRef} />;
  }
}

export default App;
