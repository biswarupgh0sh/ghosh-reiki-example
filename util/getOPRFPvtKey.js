export const getOPRFPvtKey = async (auth1Api) =>{
    const OPRFPvtKey = await auth1Api.getOPRFPrivateKey();
    return OPRFPvtKey;
}