import React, { useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import ChildGraph from './childGraph';
import { Graph, GraphConfigInterface } from "@cosmograph/cosmos";
import * as neo4j from  'neo4j-driver';

class App extends React.Component {
  
  constructor(props) {
    
    super(props);
    this.state = {showChild:undefined}
    this.canvasRef = React.createRef();
    this.sidebarRef = React.createRef();
    this.childGraphRef = React.createRef();
    
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


    this.nodes = null;
    this.links = null;
    this.graph = null;
  }

  componentDidMount = async()=> {
    
    const canvas = this.canvasRef.current;
    const config = {
      simulation: {
        //repulsion: 2,
        // linkDistance: 1,
       // linkSpring: 2,
        repulsion: 0.4,
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
      nodeSize: (node)=>{if(node.group==1){return 1}else{return 0.5}},
      linkWidth: 0.8,
      linkArrows: false,
      linkVisibilityDistanceRange : [100, 1500],
      linkVisibilityMinTransparency : 0.05,
      scaleNodesOnZoom : true,
      events: {
        onClick:  (node) => {
          if (node!== undefined){
          this.graph.selectNodeById(node.id,true);
          this.sidebarRef.current.changeNodeData(node, this.graph.getAdjacentNodes(node.id).slice(1))
          if(node.group>1){ 
          this.childGraphRef.current.makeView(node, this.graph.getAdjacentNodes(node.id)) 
          this.setState({showChild:undefined});
          }else{
            this.childGraphRef.current.reset_graph();
            this.setState({showChild:"none"});
          }
          }
          else{
            this.graph.unselectNodes();
            this.childGraphRef.current.reset_graph();
            this.setState({showChild:"none"});
          }
          this.graph.pause();

        },
        onNodeMouseOver: (node)=>{
            // console.log('Hovered node: ', node);
           
        
        },
        onmousemove: ()=>{
          this.graph.fitView();
        },
      },
      
    };

    this.graph = new Graph(canvas, config);
    [this.nodes,this.links] = await this.runQuery();
    this.graph.setData(this.nodes,this.links);
    //to run with POC data
    // const data1 = require("./assets/graph_data_poc.json")
    // graph.setData(data1.nodes,data1.links);
    //graph = this.graph.bind(this)
    this.graph.fitView();
    this.setState({showChild:"none"});
  };





runQuery = async(query =`MATCH (m:Movie)
                          CALL {
                              WITH m
                              with distinct m as movs
                              MATCH (c:Customer)-[r]-(movs)
                          RETURN toString(movs.id) as target,toString(c.id) as source, r.rating as rating, toString(movs.title) as title limit 30
                          }
return source,target,rating,title` )=>{

  let  session = await this.driver.session({database:"neo4j"});
  let res  = await session.run(query);
  session.close();
  //let movies = new Set()
  let movies = new Object();
  let custs = new Set();
  let links = res.records.map(r => {
    //group 1 = movie, 2= cust
    movies[r.get("target")] = r.get("title");
    //movies.add(r.get("target"))
    custs.add(r.get("source"));
    return {"source":r.get("source"),"target":  r.get("target"),value:parseInt(r.get("rating"))}});
  
  let nodes = Array.from(Object.entries(movies)).map(([id,title]) =>{return {id: id,title:title, group:1}})
                .concat(Array.from(custs).map(x=>{return {id: x, group:2}}))
  return [nodes,links]
};


getQuery = async (value = "init")=>{
  let n  =  this.nodes.filter(x=>x.group>1).map(x=>{return x.id})
  console.log(n)
  const query_dict = {
    init: `MATCH (m:Movie)
    CALL {
        WITH m
        with distinct m as movs
        MATCH (c:Customer)-[r]-(movs)
        WITH 
    RETURN toString(movs.id) as target,toString(c.id) as source, r.rating as rating, toString(movs.title) as title limit 10
    }
return source,target,rating,title`,
    rec1: `MATCH (c:Customer)-[r:PREDICTED_RATING]-(movs)
    where c.id in [${ this.nodes.filter(x=>x.group>1).map(x=>{return x.id})}]
        RETURN toString(movs.id) as target,toString(c.id) as source, r.predicted_rating as rating, toString(movs.title) as title`,
    // rec1 : `MATCH (c:Customer)-[r:PREDICTED_RATING]-(m:Movie)
    //         RETURN toString(m.id) as target,toString(c.id) as source, r.predicted_rating as rating, toString(m.title) as title LIMIT 30000`,
    rec2:``
  };

  
 [this.nodes, this.links] =await  this.runQuery(eval(`query_dict.${value}`),)
  this.graph.setData(this.nodes,this.links)
};

highlightGraphNode = (node_id)=>{
  if(this.nodes.map(x=>{if (node_id === x.id){return true}}))
{   this.graph.selectNodeById(node_id,true)
   this.graph.zoomToNodeById(node_id,700,30)}
}


render(){
    return (
      <div>
      <div id = "container">
      <div class = "parentlegend">
        <h4>Legend</h4>
   <div class = "circle" style={{backgroundColor:"#f54e42"}}></div><div class = "legendtext">User Nodes</div><br></br>
    <div class = "circle"style={{backgroundColor:"#b3b3b3"}}></div><div class = "legendtext">Movie Nodes</div>
</div>
    <canvas class = "graph" ref={this.canvasRef}/>
    </div>
    <div class = "childgraph"style = {{display:this.state.showChild}}>
    <div class = "childlegend">
        <h4>Legend</h4>
   <div class = "circle" style={{backgroundColor:"#2544f5"}}></div><div class = "legendtext">Recommended Movie</div><br></br>
   
</div>
    <ChildGraph ref = {this.childGraphRef}/>
    </div>
    <Sidebar highlightNode={this.highlightGraphNode} queryToParent = {this.getQuery} ref = {this.sidebarRef} data = {this.state}></Sidebar> 

    </div>
    
    
    );
  }
 
}

export default App;
