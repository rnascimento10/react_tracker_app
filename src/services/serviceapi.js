import axios from 'axios';

const service = axios.create({baseURL:'http://192.168.40.11:44399'});

export default service;