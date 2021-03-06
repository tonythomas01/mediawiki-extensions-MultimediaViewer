( function ( $ ) {
	/**
	 * @class
	 * @constructor
	 * @param {string} src The URL (possibly relative) to the image
	 */
	function LightboxImage( src ) {
		this.src = src;

		lightboxHooks.callAll( 'modifyImageObject', this );
	}

	var LIP = LightboxImage.prototype;

	/**
	 * The URL of the image (in the size we intend use to display the it in the lightbox)
	 * @type {String}
	 * @protected
	 */
	LIP.src = null;

	/**
	 * The URL of a placeholder while the image loads. Typically a smaller version of the image, which is already
	 * loaded in the browser.
	 * @type {String}
	 * @protected
	 */
	LIP.initialSrc = null;

	LIP.getImageElement = function ( loadcb ) {
		var ele;

		lightboxHooks.callAll( 'beforeFetchImage', this );

		ele = new Image();
		ele.addEventListener( 'load', loadcb );
		ele.src = this.src || this.initialSrc;

		lightboxHooks.callAll( 'modifyImageElement', ele );

		return ele;
	};

	// Assumes that the parent element's size is the maximum size.
	LIP.autoResize = function ( ele, $parent ) {
		function updateRatios() {
			if ( imgHeight ) {
				imgHeightRatio = parentHeight / imgHeight;
			}

			if ( imgWidth ) {
				imgWidthRatio = parentWidth / imgWidth;
			}
		}

		var imgWidthRatio, imgHeightRatio, parentWidth, parentHeight,
			$img = $( ele ),
			imgWidth = $img.width(),
			imgHeight = $img.height();

		$parent = $parent || $img.parent();
		parentWidth = $parent.width();
		parentHeight = $parent.height();

		if ( this.globalMaxWidth && parentWidth > this.globalMaxWidth ) {
			parentWidth = this.globalMaxWidth;
		}

		if ( this.globalMaxHeight && parentHeight > this.globalMaxHeight ) {
			parentHeight = this.globalMaxHeight;
		}

		updateRatios();

		if ( imgWidth > parentWidth ) {
			imgHeight *= imgWidthRatio || 1;
			imgWidth = parentWidth;
			updateRatios();
		}

		if ( imgHeight > parentHeight ) {
			imgWidth *= imgHeightRatio || 1;
			imgHeight = parentHeight;
			updateRatios();
		}

		if ( imgWidth < parentWidth && imgHeight < parentHeight ) {
			if ( imgWidth === 0 && imgHeight === 0 ) {
				// Only set one
				imgWidth = parentWidth;
				imgHeight = null;
			} else {
				if ( imgHeightRatio > imgWidthRatio ) {
					imgWidth *= imgHeightRatio;
					imgHeight = parentHeight;
				} else {
					imgHeight *= imgWidthRatio;
					imgWidth = parentWidth;
				}
				updateRatios();
			}
		}

		$img.width( imgWidth ).height( imgHeight );
	};

	window.LightboxImage = LightboxImage;
}( jQuery ) );
