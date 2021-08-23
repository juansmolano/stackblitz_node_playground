
const totalReplicas = 5;

function getBundleInstanceNumber(deviceId) {
    if (totalReplicas === 1 && instanceIndex === 0) return 0;
    const deviceIdNumber = deviceId.slice(-1).charCodeAt(0);
    return deviceIdNumber % totalReplicas;    
}

console.log(getBundleInstanceNumber('FLO-W7-0057'));