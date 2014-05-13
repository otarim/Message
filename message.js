;(function(Message,global){
	if(global.Message) return;
	// ---helper
	var helper = {
		addEvent: (function(){
			if(typeof addEventListener === 'function'){
				return function(el,type,callback){
					el.addEventListener(type,callback,false)
				}
			}else{
				return function(el,type,callback){
					el.attachEvent('on'+type,callback)
				}
			}
		})()
	}
	if(typeof [].forEach !== 'function'){
		Array.prototype.forEach = function(callback){
			for(var i = 0;i<this.length;i++){
				callback.call(this,this[i]);
			}
		}
	}
	// ---message
	function Message(config){
		this.ports = [];
		this.token = config.token; //ie67根据 token 认证
	}
	var sendMessage,listen,type;
	if('postMessage' in global){
		sendMessage = function(ports,msg){
			ports.forEach(function(port){
				port.postMessage(msg,'*')
			})
		}
		onMessage = function(callback){
			var self = this;
			helper.addEvent(global,'message',function(e){
				callback.call(self,e);
			})
		}
		type = 0;
	}else{
		sendMessage = function(ports,msg){
			ports.forEach(function(port){
				global.navigator['ms_'+port].call(null,{
					data: msg,
					source: global,
					origin: location.protocol + '//' + location.hostname
				});
			})
		}
		onMessage = function(callback){
			global.navigator['ms_' + this.token] = callback;
		}
		type = 1;
	}
	var __proto__ = {
		constructor: Message,
		postMessage: function(msg){
			var self = this,
				origin = [].slice.call(arguments,1);
			if(!origin.length){
				if(self.ports.length){
					sendMessage(self.ports,msg)
				}
			}else{
				sendMessage(origin,msg);
			}
		},
		onMessage: onMessage,
		add: function(){
			var token = [].slice.call(arguments)[type];
			this.ports.push(token);
			return token;
		},
		clear: function(){
			this.ports = [];
		}
	};
	Message.prototype = __proto__;
	global.Message = Message;
})(window.Message || {},window)