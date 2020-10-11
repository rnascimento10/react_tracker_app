import React  from 'react';
import './style.css'


const AppBar = (props) => {

   return <>
            <header className="app-bar">
            <span className="material-icons" onClick={props.goBack}>arrow_back</span>
            <span className="material-icons">directions_bus</span> 
            <span className="label">007</span>
            </header>
            <div className="info-line">
                <span>007 - NOVA IGUAÇU ANGRA - IDA</span>
            </div>

            <div className="info-detail">
                <h1>hello</h1>
            </div>
    </>
};

export default AppBar;