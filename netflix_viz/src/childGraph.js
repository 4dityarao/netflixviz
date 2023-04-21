import React, { useState } from 'react';
import './childGraph.css';
import { Graph, GraphConfigInterface } from "@cosmograph/cosmos";
import * as neo4j from  'neo4j-driver';

class ChildGraph extends React.Component {
  
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


    this.nodes = null;
    this.links = null;
    this.graph = null;
  }

  componentDidMount = async()=> {
    
    const canvas = this.canvasRef.current;
    const config = {
      simulation: {
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
          // onClick:  (node) => {
          //   if (node!== undefined){
          //   this.graph.selectNodeById(node.id,true);        
          //   this.childGraphRef.current.makeView(node, this.graph.getAdjacentNodes(node.id)) 
          //   }
          //   this.graph.pause();
          // },
          onNodeMouseOver: (node)=>{
              // console.log('Hovered node: ', node);
             
          
          },
          onmousemove: ()=>{
            this.graph.fitView();
          },
        },
           
    };

    this.graph = new Graph(canvas, config);
    this.graph.fitView();
  };





runQuery = async(query)=>{
  let  session = await this.driver.session({database:"neo4j"});
  let res  = await session.run(query);
  session.close();
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

runMovQuery = async(query)=>{

  let  session = await this.driver.session({database:"neo4j"});
  let res  = await session.run(query);
  session.close();
  //let movies = new Set()
  let movies = new Object();
  let rec_movies = new Object();
  let links = res.records.map(r => {
    //group 1 = movie, 2= cust
    rec_movies[r.get("movie2")] = r.get("movie2");
    //movies.add(r.get("target"))
    movies[r.get("movie1")] = r.get("movie1");
    return {"source":r.get("movie1"),"target":  r.get("movie2"),value:parseFloat(r.get("sim"))}});
  
  let nodes = Array.from(Object.entries(movies)).map(([id,title]) =>{return {id: id,title:"title", group:1}})
  .concat(Array.from(Object.entries(rec_movies)).map(([id,title]) =>{return {id: id,title:"title", group:2}}))

              
  return [nodes,links]
};



highlightGraphNode = (node_id)=>{
 
   this.graph.selectNodeById(node_id,true)
   this.graph.zoomToNodeById(node_id,700,30)
}

makeView = async(node, adjacent_nodes)=>{
  let [movienodes, simlinks] = await this.runMovQuery(`match (c:Customer{id:${node.id}})-[r:RATED]-(m)
with distinct m as m1
match (:Customer{id:${node.id}})-[p:PREDICTED_RATING]-(pred_movie:Movie)
with distinct pred_movie as m2
MATCH (m2:Movie)-[r:sim_rating ]-(m1:Movie)
RETURN toString(m1.id) as movie1, toString(m2.id) as movie2, r.sim_rating  as sim order by r.sim_rating desc `)
let x = movienodes.concat(adjacent_nodes)
console.log(x)
this.graph.setData(movienodes,simlinks);
this.graph.fitView();
// let [movienodes, simlinks] = await this.runQuery()
// this.graph.setData(movienodes,simlinks)
}
render(){
    return (
      
      <div>
   
    <canvas class = "graph" ref={this.canvasRef}/>

    </div>
    
    );
  }
 
}

export default ChildGraph;
