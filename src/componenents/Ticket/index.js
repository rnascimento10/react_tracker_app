import React, { Component } from 'react';

import imagemap from './undraw_map_1r69.svg'
import service from '../../services/serviceapi';
import { Redirect } from 'react-router-dom';

import './styles.css';


class Ticket extends Component {

    state = {
        service: {},
        errorMessageToEmpptyTicket : "",
        ticketInput: "",
        redirect : null
    };
  
    handleChange = (e) => {
        
        if (isNaN(e.target.value)){
            let errorMessageToEmpptyTicket = "O número do bilhete é composto somente por números";
            this.setState({errorMessageToEmpptyTicket});
            return;
        }
        else{
            let errorMessageToEmpptyTicket = "";
            this.setState({errorMessageToEmpptyTicket});
        }
            
        this.setState({ ticketInput: e.target.value });
    };

    isEmptyTicket = () => {
        return this.state.ticketInput === "";
    };

    onValidateTicket = async () => {


        if (!this.isEmptyTicket()){
            var endpoint = `/service/validate/${this.state.ticketInput}`;
            const r = await service.get(endpoint);

            if (r.data.isValid){
                this.setState({
                    services:r.data,
                    redirect: `/tracker/${this.state.ticketInput}`
                 });
            }
            else{
                let errorMessageToEmpptyTicket = r.data.message;
                this.setState({errorMessageToEmpptyTicket});
                return;
            }
            
        } 
        else{
            let errorMessageToEmpptyTicket = "Por favor, digite o número de seu bihete.";
            this.setState({errorMessageToEmpptyTicket});
            return;
        }
    };

    render() {

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        return (

            <div className="container">
            <div className="input-box">
                <img src={imagemap} alt="maps" className="image-map"/>
                <h1>Quer ver onde seu onibus está? </h1>
                <br/>
             
                <input onChange={this.handleChange} className='ticket-input' type='text' required placeholder="Digite aqui o seu número do bilhete" />
                <br/>
                <label style={{ fontSize:12, color:"red", textTransform:"uppercase"}} > {this.state.errorMessageToEmpptyTicket} </label>
                <br/>
                <button className='ticket-button' onClick={this.onValidateTicket} >encontrar meu ônibus</button>
            </div>
        </div>
      )
        
    }
    
}; 

export default Ticket;