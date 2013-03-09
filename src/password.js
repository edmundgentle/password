/*

*/
(function( $ ){
	var methods = {
		init : function( options ) { 
			var settings = $.extend( {
				minLength:8,
				change:function() {}
			}, options);
			this.each(function() {
				var t=$(this);
				t.keyup(function() {
					var s=$(this).val();
					var score=0;
					var max_score=50;
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
					if(s.match(/ /g)!=null) {
						errors.push('CONTAINS_SPACE');
						pass=false;
					}
					if(s.match(/(\W|_)/g)!=null) {
						score+=10;
					}else{
						errors.push('NO_SPECIAL_CHARACTERS');
					}
					if((score/max_score)<0.3) {
						pass=false;
					}
					settings.change.call(this, (score/max_score)*100, errors,pass);
				});
			});
		},
		show : function( ) {
      // IS
		},
		hide : function( ) { 
      // GOOD
		},
		update : function( content ) { 
      // !!! 
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