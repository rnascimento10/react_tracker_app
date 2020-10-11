import React from 'react';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Ticket from './componenents/ticket';

import Tracker from './componenents/tracker';

const Routes = () => (
    <Router>
        <Switch>
            <Route exact path="/" component={Ticket}/>
            <Route path="/tracker/:id" component={Tracker}/>
        </Switch>
    </Router>
);

export default Routes;