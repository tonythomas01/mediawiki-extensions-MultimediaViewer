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
			if ( !lbinterface.fullscreenButtonJustPressed &&
					!document.fullscreenElement &&
					!document.mozFullScreenElement &&
					!document.webkitFullScreenElement &&
					!document.msFullScreenElement) {
				lightboxHooks.callAll( 'defullscreen' );
				lbinterface.$main.removeClass( 'mlb-fullscreened' );
			} else if ( lbinterface.fullscreenButtonJustPressed ) {
				lbinterface.fullscreenButtonJustPressed = false;
			}
		}

		var result,
			addToPre = [],
			addToPost = [],
			lbinterface = this;

		// Staging area for image resizes
		this.$staging = $( '<div>' )
			.addClass( 'mlb-staging-area' );
		$( document.body ).append( this.$staging );

		this.$overlay = $( '<div>' )
			.addClass( 'mlb-overlay' );

		this.$wrapper = $( '<div>' )
			.addClass( 'mlb-wrapper' );

		this.$main = $( '<div>' )
			.addClass( 'mlb-main' );

		this.$imageDiv = $( '<div>' )
			.addClass( 'mlb-image' );

		// I blame CSS for this
		this.$innerWrapper = $( '<div>' )
			.addClass( 'mlb-image-inner-wrapper' )
			.append( this.$imageDiv );

		this.$imageWrapper = $( '<div>' )
			.addClass( 'mlb-image-wrapper' )
			.append( this.$innerWrapper );

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
			this.$imageWrapper,
			this.$postDiv
		);

		this.$wrapper.append(
			this.$main
		);

		lightboxHooks.callAll( 'modifyInterface', this );

		window.addEventListener( 'keyup', function ( e ) {
			if ( e.keyCode === 27 ) {
				// Escape button pressed
				lbinterface.unattach();
			}
		} );

		window.addEventListener( 'fullscreenchange', handleFullscreenChange );
		window.addEventListener( 'mozfullscreenchange', handleFullscreenChange );
		window.addEventListener( 'webkitfullscreenchange', handleFullscreenChange );
		window.addEventListener( 'msfullscreenchange', handleFullscreenChange );
	}

	LIP = LightboxInterface.prototype;

	/**
	 * @type {LightboxImage}
	 * @protected
	 */
	LIP.currentImage = null;

	LIP.empty = function () {
		this.$imageDiv.empty();

		lightboxHooks.callAll( 'clearInterface', this );

		if ( this.resizeListener ) {
			window.removeEventListener( 'resize', this.resizeListener );
		}
	};

	/**
	 * Attaches interface to document or given parent id.
	 *
	 * @param {string} [parentId] parent id where we want to attach the UI. Mainly for testing.
	 */
	LIP.attach = function ( parentId ) {
		var parent = $( parentId || document.body );

		parent
			.append(
				this.$wrapper,
				this.$overlay
			);
		this.currentlyAttached = true;
	};

	/**
	 * Unattaches interface from parent element. Calls global lightboxHooks.
	 */
	LIP.unattach = function () {
		// TODO(aarcos): This is global and it breaks tests.
		lightboxHooks.callAll( 'closeInterface', this );

		this.$wrapper.detach();
		this.$overlay.detach();

		this.currentlyAttached = false;
	};

	LIP.fullscreen = function () {
		var fullscreen;

		if ( document.fullscreenElement ||
				document.mozFullScreenElement ||
				document.webkitFullScreenElement ||
				document.msFullScreenElement ) {
			if ( document.cancelFullScreen ) {
				document.cancelFullScreen();
			} else if ( document.mozCancelFullScreen ) {
				document.mozCancelFullScreen();
			} else if ( document.webkitCancelFullScreen ) {
				document.webkitCancelFullScreen();
			} else if ( document.msCancelFullScreen ) {
				document.msCancelFullScreen();
			}

			this.$main.removeClass( 'mlb-fullscreened' );
			lightboxHooks.callAll( 'defullscreen', this );
		} else {
			fullscreen = this.$main.get( 0 );
			if ( fullscreen.requestFullScreen ) {
				fullscreen.requestFullScreen();
			} else if ( fullscreen.mozRequestFullScreen ) {
				fullscreen.mozRequestFullScreen();
			} else if ( fullscreen.webkitRequestFullScreen ) {
				fullscreen.webkitRequestFullScreen();
			} else if ( fullscreen.msRequestFullscreen ) {
				fullscreen.msRequestFullscreen();
			}

			this.$main.addClass( 'mlb-fullscreened' );
			lightboxHooks.callAll( 'fullscreen', this );
		}
	};

	/**
	 * @protected
	 */
	LIP.resizeCallback = function() {
		if ( this.currentlyAttached ) {
			var result = lightboxHooks.callAll( 'imageResize', this );

			if ( result !== false ) {
				this.autoResizeImage();
			}
		}
	};

	/**
	 * @protected
	 */
	LIP.loadCallback = function ( image, ele ) {
		var iface = this;

		image.globalMaxWidth = ele.width;
		image.globalMaxHeight = ele.height;
		this.$image = $( ele );

		this.autoResizeImage();

		// Capture listener so we can remove it later, otherwise
		// we are going to leak listeners !
		this.resizeListener = function () { iface.resizeCallback(); };

		window.addEventListener( 'resize', this.resizeListener );

		lightboxHooks.callAll( 'imageLoaded', this );
	};

	/**
	 * @param {LightboxImage} image
	 */
	LIP.load = function ( image ) {
		var iface = this,
			ele = image.getImageElement( function () {
				iface.loadCallback( image, ele );
			} );

		this.currentImage = image;
	};

	LIP.autoResizeImage = function () {
		this.$staging.append( this.$image );
		this.currentImage.autoResize( this.$image.get( 0 ), this.$imageDiv );
		this.$imageDiv.append( this.$image );
	};

	/**
	 * Changes what image is being displayed.
	 * @param {HTMLImageElement} imageEle
	 */
	LIP.replaceImageWith = function ( imageEle ) {
		var $image = $( imageEle );

		this.currentImage.src = imageEle.src;

		this.$image.replaceWith( $image );
		this.$image = $image;

		this.currentImage.globalMaxWidth = this.$image.width();
		this.currentImage.globalMaxHeight = this.$image.height();
		this.currentImage.autoResize( imageEle );
	};

	LIP.setupPreDiv = function ( buildDefaults, toAdd ) {
		var lbinterface = this;

		if ( buildDefaults ) {
			this.$controlBar = $( '<div>' )
				.addClass( 'mlb-controls' );

			this.$closeButton = $( '<div>' )
				.text( ' ' )
				.addClass( 'mlb-close' )
				.click( function () {
					lbinterface.unattach();
				} );

			this.$fullscreenButton = $( '<div>' )
				.text( ' ' )
				.addClass( 'mlb-fullscreen' )
				.click( function () {
					lbinterface.fullscreenButtonJustPressed = true;
					lbinterface.fullscreen();
				} );

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
