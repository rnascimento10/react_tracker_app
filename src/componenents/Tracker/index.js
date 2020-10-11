import React, { Component, } from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { HubConnectionBuilder } from '@microsoft/signalr';
import AppBar from '../appbar/index'

import service from '../../services/serviceapi';

import './styles.css';


export const vehicleIcon = new L.Icon({
  iconUrl: '/assets/images/bus.gif',
  iconRetinaUrl: '/assets/images/bus.gif',
  iconAnchor: [5, 30],
  popupAnchor: [10, -44],
  iconSize: [55, 55],
});

export const endmarker = new L.Icon({
  iconUrl: '/assets/images/endmarker.png',
  iconRetinaUrl: '/assets/images/endmarker.png',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [40, 54],
});

export const startmarker = new L.Icon({
  iconUrl: '/assets/images/startmarker.png',
  iconRetinaUrl: '/assets/images/startmarker.png',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [40, 54],
});


export default class Tracker extends Component {

  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);

    this.state = {
      zoom: 14,
      vehiclePoint: { lat: -22.908333, lng: -43.2096 },
      departurePoint: { lat: -22.908333, lng: -43.2096 },
      unDepaturePoint: { lat: -22.910333, lng: -43.3096 },
      lineDescription: 123,
      way: "Ida",
      departureDate: new Date(),
      connection: null,
      geoJson: null,
      service: localStorage.getItem("@tracker-app/service")

    };

    this.geoJsonLayer = React.createRef();
  }



  goBack() {

    if (this.state.connection.connectionState !== "Connected") {
      this.state.connection.stop();
    }

    this.props.history.push('/');
  }


  async componentDidMount() {
    

    await this.getRoutes();
    const newConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:44399/tracker')
      .withAutomaticReconnect()
      .build();

    this.setState({
      connection: newConnection
    });
  }

  componentDidUpdate() {


    if (this.state.connection !== null) {

      if (this.state.connection.connectionState !== "Connected") {
        this.state.connection
          .start()
          .then(result => {
            console.log('Connected!');

            this.state.connection.on('ReceiveActualPoint', message => {
              console.log(message);
              this.setState({
                vehiclePoint: { lat: message.latitude, lng: message.longitude }
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

  async getRoutes() {
    const { id } = this.props.match.params;
    var endpoint = `/service/${id}`;

    const response = await service.get(endpoint);
    const r = JSON.parse(response.data.route);

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




  render() {
    const vehiclePoinPosititon = [this.state.vehiclePoint.lat, this.state.vehiclePoint.lng];
    const unDeparturePointPosition = [this.state.unDepaturePoint.lat, this.state.unDepaturePoint.lng];
    const departurePointPosition = [this.state.departurePoint.lat, this.state.departurePoint.lng];



    return (
      <>
      
        <AppBar 
          goBack={this.goBack}
          service={this.state.service}
        />

        <Map
          center={vehiclePoinPosititon}
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

          <Marker position={vehiclePoinPosititon} icon={vehicleIcon}>
            <Popup>
              <b>Serviço:</b> 123 <br />
              <b>Linha:</b>

            </Popup>
          </Marker>

          <Marker position={departurePointPosition} icon={startmarker}>
            <Popup>
              <b>Emmbarque</b>
            </Popup>
          </Marker>

          <Marker position={unDeparturePointPosition} icon={endmarker}>
            <Popup>
              <b>Desembarque</b>
            </Popup>
          </Marker>
        </Map>
      </>
    );
  }
}