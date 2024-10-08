function otp_code() {
    return new Promise(async (resolve) => {
        var result = '';
        var characters = '0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        resolve(result);
    })
}
module.exports = {
    otp_code,
}