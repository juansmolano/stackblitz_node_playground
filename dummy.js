

===== REACT gql ======

export const PaymentMediumMngSharedPaymentMediumReadAndApplyPendingMods = (variables) => ({
    mutation: gql`
            mutation  PaymentMediumMngSharedPaymentMediumReadAndApplyPendingMods($input: PaymentMediumMngSharedPaymentMediumReadAndApplyPendingModsInput!){
                PaymentMediumMngSharedPaymentMediumReadAndApplyPendingMods(input: $input){
                    nextStep {sessionId,step,requestApdus,desc,error,resetReaderSession},
                    paymentMedium {
                        id, typeId, mediumId, endUserId, profileId, state, pockets, expirationTimestamp, expired
                    },
                    appliedMods {id,type,applied,payload,ts,appliedTs}
                }
            }`,
    variables
});

===== REACT =======

import { PaymentMediumMngSharedPaymentMediumReadAndApplyPendingMods } from '../gql/PaymentMedium';

const gqlPaymentMediumMngSharedPaymentMediumReadAndApplyPendingMods = PaymentMediumMngSharedPaymentMediumReadAndApplyPendingMods({});
const [readAndApplyPendingMods, readAndApplyPendingModsResult] = useMutation(gqlPaymentMediumMngSharedPaymentMediumReadAndApplyPendingMods.mutation);

const [nextStep, setNextStep] = useState();
    const [appliedMods, setAppliedMods] = useState();
    const [readPaymentMedium, setReadPaymentMedium] = useState();
    const readerSession = useRef('ReadAndApplyMods_' + Date.now());
    useEffect(() => {
        if (smartCard && smartCard.uuid) {
            pcscDaemonEngine.contactLessReader.requestSmartCardLock(smartCard.uuid);
        }
    }, [smartCard]);

    useEffect(() => {
        if (reader && reader.state === READER_STATES.SMART_CARD_LOCKED) {
            readAndApplyPendingMods({
                variables: {
                    input: {
                        atr: smartCard.atr.raw,
                        uuid: smartCard.uuid,
                        metadata: {},
                        organizationId: user.selectedOrganization.id
                    }
                }
            });
        }
    }, [reader]);

    useEffect(() => {
        if (readAndApplyPendingModsResult && readAndApplyPendingModsResult.data && readAndApplyPendingModsResult.data.PaymentMediumMngSharedPaymentMediumReadAndApplyPendingMods) {
            const { nextStep, paymentMedium, appliedMods } = readAndApplyPendingModsResult.data.PaymentMediumMngSharedPaymentMediumReadAndApplyPendingMods;
            setNextStep(nextStep);
            setReadPaymentMedium(paymentMedium);
            setAppliedMods(appliedMods);
            console.log('=========');
            console.log('= nextStep =',nextStep);
            console.log('= appliedMods =',appliedMods);
            console.log('= paymentMedium =',paymentMedium);
        }
    }, [readAndApplyPendingModsResult]);

    useEffect(() => {
        if (nextStep && nextStep.requestApdus && nextStep.requestApdus.length > 0) {
            if (nextStep.resetReaderSession) readerSession.current = 'ReadAndApplyMods_' + Date.now();
            pcscDaemonEngine.contactLessReader.sendApdus(nextStep.requestApdus, readerSession.current, false)
                .then(result => {
                    const responseApdus = result.data.map(({ apdu: requestApdu, response: responseApdu, isValid }) => ({ requestApdu, responseApdu, isValid }));
                    readAndApplyPendingMods({
                        variables: {
                            input: {
                                atr: smartCard.atr.raw,
                                uuid: smartCard.uuid,
                                sessionId: nextStep.sessionId,
                                responseApdus,
                                metadata: {},
                                organizationId: user.selectedOrganization.id
                            }
                        }
                    });
                })
                .catch(err => {
                    console.log('Error Sending APDU to SmartCard', err);
                });
        } else {
            // stopPcscDaemon();
        }
    }, [nextStep]);