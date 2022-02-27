import React from 'react'
import {Button, Form} from "react-bootstrap";
import _ from "lodash";
import data from  '../Data/data.json'
import ReactJson from 'react-json-view'

export default (class SearchService extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            serviceName: '',
            lat: 0,
            lng: 0,
            response: {},
            dataSet: []
        }
    }

    componentDidMount() {
        if(_.isEmpty(this.state.dataSet)){
            this.loadData()
        }
    }

    calculateDistanceBetweenLatLon = (fromPoint, ToPoint) => {
        if ((fromPoint.lat === ToPoint.lat) && (fromPoint.lng === ToPoint.lng)) {
            return 0;
        }
        else {
            let fromRLat = Math.PI * fromPoint.lat/180;
            let toRLat = Math.PI * ToPoint.lat/180;
            let theta = fromPoint.lng-ToPoint.lng;
            let rTheta = Math.PI * theta/180;
            let dist = Math.sin(fromRLat) * Math.sin(toRLat) + Math.cos(fromRLat) * Math.cos(toRLat) * Math.cos(rTheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            return dist * 1.609344;
        }
    }

    filterServices = () => {
        if (!this.state.serviceName) {
            return [];
        }
        const matchRegex = new RegExp(this.state.serviceName, "i");
        let results = this.state.dataSet.filter(({name}) => name.match(matchRegex, "i"))
        let TotalHits = results.length
        let TotalDocuments = this.state.dataSet.length
        results = results.map(service => {
            service["score"] = this.calculateStringScoring(this.state.serviceName, service.name)
            service["distance"] = Math.round(this.calculateDistanceBetweenLatLon(service.position, {lat: this.state.lat, lng: this.state.lng})) + 'KM'
            return service
        })
        return {["TotalHits"]: TotalHits, ["TotalDocuments"]: TotalDocuments, ["results"]: results}
    }

    loadData = () => {
        this.setState({dataSet: data})
    }

    onSubmit = e => {
        e.preventDefault();
        let resp = this.filterServices()
        debugger
        this.setState({response: resp}, () => console.log('Response', resp))
    }

    calculateStringScoring(userEntered,currentService) {
        let equivalency = 0;
        let minLength = (userEntered.length > currentService.length) ? currentService.length : userEntered.length;
        let maxLength = (userEntered.length < currentService.length) ? currentService.length : userEntered.length;
        _.times(minLength, i => {
            if(userEntered[i] === currentService[i]) {
                equivalency++;
            }
        })
        return Math.round((equivalency / maxLength) * 100) + `%`;
    }

    updateServiceName = (e) => {
        this.setState({serviceName: e.target.value})
    }

    updateLat = (e) => {
        this.setState({lat: e.target.value})
    }

    updateLng = (e) => {
        this.setState({lng: e.target.value})
    }

    render() {
        return (
            <main>
                <section className="mx-0 px-0">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12 col-lg-10">
                                <div className="container">
                                    <Form onSubmit={this.onSubmit}>
                                        <Form.Group>
                                            <Form.Label>Service Name</Form.Label>
                                            <Form.Control onChange={e => this.updateServiceName(e)} required/>
                                            <Form.Label>Geolocation</Form.Label>
                                            <Form.Control className="mb-2" placeholder="0.00" type='number'
                                                          step="any"
                                                          min='0'
                                                          max='20' onChange={e => this.updateLat(e)} required/>
                                            <Form.Control className="mb-2" placeholder="0.00" type='number'
                                                          step="any"
                                                          min='0'
                                                          max='20' onChange={e => this.updateLng(e)} required/>
                                        </Form.Group>
                                        <Button type="submit">Submit form</Button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 col-lg-12">
                                { this.state.response &&
                                        <ReactJson src={this.state.response} name="Response" collapsed={false} indentWidth={4} iconStyle="triangle"  style={{position: "absolute"}}/>
                                }
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        )
    }
})
