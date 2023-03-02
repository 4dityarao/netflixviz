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
        //repulsion: 2,
        // linkDistance: 1,
       // linkSpring: 2,
        repulsion: 0.2,
        gravity: 0.1,
        decay: 1000
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
          if (node!== undefined){
          console.log('Clicked node: ', node);
         
          }
          graph.pause();

        },
        onNodeMouseOver: (node)=>{
            console.log('Hovered node: ', node);
           
        
        },
        onmousemove: ()=>{
          graph.fitView();
        },
      },
      /* ... */
    };
    const data = require("./assets/graph_data_poc.json")
    console.log(data)
    const graph = new Graph(canvas, config);
    graph.setData(data.nodes, data.links);
    graph.fitView();
  }

  render() {
    return (
      <div><h1>Netflix Prize Data</h1>
    
    <canvas ref={this.canvasRef} /*width = {390} height = {1732}*/ />
    </div>);
  }
}

export default App;
