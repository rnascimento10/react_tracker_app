import React, { Component, } from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { HubConnectionBuilder } from '@microsoft/signalr';
import AppBar from '../../appbar/index'

import service from '../../../services/serviceapi';
import config from '../../../config'

import './styles.css';


export const vehicleIcon = new L.Icon({
  iconUrl: '/assets/images/bus.gif',
  iconRetinaUrl: '/assets/images/bus.gif',
  iconAnchor: [5, 30],
  popupAnchor: [10, -44],
  iconSize: [55, 55],
});

export const meIcon = new L.Icon({
  iconUrl: '/assets/images/me.png',
  iconRetinaUrl: '/assets/images/me.png',
  iconAnchor: [5, 30],
  popupAnchor: [10, -44],
  iconSize: [32, 40],
});

export const endmarker = new L.Icon({
  iconUrl: '/assets/images/endmarker.png',
  iconRetinaUrl: '/assets/images/endmarker.png',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [32, 40],
});

export const startmarker = new L.Icon({
  iconUrl: '/assets/images/startmarker.png',
  iconRetinaUrl: '/assets/images/startmarker.png',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [32, 40],
});



export default class Tracker extends Component {

  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);

    this.state = {
      zoom: 10,
      vehiclePoint: { lat: -22.908333, lng: -43.2096 },
      departurePoint: { lat: -22.908333, lng: -43.2096 },
      unDepaturePoint: { lat: -22.910333, lng: -43.3096 },
      connection: null,
      geoJson: null,
      service: JSON.parse(localStorage.getItem("@tracker-app/travel")),
      me: { lat: -22.908333, lng: -43.2096 },
      myDistanceFromPoint: 0,
      messageInfo: "",
    };

    this.geoJsonLayer = React.createRef();
  }



  goBack() {

    if (this.state.connection !== null) {

      if (this.state.connection.connectionState === "Connected") {
        this.state.connection.stop();
      }
    }

    this.props.history.push('/');
  }

  getDistance(lat1, lon1, lat2, lon2){
  let rad = (x) => {
    return x * Math.PI / 180;
  }

  let R     = 6378.137;                 
  let dLat  = rad( lat2 - lat1 );
  let dLong = rad( lon2 - lon1 );

  let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  let d = R * c;

  return d.toFixed(1);                   
}

  trackMe(){
    let getGeo = (pos) => {
    
      let lat = pos.coords.latitude,
          lng = pos.coords.longitude;
      

      let distancePoint = this.state.vehiclePoint;
      let distance = this.getDistance(lat, lng, distancePoint.lat, distancePoint.lng);

  
      this.setState({
        me: { lat: lat, lng: lng },
        myDistanceFromPoint: distance
      });
    };
  
    let errorHandler = (err) => {
  
      switch (err.code) {
        case 1:
          //Permissão negada pelo usuario
          console.log("Permissão negada pelo usuario.");
          break;
  
        case 2:
          //Não foi possível alcançar os satélites GPS
          console.log("Não foi possível alcançar os satélites GPS");
          break;
  
        case 3:
          //A requisição demorou demais para retornar
          console.log("A requisição demorou demais para retornar");
          break;
  
        case 0:
          //Ocorreu um erro desconhecido...
          console.log("Ocorreu um erro desconhecido...");
          break;
        default:
          console.log(err);
          break;
      }
  
    };
  
    let options = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 3000
    };
  
    return {
      watch : () => navigator.geolocation.watchPosition(getGeo, errorHandler, options),
    }
    
  
  }



  async getRoutes() {
    const { serviceNumber } = this.props.match.params;
    const endpoint = `api/v1/service/${serviceNumber}`;

    const response = await service.get(endpoint);
    const r = JSON.parse(response.data.route);

    if (r == null){
      this.setState({
        messageInfo : "Nos desculpe, parece que ainda não existem rotas planejadas para esta viagem",
      });

      return;
    }

    this.geoJsonLayer.current.leafletElement.clearLayers().addData(r);
    this.setState({
      geoJson: r,
      departurePoint: {
        lat: r.features[0].geometry.coordinates[0][1],
        lng: r.features[0].geometry.coordinates[0][0]
      },
      unDepaturePoint: {
        lat: r.features[r.features.length - 1].geometry.coordinates[r.features[r.features.length - 1].geometry.coordinates.length - 1][1],
        lng: r.features[r.features.length - 1].geometry.coordinates[r.features[r.features.length - 1].geometry.coordinates.length - 1][0]
      }
    });
  }



  async componentDidMount() {

    if ('geolocation' in navigator) {
        this.trackMe().watch();
    }
   
    await this.getRoutes();

    const conn = new HubConnectionBuilder()
      .withUrl(config.trackerUrl)
      .withAutomaticReconnect()
      .build();

    this.setState({
      connection: conn
    });
  }

  componentDidUpdate() {


    if (this.state.connection !== null) {

      if (this.state.connection.connectionState !== "Connected") {
        this.state.connection
          .start()
          .then(result => {

            const { serviceNumber } = this.props.match.params;
            const idGrade = this.state.service.idGrade;
            const idVeiculo = this.state.service.idVeiculo;


            this.state.connection.invoke("AddToMonitoringGroup", serviceNumber, idGrade, idVeiculo)
              .catch(e => console.log('Erro to AddToMonitoringGroup: ', e));

            console.log('Connected!');
            this.state.connection.on('ReceiveLocationFromBus', locationNotifiedToCustomer => {
              console.log(locationNotifiedToCustomer);

              if (locationNotifiedToCustomer.isDisconected) {
                console.log("Fim da viagem, avisar ao usuário e desconectar da aplicação");
              }

              let _service = JSON.parse(localStorage.getItem("@tracker-app/travel"));
              _service.proximoPonto = locationNotifiedToCustomer.nextDeparturePoint;

              let distance = this.getDistance(this.state.me.lat, this.state.me.lng, locationNotifiedToCustomer.latitude, locationNotifiedToCustomer.longitude);

              this.setState({
                vehiclePoint: { lat: locationNotifiedToCustomer.latitude, lng: locationNotifiedToCustomer.longitude },
                service: _service,
                myDistanceFromPoint: distance
              });
            });

          })
          .catch(e => console.log('Connection failed: ', e));
      }
    }
  }

  geoStyles() {
    return { color: '#009688', "weight": 6, };
  }





  render() {
    const vehicleLocation = [this.state.vehiclePoint.lat, this.state.vehiclePoint.lng];
    const unDepartureLocation = [this.state.unDepaturePoint.lat, this.state.unDepaturePoint.lng];
    const departureLocation = [this.state.departurePoint.lat, this.state.departurePoint.lng];
    const meLocation = [this.state.me.lat, this.state.me.lng];


    return (
      <>

        <AppBar
          goBack={this.goBack}
          service={this.state.service}
          userDistanceFromPoint = { this.state.myDistanceFromPoint}
          messageInfo = {this.state.messageInfo}
        />

        <Map
          center={meLocation}
          zoom={this.state.zoom}
          attributionControl={true}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={true}
          animate={true}
          easeLinearity={0.35}
        >

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          <GeoJSON
            ref={this.geoJsonLayer}
            data={this.state.geoJson}
            style={this.geoStyles} />

          <Marker position={vehicleLocation} icon={vehicleIcon}
            onMouseOver={(e) => {
              e.target.openPopup();
            }}
            onMouseOut={(e) => {
              e.target.closePopup();
            }}>
            <Popup>
              <b>Estou indo para :</b> {this.state.service.proximoPonto} <br />
            </Popup>
          </Marker>

          <Marker position={meLocation} 
                  icon={meIcon}>
          </Marker>

          {this.state.messageInfo === "" && 
          <>
          <Marker 
                  position={departureLocation} 
                  icon={startmarker}>
            <Popup>
              <b>Emmbarque</b>
            </Popup>
          </Marker>
          </>
          }

        {this.state.messageInfo ==="" && 
        <>
        <Marker position={unDepartureLocation} icon={endmarker}>
            <Popup>
              <b>Desembarque</b>
            </Popup>
          </Marker>
          </>
        }
        </Map>
      </>
    );
  }
}