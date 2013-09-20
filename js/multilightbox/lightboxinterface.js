( function ( $ ) {
	var LIP, lightboxHooks;

	/**
	 * @class
	 * @constructor
	 */
	function LightboxInterface() {
		lightboxHooks = window.lightboxHooks;

		function handleFullscreenChange() {
			// If we're no longer in fullscreen mode, make sure
			if ( !this.fullscreenButtonJustPressed &&
					!document.fullscreenElement &&
					!document.mozFullScreenElement &&
					!document.webkitFullScreenElement ) {
				this.fullscreen();
			} else if ( this.fullscreenButtonJustPressed ) {
				this.fullscreenButtonJustPressed = false;
			}
		}

		var result,
			addToPre = [],
			addToPost = [];

		this.$overlay = $( '<div>' )
			.addClass( 'mlb-overlay' );

		this.$wrapper = $( '<div>' )
			.addClass( 'mlb-wrapper' );

		this.$main = $( '<div>' )
			.addClass( 'mlb-main' );

		this.$imageDiv = $( '<div>' )
			.addClass( 'mlb-image' );

		this.$preDiv = $( '<div>' )
			.addClass( 'mlb-pre-image' );
		result = lightboxHooks.callAll( 'addToPreDiv', this, addToPre );
		this.setupPreDiv( result, addToPre );

		this.$postDiv = $( '<div>' )
			.addClass( 'mlb-post-image' );
		result = lightboxHooks.callAll( 'addToPostDiv', this, addToPost );
		this.setupPostDiv( result, addToPost );

		this.$main.append(
			this.$preDiv,
			this.$imageDiv,
			this.$postDiv
		);

		this.$wrapper.append(
			this.$main
		);

		lightboxHooks.callAll( 'modifyInterface', this );

		window.addEventListener( 'keyup', function ( e ) {
			if ( e.keyCode === 27 ) {
				// Escape button pressed
				this.unattach();
			}
		}.bind( this ) );

		window.addEventListener( 'fullscreenchange', handleFullscreenChange.bind( this ) );
		window.addEventListener( 'mozfullscreenchange', handleFullscreenChange.bind( this ) );
		window.addEventListener( 'webkitfullscreenchange', handleFullscreenChange.bind( this ) );
	}

	LIP = LightboxInterface.prototype;

	LIP.attach = function () {
		$( document.body )
			.append(
				this.$wrapper,
				this.$overlay
			);
	};

	LIP.unattach = function () {
		this.$wrapper.detach();
		this.$overlay.detach();
	};

	LIP.fullscreen = function () {
		var fullscreen;

		if ( this.isFullScreen ) {
			if ( !document.fullscreenElement &&
					!document.mozFullScreenElement &&
					!document.webkitFullScreenElement ) {
				if ( document.cancelFullScreen ) {
					document.cancelFullScreen();
				} else if ( document.mozCancelFullScreen ) {
					document.mozCancelFullScreen();
				} else if ( document.webkitCancelFullScreen ) {
					document.webkitCancelFullScreen();
				}
			}

			this.$fullscreen.detach();
			this.$wrapper.html( this.$main.detach() );
		} else {
			this.$fullscreen = this.$fullscreen || $( '<div>' )
				.addClass( 'mlb-fullscreen-div' );

			this.$fullscreen.html( this.$main.detach() );

			this.$wrapper.append( this.$fullscreen );

			fullscreen = this.$fullscreen[0];
			if ( fullscreen.requestFullScreen ) {
				fullscreen.requestFullScreen();
			} else if ( fullscreen.mozRequestFullScreen ) {
				fullscreen.mozRequestFullScreen();
			} else if ( fullscreen.webkitRequestFullScreen ) {
				fullscreen.webkitRequestFullScreen();
			}
		}

		this.isFullScreen = !this.isFullScreen;
	};

	LIP.load = function ( image ) {
		var ele = image.getImageElement( function () {
				iface.$image = $( ele );
				iface.$imageDiv.html( ele );
				image.autoResize( ele );

				window.addEventListener( 'resize', function () {
					image.autoResize( ele );
				} );

				lightboxHooks.callAll( 'imageLoaded', iface );
			} ),
			iface = this;

		this.currentImage = image;
	};

	LIP.setupPreDiv = function ( buildDefaults, toAdd ) {
		if ( buildDefaults ) {
			this.$controlBar = $( '<div>' )
				.addClass( 'mlb-controls' );

			this.$closeButton = $( '<div>' )
				.text( ' ' )
				.addClass( 'mlb-close' )
				.click( this.unattach.bind( this ) );

			this.$fullscreenButton = $( '<div>' )
				.text( ' ' )
				.addClass( 'mlb-fullscreen' )
				.click( function () {
					this.fullscreenButtonJustPressed = true;
					this.fullscreen();
				}.bind( this ) );

			this.$controlBar.append(
				this.$closeButton,
				this.$fullscreenButton
			);

			this.$preDiv.append( this.$controlBar );

			lightboxHooks.callAll( 'modifyDefaultPreDiv', this );
		}

		this.addElementsToDiv( this.$preDiv, toAdd );
	};

	LIP.setupPostDiv = function ( buildDefaults, toAdd ) {
		if ( buildDefaults ) {
			lightboxHooks.callAll( 'modifyDefaultPostDiv', this );
		}

		this.addElementsToDiv( this.$postDiv, toAdd );
	};

	LIP.addElementsToDiv = function ( $div, toAdd ) {
		var i;

		for ( i = 0; i < toAdd.length; i++ ) {
			$div.append( toAdd[i] );
		}
	};

	window.LightboxInterface = LightboxInterface;
}( jQuery ) );