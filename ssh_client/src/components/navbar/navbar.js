import React, { useState } from "react";
import {
  AppBar,
  Button,
  MenuList,
  MenuListItem,
  Separator,
  TextInput,
  Toolbar,
} from "react95";
import Link from 'next/link'


const navbar = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <div id = 'navbar'>
    <AppBar >
    <Toolbar style={{ justifyContent: 'space-between' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button
          onClick={() => setOpen(!open)}
          active={open}
          style={{ fontWeight: 'bold' }}
        >
          <img
            src={'https://cdn.icon-icons.com/icons2/159/PNG/256/minecraft_22400.png'}
            style={{ height: '20px', marginRight: 4 }}
          />
          Menu
        </Button>
        {open && (
          <MenuList
            style={{
              position: 'absolute',
              left: '0px',
              top: '100%',
              margin: '0px',
            }}
            onClick={() => setOpen(false)}
          >
            <MenuListItem>
              <Link href="/" legacyBehavior>
              <a >👨‍💻  Home</a>
              
              </Link>
            </MenuListItem>
            <MenuListItem>
              <Link href="/FTP_pages">📁    SSH</Link>
            </MenuListItem>
            <Separator />
            <MenuListItem disabled>
              <span role='img' aria-label='🔙'>
                🔙
              </span>
              Logout
            </MenuListItem>
          </MenuList>
        )}
      </div>

      <TextInput placeholder='Search...' width={150} />
      <Button>Default</Button>
    </Toolbar>
  </AppBar>
  </div>
  );
};

export default navbar;

