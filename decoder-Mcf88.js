function (msg) {
/*
 ORISUN-IOT 
 This code is meant to be used in order to decode the D-LW12TERWP Model from Mcf88
 Use it as it is or change it for your specifics needs
*/

function bin16dec(bin) {
   var num=bin&0xFFFF;
   if (0x8000 & num)
       num = - (0x010000 - num);
   return num;
}
function bin8dec(bin) {
    var num=bin&0xFF;
    if (0x80 & num)
        num = - (0x0100 - num);
    return num;
}
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

var Base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // public method for decoding
    decode : function (input) {
        var output = [];
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output.push(chr1);
            if (enc3 != 64) {
                output.push(chr2);
            }
            if (enc4 != 64) {
                output.push(chr3);
            }
        }
        return output;
    },
};

function DecodeElsysPayload(data){    
    var array = []; 
    for ( var i = 0; i < 3; i++ ) {
      var obj = new Object();
      var index = 10*i;
	  
      var year = (data[index+4] >> 1)+2000;
      var monthIndex =  ((data[index+4] & 1)<<3) | (data[index+3]>>5);
      var day =  (data[index+3] & 0x1F);
      var hours =  (data[index+2]>>3);
      var minutes =  ((data[index+2]&7) <<2) | (data[index+1]>>6);
      var seconds = (data[index+2] & 0x1F);
      obj.timestamp = (new Date(year, monthIndex, day, hours, minutes , seconds)).toISOString();
      
      var temp = (data[index+6]<<8) | (data[index+5]);
      obj.temperature = temp/100;
      
      var rh = (data[index+7]);
      obj.humidity = rh/2;
      
      var pe = (data[index+10]<<16)|(data[index+9]<<8)|(data[index+8]);
      obj.pressure = pe/100; 
      
      array.push(obj);
    }
    return array;
}


function preprocessMessage ( msg, options ) {
    var opts = options || {};
    var msgBody = msg;
    switch( opts.enc ) {
    case 'base64':
        msgBody = Base64.decode( msgBody );
        break;
    case 'hex':
        msgBody = hexToBytes( msgBody );
        break;
    default:
        break;
    }
    if (msgBody.length != 32) return [];
    return DecodeElsysPayload( msgBody );
    }
  
    var obj = preprocessMessage( msg.data, { enc: "base64" });
    console.log(JSON.stringify(obj));
    return obj;
} 