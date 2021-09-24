module.exports = {
  _id: "22ff57ab-7e18-4b93-9321-dbe806269895",
  active: true,
  name: "MIFARE",
  code: "MIFARE",
  organizationId: "3ae750a0-609c-483f-96c2-e27c8018daec",
  idField: "muuid",
  idRegex: "(\\b[0-9A-F]{8}$\\b)|(\\b[0-9A-F]{14}$\\b)",
  flagRegex: "i",
  mappings: [
    {
      version: 3,
      active: true,
      readOnly: false,
      description: null,
      changelog: "",
      mapping: {
        APP_AFC: {
          access: {
            "12": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "13": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "14": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "15": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "16": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "17": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "18": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "19": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "20": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "21": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "22": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "23": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "24": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "25": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "26": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "27": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "28": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "29": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "30": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "31": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "32": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "33": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "34": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "35": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            }
          },
          acls: {
            "15": {
              ACL: "00000000000F7F0788FF000000000000",
              KEYA: "DEBITO",
              KEYB: "CREDITO"
            },
            "19": {
              ACL: "00000000000F7F0788FF000000000000",
              KEYA: "DEBITO",
              KEYB: "CREDITO"
            },
            "23": {
              ACL: "00000000000F7F0788FF000000000000",
              KEYA: "DEBITO",
              KEYB: "CREDITO"
            },
            "27": {
              ACL: "00000000000F7F0788FF000000000000",
              KEYA: "DEBITO",
              KEYB: "CREDITO"
            },
            "31": {
              ACL: "00000000000F7F0788FF000000000000",
              KEYA: "DEBITO",
              KEYB: "CREDITO"
            }
          },
          data: {
            AC: {
              block: 13,
              start: 3,
              type: "UINT8"
            },
            B: {
              block: 14,
              start: 0,
              type: "VALUE"
            },
            "CT$": {
              block: 22,
              start: 0,
              type: "VALUE"
            },
            FV: {
              block: 18,
              start: 0,
              type: "UINT32"
            },
            HISTR_CK_1: {
              block: 16,
              start: 15,
              type: "UINT8"
            },
            HISTR_CK_2: {
              block: 17,
              start: 15,
              type: "UINT8"
            },
            HISTR_CT_1: {
              block: 16,
              start: 4,
              type: "UINT32"
            },
            HISTR_CT_2: {
              block: 17,
              start: 4,
              type: "UINT32"
            },
            HISTR_FT_1: {
              block: 16,
              start: 0,
              type: "UINT32"
            },
            HISTR_FT_2: {
              block: 17,
              start: 0,
              type: "UINT32"
            },
            HISTR_IDV_1: {
              block: 16,
              start: 11,
              type: "UINT24"
            },
            HISTR_IDV_2: {
              block: 17,
              start: 11,
              type: "UINT24"
            },
            HISTR_TT_1: {
              block: 16,
              start: 14,
              type: "UINT8"
            },
            HISTR_TT_2: {
              block: 17,
              start: 14,
              type: "UINT8"
            },
            HISTR_VT_1: {
              block: 16,
              start: 8,
              type: "INT24"
            },
            HISTR_VT_2: {
              block: 17,
              start: 8,
              type: "INT24"
            },
            HISTU_CK_1: {
              block: 24,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_2: {
              block: 25,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_3: {
              block: 26,
              start: 14,
              type: "UINT8"
            },
            HISTU_CK_4: {
              block: 28,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_5: {
              block: 29,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_6: {
              block: 30,
              start: 15,
              type: "UINT8"
            },
            HISTU_FID_1: {
              block: 24,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_2: {
              block: 25,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_3: {
              block: 26,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_4: {
              block: 28,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_5: {
              block: 29,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_6: {
              block: 30,
              start: 4,
              type: "UINT16"
            },
            HISTU_FT_1: {
              block: 24,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_2: {
              block: 25,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_3: {
              block: 26,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_4: {
              block: 28,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_5: {
              block: 29,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_6: {
              block: 30,
              start: 0,
              type: "UINT32"
            },
            HISTU_IDV_1: {
              block: 24,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_2: {
              block: 25,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_3: {
              block: 26,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_4: {
              block: 28,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_5: {
              block: 29,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_6: {
              block: 30,
              start: 8,
              type: "UINT24"
            },
            HISTU_ITI_1: {
              block: 24,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_2: {
              block: 25,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_3: {
              block: 26,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_4: {
              block: 28,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_5: {
              block: 29,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_6: {
              block: 30,
              start: 6,
              type: "UINT16"
            },
            NT: {
              block: 12,
              start: 0,
              type: "UINT32"
            },
            P: {
              block: 13,
              start: 0,
              type: "UINT8"
            },
            PMR: {
              block: 13,
              start: 2,
              type: "UINT8"
            },
            "ST$": {
              block: 20,
              start: 0,
              type: "VALUE"
            },
            "STB$": {
              block: 21,
              start: 0,
              type: "VALUE"
            },
            VL: {
              block: 13,
              start: 1,
              type: "UINT8"
            }
          },
          keys: {
            CREDITO: {
              name: "CREDITO",
              value: 11
            },
            DEBITO: {
              name: "DEBITO",
              value: 11
            }
          },
          seqRead: [
            [
              4,
              14
            ],
            [
              22,
              7
            ]
          ],
          seqWrite: [
            [
              4,
              1
            ],
            [
              5,
              1
            ],
            [
              6,
              1
            ],
            [
              7,
              1
            ],
            [
              8,
              1
            ],
            [
              9,
              1
            ],
            [
              10,
              1
            ],
            [
              11,
              1
            ],
            [
              12,
              1
            ],
            [
              13,
              1
            ],
            [
              14,
              1
            ],
            [
              15,
              1
            ],
            [
              16,
              1
            ],
            [
              17,
              1
            ],
            [
              18,
              1
            ],
            [
              19,
              1
            ],
            [
              20,
              1
            ],
            [
              21,
              1
            ],
            [
              22,
              1
            ],
            [
              23,
              1
            ],
            [
              24,
              1
            ],
            [
              25,
              1
            ],
            [
              26,
              1
            ],
            [
              27,
              1
            ],
            [
              28,
              1
            ],
            [
              29,
              1
            ]
          ]
        },
        APP_GARBAGE: {
          acls: {
            "3": {
              ACL: "00000000000F7F0788FF000000000000",
              KEYA: "DEBITO",
              KEYB: "CREDITO"
            }
          },
          data: {
            NU: {
              block: 0,
              start: 0,
              type: "STRING32"
            }
          }
        },
        APP_PUB: {
          access: {
            "0": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "1": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "2": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "3": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "4": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "5": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "6": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "7": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "8": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "9": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "10": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            },
            "11": {
              readKeys: {
                CREDITO: "KEYB"
              },
              writeKeys: {
                CREDITO: "KEYB",
                DEBITO: "KEYA"
              }
            }
          },
          acls: {
            "7": {
              ACL: "00000000000F7F0788FF000000000000",
              KEYA: "DEBITO",
              KEYB: "CREDITO"
            },
            "11": {
              ACL: "00000000000F7F0788FF000000000000",
              KEYA: "DEBITO",
              KEYB: "CREDITO"
            }
          },
          data: {
            DI: {
              block: 10,
              start: 0,
              type: "STRING16"
            },
            NU: {
              block: 4,
              start: 0,
              type: "STRING32"
            },
            TD: {
              block: 9,
              start: 0,
              type: "UINT8"
            }
          },
          keys: {
            CREDITO: {
              name: "CREDITO",
              value: 11
            },
            DEBITO: {
              name: "DEBITO",
              value: 11
            }
          }
        },
        CONTACTLESS_CODES: [
          "MIFARE_PLUS_2K",
          "MIFARE_PLUS_4K"
        ],
        EMISSION_VARS: {
          APPS: [
            "APP_PUB",
            "APP_AFC"
          ],
          KEYA: "bad15e15bb8f75b2d8dcb542f1461754",
          KEYA_: "00000000000000000000000000000000",
          KEYA__: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          KEYB: "756cc292b4b65f7ef00eca932ef93f2b",
          KEYB_: "00000000000000000000000000000000",
          KEYB__: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          KEY_TO_READ_WRITE: "KEYB",
          _APPS: [
            "APP_GARBAGE"
          ]
        },
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
        TYPE: "MIFARE"
      },
      metadata: {
        __typename: "PaymentMediumMngPaymentMediumTypeMappingMetadata",
        createdAt: 1631978940673,
        createdBy: "Sebastian Molano",
        updatedAt: 1632339558448,
        updatedBy: "Sebastian Molano"
      }
    },
    {
      version: 2,
      active: false,
      readOnly: false,
      description: null,
      changelog: null,
      mapping: {
        APP_AFC: {
          access: {
            "12": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "13": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "14": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "15": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "16": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "17": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "18": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "19": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "20": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "21": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "22": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "23": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "24": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "25": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "26": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "27": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "28": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "29": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "30": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "31": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "32": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "33": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "34": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "35": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            }
          },
          acls: {
            "15": "00000000000F7F0788FF000000000000",
            "19": "00000000000F7F0788FF000000000000",
            "23": "00000000000F7F0788FF000000000000",
            "27": "00000000000F7F0788FF000000000000",
            "31": "00000000000F7F0788FF000000000000"
          },
          data: {
            AC: {
              block: 13,
              start: 3,
              type: "UINT8"
            },
            B: {
              block: 14,
              start: 0,
              type: "VALUE"
            },
            "CT$": {
              block: 22,
              start: 0,
              type: "VALUE"
            },
            FV: {
              block: 18,
              start: 0,
              type: "UINT32"
            },
            HISTR_CK_1: {
              block: 16,
              start: 15,
              type: "UINT8"
            },
            HISTR_CK_2: {
              block: 17,
              start: 15,
              type: "UINT8"
            },
            HISTR_CT_1: {
              block: 16,
              start: 4,
              type: "UINT32"
            },
            HISTR_CT_2: {
              block: 17,
              start: 4,
              type: "UINT32"
            },
            HISTR_FT_1: {
              block: 16,
              start: 0,
              type: "UINT32"
            },
            HISTR_FT_2: {
              block: 17,
              start: 0,
              type: "UINT32"
            },
            HISTR_IDV_1: {
              block: 16,
              start: 11,
              type: "UINT24"
            },
            HISTR_IDV_2: {
              block: 17,
              start: 11,
              type: "UINT24"
            },
            HISTR_TT_1: {
              block: 16,
              start: 14,
              type: "UINT8"
            },
            HISTR_TT_2: {
              block: 17,
              start: 14,
              type: "UINT8"
            },
            HISTR_VT_1: {
              block: 16,
              start: 8,
              type: "INT24"
            },
            HISTR_VT_2: {
              block: 17,
              start: 8,
              type: "INT24"
            },
            HISTU_CK_1: {
              block: 24,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_2: {
              block: 25,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_3: {
              block: 26,
              start: 14,
              type: "UINT8"
            },
            HISTU_CK_4: {
              block: 28,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_5: {
              block: 29,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_6: {
              block: 30,
              start: 15,
              type: "UINT8"
            },
            HISTU_FID_1: {
              block: 24,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_2: {
              block: 25,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_3: {
              block: 26,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_4: {
              block: 28,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_5: {
              block: 29,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_6: {
              block: 30,
              start: 4,
              type: "UINT16"
            },
            HISTU_FT_1: {
              block: 24,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_2: {
              block: 25,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_3: {
              block: 26,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_4: {
              block: 28,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_5: {
              block: 29,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_6: {
              block: 30,
              start: 0,
              type: "UINT32"
            },
            HISTU_IDV_1: {
              block: 24,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_2: {
              block: 25,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_3: {
              block: 26,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_4: {
              block: 28,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_5: {
              block: 29,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_6: {
              block: 30,
              start: 8,
              type: "UINT24"
            },
            HISTU_ITI_1: {
              block: 24,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_2: {
              block: 25,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_3: {
              block: 26,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_4: {
              block: 28,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_5: {
              block: 29,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_6: {
              block: 30,
              start: 6,
              type: "UINT16"
            },
            NT: {
              block: 12,
              start: 0,
              type: "UINT32"
            },
            P: {
              block: 13,
              start: 0,
              type: "UINT8"
            },
            PMR: {
              block: 13,
              start: 2,
              type: "UINT8"
            },
            "ST$": {
              block: 20,
              start: 0,
              type: "VALUE"
            },
            "STB$": {
              block: 21,
              start: 0,
              type: "VALUE"
            },
            VL: {
              block: 13,
              start: 1,
              type: "UINT8"
            }
          },
          keys: {
            LLAVE1: {
              name: "LLAVE1",
              value: 11
            },
            LLAVE2: {
              name: "LLAVE2",
              value: 11
            }
          },
          seqRead: [
            [
              4,
              14
            ],
            [
              22,
              7
            ]
          ],
          seqWrite: [
            [
              4,
              1
            ],
            [
              5,
              1
            ],
            [
              6,
              1
            ],
            [
              7,
              1
            ],
            [
              8,
              1
            ],
            [
              9,
              1
            ],
            [
              10,
              1
            ],
            [
              11,
              1
            ],
            [
              12,
              1
            ],
            [
              13,
              1
            ],
            [
              14,
              1
            ],
            [
              15,
              1
            ],
            [
              16,
              1
            ],
            [
              17,
              1
            ],
            [
              18,
              1
            ],
            [
              19,
              1
            ],
            [
              20,
              1
            ],
            [
              21,
              1
            ],
            [
              22,
              1
            ],
            [
              23,
              1
            ],
            [
              24,
              1
            ],
            [
              25,
              1
            ],
            [
              26,
              1
            ],
            [
              27,
              1
            ],
            [
              28,
              1
            ],
            [
              29,
              1
            ]
          ]
        },
        APP_GARBAGE: {
          acls: {
            "3": "00000000000F7F0788FF000000000000"
          },
          data: {
            NU: {
              block: 0,
              start: 0,
              type: "STRING32"
            }
          }
        },
        APP_PUB: {
          access: {
            "0": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "1": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "2": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "3": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "4": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "5": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "6": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "7": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "8": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "9": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "10": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "11": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            }
          },
          acls: {
            "7": "00000000000F7F0788FF000000000000",
            "11": "00000000000F7F0788FF000000000000"
          },
          data: {
            DI: {
              block: 10,
              start: 0,
              type: "STRING16"
            },
            NU: {
              block: 4,
              start: 0,
              type: "STRING32"
            },
            TD: {
              block: 9,
              start: 0,
              type: "UINT8"
            }
          },
          keys: {
            LLAVE1: {
              name: "LLAVE1",
              value: 11
            },
            LLAVE2: {
              name: "LLAVE2",
              value: 11
            }
          }
        },
        CONTACTLESS_CODES: [
          "MIFARE_PLUS_2K",
          "MIFARE_PLUS_4K"
        ],
        EMISSION_VARS: {
          APPS: [
            "APP_PUB",
            "APP_AFC"
          ],
          KEY_A: "00000000000000000000000000000000",
          KEY_A_: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          KEY_B: "00000000000000000000000000000000",
          KEY_B_: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          KEY_TO_READ_WRITE: "KEY_B",
          _APPS: [
            "APP_GARBAGE"
          ]
        },
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
        TYPE: "MIFARE"
      },
      metadata: {
        __typename: "PaymentMediumMngPaymentMediumTypeMappingMetadata",
        createdAt: 1631978937825,
        createdBy: "Sebastian Molano",
        updatedAt: 1631978937825,
        updatedBy: "Sebastian Molano"
      }
    },
    {
      version: 1,
      active: true,
      readOnly: false,
      description: null,
      changelog: null,
      mapping: {
        APP_AFC: {
          access: {
            "12": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "13": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "14": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "15": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "16": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "17": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "18": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "19": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "20": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "21": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "22": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "23": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "24": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "25": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "26": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "27": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "28": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "29": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "30": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "31": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "32": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "33": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "34": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "35": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            }
          },
          acls: {
            "15": "00000000000F7F0788FF000000000000",
            "19": "00000000000F7F0788FF000000000000",
            "23": "00000000000F7F0788FF000000000000",
            "27": "00000000000F7F0788FF000000000000",
            "31": "00000000000F7F0788FF000000000000"
          },
          data: {
            AC: {
              block: 13,
              start: 3,
              type: "UINT8"
            },
            B: {
              block: 14,
              start: 0,
              type: "VALUE"
            },
            "CT$": {
              block: 22,
              start: 0,
              type: "VALUE"
            },
            FV: {
              block: 18,
              start: 0,
              type: "UINT32"
            },
            HISTR_CK_1: {
              block: 16,
              start: 15,
              type: "UINT8"
            },
            HISTR_CK_2: {
              block: 17,
              start: 15,
              type: "UINT8"
            },
            HISTR_CT_1: {
              block: 16,
              start: 4,
              type: "UINT32"
            },
            HISTR_CT_2: {
              block: 17,
              start: 4,
              type: "UINT32"
            },
            HISTR_FT_1: {
              block: 16,
              start: 0,
              type: "UINT32"
            },
            HISTR_FT_2: {
              block: 17,
              start: 0,
              type: "UINT32"
            },
            HISTR_IDV_1: {
              block: 16,
              start: 11,
              type: "UINT24"
            },
            HISTR_IDV_2: {
              block: 17,
              start: 11,
              type: "UINT24"
            },
            HISTR_TT_1: {
              block: 16,
              start: 14,
              type: "UINT8"
            },
            HISTR_TT_2: {
              block: 17,
              start: 14,
              type: "UINT8"
            },
            HISTR_VT_1: {
              block: 16,
              start: 8,
              type: "INT24"
            },
            HISTR_VT_2: {
              block: 17,
              start: 8,
              type: "INT24"
            },
            HISTU_CK_1: {
              block: 24,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_2: {
              block: 25,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_3: {
              block: 26,
              start: 14,
              type: "UINT8"
            },
            HISTU_CK_4: {
              block: 28,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_5: {
              block: 29,
              start: 15,
              type: "UINT8"
            },
            HISTU_CK_6: {
              block: 30,
              start: 15,
              type: "UINT8"
            },
            HISTU_FID_1: {
              block: 24,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_2: {
              block: 25,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_3: {
              block: 26,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_4: {
              block: 28,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_5: {
              block: 29,
              start: 4,
              type: "UINT16"
            },
            HISTU_FID_6: {
              block: 30,
              start: 4,
              type: "UINT16"
            },
            HISTU_FT_1: {
              block: 24,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_2: {
              block: 25,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_3: {
              block: 26,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_4: {
              block: 28,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_5: {
              block: 29,
              start: 0,
              type: "UINT32"
            },
            HISTU_FT_6: {
              block: 30,
              start: 0,
              type: "UINT32"
            },
            HISTU_IDV_1: {
              block: 24,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_2: {
              block: 25,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_3: {
              block: 26,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_4: {
              block: 28,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_5: {
              block: 29,
              start: 8,
              type: "UINT24"
            },
            HISTU_IDV_6: {
              block: 30,
              start: 8,
              type: "UINT24"
            },
            HISTU_ITI_1: {
              block: 24,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_2: {
              block: 25,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_3: {
              block: 26,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_4: {
              block: 28,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_5: {
              block: 29,
              start: 6,
              type: "UINT16"
            },
            HISTU_ITI_6: {
              block: 30,
              start: 6,
              type: "UINT16"
            },
            NT: {
              block: 12,
              start: 0,
              type: "UINT32"
            },
            P: {
              block: 13,
              start: 0,
              type: "UINT8"
            },
            PMR: {
              block: 13,
              start: 2,
              type: "UINT8"
            },
            "ST$": {
              block: 20,
              start: 0,
              type: "VALUE"
            },
            "STB$": {
              block: 21,
              start: 0,
              type: "VALUE"
            },
            VL: {
              block: 13,
              start: 1,
              type: "UINT8"
            }
          },
          keys: {
            LLAVE1: {
              name: "LLAVE1",
              value: 11
            },
            LLAVE2: {
              name: "LLAVE2",
              value: 11
            }
          },
          seqRead: [
            [
              4,
              14
            ],
            [
              22,
              7
            ]
          ],
          seqWrite: [
            [
              4,
              1
            ],
            [
              5,
              1
            ],
            [
              6,
              1
            ],
            [
              7,
              1
            ],
            [
              8,
              1
            ],
            [
              9,
              1
            ],
            [
              10,
              1
            ],
            [
              11,
              1
            ],
            [
              12,
              1
            ],
            [
              13,
              1
            ],
            [
              14,
              1
            ],
            [
              15,
              1
            ],
            [
              16,
              1
            ],
            [
              17,
              1
            ],
            [
              18,
              1
            ],
            [
              19,
              1
            ],
            [
              20,
              1
            ],
            [
              21,
              1
            ],
            [
              22,
              1
            ],
            [
              23,
              1
            ],
            [
              24,
              1
            ],
            [
              25,
              1
            ],
            [
              26,
              1
            ],
            [
              27,
              1
            ],
            [
              28,
              1
            ],
            [
              29,
              1
            ]
          ]
        },
        APP_GARBAGE: {
          acls: {
            "3": "00000000000F7F0788FF000000000000"
          },
          data: {
            NU: {
              block: 0,
              start: 0,
              type: "STRING32"
            }
          }
        },
        APP_PUB: {
          access: {
            "0": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "1": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "2": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "3": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "4": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "5": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "6": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "7": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "8": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "9": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "10": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            },
            "11": {
              readKeys: {
                LLAVE2: "KEYB"
              },
              writeKeys: {
                LLAVE1: "KEYA",
                LLAVE2: "KEYB"
              }
            }
          },
          acls: {
            "7": "00000000000F7F0788FF000000000000",
            "11": "00000000000F7F0788FF000000000000"
          },
          data: {
            DI: {
              block: 10,
              start: 0,
              type: "STRING16"
            },
            NU: {
              block: 4,
              start: 0,
              type: "STRING32"
            },
            TD: {
              block: 9,
              start: 0,
              type: "UINT8"
            }
          },
          keys: {
            LLAVE1: {
              name: "LLAVE1",
              value: 11
            },
            LLAVE2: {
              name: "LLAVE2",
              value: 11
            }
          }
        },
        CONTACTLESS_CODES: [
          "MIFARE_PLUS_2K",
          "MIFARE_PLUS_4K"
        ],
        EMISSION_VARS: {
          APPS: [
            "APP_PUB",
            "APP_AFC"
          ],
          KEY_A: "00000000000000000000000000000000",
          KEY_A_: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          KEY_B: "00000000000000000000000000000000",
          KEY_B_: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
          KEY_TO_READ_WRITE: "KEY_B",
          _APPS: [
            "APP_GARBAGE"
          ]
        },
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
        TYPE: "MIFARE"
      },
      metadata: {
        __typename: "PaymentMediumMngPaymentMediumTypeMappingMetadata",
        createdAt: 1631907338597,
        createdBy: "Sebastian Molano",
        updatedAt: 1631973457118,
        updatedBy: "Sebastian Molano"
      }
    }
  ],
  metadata: {
    createdBy: "sebastian.molano@nebulae.com.co",
    createdAt: 1631907326769,
    updatedBy: "sebastian.molano@nebulae.com.co",
    updatedAt: 1632339560043
  },
  ephemeral: null
};