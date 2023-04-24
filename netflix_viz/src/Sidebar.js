import React from 'react';
import './Sidebar.css';
//import { Drawer, Select, MenuItem, Button,Card,Typography, Box} from '@mui/material';
import { Drawer, Select, MenuItem, Button, Card, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow , TextField} from '@mui/material';

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
        height: "70vh", // Set height to 70% of viewport height
        backgroundColor: "#00000080",
        overflowY: "scroll", // Add scrollable content
        padding: "10px", // Add some padding for readability
        borderBottom: "2px solid grey"
      },
    }}
    >

      <div>
        <center><img style = {{height: 100, width: 100 }}src = {require("./assets/logo.gif")}></img></center>
        <center><h1>Netflix Prize Recommendations</h1>
        <Select label = "select graph.." defaultValue = "init" sx = {{"minWidth": 120,"bgcolor": "grey"}} onChange = {this.sendQuery} >
          <MenuItem value="init">Initial Ratings</MenuItem>
          <MenuItem value="rec1">Recommender System 1</MenuItem>
          <MenuItem value="rec2">Recommender System 2</MenuItem>
</Select>
<TextField id="filled-basic" label="Node Search " variant="filled" onKeyDown= {this.highlight} sx = {{backgroundColor : "white"}}/>
<Box sx={{ width:"80%" }}>
          <Card sx={{ width:"100%", bgcolor: "#222222", color: "white"}}> <Typography variant="h6">
        Selected Node : 
        {" "+this.state.node.id}
      </Typography>
      {/* <Typography variant="h5" component="div">
        {this.state.node.id}
      </Typography> */}
      
      <Typography variant="h6" component="div">
        {this.state.node.title}
      </Typography>
      <Typography variant="h6" component="div" sx={{ color: "white" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "white",textAlign:"center",fontSize:"20px" }}>Adjacent Ids</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.neighbors.map(item => (
                  <TableRow key={item}>
                  <TableCell class="link-cell" align="center" sx={{ color: "white"}} onClick={this.highlight}>{item}</TableCell>
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
  this.setState({"node": x, "neighbors":neighbors.map((x)=>x.id).slice(0,20)});
  //render();

};
sendQuery = (event)=>{
  //console.log(event.target.value);
  this.props.queryToParent(event.target.value)
  
};
highlight= (item)=>{
  let x = null
  if(item.keyCode==13){
      x= item.target.value;
    console.log("theses")
  }
  else{
  x = item.currentTarget.innerHTML;
  
  }
  this.props.highlightNode(x);
}
}
export default Sidebar;

