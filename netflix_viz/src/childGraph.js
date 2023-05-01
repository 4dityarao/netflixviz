import React, { useState } from 'react';
import './childGraph.css';
import { Graph, GraphConfigInterface } from "@cosmograph/cosmos";
import * as neo4j from  'neo4j-driver';
import { Drawer, Select, MenuItem, Button, Card, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

class ChildGraph extends React.Component {
  
  constructor(props) {
    
    super(props);
    this.canvasRef = React.createRef();
    this.state = {node:{title:""},value:[]};
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
    this.movie_dict = null
  }

  componentDidMount = async()=> {
    
    const canvas = this.canvasRef.current;
    const config = {
      simulation: {
        repulsion: 0.05,
        gravity: 0.1,
        decay: 1000
      },
      renderLinks: true,
      linkColor: (link) => {if(link.value>0.5)
        return "#c5fb61"
        else return "#f54e42"
        },
        nodeColor: (node) => {if(node.group>1){
          return "#2544f5"
        }
        },
        nodeSize: (node)=>{if(node.group>1){return 1}else{return 0.5}},
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
              if (node!== undefined){
                  this.changeSidebar(node)
              }
          
          },
          onmousemove: ()=>{
            this.graph.fitView();
          },
        },
           
    };

    this.graph = new Graph(canvas, config);
    this.graph.fitView();
   
  };



changeSidebar = (node)=>{
  console.log('Hovered node: ', node.title);
  this.setState(node);
  let nodez = this.graph.getAdjacentNodes(node.id)
  console.log(this.links);
  let x = this.links.filter(x=>{return (x.target === node.id)})
  this.setState({node:node,value:x})
  console.log(x);
}

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
    //group 1 = watched_movies, 2= rec_movies

    rec_movies[r.get("movie2")] = r.get("m2Title");
    //movies.add(r.get("target"))
    movies[r.get("movie1")] = r.get("m1Title");
    return {"source":r.get("movie1"),"target":  r.get("movie2"),value:parseFloat(r.get("sim"))}});
  
  let nodes = Array.from(Object.entries(movies)).map(([id,title]) =>{return {id: id,title:title, group:1}})
  .concat(Array.from(Object.entries(rec_movies)).map(([id,title]) =>{return {id: id,title:title, group:2}}))


              
  return [nodes,links]
};



highlightGraphNode = (node_id)=>{
 
   this.graph.selectNodeById(node_id,true)
   this.graph.zoomToNodeById(node_id,700,30)
}

makeView = async(node, adjacent_nodes)=>{

[this.nodes, this.links] = await this.runMovQuery( `match (:Customer{id:${node.id}})-[p:PREDICTED_RATING]-(pred_movie:Movie)
with collect(distinct pred_movie.id)  as pred_movs, [${adjacent_nodes.map((x)=>{return x.id})}] as watched_movs
MATCH (m2:Movie)-[r:sim_rating ]-(m1:Movie)
where m2.id in pred_movs or (m2.id in pred_movs and m1.id in watched_movs)
RETURN toString(m1.id) as movie1,toString(m1.title) as m1Title, toString(m2.id) as movie2,toString(m2.title) as m2Title, r.sim_rating  as sim order by r.sim_rating desc`
)
// let [adj_nodes, adj_links]  = await this.runMovQuery(`match (:Customer{id:${node.id}})-[p:PREDICTED_RATING]-(pred_movie:Movie)
// with collect(distinct pred_movie.id)  as pred_movs, [${adjacent_nodes.map((x)=>{return x.id})}] as watched_movs
// MATCH (m2:Movie)-[r:sim_rating ]-(m1:Movie)
// where m2.id in pred_movs and m1.id in watched_movs 
// RETURN toString(m1.id) as movie1,toString(m1.title) as m1Title, toString(m2.id) as movie2,toString(m2.title) as m2Title, r.sim_rating  as sim order by r.sim_rating desc`)

if(this.nodes.length>0){
  this.movie_dict = this.nodes.reduce((acc,x)=>{
    acc[x.id]= x.title;
    return acc;
  })}
this.graph.setData(this.nodes,this.links);
this.graph.fitView();
this.graph.setZoomLevel(10, [250])
// let [movienodes, simlinks] = await this.runQuery()
// this.graph.setData(movienodes,simlinks)
}


reset_graph = ()=>{
this.graph.setData([],[])
this.setState({node:{title:""},value:[]});

}
render(){
    return (    
      <div>
  <canvas class="graph" ref={this.canvasRef} />
  <div class="childMovieInfo">
    <center>
    <span
      style={{
        fontWeight: "bold",
        textDecoration: "underline",
        textAlign: "center",
        fontSize: "25px",
      }}
    >
      {this.state.node.title}
    </span>
    <TableRow  style={{ border: "1px solid black", borderBottom: "1px solid black" }}>
          <TableCell sx={{ color: "white" }}><b>Movie Title</b></TableCell>
          <TableCell sx={{ color: "white" }}><b>Similarity(0-1)</b></TableCell>
        </TableRow>
    {this.state.value.map((item) => (
      <Typography variant="h6" component="div">

        <TableRow key={item} style={{ borderTop: "1px solid black", borderBottom: "1px solid black" }}>
          <TableCell sx={{ color: "white" }}>{this.movie_dict[item.source]}</TableCell>
          <TableCell sx={{ color: "white" }}>{item.value}</TableCell>
        </TableRow>
      </Typography>
    ))}
    </center>
  </div>
  
</div>
    
    );
  }
 
}

export default ChildGraph;
