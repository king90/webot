import * as QrcodeTerminal from 'qrcode-terminal';

const onScan = async (qrcode: string, status: string) => {
    QrcodeTerminal.generate(qrcode, {small: true});
  
    const qrcodeImageUrl = [
      'https://api.qrserver.com/v1/create-qr-code/?data=',
      encodeURIComponent(qrcode),
    ].join('');
  
    console.log(status, qrcodeImageUrl);
};
  
export default onScan;
