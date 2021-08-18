'use strict';

const PAYMENT_MEDIUM_STATES = {
    ACQUIRED: 'ACQUIRED',
    PRE_INITIALIZED: 'PRE_INITIALIZED',
    INITIALIZED: 'INITIALIZED',
    PERSONALIZED: 'PERSONALIZED',
    EMITED: 'EMITED',
    BLOCKED: 'BLOCKED'
};

const buildMifarePaymentMedium = (uuid, Idsequence, paymentMediumType, endUser, paymentMediumAcquisition, authToken) => {
    const { _id: paymentMediumTypeId, code: paymentMediumTypeCode, ephemeral, mappings } = paymentMediumType;
    const { _id: endUserId, organizationId } = endUser;
    const mapping = mappings.sort((v1, v2) => v2.version - v1.version).find(v => v.active);
    
    const paymentMedium = {
        _id: `${paymentMediumTypeCode}-${Idsequence}`,
        organizationId,
        typeId: paymentMediumTypeId,
        mediumId: uuid,
        ephemeral,
        endUserId,
        state: PAYMENT_MEDIUM_STATES.INITIALIZED,
        stateHistory: [
            {
                timestamp: paymentMediumAcquisition.purchase.timestamp,
                state: PAYMENT_MEDIUM_STATES.ACQUIRED,
                responsibleUserId: '',
                responsibleUserFullname: paymentMediumAcquisition.buyer.buyerFullname
            },
            {
                timestamp: Date.now(),
                state: PAYMENT_MEDIUM_STATES.INITIALIZED,
                responsibleUserId: authToken._id,
                responsibleUserFullname: authToken.name
            }
        ],
        pockets: {
            REGULAR: {
                type: 'REGULAR',
                balance: 0,
                balanceBk: 0,
                timestamp: Date.now(),
            }
        },
        metadata: {
            blocked: false,
            data: null,
            timestamp: Date.now(),
            mappingVersion: mapping.version,
            transactionSeq: 0
        },
        expirationTimestamp: Date.now() + (parseInt(process.env.MIFARE_EXPIRATION_DAYS || '1825') * 86400000),
        expired: false,
        mods: []
    };

    return paymentMedium;
};

module.exports = buildMifarePaymentMedium;