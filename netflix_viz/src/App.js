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
      nodeSize: (node)=>{if(node.group==1){return 1}else{return 0.5}},
      linkWidth: 0.8,
      linkArrows: false,
      linkVisibilityDistanceRange : [100, 1500],
      linkVisibilityMinTransparency : 0.05,
      scaleNodesOnZoom : true,
      events: {
        onClick: async (node) => {
          if (node!== undefined){
          // console.log('Clicked node: ', node);
          //console.log(graph.getAdjacentNodes(node.id));
          this.graph.selectNodeById(node.id,true);
          this.sidebarRef.current.changeNodeData(node, this.graph.getAdjacentNodes(node.id).slice(1))
          // this.state.node_id = node.id;  
          await this.getFusedView(node)     
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

runMovQuery = async(query =`MATCH (m:Movie)
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
  let links = res.records.map(r => {
    //group 1 = movie, 2= cust
    movies[r.get("movie2")] = r.get("movie2");
    //movies.add(r.get("target"))
    movies[r.get("movie1")] = r.get("movie1");
    return {"source":r.get("movie1"),"target":  r.get("movie2"),value:parseFloat(r.get("sim"))}});
  
  let nodes = Array.from(Object.entries(movies)).map(([id,title]) =>{return {id: id,title:title, group:1}})
              
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
 
   this.graph.selectNodeById(node_id,true)
   this.graph.zoomToNodeById(node_id,700,30)
}

getFusedView = async (node)=>{
  let [movienodes, simlinks] = await this.runMovQuery(`match (c:Customer{id:${node.id}})-[r:RATED]-(m)
with distinct m as m1
MATCH (m1:Movie)-[r:similarity]-(m2:Movie)
RETURN m1.id as movie1, m2.id as movie2, r.similarity as sim`)
let usermovs = this.graph.getAdjacentNodes(node.id)
let x = Array.from(movienodes.map(x=>{return x.id}).concat(usermovs))
this.graph.selectNodesByIds(x)
console.log(usermovs)


}
render(){
  

    return (
      
      <div id = "container"><h1>Netflix Prize Data</h1>
   
    <canvas class = "graph" ref={this.canvasRef}/>
    <Sidebar highlightNode={this.highlightGraphNode} queryToParent = {this.getQuery} ref = {this.sidebarRef} data = {this.state}></Sidebar>
    </div>
    
    );
  }
 
}

export default App;
