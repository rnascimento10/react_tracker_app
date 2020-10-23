import React  from 'react';
import Moment from 'react-moment';
import './style.css'


const AppBar = (props) => {

   return <>
            <header className="app-bar">
            <span className="material-icons" onClick={props.goBack}>arrow_back</span>
            <span className="material-icons">directions_bus</span> 
            <span className="label">{props.service.linha} - {props.service.nomelinha} - {props.service.placaVeiculo}</span>
            </header>
            <div className="info-line">
                <span>
                   DE {props.service.origem} PARA {props.service.destino}
                </span>
            </div>
           
            <div className="row">

           
                    <div className="card-info-board">
                        <span className="info">{props.userDistanceFromPoint} KM</span>
                        <span className="title">é a sua distância para o ônibus</span>
                    </div>
           

                    <div className="card-info-board">
                        <span className="info">
                            <Moment format="HH:mm">{props.service.previsaoPartida}</Moment>
                        </span>
                       
                        <span className="title">Previsão Partida</span>
                    </div>

                    <div className="card-info-board">
                       
                        <span className="info">
                            <Moment format="HH:mm">{props.service.previsaoChegada}</Moment>
                        </span>
                       
                        <span className="title">Previsão Chegada</span>
                    </div>
               
            </div>
    </>
};

export default AppBar;