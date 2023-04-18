import React from 'react';
import './Sidebar.css';
//import { Drawer, Select, MenuItem, Button,Card,Typography, Box} from '@mui/material';
import { Drawer, Select, MenuItem, Button, Card, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

class Sidebar extends React.Component 
{
constructor(props){
  super(props);
  this.state = {node:{}, neighbors:[]};
}

 render(){ 
  return (
    <Drawer
    variant="temporary"
    open = "true"
    anchor="left"
    ModalProps={{
      keepMounted: true,
    }}
    sx = {{
      position: "relative",
      "& .MuiBackdrop-root": {
        display: "none"
      },
      "& .MuiDrawer-paper": {
        display: "flex",
        flexDirection: "column",
        width: "25%",
        height: "100%",
        backgroundColor: "#000"
      },
    }}
    >

      <div>
        <center><img style = {{height: 100, width: 100 }}src = {require("./assets/logo.gif")}></img></center>
        <center><h1>Netflix Prize Recommendations</h1>
        <Select label = "select graph.." default = 'init'sx = {{"minWidth": 120,"bgcolor": "grey"}} onChange = {this.sendQuery} >
          <MenuItem value="init">Initial Ratings</MenuItem>
          <MenuItem value="rec1">Recommender System 1</MenuItem>
          <MenuItem value="rec2">Recommender System 2</MenuItem>
</Select>
<Box sx={{ width:200 }}>
          <Card sx={{ width:200, bgcolor: "#222222", color: "white"}}> <Typography variant="h6">
        Selected Node
      </Typography>
      <Typography variant="h5" component="div">
        {this.state.node.id}
      </Typography>
      
      <Typography variant="h6" component="div">
        {this.state.node.title}
      </Typography>
      <Typography variant="h6" component="div" sx={{ color: "white" }}>
        Neighbors
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "white" }}>Customer ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.neighbors.map(item => (
                  <TableRow key={item}>
                    <TableCell sx={{ color: "white" }} onClick = { this.highlight}>{item}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      </Typography>
      </Card>
      </Box>
        </center>
      </div>
   
    </Drawer>
  );
};
changeNodeData(x, neighbors){
  console.log(x)
  this.setState({"node": x, "neighbors":neighbors.map((x)=>x.id ).slice(0,10)});
  //render();

};
sendQuery = (event)=>{
  //console.log(event.target.value);
  this.props.queryToParent(event.target.value)
  
};
highlight= (item)=>{
  let x = item.currentTarget.innerHTML;
  this.props.highlightNode(x);
}
}
export default Sidebar;

