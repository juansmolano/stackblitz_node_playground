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
            if(counterpartEvent.__taken)continue;
            formatEventData(counterpartEvent);     
            const backDoor = event.puerta.find(({idPuerta}) => idPuerta === 1);
            const frontDoor = event.puerta.find(({idPuerta}) => idPuerta === 0);
            const counterpartBackDoor = counterpartEvent.puerta.find(({idPuerta}) => idPuerta === 1);
            const counterpartFrontDoor = counterpartEvent.puerta.find(({idPuerta}) => idPuerta === 0);            

            const timeDiff = parseInt(Math.abs(event.timestamp - counterpartEvent.timestamp)/1000);
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
            const applyFrontDoorState = frontDoor && counterpartFrontDoor && frontDoor.estado === counterpartFrontDoor.estado;
            const applyBackDoorState = backDoor && counterpartBackDoor && backDoor.estado === counterpartBackDoor.estado;

            const ranking = timeDiff+distanceDiff+applyBackDoorEntrance+applyBackDoorExit+applyFrontDoorEntrance+applyFrontDoorExit;            

            if(!result.counterpartEvent || ranking < result.match.ranking ) {
                result = {
                    counterpartEvent, 
                    match:{
                        timeDiff,
                        distanceDiff,
                        ranking,
                        backDoor,
                        counterpartFrontDoor,
                        counterpartBackDoor,
                        frontDoor,
                        applyTime,
                        applyDistance,
                        applyBackDoorEntrance,
                        applyBackDoorExit,
                        applyFrontDoorEntrance,
                        applyFrontDoorExit,
                        applyFrontDoorState,
                        applyBackDoorState     
                    }
                };

            }
        }        
    }
    if(result.counterpartEvent)result.counterpartEvent.__taken = true;
    return result;
};

const generateFlagCell = (event,counterpartEvent,match) => {
    return !match
        ? '🔴' 
        : (
            match.applyBackDoorEntrance && 
            match.applyBackDoorExit && 
            match.applyFrontDoorEntrance && 
            match.applyFrontDoorExit &&
            match.applyFrontDoorState &&
            match.applyBackDoorState 
            )
            ? '🟢'
            : '🟠';
};

const generateDateTimeCell = (event,counterpartEvent,match) => {
    const dateTime = new Date(event.timestamp).toLocaleString();
    if(!match || match.timeDiff === 0 ){
        return dateTime;
    }
    return `${dateTime} dif:${match.timeDiff}s`;
};

const generateLocationCell = (event,counterpartEvent,match) => {
    if(!match || match.distanceDiff === 0 ){
        return `${event.latitud},${event.longitud}`;
    }
    return `${event.latitud},${event.longitud} dif:${match.distanceDiff}m`;
};

const generateDoorStateCell = (event,counterpartEvent,match) => {
    if(!match || (match.applyFrontDoorState && match.applyBackDoorState)){
        const backDoor = event.puerta.find(({idPuerta}) => idPuerta === 1);
        const frontDoor = event.puerta.find(({idPuerta}) => idPuerta === 0);
        return `D${frontDoor.estado?'C':'A'}T${backDoor.estado?'C':'A'}`;
    }
    return `D${match.frontDoor.estado?'C':'A'}T${match.backDoor.estado?'C':'A'} aut: D${match.counterpartFrontDoor.estado?'C':'A'}T${match.counterpartBackDoor.estado?'C':'A'} `;
};

const generateDoorPassengerCell = (event,counterpartEvent,match, isFront, isEntrance) => {
    if(!match || (match[`apply${isFront?'Front':'Back'}Door${isEntrance?'Entrance':'Exit'}`])){  
        const door = event.puerta.find(({idPuerta}) => idPuerta === (isFront ? 0 :1));      
        return `${door[isEntrance?'ingresos':'salidas']}`;
    }
    return `${match[isFront?'frontDoor':'backDoor'][isEntrance?'ingresos':'salidas']} aut:${match[isFront?'counterpartFrontDoor':'counterpartBackDoor'][isEntrance?'ingresos':'salidas']}`;
};

const generateReportTableRow = (event,counterpartEvent,match) => {
    const dateTime = new Date(event.timestamp).toLocaleString();
    return {
        flag : generateFlagCell(event,counterpartEvent,match),
        dateTime: generateDateTimeCell(event,counterpartEvent,match),
        location: generateLocationCell(event,counterpartEvent,match),
        doorState: generateDoorStateCell(event,counterpartEvent,match),
        //frontDoorPassengerEntrance
        fdpentr: generateDoorPassengerCell(event,counterpartEvent,match,true,true),
        //frontDoorPassengerExit
        fdpexit: generateDoorPassengerCell(event,counterpartEvent,match,true,false),
        //backDoorPassengerEntrance
        bdpentr: generateDoorPassengerCell(event,counterpartEvent,match,false,true),
        //backDoorPassengerExit
        bdpexit: generateDoorPassengerCell(event,counterpartEvent,match,false,false),
    };
};

const buildReportTable = (appFileContent, authorityVehicleFileContent,analysisParameter)=>{
    appFileContent = _.cloneDeep(appFileContent);
    authorityVehicleFileContent = _.cloneDeep(authorityVehicleFileContent);
    analysisParameter = _.cloneDeep(analysisParameter);

    const reportTable = []; // final result => output
    for(let appRow of appFileContent) {
        const authorityPayload = appRow.authorityPayload;
        if(!authorityPayload) continue; //ignores text-notes
        for(let event of authorityPayload.eventos){
            formatEventData(event);
            const radioPermissibleError = findRadioPermissibleError(event.dop,analysisParameter.dopDistancePermissibleErrors);
            const permissibleError = {...analysisParameter.permissibleErrors, distance:radioPermissibleError};
            const {counterpartEvent, match} = findCounterpartEvent(authorityPayload,event,permissibleError,authorityVehicleFileContent);
            reportTable.push(generateReportTableRow(event,counterpartEvent,match));
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