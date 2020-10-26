import React, { Component } from 'react';

import imagemap from './undraw_map_1r69.svg'
import service from '../../../services/serviceapi';
import { Redirect } from 'react-router-dom';

import './styles.css';


class TravelSearch extends Component {

    state = {
        travel: {},
        errorMessageToEmpptyService : "",
        serviceNumber: "",
        redirect : null
    };
  
    handleChange = (e) => {
        let errorMessageToEmpptyService = "";
        
        if (isNaN(e.target.value)){
            errorMessageToEmpptyService = "O número do bilhete é composto somente por números";
            this.setState({errorMessageToEmpptyService});
            return;
        }
        else{
            
            this.setState({errorMessageToEmpptyService});
        }
            
        this.setState({ serviceNumber: e.target.value });
    };

    isEmptyTicket = () => {
        return this.state.serviceNumber === "";
    };

    onValidateTicket = async () => {

        
        let errorMessageToEmpptyService ="";
        if (!this.isEmptyTicket()){

           
            var endpoint = `api/v1/service/validate/${this.state.serviceNumber}`;
            const response = await service.get(endpoint).catch(e => {
                debugger;
                errorMessageToEmpptyService = "Parece que estamos enfrentando problemas com a internet";
                this.setState({errorMessageToEmpptyService});
            });

            if (errorMessageToEmpptyService !== ""){
                return;
            }


            if (response.data.isValid){
                let travel = response.data.data;

                localStorage.setItem("@tracker-app/travel", JSON.stringify(travel));
                this.setState({
                    services: travel,
                    redirect: `/tracker/${this.state.serviceNumber}`
                 });
            }
            else{
                errorMessageToEmpptyService = response.data.message;
                this.setState({errorMessageToEmpptyService});
                return;
            }
            
        } 
        else{
            errorMessageToEmpptyService = "Por favor, digite o número do servico.";
            this.setState({errorMessageToEmpptyService});
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
                <h1>Quer saber aonde seu onibus está? </h1>
                <br/>
             
                <input onChange={this.handleChange} className='ticket-input' type='text' required placeholder="Digite aqui o número do serviço" />
                <br/>
                {
                    this.state.errorMessageToEmpptyService && 
                    <span className="message-alert"> 
                        {this.state.errorMessageToEmpptyService} 
                    </span> 
                }
                <br/>
                <button className='ticket-button' onClick={this.onValidateTicket} >encontrar meu ônibus</button>
            </div>
        </div>
      )
        
    }
    
}; 

export default TravelSearch;