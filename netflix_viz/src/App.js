import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import { Graph, GraphConfigInterface } from "@cosmograph/cosmos";
import * as neo4j from  'neo4j-driver';

class App extends React.Component {
  
  constructor(props) {
    
    super(props);
    this.canvasRef = React.createRef();
    this.sidebarRef = React.createRef();
    
    this.driver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://localhost:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password'
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
          // console.log('Clicked node: ', node);
          //console.log(graph.getAdjacentNodes(node.id));
          this.sidebarRef.current.changeNodeData(node, this.graph.getAdjacentNodes(node.id).slice(1))
          // this.state.node_id = node.id;
    
       
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
      
      /* ... */
    };

    this.graph = new Graph(canvas, config);
    [this.nodes,this.links] = await this.runQuery();
    this.graph.setData(this.nodes,this.links);
    //to run with POC data
    // const data1 = require("./assets/graph_data_poc.json")
    // graph.setData(data1.nodes,data1.links);
    //graph = this.graph.bind(this)
    this.graph.fitView();
  };





runQuery = async(query =`MATCH (m:Movie)
                          CALL {
                              WITH m
                              with distinct m as movs
                              MATCH (c:Customer)-[r]-(movs)
                          RETURN toString(movs.id) as target,toString(c.id) as source, r.rating as rating, toString(movs.title) as title limit 10
                          }
return source,target,rating,title` )=>{

  let  session = await this.driver.session({database:"moviedb"});
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

render(){
  

    return (
      
      <div id = "container"><h1>Netflix Prize Data</h1>
   
    <canvas class = "graph" ref={this.canvasRef}/>
    <Sidebar queryToParent = {this.getQuery} ref = {this.sidebarRef} data = {this.state}></Sidebar>
    </div>
    
    );
  }
 
}

export default App;
