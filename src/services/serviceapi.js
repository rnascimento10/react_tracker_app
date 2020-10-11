import axios from 'axios';

const service = axios.create({baseURL:'https://localhost:44399'});

export default service;