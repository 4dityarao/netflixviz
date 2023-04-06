import React from 'react';
import './Sidebar.css';
import { Drawer } from '@mui/material';

class Sidebar extends React.Component 
{
constructor(props){
  super(props);
  this.state = {node:{}};
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
        <center><h1>Sidebar Content</h1>
        <div class = "nodedata">id: {this.state.node.id}
        neighbors : {this.state.neighbors}
        </div>
        </center>
      </div>
    </Drawer>
  );
};
changeState(x){
  console.log(x);
  this.setState({node: x, neighbors: [1,2,3]});
  //render();

}
}
export default Sidebar;

