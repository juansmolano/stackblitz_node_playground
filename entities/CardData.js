module.exports = {
  "NT": 1234567890, // Numero (seq) tarjeta
  "VL": 1, // VersionLayout (Mapping)
  "B": 1, // Bloqueo temporal (TimeStamp sec)  
  "FV": 1627927978, // Fecha de validez del medio de pago
  "CT$": 100, // Consecutivo Transaccion Medio de Pago  
  "ST$": 200200, // Saldo Tarjeta
  "STB$": 10101, // Saldo Tarjeta Backup

  ////////////////////////////////////////////////////////////////
  ///////////////////// USUARIO FINAL ////////////////////////////
  ////////////////////////////////////////////////////////////////

  "NU": "Lorem Ipsum is simply dummy text", // Nombre Usuario
  "TD": 111, // Tipo de documento
  "DI": "0123456789012345", // ID de identidad del usuario  
  "P": 123, // PErfil
  "PMR": 1, // PMR
  "AC": 100, // Numero de acompañantes
  
  ////////////////////////////////////////////////////////////////
  ////////////////// HISTORIAL RECARGA  //////////////////////////
  ////////////////////////////////////////////////////////////////

  "HISTR_FT_1": 1627927111, //Marca de tiempo (timeStamp sec) de la transacción
  "HISTR_FT_2": 1627927222, //Marca de tiempo (timeStamp sec) de la transacción

  "HISTR_CT_1": 1627927101, // Consecutivo Transaccion
  "HISTR_CT_2": 1627927202, // Consecutivo Transaccion

  "HISTR_VT_1": 8300001, //Monto de la transacción 
  "HISTR_VT_2": 8300002, //Monto de la transacción 

  "HISTR_IDV_1": 16000001, //Id del dispositivo 
  "HISTR_IDV_2": 16000002, //Id del dispositivo 

  "HISTR_TT_1": 111, //Tipo de transacción
  "HISTR_TT_2": 222, //Tipo de transacción

  "HISTR_CK_1": 101, //CheckSum
  "HISTR_CK_2": 102, //CheckSum

  ////////////////////////////////////////////////////////////////
  ////////////////// HISTORIAL USOS T.  //////////////////////////
  ////////////////////////////////////////////////////////////////

  "HISTU_FT_1": 1627927001, //Marca de tiempo (timeStamp sec) de la transacción
  "HISTU_FT_2": 1627927002, //Marca de tiempo (timeStamp sec) de la transacción
  "HISTU_FT_3": 1627927003, //Marca de tiempo (timeStamp sec) de la transacción
  "HISTU_FT_4": 1627927004, //Marca de tiempo (timeStamp sec) de la transacción
  "HISTU_FT_5": 1627927005, //Marca de tiempo (timeStamp sec) de la transacción
  "HISTU_FT_6": 1627927006, //Marca de tiempo (timeStamp sec) de la transacción

  "HISTU_FID_1": 60001, // Device-Fare ID
  "HISTU_FID_2": 60002, // Device-Fare ID
  "HISTU_FID_3": 60003, // Device-Fare ID
  "HISTU_FID_4": 60004, // Device-Fare ID
  "HISTU_FID_5": 60005, // Device-Fare ID
  "HISTU_FID_6": 60006, // Device-Fare ID

  "HISTU_ITI_1": 10001, // Id Itinerario
  "HISTU_ITI_2": 20002, // Id Itinerario
  "HISTU_ITI_3": 30002, // Id Itinerario
  "HISTU_ITI_4": 40002, // Id Itinerario
  "HISTU_ITI_5": 50002, // Id Itinerario
  "HISTU_ITI_6": 60002, // Id Itinerario

  "HISTU_IDV_1": 16000101, //Id del dispositivo
  "HISTU_IDV_2": 16000102, //Id del dispositivo
  "HISTU_IDV_3": 16000103, //Id del dispositivo
  "HISTU_IDV_4": 16000104, //Id del dispositivo
  "HISTU_IDV_5": 16000105, //Id del dispositivo
  "HISTU_IDV_6": 16000106, //Id del dispositivo

  "HISTU_CK_1": 101, //CheckSum
  "HISTU_CK_2": 102, //CheckSum
  "HISTU_CK_3": 103, //CheckSum
  "HISTU_CK_4": 104, //CheckSum
  "HISTU_CK_5": 105, //CheckSum
  "HISTU_CK_6": 106, //CheckSum
};