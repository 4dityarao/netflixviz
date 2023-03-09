import logo from './logo.svg';
import React from 'react';
import './App.css';
import { Graph, GraphConfigInterface } from "@cosmograph/cosmos";
import * as neo4j from  'neo4j-driver';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.driver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://localhost:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'qwerty123'
      ),
      {
        encrypted: process.env.NEO4J_ENCRYPTED ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
      }
    )
    console.log(this.driver);
  }

  componentDidMount = async()=> {
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
      linkColor: (link) => {if(link.value>1)
      return "#c5fb61"
      else return "#f54e42"
      },
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
    //console.log("data")
    let  session = await this.driver.session({database:"neo4j"});
    //console.log(session)
    let res  = await session.run(`MATCH (c:Customer)-[r]-(m:Movie)
    WHERE c.id < 3000000 
    AND m.id < 300
    RETURN toString(m.id) as target,toString(c.id) as source, r.rating as rating`)
    
    //const data1 = require("./assets/graph_data_poc.json")
    session.close();
    //console.log(res);
    let nodes = new Set();
    let links = res.records.map(r => {
      let source = {"group":1, "id":parseInt(r.get("source"))};
      
      let target ={"group":2, "id": parseInt(r.get("target"))};
      nodes.add(source);
      nodes.add(target);
      return {"source":source.id,"target":  target.id,value:parseInt(r.get("rating"))}});
    
    nodes = Array.from(nodes);
    //console.log(nodes);
    //console.log(nodes);
    // this.setState({ data : {nodes, links}});
    //console.log(data1);
    const graph = new Graph(canvas, config);
    graph.setData(nodes, links);
    //graph.setData(data1.nodes,data1.links);

    graph.fitView();
  }

render(){
    // this.loadData();
    console.log("Didnt Wait")
    return (
      <div><h1>Netflix Prize Data</h1>
    
    <canvas ref={this.canvasRef}/>
    </div>);
  }
}

export default App;
