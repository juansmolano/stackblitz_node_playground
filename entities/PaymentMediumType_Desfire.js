module.exports = {
  _id: "22ff57ab-7e18-4b93-9321-dbe806269895",
  active: true,
  name: "DESFIRE",
  code: "DESFIRE",
  organizationId: "3ae750a0-609c-483f-96c2-e27c8018daec",
  idField: "muuid",
  idRegex: "(\\b[0-9A-F]{8}$\\b)|(\\b[0-9A-F]{14}$\\b)",
  flagRegex: "i",
  specs: {
    validityPeriodExtension: 31556952,
    QR_RECHARGE_TOKEN: {
      t: "PMRT",
      v: {
        e: "$tsAtt.expirationThreshold",
        pid: "$paymentMediumRechargeToken.paymentMediumId",
        t: "$tsAtt.timestampAsSeconds",
        tid: "$rts.seq",
        v: "$paymentMediumRechargeToken.metadata.unitPrice"
      }
    },
    TYPE: "DESFIRE"
  },
  mappings: [
    {
      version: 1,
      active: true,
      readOnly: false,
      description: null,
      changelog: "",
      mapping: {
        APP_AFC: {
          "appId": 1,
          "data": {
            "AC": {
              "fileID": 2,
              "offset": 2,
              "type": "UINT8"
            },
            "B": {
              "fileID": 3,
              "offset": 0,
              "type": "UINT8"
            },
            "CT$": {
              "fileID": 3,
              "offset": 1,
              "type": "UINT32"
            },
            "DI": {
              "fileID": 1,
              "offset": 33,
              "type": "STRING16"
            },
            "FV": {
              "fileID": 3,
              "offset": 5,
              "type": "UINT32"
            },
            "HISTR_CT": {
              "fileID": 6,
              "offset": 4,
              "type": "UINT32"
            },
            "HISTR_FT": {
              "fileID": 6,
              "offset": 0,
              "type": "UINT32"
            },
            "HISTR_IDV": {
              "fileID": 6,
              "offset": 12,
              "type": "UINT32"
            },
            "HISTR_TT": {
              "fileID": 6,
              "offset": 16,
              "type": "UINT8"
            },
            "HISTR_VT": {
              "fileID": 6,
              "offset": 8,
              "type": "INT32"
            },
            "HISTU_FID": {
              "fileID": 7,
              "offset": 4,
              "type": "UINT32"
            },
            "HISTU_FT": {
              "fileID": 7,
              "offset": 0,
              "type": "UINT32"
            },
            "HISTU_IDV": {
              "fileID": 7,
              "offset": 12,
              "type": "UINT32"
            },
            "HISTU_ITI": {
              "fileID": 7,
              "offset": 8,
              "type": "UINT32"
            },
            "HISTU_SQD": {
              "fileID": 7,
              "offset": 16,
              "type": "UINT32"
            },
            "HISTU_VAL": {
              "fileID": 7,
              "offset": 20,
              "type": "UINT32"
            },
            "NT": {
              "fileID": 1,
              "offset": 49,
              "type": "UINT32"
            },
            "NT_BACKUP": {
              "fileID": 2,
              "offset": 4,
              "type": "UINT32"
            },
            "NU": {
              "fileID": 1,
              "offset": 0,
              "type": "STRING32"
            },
            "P": {
              "fileID": 2,
              "offset": 0,
              "type": "UINT8"
            },
            "PMR": {
              "fileID": 2,
              "offset": 1,
              "type": "UINT8"
            },
            "ST$": {
              "fileID": 5,
              "offset": 0,
              "type": "VALUE"
            },
            "TD": {
              "fileID": 1,
              "offset": 32,
              "type": "UINT8"
            },
            "VL": {
              "fileID": 1,
              "offset": 53,
              "type": "UINT8"
            },
            "VL_BACKUP": {
              "fileID": 2,
              "offset": 3,
              "type": "UINT8"
            }
          },
          "filesMetada": {
            "1": {
              "fileType": "StdFile",
              "fileComm": "MAC",
              "fileSize": 54
            },
            "2": {
              "fileType": "BackupFile",
              "fileComm": "FULL",
              "fileSize": 8
            },
            "3": {
              "fileType": "BackupFile",
              "fileComm": "FULL",
              "fileSize": 9
            },
            "5": {
              "fileType": "ValueFile",
              "fileComm": "FULL",
              "fileSize": 4
            },
            "6": {
              "fileType": "CyclicRecod",
              "fileComm": "FULL",
              "fileSize": 32,
              "recordLines": 3
            },
            "7": {
              "fileType": "CyclicRecod",
              "fileComm": "FULL",
              "fileSize": 32,
              "recordLines": 6
            }
          },
          "keys": {
            "LLAVE_CREDITO": {
              "name": "LLAVE_CREDITO",
              "value": 32,
              "diversified": true
            },
            "LLAVE_DEBITO": {
              "name": "LLAVE_DEBITO",
              "value": 31,
              "diversified": true
            },
            "LLAVE_OPERACION": {
              "name": "LLAVE_OPERACION",
              "value": 41,
              "diversified": true
            },
            "LLAVE_PUBLICA": {
              "name": "LLAVE_PUBLICA",
              "value": 30,
              "diversified": false
            }
          },
          "access": {
            "1": {
              "writeKeys": {
                "LLAVE_OPERACION": "KEY_01"
              },
              "readKeys": {
                "LLAVE_PUBLICA": "KEY_02"
              }
            },
            "2": {
              "writeKeys": {
                "LLAVE_CREDITO": "KEY_04",
                "LLAVE_OPERACION": "KEY_01"
              },
              "readKeys": {
                "LLAVE_CREDITO": "KEY_04",
                "LLAVE_DEBITO": "KEY_03"
              }
            },
            "3": {
              "writeKeys": {
                "LLAVE_CREDITO": "KEY_04",
                "LLAVE_DEBITO": "KEY_03",
                "LLAVE_OPERACION": "KEY_01"
              },
              "readKeys": {
                "LLAVE_CREDITO": "KEY_04",
                "LLAVE_DEBITO": "KEY_03"
              }
            },
            "5": {
              "writeKeys": {
                "LLAVE_CREDITO": "KEY_04",
                "LLAVE_DEBITO": "KEY_03",
                "LLAVE_OPERACION": "KEY_01"
              },
              "readKeys": {
                "LLAVE_CREDITO": "KEY_04",
                "LLAVE_DEBITO": "KEY_03"
              }
            },
            "6": {
              "writeKeys": {
                "LLAVE_CREDITO": "KEY_04",
                "LLAVE_DEBITO": "KEY_03",
                "LLAVE_OPERACION": "KEY_01"
              },
              "readKeys": {
                "LLAVE_CREDITO": "KEY_04",
                "LLAVE_DEBITO": "KEY_03"
              }
            },
            "7": {
              "writeKeys": {
                "LLAVE_CREDITO": "KEY_04",
                "LLAVE_DEBITO": "KEY_03",
                "LLAVE_OPERACION": "KEY_01"
              },
              "readKeys": {
                "LLAVE_CREDITO": "KEY_04",
                "LLAVE_DEBITO": "KEY_03"
              }
            }
          },
          "seqRead": [
            [
              2,
              0,
              8
            ],
            [
              3,
              0,
              9
            ],
            [
              5,
              0,
              4
            ],
            [
              6,
              0,
              17
            ],
            [
              7,
              0,
              24
            ]
          ],
          "seqWrite": [
            [
              3,
              0
            ],
            [
              5,
              0
            ],
            [
              6,
              0
            ],
            [
              7,
              0
            ]
          ],
          "acls": {
            '1': '010200',
            '2': '030001040001',
            '3': '030104000001',
            '5': '030401000001',
            '6': '040304000001',
            '7': '040304000001'
          }
        },
      },
      metadata: {
        __typename: "PaymentMediumMngPaymentMediumTypeMappingMetadata",
        createdAt: 1631978940673,
        createdBy: "Sebastian Molano",
        updatedAt: 1632339558448,
        updatedBy: "Sebastian Molano"
      }
    },
  ],
  metadata: {
    createdBy: "sebastian.molano@nebulae.com.co",
    createdAt: 1631907326769,
    updatedBy: "sebastian.molano@nebulae.com.co",
    updatedAt: 1632339560043
  },
  ephemeral: null
};