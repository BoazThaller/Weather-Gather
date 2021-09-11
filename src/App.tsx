import React from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';
import FetchData from './components/fetchData/FetchData';
import "./styles/Main.scss"


function App() {
  return (
    <div className="App">
      <Navbar/>
      <FetchData/>
    </div>
  );
}

export default App;
