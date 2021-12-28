'use strict';

const _ = require('lodash');
const getDistance = require('geolib').getDistance;


const findRadioPermissibleError = (dop,dopDistancePermissibleErrors = [])=>{
    const permissibleError = dopDistancePermissibleErrors
    .find(({dopInitial, dopFinal, radio}) => dop>=dopInitial && dop<=dopFinal);   
    return permissibleError ? permissibleError.radio : 0; 
};

const formatEventData = (event)=>{    
    if(event.__formatted) return;
    const year = event.fecha.slice(0,4);
    const month = event.fecha.slice(4,6);
    const day = event.fecha.slice(6,8);
    const hour = event.hora.slice(0,2);
    const minute = event.hora.slice(2,4);
    const second = event.hora.slice(4,6);
    const timestamp = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}-05:00`).getTime();
    
    event.timestamp = timestamp;
    event.dop= parseFloat(event.dop.replace(',','.'));
    event.longitud= parseFloat(event.longitud.replace(',','.'));
    event.latitud= parseFloat(event.latitud.replace(',','.'));    
    event.__formatted= true;
};

const findCounterpartEvent = (authorityPayload,event,permissibleError, counterpartFileContent) => {
    const {distance,backDoorEntrance,backDoorExit,frontDoorEntrance,frontDoorExit,times} = permissibleError;
    let result = {};
    for(let counterpartPayload of counterpartFileContent) {
        for(let counterpartEvent of counterpartPayload.eventos){
            formatEventData(counterpartEvent);     
            const backDoor = event.puerta.find(({idPuerta}) => idPuerta === 1);
            const frontDoor = event.puerta.find(({idPuerta}) => idPuerta === 0);
            const counterpartBackDoor = counterpartEvent.puerta.find(({idPuerta}) => idPuerta === 1);
            const counterpartFrontDoor = counterpartEvent.puerta.find(({idPuerta}) => idPuerta === 0);            

            const timeDiff = Math.abs(event.timestamp - counterpartEvent.timestamp);
            const applyTime = timeDiff <= times;
        
            if(!applyTime) continue;       
            const distanceDiff = getDistance(
                {latitude:event.latitud,longitude:event.longitud}, 
                {latitude:counterpartEvent.latitud,longitude:counterpartEvent.longitud}, 
            );     
            const applyDistance = distanceDiff <= distance;            
            if(!applyDistance) continue;            
            const applyBackDoorEntrance = backDoor && counterpartBackDoor && Math.abs(backDoor.ingresos - counterpartBackDoor.ingresos) <= backDoorEntrance;
            const applyBackDoorExit = backDoor && counterpartBackDoor && Math.abs(backDoor.salidas - counterpartBackDoor.salidas) <= backDoorExit;
            const applyFrontDoorEntrance = frontDoor && counterpartFrontDoor && Math.abs(frontDoor.ingresos - counterpartFrontDoor.ingresos) <= frontDoorEntrance;
            const applyFrontDoorExit = frontDoor && counterpartFrontDoor && Math.abs(frontDoor.salidas - counterpartFrontDoor.salidas) <= frontDoorExit;
            const ranking = timeDiff+distanceDiff+applyBackDoorEntrance+applyBackDoorExit+applyFrontDoorEntrance+applyFrontDoorExit;            
            if(!result.counterpartEvent || ranking < result.match.ranking ) result = {counterpartEvent, match:{ranking,applyTime,applyDistance,applyBackDoorEntrance,applyBackDoorExit,applyFrontDoorEntrance,applyFrontDoorExit}};             
        }        
    }
    return result;
};

const buildReportTable = (appFileContent, authorityVehicleFileContent,analysisParameter)=>{
    appFileContent = _.cloneDeep(appFileContent);
    authorityVehicleFileContent = _.cloneDeep(authorityVehicleFileContent);
    analysisParameter = _.cloneDeep(analysisParameter);

    const reportTable = []; // final result => output
    for(let appRow of appFileContent) {
        const authorityPayload = appRow.authorityPayload;
        for(let event of authorityPayload.eventos){
            formatEventData(event);
            const radioPermissibleError = findRadioPermissibleError(event.dop,analysisParameter.dopDistancePermissibleErrors);
            const permissibleError = {...analysisParameter.permissibleErrors, distance:radioPermissibleError};
            const {counterpartEvent, match} = findCounterpartEvent(authorityPayload,event,permissibleError,authorityVehicleFileContent);
            reportTable.push({event,counterpartEvent,match: match ? JSON.stringify(match) : undefined});
        }        
    }
    return reportTable;
};



console.table(
    buildReportTable(
        require('./entities/appFileContent.json'),
        require('./entities/authorityVehicleFileContent.json'),
        require('./entities/analysisParameter.json')
    )
);