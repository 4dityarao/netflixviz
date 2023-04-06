import React from 'react';
import './Sidebar.css';
import { Drawer } from '@mui/material';

class Sidebar extends React.Component 
{
constructor(props){
  super(props);
  this.state = {id:-1};
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
        <div class = "nodedata">{this.state.id}</div>
        </center>
      </div>
    </Drawer>
  );
};
changeState(x){
  console.log(x);
  this.state = x;
  //render();

}
}
export default Sidebar;

