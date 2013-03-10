(function( $ ){
	var methods = {
		init : function( options ) { 
			var settings = $.extend( {
				minLength:8,
				allowSpace:false,
				change:function() {},
				strengthIndicator:null,
				personalInformation:{}
			}, options);
			this.each(function() {
				var t=$(this);
				var si=null;
				var score = $.fn.password('calculateScore',t,settings);
				if(settings.strengthIndicator!=null) {
					if(typeof(settings.strengthIndicator)=='string') {
						si=$(settings.strengthIndicator);
					}else{
						si=settings.strengthIndicator;
					}
					si.html('<div class="pw_strengthIndicator"><div class="strength weak">Weak</div><div class="strength medium">Medium</div><div class="strength strong">Strong</div></div>');
					if(score[2]) {
						si.find('.weak').addClass('pass');
						if(score[0]>=50) {
							si.find('.medium').addClass('pass');
						}
						if(score[0]>=80) {
							si.find('.strong').addClass('pass');
						}
					}
				}
				$.each(settings.personalInformation, function(index, value) {
					if(typeof(value)=='string') {
						if($(value).length>0) {
							settings.personalInformation[index]=$(value);
						}
					}
				});
				t.keyup(function() {
					var score = $.fn.password('calculateScore',t,settings);
					if(si!=null) {
						si.find('.pass').removeClass('pass');
						if(score[2]) {
							si.find('.weak').addClass('pass');
							if(score[0]>=50) {
								si.find('.medium').addClass('pass');
							}
							if(score[0]>=80) {
								si.find('.strong').addClass('pass');
							}
						}
					}
					settings.change.call(this, score[0], score[1], score[2]);
				});
			});
		},
		calculateScore : function(elem, settings) {
			var s=elem.val();
			var score=0;
			var max_score=70;
			var pass=true;
			var errors=[];
			if(s.length>=settings.minLength) {
				score+=10;
			}else{
				errors.push('TOO_SHORT');
				pass=false;
			}
			if(s.match(/[A-Z]/g)!=null) {
				score+=10;
			}else{
				errors.push('NO_UPPERCASE_LETTERS');
			}
			if(s.match(/[a-z]/g)!=null) {
				score+=10;
			}else{
				errors.push('NO_LOWERCASE_LETTERS');
			}
			if(s.match(/[0-9]/g)!=null) {
				score+=10;
			}else{
				errors.push('NO_NUMBERS');
			}
			if(!settings.allowSpace && s.match(/ /g)!=null) {
				errors.push('CONTAINS_SPACE');
				pass=false;
			}
			if(s.match(/(\W|_)/g)!=null) {
				score+=10;
			}else{
				errors.push('NO_SPECIAL_CHARACTERS');
			}
			//check personal information
			var pi=[];
			$.each(settings.personalInformation, function(index, value) {
				if(typeof(value)=='string') {
					pi.push(value.toLowerCase());
					var n=value.match(/[1-2][0-9]{3}/g);
					if(n) {
						pi.push(n[0].substring(2,4));
					}
				}else{
					pi.push(value.val().toLowerCase());
				}
			});
			var slc=s.toLowerCase();
			var fpi=false;
			$.each(pi, function(index, value) {
				var regex = new RegExp(value, "g");
				if(slc.match(regex)!=null) {
					fpi=true;
				}
			});
			if(fpi) {
				errors.push('CONTAINS_PERSONAL_INFO');
			}else if(s.length>5) {
				score+=20;
			}
			if((score/max_score)<0.3) {
				pass=false;
			}
			if(s.length==0) {
				pass=false;
				errors.push('EMPTY');
			}
			return [(score/max_score)*100,errors,pass];
		}
	};
	$.fn.password = function( method ) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		}else{
			$.error( 'Method ' +  method + ' does not exist on jQuery.password' );
		}
	};
})( jQuery );