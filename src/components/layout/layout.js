import React from "react";
import Navbar from "./../navbar/navbar"




const Footer = () => {
return <h3>This is Footer</h3>;
};

const Layout = ({ children }) => {
return (
	<>
	<Navbar />
	<br></br>
	<main>{children}</main>
	
	<Footer />
	</>
);
};

export default Layout;
