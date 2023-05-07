import {
  Button,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";
import React from 'react';


function TABLE_STATUS({ width ,windowheader ,data} ) {

  return (
    <>
      <Window style={{width}}>
        <WindowHeader>{windowheader}</WindowHeader>
        <WindowContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Name</TableHeadCell> 
                <TableHeadCell>Port</TableHeadCell> 
                <TableHeadCell>Manage</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableDataCell style={{ textAlign: "center" }}>
                    {item.status}
                  </TableDataCell>
                  <TableDataCell style={{ textAlign: "center" }}>{item.name}</TableDataCell>
                  <TableDataCell style={{ textAlign: "center" }}>{item.port}</TableDataCell>
                  <TableDataCell >{item.manage}</TableDataCell>  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </WindowContent>
      </Window>
    </>
  );
}

export default TABLE_STATUS;
