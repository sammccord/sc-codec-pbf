var Pbf = require('pbf')

// scMessage ========================================

var scMessage = {}

scMessage.read = function(pbf, end) {
  return pbf.readFields(scMessage._readField, { event: '', data: null }, end)
}
function _readField(msg) {
  return function(tag, obj, pbf) {
    if (tag === 1) obj.event = pbf.readString()
    else if (tag === 2) obj.data = msg.read(pbf, pbf.readVarint() + pbf.pos)
  }
}
function write(msg) {
  return function(obj, pbf) {
    if (obj.event) pbf.writeStringField(1, obj.event)
    if (obj.data) pbf.writeMessage(2, msg.write, obj.data)
  }
}

function scCodecPbf(msg) {
  if (!msg) throw new Error('No pbf message object provided')
  this.scMessage = scMessage
  this.scMessage._readField = _readField(msg)
  this.scMessage.write = write(msg)
}

scCodecPbf.prototype.encode = function(object) {
  if (object) {
    if (object.rid != null || object.cid != null) return JSON.stringify(object)
    else if (typeof object === 'string') return object
    else {
      var buf = new Pbf()
      this.scMessage.write(object, buf)
      return buf.finish()
    }
  }
}

scCodecPbf.prototype.decode = function(str) {
  if (typeof str === 'string') {
    if (str.charAt(0) === '#') return str
    else return JSON.parse(str)
  } else {
    var buf = new Pbf(str)
    return this.scMessage.read(buf)
  }
}

module.exports = scCodecPbf
